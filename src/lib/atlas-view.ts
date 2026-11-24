export interface AtlasPoint {
  x: number
  y: number
}

export interface AtlasView extends AtlasPoint {
  scale: number
}

export interface AtlasSize {
  width: number
  height: number
}

export const MIN_ATLAS_SCALE = 1
export const MAX_ATLAS_SCALE = 8
export const INITIAL_ATLAS_VIEW: AtlasView = { x: 0, y: 0, scale: MIN_ATLAS_SCALE }

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value))

/** Keep the map covering its viewport at every zoom level and reject invalid input. */
export function constrainAtlasView(view: AtlasView, size: AtlasSize): AtlasView {
  if (![view.x, view.y, view.scale, size.width, size.height].every(Number.isFinite) || size.width <= 0 || size.height <= 0) {
    return INITIAL_ATLAS_VIEW
  }

  const scale = clamp(view.scale, MIN_ATLAS_SCALE, MAX_ATLAS_SCALE)
  return {
    scale,
    x: clamp(view.x, size.width * (1 - scale), 0),
    y: clamp(view.y, size.height * (1 - scale), 0),
  }
}

/** Zoom around a viewport anchor without moving the geography beneath it. */
export function zoomAtlasView(view: AtlasView, factor: number, anchor: AtlasPoint, size: AtlasSize): AtlasView {
  if (!Number.isFinite(factor) || factor <= 0 || ![anchor.x, anchor.y].every(Number.isFinite)) return constrainAtlasView(view, size)

  const current = constrainAtlasView(view, size)
  const scale = clamp(current.scale * factor, MIN_ATLAS_SCALE, MAX_ATLAS_SCALE)
  const sourceX = (anchor.x - current.x) / current.scale
  const sourceY = (anchor.y - current.y) / current.scale

  return constrainAtlasView({
    scale,
    x: anchor.x - sourceX * scale,
    y: anchor.y - sourceY * scale,
  }, size)
}

export function panAtlasView(view: AtlasView, delta: AtlasPoint, size: AtlasSize): AtlasView {
  if (![delta.x, delta.y].every(Number.isFinite)) return constrainAtlasView(view, size)
  return constrainAtlasView({ ...view, x: view.x + delta.x, y: view.y + delta.y }, size)
}
