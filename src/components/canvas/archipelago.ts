import { CONTEXT_B64, LAND_B64 } from './archipelago-points'

/**
 * Geometry for the hero scene: land points, hub cities, and the stylised
 * backbone drawn between them.
 *
 * The routes are deliberately illustrative. They follow the public shape of a
 * national backbone (trunk down Sumatra and Java, subsea hops to Kalimantan,
 * Sulawesi and the east) and are not a map of any operator's real network.
 * Publishing real fibre routes for critical infrastructure is not something a
 * portfolio should do, and the caption on the page says so.
 */

/** Map centre and scale, in degrees → scene units. */
const LON0 = 118
const LAT0 = -2.4
export const SCALE = 0.22

export function project(lon: number, lat: number): [number, number] {
  return [(lon - LON0) * SCALE, (lat - LAT0) * SCALE]
}

function decode(b64: string): Int16Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Int16Array(bytes.buffer)
}

/** mulberry32. Deterministic so the scene is identical on every load. */
function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface LandCloud {
  positions: Float32Array
  /** 0 for Indonesian land, 1 for neighbouring context land. */
  kind: Float32Array
  /** Per-point random in [0, 1), drives twinkle phase in the shader. */
  seed: Float32Array
  count: number
}

export function buildLand(): LandCloud {
  const land = decode(LAND_B64)
  const context = decode(CONTEXT_B64)
  const count = (land.length + context.length) / 2
  const positions = new Float32Array(count * 3)
  const kind = new Float32Array(count)
  const seed = new Float32Array(count)
  const rng = makeRng(0x1d0)

  let n = 0
  const push = (src: Int16Array, k: number) => {
    for (let i = 0; i < src.length; i += 2, n++) {
      const [x, y] = project(src[i] / 100, src[i + 1] / 100)
      positions[n * 3] = x
      positions[n * 3 + 1] = y
      // A hair of relief so the cloud reads as terrain from a raking angle
      // rather than as a printed sheet.
      positions[n * 3 + 2] = rng() * 0.035
      kind[n] = k
      seed[n] = rng()
    }
  }
  push(land, 0)
  push(context, 1)

  return { positions, kind, seed, count }
}

export type CityId =
  | 'aceh' | 'medan' | 'batam' | 'pekanbaru' | 'padang' | 'palembang'
  | 'lampung' | 'jakarta' | 'bandung' | 'semarang' | 'surabaya' | 'denpasar'
  | 'mataram' | 'kupang' | 'pontianak' | 'banjarmasin' | 'balikpapan'
  | 'makassar' | 'palu' | 'manado' | 'ternate' | 'ambon' | 'sorong'
  | 'jayapura' | 'merauke'

export const CITIES: Record<CityId, { name: string; lon: number; lat: number; hub?: boolean }> = {
  aceh:        { name: 'Banda Aceh',  lon: 95.32,  lat: 5.55 },
  medan:       { name: 'Medan',       lon: 98.67,  lat: 3.59, hub: true },
  batam:       { name: 'Batam',       lon: 104.03, lat: 1.13 },
  pekanbaru:   { name: 'Pekanbaru',   lon: 101.45, lat: 0.51 },
  padang:      { name: 'Padang',      lon: 100.35, lat: -0.95 },
  palembang:   { name: 'Palembang',   lon: 104.75, lat: -2.99 },
  lampung:     { name: 'Lampung',     lon: 105.26, lat: -5.43 },
  jakarta:     { name: 'Jakarta',     lon: 106.85, lat: -6.21, hub: true },
  bandung:     { name: 'Bandung',     lon: 107.61, lat: -6.91 },
  semarang:    { name: 'Semarang',    lon: 110.42, lat: -6.97 },
  surabaya:    { name: 'Surabaya',    lon: 112.75, lat: -7.25, hub: true },
  denpasar:    { name: 'Denpasar',    lon: 115.22, lat: -8.65 },
  mataram:     { name: 'Mataram',     lon: 116.12, lat: -8.58 },
  kupang:      { name: 'Kupang',      lon: 123.6,  lat: -10.17 },
  pontianak:   { name: 'Pontianak',   lon: 109.33, lat: -0.03 },
  banjarmasin: { name: 'Banjarmasin', lon: 114.59, lat: -3.32 },
  balikpapan:  { name: 'Balikpapan',  lon: 116.83, lat: -1.27, hub: true },
  makassar:    { name: 'Makassar',    lon: 119.42, lat: -5.14, hub: true },
  palu:        { name: 'Palu',        lon: 119.87, lat: -0.9 },
  manado:      { name: 'Manado',      lon: 124.84, lat: 1.47, hub: true },
  ternate:     { name: 'Ternate',     lon: 127.38, lat: 0.79 },
  ambon:       { name: 'Ambon',       lon: 128.18, lat: -3.69 },
  sorong:      { name: 'Sorong',      lon: 131.25, lat: -0.88 },
  jayapura:    { name: 'Jayapura',    lon: 140.72, lat: -2.53, hub: true },
  merauke:     { name: 'Merauke',     lon: 140.4,  lat: -8.5 },
}

/** Illustrative trunk. Land segments stay flat, subsea hops arc. */
const ROUTES: Array<[CityId, CityId, 'land' | 'sea']> = [
  ['aceh', 'medan', 'land'],
  ['medan', 'pekanbaru', 'land'],
  ['pekanbaru', 'padang', 'land'],
  ['pekanbaru', 'batam', 'sea'],
  ['pekanbaru', 'palembang', 'land'],
  ['palembang', 'lampung', 'land'],
  ['lampung', 'jakarta', 'sea'],
  ['jakarta', 'bandung', 'land'],
  ['bandung', 'semarang', 'land'],
  ['semarang', 'surabaya', 'land'],
  ['surabaya', 'denpasar', 'land'],
  ['denpasar', 'mataram', 'sea'],
  ['mataram', 'kupang', 'sea'],
  ['jakarta', 'pontianak', 'sea'],
  ['batam', 'pontianak', 'sea'],
  ['pontianak', 'banjarmasin', 'land'],
  ['surabaya', 'banjarmasin', 'sea'],
  ['banjarmasin', 'balikpapan', 'land'],
  ['balikpapan', 'makassar', 'sea'],
  ['surabaya', 'makassar', 'sea'],
  ['makassar', 'palu', 'land'],
  ['palu', 'manado', 'land'],
  ['manado', 'ternate', 'sea'],
  ['makassar', 'ambon', 'sea'],
  ['ternate', 'sorong', 'sea'],
  ['ambon', 'sorong', 'sea'],
  ['sorong', 'jayapura', 'sea'],
  ['jayapura', 'merauke', 'land'],
  ['kupang', 'ambon', 'sea'],
]

export const SEGMENTS_PER_ROUTE = 28

export interface Route {
  a: CityId
  b: CityId
  /** Quadratic Bézier control points in scene space. */
  p0: [number, number, number]
  p1: [number, number, number]
  p2: [number, number, number]
}

export function buildRoutes(): Route[] {
  return ROUTES.map(([a, b, kind]) => {
    const [ax, ay] = project(CITIES[a].lon, CITIES[a].lat)
    const [bx, by] = project(CITIES[b].lon, CITIES[b].lat)
    const len = Math.hypot(bx - ax, by - ay)
    const lift = kind === 'sea' ? 0.12 + len * 0.16 : 0.02 + len * 0.03
    return {
      a,
      b,
      p0: [ax, ay, 0.02],
      p1: [(ax + bx) / 2, (ay + by) / 2, lift],
      p2: [bx, by, 0.02],
    }
  })
}

export function bezier(r: Route, t: number, out: Float32Array, o: number) {
  const u = 1 - t
  const w0 = u * u
  const w1 = 2 * u * t
  const w2 = t * t
  out[o] = w0 * r.p0[0] + w1 * r.p1[0] + w2 * r.p2[0]
  out[o + 1] = w0 * r.p0[1] + w1 * r.p1[1] + w2 * r.p2[1]
  out[o + 2] = w0 * r.p0[2] + w1 * r.p1[2] + w2 * r.p2[2]
}

/** Line-segment buffer for every route, two vertices per segment. */
export function buildRouteLines(routes: Route[]) {
  const segs = routes.length * SEGMENTS_PER_ROUTE
  const positions = new Float32Array(segs * 6)
  // Fraction along the route, used by the shader for a travelling sheen.
  const along = new Float32Array(segs * 2)
  const tmp = new Float32Array(3)
  let s = 0
  for (const r of routes) {
    for (let i = 0; i < SEGMENTS_PER_ROUTE; i++, s++) {
      const t0 = i / SEGMENTS_PER_ROUTE
      const t1 = (i + 1) / SEGMENTS_PER_ROUTE
      bezier(r, t0, tmp, 0)
      positions.set(tmp, s * 6)
      bezier(r, t1, tmp, 0)
      positions.set(tmp, s * 6 + 3)
      along[s * 2] = t0
      along[s * 2 + 1] = t1
    }
  }
  return { positions, along }
}

/**
 * Where the camera rests for each section. The page is a tour of the
 * archipelago: each chapter of the story is anchored to a hub.
 */
export const CHAPTERS: Record<string, { city: CityId | null; distance: number }> = {
  hero:         { city: null,         distance: 0.92 },
  leadership:   { city: 'jakarta',    distance: 0.5 },
  work:         { city: 'balikpapan', distance: 0.58 },
  experience:   { city: 'surabaya',   distance: 0.55 },
  research:     { city: 'makassar',   distance: 0.6 },
  capabilities: { city: 'manado',     distance: 0.62 },
  credentials:  { city: 'medan',      distance: 0.6 },
  writing:      { city: 'denpasar',   distance: 0.6 },
  contact:      { city: 'jakarta',    distance: 0.9 },
}
