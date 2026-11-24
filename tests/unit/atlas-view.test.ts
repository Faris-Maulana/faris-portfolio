import { describe, expect, it } from 'vitest'
import {
  constrainAtlasView,
  INITIAL_ATLAS_VIEW,
  MAX_ATLAS_SCALE,
  panAtlasView,
  zoomAtlasView,
} from '@/lib/atlas-view'

const SIZE = { width: 960, height: 576 }

describe('atlas viewport geometry', () => {
  it('zooms around the anchor without moving its underlying source point', () => {
    const anchor = { x: 740, y: 270 }
    const before = { x: -340, y: -120, scale: 2 }
    const after = zoomAtlasView(before, 1.5, anchor, SIZE)
    const sourceBefore = { x: (anchor.x - before.x) / before.scale, y: (anchor.y - before.y) / before.scale }
    const sourceAfter = { x: (anchor.x - after.x) / after.scale, y: (anchor.y - after.y) / after.scale }

    expect(after.scale).toBe(3)
    expect(sourceAfter.x).toBeCloseTo(sourceBefore.x)
    expect(sourceAfter.y).toBeCloseTo(sourceBefore.y)
  })

  it('clamps repeated zoom operations to one-to-eight times magnification', () => {
    const center = { x: 480, y: 288 }
    const maximum = zoomAtlasView(INITIAL_ATLAS_VIEW, 100, center, SIZE)
    const minimum = zoomAtlasView(maximum, 0.001, center, SIZE)

    expect(maximum).toEqual({ x: 480 * (1 - MAX_ATLAS_SCALE), y: 288 * (1 - MAX_ATLAS_SCALE), scale: MAX_ATLAS_SCALE })
    expect(minimum).toEqual(INITIAL_ATLAS_VIEW)
  })

  it('keeps panning inside the rendered geography bounds', () => {
    const zoomed = { x: -1000, y: -500, scale: 3 }
    const beyondTopLeft = panAtlasView(zoomed, { x: 10_000, y: 10_000 }, SIZE)
    const beyondBottomRight = panAtlasView(zoomed, { x: -100_000, y: -100_000 }, SIZE)

    expect(beyondTopLeft).toEqual({ x: 0, y: 0, scale: 3 })
    expect(beyondBottomRight).toEqual({ x: SIZE.width * -2, y: SIZE.height * -2, scale: 3 })
    expect(panAtlasView(INITIAL_ATLAS_VIEW, { x: 100, y: 100 }, SIZE)).toEqual(INITIAL_ATLAS_VIEW)
  })

  it('recovers from invalid geometry rather than poisoning the SVG transform', () => {
    expect(constrainAtlasView({ x: Number.NaN, y: 0, scale: 2 }, SIZE)).toEqual(INITIAL_ATLAS_VIEW)
    expect(constrainAtlasView({ x: 0, y: 0, scale: Number.POSITIVE_INFINITY }, SIZE)).toEqual(INITIAL_ATLAS_VIEW)
    expect(constrainAtlasView({ x: 0, y: 0, scale: 2 }, { width: 0, height: 576 })).toEqual(INITIAL_ATLAS_VIEW)
    expect(zoomAtlasView(INITIAL_ATLAS_VIEW, Number.NaN, { x: 0, y: 0 }, SIZE)).toEqual(INITIAL_ATLAS_VIEW)
    expect(panAtlasView(INITIAL_ATLAS_VIEW, { x: Number.NaN, y: 0 }, SIZE)).toEqual(INITIAL_ATLAS_VIEW)
  })
})
