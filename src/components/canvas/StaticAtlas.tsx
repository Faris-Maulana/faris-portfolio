'use client'

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { Maximize2, Minus, Move, Plus, RotateCcw } from 'lucide-react'
import {
  ATLAS_BOUNDS,
  ATLAS_HEIGHT,
  ATLAS_LAND_PATH,
  ATLAS_ROUTE_COUNT,
  ATLAS_ROUTE_PATH,
  ATLAS_WIDTH,
} from '@/data/infrastructure-atlas'
import { keepDialogFocus } from '@/lib/dialog-focus'
import {
  INITIAL_ATLAS_VIEW,
  MAX_ATLAS_SCALE,
  MIN_ATLAS_SCALE,
  panAtlasView,
  zoomAtlasView,
  type AtlasPoint,
} from '@/lib/atlas-view'

const MAP_SIZE = { width: ATLAS_WIDTH, height: ATLAS_HEIGHT }
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
  const svgRef = useRef<SVGSVGElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const returnFocusRef = useRef<HTMLButtonElement | null>(null)
  const pointers = useRef(new Map<number, AtlasPoint>())
  const [view, setView] = useState(INITIAL_ATLAS_VIEW)
  const [isDragging, setDragging] = useState(false)
  const [isExpanded, setExpanded] = useState(false)

  const zoom = useCallback((factor: number, anchor: AtlasPoint = { x: ATLAS_WIDTH / 2, y: ATLAS_HEIGHT / 2 }) => {
    setView(current => zoomAtlasView(current, factor, anchor, MAP_SIZE))
  }, [])

  const pointFromClient = useCallback((clientX: number, clientY: number): AtlasPoint => {
    const svg = svgRef.current
    const matrix = svg?.getScreenCTM()
    if (svg && matrix) {
      const point = svg.createSVGPoint()
      point.x = clientX
      point.y = clientY
      return point.matrixTransform(matrix.inverse())
    }
    const bounds = svg?.getBoundingClientRect()
    if (!bounds?.width || !bounds.height) return { x: ATLAS_WIDTH / 2, y: ATLAS_HEIGHT / 2 }
    return {
      x: (clientX - bounds.left) * ATLAS_WIDTH / bounds.width,
      y: (clientY - bounds.top) * ATLAS_HEIGHT / bounds.height,
    }
  }, [])

  const reset = useCallback(() => {
    pointers.current.clear()
    setDragging(false)
    setView(INITIAL_ATLAS_VIEW)
  }, [])

  useEffect(() => {
    if (!isExpanded || !dialogRef.current) return
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    if (!dialog.open) dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isExpanded])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      event.stopPropagation()
      const deltaUnit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? svg.clientHeight : 1
      const factor = Math.exp(-event.deltaY * deltaUnit * 0.002)
      setView(current => zoomAtlasView(
        current,
        factor,
        pointFromClient(event.clientX, event.clientY),
        MAP_SIZE,
      ))
    }
    svg.addEventListener('wheel', handleWheel, { passive: false })
    return () => svg.removeEventListener('wheel', handleWheel)
  }, [pointFromClient, isExpanded])

  const startDrag = (event: PointerEvent<SVGSVGElement>) => {
    if ((event.pointerType === 'mouse' && event.button !== 0) || pointers.current.size >= 2) return
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    setDragging(true)
  }

  const moveDrag = (event: PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(event.pointerId)) return
    const previousPoints = [...pointers.current.values()]
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const currentPoints = [...pointers.current.values()]

    if (currentPoints.length === 1) {
      const previous = pointFromClient(previousPoints[0].x, previousPoints[0].y)
      const current = pointFromClient(event.clientX, event.clientY)
      setView(view => panAtlasView(view, { x: current.x - previous.x, y: current.y - previous.y }, MAP_SIZE))
      return
    }

    const [previousA, previousB] = previousPoints
    const [currentA, currentB] = currentPoints
    const previousSpan = Math.hypot(previousA.x - previousB.x, previousA.y - previousB.y)
    const currentSpan = Math.hypot(currentA.x - currentB.x, currentA.y - currentB.y)
    if (previousSpan < 1 || currentSpan < 1) return

    const previousCenter = pointFromClient((previousA.x + previousB.x) / 2, (previousA.y + previousB.y) / 2)
    const currentCenter = pointFromClient((currentA.x + currentB.x) / 2, (currentA.y + currentB.y) / 2)
    setView(view => {
      const zoomed = zoomAtlasView(view, currentSpan / previousSpan, previousCenter, MAP_SIZE)
      return panAtlasView(zoomed, { x: currentCenter.x - previousCenter.x, y: currentCenter.y - previousCenter.y }, MAP_SIZE)
    })
  }

  const endDrag = (event: PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.delete(event.pointerId)) return
    setDragging(pointers.current.size > 0)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const navigateWithKeyboard = (event: KeyboardEvent<SVGSVGElement>) => {
    const step = ATLAS_WIDTH / (view.scale * 8)
    const verticalStep = ATLAS_HEIGHT / (view.scale * 8)
    const actions: Record<string, () => void> = {
      ArrowLeft: () => setView(current => panAtlasView(current, { x: step, y: 0 }, MAP_SIZE)),
      ArrowRight: () => setView(current => panAtlasView(current, { x: -step, y: 0 }, MAP_SIZE)),
      ArrowUp: () => setView(current => panAtlasView(current, { x: 0, y: verticalStep }, MAP_SIZE)),
      ArrowDown: () => setView(current => panAtlasView(current, { x: 0, y: -verticalStep }, MAP_SIZE)),
      '+': () => zoom(1.5),
      '=': () => zoom(1.5),
      '-': () => zoom(2 / 3),
      _: () => zoom(2 / 3),
      Home: reset,
      '0': reset,
    }
    const action = actions[event.key]
    if (!action) return
    event.preventDefault()
    action()
  }

  const zoomPercent = Math.round(view.scale * 100)
  const transform = `translate(${view.x} ${view.y}) scale(${view.scale})`

  const closeExpanded = () => dialogRef.current?.close()

  const figure = (
    <figure
      className={`atlas-figure ${isExpanded ? 'atlas-figure-expanded' : ''} ${className}`}
      aria-label="Interactive TIS infrastructure route explorer"
      data-expanded={isExpanded}
    >
      <div className="atlas-map-head">
        <span className="atlas-map-title">Infrastructure atlas</span>
        <span>Public geometry</span>
      </div>
      <div className="atlas-map-canvas">
        <span className="atlas-reticle atlas-reticle-a" aria-hidden />
        <span className="atlas-reticle atlas-reticle-b" aria-hidden />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${ATLAS_WIDTH} ${ATLAS_HEIGHT}`}
          className={`atlas-map-svg ${isDragging ? 'is-dragging' : ''} ${isExpanded || view.scale > MIN_ATLAS_SCALE ? 'is-pannable' : ''}`}
          role="img"
          tabIndex={0}
          aria-labelledby="atlas-title atlas-desc"
          aria-describedby="atlas-interaction-help"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onDoubleClick={event => zoom(1.75, pointFromClient(event.clientX, event.clientY))}
          onKeyDown={navigateWithKeyboard}
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

          <g transform={transform} className="atlas-geometry">
            <path className="atlas-land" d={ATLAS_LAND_PATH} fillRule="evenodd" vectorEffect="non-scaling-stroke" />
            <path className="atlas-routes" d={ATLAS_ROUTE_PATH} data-route-count={ATLAS_ROUTE_COUNT} vectorEffect="non-scaling-stroke" />
            {view.scale < 2.5 ? (
              <g className="atlas-region-labels" aria-hidden>
                {REGION_LABELS.map(label => {
                  const { x, y } = project(label.longitude, label.latitude)
                  return <text key={label.name} x={x} y={y}>{label.name}</text>
                })}
              </g>
            ) : null}
          </g>

        </svg>

        <div className="atlas-map-controls" role="group" aria-label="Map navigation controls">
          <button type="button" onClick={() => zoom(1.5)} disabled={view.scale >= MAX_ATLAS_SCALE} aria-label="Zoom in" title="Zoom in (+)"><Plus size={16} aria-hidden /></button>
          <button type="button" onClick={() => zoom(2 / 3)} disabled={view.scale <= MIN_ATLAS_SCALE} aria-label="Zoom out" title="Zoom out (-)"><Minus size={16} aria-hidden /></button>
          <output className="atlas-zoom-level" aria-label="Current zoom">{zoomPercent}%</output>
          <button type="button" onClick={reset} disabled={view.scale === MIN_ATLAS_SCALE && view.x === 0 && view.y === 0} aria-label="Reset map view" title="Reset view (0)"><RotateCcw size={15} aria-hidden /></button>
        </div>
        <button
          ref={returnFocusRef}
          type="button"
          className="atlas-expand"
          onClick={() => {
            if (isExpanded) {
              closeExpanded()
            } else {
              reset()
              setExpanded(true)
            }
          }}
          aria-label={isExpanded ? 'Close expanded map' : 'Expand infrastructure map'}
          aria-expanded={isExpanded}
        >
          <Maximize2 size={14} aria-hidden /><span>{isExpanded ? 'Close' : 'Expand'}</span>
        </button>
      </div>
      <figcaption className="atlas-map-footer">
        <span><i className="atlas-legend-signal" aria-hidden />{ATLAS_ROUTE_COUNT.toLocaleString('en-US')} source paths</span>
        <span className="atlas-drag-indicator" aria-hidden><Move size={13} />{isDragging ? 'Exploring' : 'Drag or pinch to explore'}</span>
        <span>Static, not live telemetry</span>
      </figcaption>
      <p id="atlas-interaction-help" className="atlas-interaction-help">
        Focus the map and use plus, minus and arrow keys. Press zero to reset. Drag to pan, double-click to zoom, or use Control or Command with the scroll wheel. On a touch screen, drag with one finger to pan and pinch with two fingers to zoom.
      </p>
    </figure>
  )

  if (!isExpanded) return figure
  return createPortal(
    <dialog
      ref={dialogRef}
      className="atlas-explorer-dialog"
      aria-label="Expanded infrastructure map"
      data-lenis-prevent
      onKeyDown={keepDialogFocus}
      onClose={() => {
        if (dialogRef.current?.open) return
        setExpanded(false)
        requestAnimationFrame(() => returnFocusRef.current?.focus())
      }}
      onClick={event => { if (event.target === event.currentTarget) closeExpanded() }}
    >
      {figure}
    </dialog>,
    document.body,
  )
}
