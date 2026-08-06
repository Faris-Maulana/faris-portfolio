/**
 * Topology generator for the hero backbone visual.
 *
 * The graph is built deterministically from a fixed seed so every render, * server, client, reload, produces the identical structure. That matters for
 * two reasons: React hydration never sees a mismatch, and the composition can
 * be art-directed (we know where the hubs land) instead of hoping random
 * points happen to look balanced.
 *
 * Shape is deliberate, not noise: a ring of hubs (the backbone) with leaf
 * clusters hanging off each one (regional nodes / agent workers).
 */

export interface Topology {
  /** Flat xyz triples for every node, hubs first. */
  positions: Float32Array
  /** Flat rgb triples matching `positions`. */
  colors: Float32Array
  /** Per-node point size multiplier. */
  sizes: Float32Array
  /** Flat xyz pairs, 2 vertices per edge. */
  edgePositions: Float32Array
  /** Flat rgb pairs matching `edgePositions`. */
  edgeColors: Float32Array
  /** Endpoint pairs as node indices, used to animate travelling pulses. */
  edgeIndices: Array<[number, number]>
  hubCount: number
  nodeCount: number
}

/** mulberry32, small, fast, good enough distribution for layout. */
function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Box-Muller: clusters look organic, uniform-random clouds look like static. */
function gaussian(rng: () => number, spread: number) {
  const u = Math.max(rng(), 1e-6)
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * spread
}

const HUB_COLOR = [0.36, 0.95, 0.75] as const // signal mint
const LEAF_WARM = [0.55, 0.48, 1.0] as const // agent violet
const LEAF_COOL = [0.35, 0.72, 1.0] as const // data blue

export function buildTopology(opts: {
  hubs?: number
  leavesPerHub?: number
  radius?: number
  depth?: number
  seed?: number
} = {}): Topology {
  const hubs = opts.hubs ?? 7
  const leavesPerHub = opts.leavesPerHub ?? 22
  // Kept well inside the camera frustum. At z=20 with a 46° fov the visible
  // half-height is ~8.5 units, so a wider graph pushes most of its nodes off
  // screen and leaves only long radiating edges in view.
  const radius = opts.radius ?? 5.2
  const depth = opts.depth ?? 4.5
  const rng = makeRng(opts.seed ?? 0x5c1f2a)

  const nodeCount = hubs + hubs * leavesPerHub
  const positions = new Float32Array(nodeCount * 3)
  const colors = new Float32Array(nodeCount * 3)
  const sizes = new Float32Array(nodeCount)

  // ── Hubs: an irregular ring so the silhouette never reads as a perfect
  //    circle, which would look like a logo rather than a network.
  for (let i = 0; i < hubs; i++) {
    const angle = (i / hubs) * Math.PI * 2 + (rng() - 0.5) * 0.5
    const r = radius * (0.72 + rng() * 0.42)
    const o = i * 3
    positions[o] = Math.cos(angle) * r
    positions[o + 1] = Math.sin(angle) * r * 0.58 // flattened, screens are wide
    positions[o + 2] = (rng() - 0.5) * depth
    colors[o] = HUB_COLOR[0]
    colors[o + 1] = HUB_COLOR[1]
    colors[o + 2] = HUB_COLOR[2]
    sizes[i] = 2.4 + rng() * 0.8
  }

  // ── Leaves clustered around their parent hub.
  let n = hubs
  for (let h = 0; h < hubs; h++) {
    const ho = h * 3
    for (let l = 0; l < leavesPerHub; l++) {
      const o = n * 3
      positions[o] = positions[ho] + gaussian(rng, 1.45)
      positions[o + 1] = positions[ho + 1] + gaussian(rng, 1.15)
      positions[o + 2] = positions[ho + 2] + gaussian(rng, 1.3)

      const warm = rng() > 0.45
      const tint = warm ? LEAF_WARM : LEAF_COOL
      const fade = 0.35 + rng() * 0.5
      colors[o] = tint[0] * fade
      colors[o + 1] = tint[1] * fade
      colors[o + 2] = tint[2] * fade
      sizes[n] = 0.55 + rng() * 0.7
      n++
    }
  }

  // ── Edges: leaf→hub, hub→hub ring, plus sparse cross-links.
  const edgeIndices: Array<[number, number]> = []
  n = hubs
  for (let h = 0; h < hubs; h++) {
    for (let l = 0; l < leavesPerHub; l++) {
      // Only ~55% of leaves are wired up; a fully connected cluster turns
      // into a solid blob at this density.
      if (rng() < 0.55) edgeIndices.push([h, n])
      n++
    }
  }
  for (let h = 0; h < hubs; h++) edgeIndices.push([h, (h + 1) % hubs])
  for (let h = 0; h < hubs; h++) {
    if (rng() < 0.5) edgeIndices.push([h, (h + 2 + Math.floor(rng() * 2)) % hubs])
  }

  const edgePositions = new Float32Array(edgeIndices.length * 6)
  const edgeColors = new Float32Array(edgeIndices.length * 6)

  edgeIndices.forEach(([a, b], i) => {
    const ao = a * 3
    const bo = b * 3
    const eo = i * 6
    edgePositions[eo] = positions[ao]
    edgePositions[eo + 1] = positions[ao + 1]
    edgePositions[eo + 2] = positions[ao + 2]
    edgePositions[eo + 3] = positions[bo]
    edgePositions[eo + 4] = positions[bo + 1]
    edgePositions[eo + 5] = positions[bo + 2]

    // Backbone links (hub→hub) are brighter than the capillaries.
    const trunk = a < hubs && b < hubs
    const near = trunk ? 0.5 : 0.22
    const far = trunk ? 0.28 : 0.03
    edgeColors[eo] = HUB_COLOR[0] * near
    edgeColors[eo + 1] = HUB_COLOR[1] * near
    edgeColors[eo + 2] = HUB_COLOR[2] * near
    edgeColors[eo + 3] = HUB_COLOR[0] * far
    edgeColors[eo + 4] = HUB_COLOR[1] * far
    edgeColors[eo + 5] = HUB_COLOR[2] * far
  })

  return {
    positions,
    colors,
    sizes,
    edgePositions,
    edgeColors,
    edgeIndices,
    hubCount: hubs,
    nodeCount,
  }
}
