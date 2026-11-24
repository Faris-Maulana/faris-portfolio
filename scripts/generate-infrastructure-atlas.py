#!/usr/bin/env python3
"""Generate the public, geometry-only atlas artifact from an authorized KMZ.

The source KMZ is intentionally not copied into the repository. Placemark names,
points, styles and extended metadata are discarded. Land geometry comes from
Natural Earth (public domain). Run with Python 3, no third-party packages needed:

    python3 scripts/generate-infrastructure-atlas.py "/path/to/source.kmz"
"""

from __future__ import annotations

import argparse
from hashlib import sha256
from io import BytesIO
import json
import math
from pathlib import Path
from urllib.request import urlopen
from xml.etree.ElementTree import iterparse
from zipfile import BadZipFile, ZipFile

WIDTH = 960
HEIGHT = 576
MIN_LONGITUDE = 104.4
MAX_LONGITUDE = 124.4
MIN_LATITUDE = -10.2
MAX_LATITUDE = 1.8
ROUTE_TOLERANCE = 0.35
LAND_TOLERANCE = 0.12
NATURAL_EARTH_URL = (
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/"
    "master/geojson/ne_50m_admin_0_countries.geojson"
)
OUTPUT_PATH = Path(__file__).resolve().parents[1] / "src/data/infrastructure-atlas.ts"

Point = tuple[float, float]


def project(point: Point) -> Point:
    longitude, latitude = point
    if not (
        math.isfinite(longitude)
        and math.isfinite(latitude)
        and -180 <= longitude <= 180
        and -90 <= latitude <= 90
    ):
        raise ValueError(f"Invalid WGS 84 coordinate: {point}")
    return (
        (longitude - MIN_LONGITUDE) * WIDTH / (MAX_LONGITUDE - MIN_LONGITUDE),
        (MAX_LATITUDE - latitude) * HEIGHT / (MAX_LATITUDE - MIN_LATITUDE),
    )


def simplify(points: list[Point], tolerance: float) -> list[Point]:
    """Iterative Ramer-Douglas-Peucker, safe for the longest source paths."""
    if len(points) <= 2:
        return points

    retained = {0, len(points) - 1}
    pending = [(0, len(points) - 1)]
    tolerance_squared = tolerance * tolerance

    while pending:
        start, end = pending.pop()
        ax, ay = points[start]
        bx, by = points[end]
        dx, dy = bx - ax, by - ay
        length_squared = dx * dx + dy * dy
        greatest_distance = tolerance_squared
        split = None

        for index in range(start + 1, end):
            px, py = points[index]
            if length_squared == 0:
                distance_squared = (px - ax) ** 2 + (py - ay) ** 2
            else:
                position = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / length_squared))
                distance_squared = (px - (ax + position * dx)) ** 2 + (
                    py - (ay + position * dy)
                ) ** 2
            if distance_squared > greatest_distance:
                greatest_distance = distance_squared
                split = index

        if split is not None:
            retained.add(split)
            pending.append((start, split))
            pending.append((split, end))

    return [point for index, point in enumerate(points) if index in retained]


def parse_routes(kml: bytes) -> tuple[list[list[Point]], int]:
    # The export contains MapsWithMe elements without declaring their prefix.
    # Bind that prefix in memory; no untrusted external entities are resolved.
    if kml.count(b"<kml ") != 1:
        raise ValueError("Unexpected KML document root")
    kml = kml.replace(b"<kml ", b'<kml xmlns:mwm="urn:maps-with-me" ', 1)

    routes: list[list[Point]] = []
    source_vertices = 0
    in_line_string = False

    for event, element in iterparse(BytesIO(kml), events=("start", "end")):
        tag = element.tag.rsplit("}", 1)[-1]
        if event == "start":
            if tag == "LineString":
                in_line_string = True
            continue

        if tag == "coordinates" and in_line_string:
            points: list[Point] = []
            for coordinate in (element.text or "").split():
                fields = coordinate.split(",")
                if len(fields) < 2:
                    raise ValueError(f"Malformed coordinate tuple: {coordinate}")
                points.append(project((float(fields[0]), float(fields[1]))))
            source_vertices += len(points)
            if len(points) >= 2:
                routes.append(points)

        if tag == "LineString":
            in_line_string = False
        element.clear()

    if not routes:
        raise ValueError("The KMZ contains no renderable LineString geometry")
    return routes, source_vertices


def parse_land() -> list[list[Point]]:
    with urlopen(NATURAL_EARTH_URL, timeout=60) as response:
        collection = json.load(response)
    indonesia = next(
        (
            feature
            for feature in collection["features"]
            if feature.get("properties", {}).get("ADMIN") == "Indonesia"
        ),
        None,
    )
    if indonesia is None:
        raise ValueError("Indonesia is absent from the Natural Earth source")

    geometry = indonesia["geometry"]
    polygons = (
        geometry["coordinates"]
        if geometry["type"] == "MultiPolygon"
        else [geometry["coordinates"]]
    )
    rings: list[list[Point]] = []
    for polygon in polygons:
        for ring in polygon:
            projected = [project(tuple(point[:2])) for point in ring]
            ring_bounds = (
                min(point[0] for point in projected),
                min(point[1] for point in projected),
                max(point[0] for point in projected),
                max(point[1] for point in projected),
            )
            if ring_bounds[2] >= 0 and ring_bounds[0] <= WIDTH and ring_bounds[3] >= 0 and ring_bounds[1] <= HEIGHT:
                rings.append(projected)
    return rings


def format_number(value: float) -> str:
    rounded = round(value, 1)
    if rounded == 0:
        return "0"
    return f"{rounded:.1f}".rstrip("0").rstrip(".")


def path_data(lines: list[list[Point]], tolerance: float, close: bool = False) -> tuple[str, int]:
    commands: list[str] = []
    rendered_vertices = 0
    for line in lines:
        simplified = simplify(line, tolerance)
        if len(simplified) < 2:
            continue
        coordinates = [
            f"{command}{format_number(x)} {format_number(y)}"
            for command, (x, y) in zip(("M", *(["L"] * (len(simplified) - 1))), simplified)
        ]
        commands.append("".join(coordinates) + ("Z" if close else ""))
        rendered_vertices += len(simplified)
    return "\n".join(commands), rendered_vertices


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("kmz", type=Path, help="Authorized source KMZ, read locally and never copied")
    args = parser.parse_args()

    try:
        with ZipFile(args.kmz) as archive:
            kml_name = next((name for name in archive.namelist() if name.endswith(".kml")), None)
            if kml_name is None:
                raise ValueError("The KMZ contains no KML document")
            kml = archive.read(kml_name)
    except (FileNotFoundError, BadZipFile) as error:
        raise SystemExit(f"Cannot read source KMZ: {error}") from error

    routes, source_vertices = parse_routes(kml)
    route_path, rendered_vertices = path_data(routes, ROUTE_TOLERANCE)
    land_path, _ = path_data(parse_land(), LAND_TOLERANCE, close=True)
    source_hash = sha256(args.kmz.read_bytes()).hexdigest()

    artifact = f"""// Generated by scripts/generate-infrastructure-atlas.py. Do not edit manually.
// Route geometry only. Placemark names, points, styles and metadata are excluded.
// Source: Existing Jaringan TIS (Jalur Only) (1).kmz, SHA-256 {source_hash}
// Land: Natural Earth 1:50m Admin 0 Countries, public domain.

export const ATLAS_WIDTH = {WIDTH}
export const ATLAS_HEIGHT = {HEIGHT}
export const ATLAS_BOUNDS = {{
  minLongitude: {MIN_LONGITUDE},
  maxLongitude: {MAX_LONGITUDE},
  minLatitude: {MIN_LATITUDE},
  maxLatitude: {MAX_LATITUDE},
}} as const
export const ATLAS_ROUTE_COUNT = {len(routes)}
export const ATLAS_SOURCE_VERTEX_COUNT = {source_vertices}
export const ATLAS_RENDERED_VERTEX_COUNT = {rendered_vertices}

export const ATLAS_LAND_PATH = `
{land_path}
`

export const ATLAS_ROUTE_PATH = `
{route_path}
`
"""
    temporary_path = OUTPUT_PATH.with_suffix(".ts.tmp")
    temporary_path.write_text(artifact)
    temporary_path.replace(OUTPUT_PATH)
    print(
        f"Wrote {OUTPUT_PATH.relative_to(OUTPUT_PATH.parents[2])}: "
        f"{len(routes):,} routes, {source_vertices:,} source vertices, "
        f"{rendered_vertices:,} rendered vertices, {len(artifact):,} bytes"
    )


if __name__ == "__main__":
    main()
