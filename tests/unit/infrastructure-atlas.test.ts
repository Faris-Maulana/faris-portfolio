import { describe, expect, it } from 'vitest'
import {
  ATLAS_HEIGHT,
  ATLAS_ROUTE_COUNT,
  ATLAS_RENDERED_VERTEX_COUNT,
  ATLAS_ROUTE_PATH,
  ATLAS_SOURCE_VERTEX_COUNT,
  ATLAS_WIDTH,
} from '@/data/infrastructure-atlas'

const COORDINATE = /[ML](-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g

describe('public infrastructure atlas artifact', () => {
  it('retains every renderable source path as one SVG subpath', () => {
    const subpaths = ATLAS_ROUTE_PATH.trim().split('\n')

    expect(subpaths).toHaveLength(ATLAS_ROUTE_COUNT)
    expect(subpaths.every(subpath => subpath.startsWith('M') && subpath.includes('L'))).toBe(true)
  })

  it('contains finite, in-frame coordinates and the recorded simplification count', () => {
    const coordinates = [...ATLAS_ROUTE_PATH.matchAll(COORDINATE)]

    expect(coordinates).toHaveLength(ATLAS_RENDERED_VERTEX_COUNT)
    expect(ATLAS_SOURCE_VERTEX_COUNT).toBeGreaterThan(ATLAS_RENDERED_VERTEX_COUNT)
    for (const coordinate of coordinates) {
      const x = Number(coordinate[1])
      const y = Number(coordinate[2])
      expect(Number.isFinite(x) && x >= 0 && x <= ATLAS_WIDTH).toBe(true)
      expect(Number.isFinite(y) && y >= 0 && y <= ATLAS_HEIGHT).toBe(true)
    }
  })

  it('does not carry source XML or operational metadata into the public artifact', () => {
    expect(ATLAS_ROUTE_PATH).not.toContain('<')
    expect(ATLAS_ROUTE_PATH).not.toContain('ExtendedData')
    expect(ATLAS_ROUTE_PATH).not.toContain('Placemark')
  })
})
