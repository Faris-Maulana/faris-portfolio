import {
  ATLAS_BOUNDS,
  ATLAS_HEIGHT,
  ATLAS_LAND_PATH,
  ATLAS_ROUTE_COUNT,
  ATLAS_ROUTE_PATH,
  ATLAS_WIDTH,
} from '@/data/infrastructure-atlas'

const LONGITUDES = [105, 110, 115, 120]
const LATITUDES = [0, -5, -10]
const REGION_LABELS = [
  { name: 'KALIMANTAN', longitude: 114.5, latitude: 0.7 },
  { name: 'JAVA', longitude: 108.2, latitude: -9.2 },
  { name: 'SULAWESI', longitude: 120.7, latitude: -1.2 },
]

function project(longitude: number, latitude: number) {
  return {
    x: (longitude - ATLAS_BOUNDS.minLongitude) * ATLAS_WIDTH
      / (ATLAS_BOUNDS.maxLongitude - ATLAS_BOUNDS.minLongitude),
    y: (ATLAS_BOUNDS.maxLatitude - latitude) * ATLAS_HEIGHT
      / (ATLAS_BOUNDS.maxLatitude - ATLAS_BOUNDS.minLatitude),
  }
}

export function StaticAtlas({ className = '' }: { className?: string }) {
  return (
    <figure className={`atlas-figure ${className}`} aria-label="Existing TIS infrastructure route abstraction">
      <div className="atlas-map-head"><span>Infrastructure atlas</span><span>Public abstraction</span></div>
      <div className="atlas-map-canvas">
        <span className="atlas-reticle atlas-reticle-a" aria-hidden />
        <span className="atlas-reticle atlas-reticle-b" aria-hidden />
        <svg
          viewBox={`0 0 ${ATLAS_WIDTH} ${ATLAS_HEIGHT}`}
          className="block h-auto w-full"
          role="img"
          aria-labelledby="atlas-title atlas-desc"
        >
          <title id="atlas-title">Existing TIS infrastructure corridors</title>
          <desc id="atlas-desc">
            {ATLAS_ROUTE_COUNT} route paths derived from the authorized Existing Jaringan TIS KMZ,
            simplified for public display over Natural Earth land geometry. Points, site names,
            operational metadata and live telemetry are not included.
          </desc>
          <defs>
            <pattern id="atlas-grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0V48" fill="none" stroke="var(--color-grid)" strokeWidth="1" />
            </pattern>
          </defs>

          <rect width={ATLAS_WIDTH} height={ATLAS_HEIGHT} className="atlas-map-background" />
          <rect width={ATLAS_WIDTH} height={ATLAS_HEIGHT} fill="url(#atlas-grid-pattern)" />

          <g className="atlas-graticule" aria-hidden>
            {LONGITUDES.map(longitude => {
              const { x } = project(longitude, 0)
              return (
                <g key={longitude}>
                  <line x1={x} y1="0" x2={x} y2={ATLAS_HEIGHT} />
                  <text x={x + 7} y="24">{longitude}° E</text>
                </g>
              )
            })}
            {LATITUDES.map(latitude => {
              const { y } = project(105, latitude)
              return (
                <g key={latitude}>
                  <line x1="0" y1={y} x2={ATLAS_WIDTH} y2={y} />
                  <text x="16" y={y - 8}>
                    {Math.abs(latitude).toString().padStart(2, '0')}° {latitude === 0 ? '' : latitude < 0 ? 'S' : 'N'}
                  </text>
                </g>
              )
            })}
          </g>

          <path className="atlas-land" d={ATLAS_LAND_PATH} fillRule="evenodd" />
          <path className="atlas-routes" d={ATLAS_ROUTE_PATH} data-route-count={ATLAS_ROUTE_COUNT} />

          <g className="atlas-region-labels" aria-hidden>
            {REGION_LABELS.map(label => {
              const { x, y } = project(label.longitude, label.latitude)
              return <text key={label.name} x={x} y={y}>{label.name}</text>
            })}
          </g>

          <g className="atlas-map-meta" aria-hidden>
            <text x="18" y={ATLAS_HEIGHT - 18}>WGS 84 / ROUTE GEOMETRY</text>
            <text x={ATLAS_WIDTH - 18} y={ATLAS_HEIGHT - 18} textAnchor="end">{ATLAS_ROUTE_COUNT.toLocaleString('en-US')} SOURCE PATHS</text>
          </g>
        </svg>
      </div>
      <figcaption className="atlas-map-footer">
        <span><i className="atlas-legend-signal" aria-hidden />Existing route geometry</span>
        <span className="atlas-route-count">{ATLAS_ROUTE_COUNT.toLocaleString('en-US')} paths</span>
        <span>Static, not live telemetry</span>
      </figcaption>
    </figure>
  )
}
