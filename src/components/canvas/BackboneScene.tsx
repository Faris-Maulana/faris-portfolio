'use client'

import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  CHAPTERS,
  CITIES,
  bezier,
  buildLand,
  buildRouteLines,
  buildRoutes,
  project,
  type CityId,
} from './archipelago'

/* ────────────────────────────────────────────────────────────────────────
   Chapter tracking.

   The camera follows whichever section owns the middle of the viewport. The
   value lives in a module-level ref read inside useFrame, so scrolling never
   re-renders React; it only changes where the next frame eases toward.
   ──────────────────────────────────────────────────────────────────────── */

const chapter = { current: 'hero' }

function useChapterTracking(host: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const ids = Object.keys(CHAPTERS)
    const visible = new Map<string, number>()

    const apply = () => {
      let best = 'hero'
      let bestRatio = 0
      for (const [id, ratio] of visible) {
        if (ratio > bestRatio) {
          best = id
          bestRatio = ratio
        }
      }
      chapter.current = best
      // Full strength behind the hero, receded behind reading sections so
      // body copy never competes with moving geometry.
      if (host.current) host.current.style.opacity = best === 'hero' ? '1' : '0.3'
    }

    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0)
        apply()
      },
      // A band across the middle of the screen decides the chapter.
      { rootMargin: '-35% 0px -35% 0px', threshold: [0, 0.01, 0.25, 0.5, 0.75, 1] }
    )

    const observe = () =>
      ids.forEach(id => {
        const el = document.getElementById(id)
        if (el) io.observe(el)
      })
    observe()

    return () => io.disconnect()
  }, [host])
}

/* ────────────────────────────────────────────────────────────────────────
   Shaders
   ──────────────────────────────────────────────────────────────────────── */

const LAND_VERT = /* glsl */ `
  attribute float aKind;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPx;
  uniform vec2  uFocus;
  uniform float uScan;
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float depth = -mv.z;

    // A slow survey sweep, west to east, like a scan passing over the map.
    float sweep = exp(-pow((position.x - uScan) * 1.6, 2.0));
    float focus = exp(-pow(distance(position.xy, uFocus) * 1.25, 2.0));
    float twinkle = 0.75 + 0.25 * sin(uTime * 1.3 + aSeed * 40.0);

    vec3 base   = vec3(0.30, 0.36, 0.42);
    vec3 lime   = vec3(0.78, 1.00, 0.30);
    vec3 col    = mix(base, lime, clamp(sweep * 0.55 + focus * 0.75, 0.0, 1.0));
    float a     = (0.55 + 0.45 * twinkle) * (0.55 + sweep * 0.45 + focus * 0.6);

    if (aKind > 0.5) { col = vec3(0.17, 0.20, 0.24); a = 0.5; }

    vColor = col;
    vAlpha = a * clamp(1.4 - depth / 26.0, 0.15, 1.0);
    gl_PointSize = (1.0 + focus * 0.9) * uPx * (16.0 / max(depth, 0.5));
    gl_Position = projectionMatrix * mv;
  }
`

const DOT_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vAlpha;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.18, r);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`

const ROUTE_VERT = /* glsl */ `
  attribute float aAlong;
  uniform float uTime;
  varying float vAlpha;
  void main() {
    // A sheen that runs the length of every route, offset per route by its
    // own position so the network never pulses in unison.
    float sheen = pow(fract(aAlong - uTime * 0.22 + position.x * 0.05), 6.0);
    vAlpha = 0.22 + sheen * 0.65;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const ROUTE_FRAG = /* glsl */ `
  varying float vAlpha;
  void main() { gl_FragColor = vec4(0.78, 1.0, 0.30, vAlpha); }
`

const NODE_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3  aColor;
  uniform float uPx;
  uniform float uTime;
  varying vec3  vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vColor = aColor;
    vAlpha = 1.0;
    gl_PointSize = aSize * uPx * (16.0 / max(-mv.z, 0.5));
    gl_Position = projectionMatrix * mv;
  }
`

const GLOW_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vAlpha;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    float core = smoothstep(0.16, 0.0, r);
    float halo = pow(smoothstep(0.5, 0.0, r), 3.0) * 0.55;
    gl_FragColor = vec4(vColor, (core + halo) * vAlpha);
  }
`

const RING_FRAG = /* glsl */ `
  uniform float uTime;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d) * 2.0;
    float wave = fract(uTime * 0.55);
    float ring = smoothstep(0.06, 0.0, abs(r - wave)) * (1.0 - wave);
    if (r > 1.0) discard;
    gl_FragColor = vec4(0.78, 1.0, 0.30, ring * 0.9);
  }
`

/* ────────────────────────────────────────────────────────────────────────
   Scene
   ──────────────────────────────────────────────────────────────────────── */

const PULSES = 34
const TILT = -0.74

function Archipelago() {
  const land = useMemo(() => buildLand(), [])
  const routes = useMemo(() => buildRoutes(), [])
  const lines = useMemo(() => buildRouteLines(routes), [routes])

  const cityIds = useMemo(() => Object.keys(CITIES) as CityId[], [])
  const nodes = useMemo(() => {
    const pos = new Float32Array(cityIds.length * 3)
    const col = new Float32Array(cityIds.length * 3)
    const size = new Float32Array(cityIds.length)
    cityIds.forEach((id, i) => {
      const [x, y] = project(CITIES[id].lon, CITIES[id].lat)
      pos.set([x, y, 0.03], i * 3)
      const hub = CITIES[id].hub
      col.set(hub ? [0.86, 1.0, 0.5] : [0.62, 0.8, 0.32], i * 3)
      size[i] = hub ? 9 : 5.5
    })
    return { pos, col, size }
  }, [cityIds])

  const pulseState = useMemo(() => {
    const pos = new Float32Array(PULSES * 3)
    const col = new Float32Array(PULSES * 3)
    const size = new Float32Array(PULSES)
    for (let i = 0; i < PULSES; i++) {
      col.set([0.9, 1.0, 0.65], i * 3)
      size[i] = 4.2
    }
    return { pos, col, size }
  }, [])

  const ringPos = useMemo(() => new Float32Array(3), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPx: { value: 1 },
      uFocus: { value: new THREE.Vector2(0, 0) },
      uScan: { value: -6 },
    }),
    []
  )
  const ringUniforms = useMemo(() => ({ uTime: uniforms.uTime }), [uniforms])

  const group = useRef<THREE.Group>(null)
  // Uniforms are shared by every material in the scene and written through
  // this ref each frame. Writing through the ref, not the memoised object,
  // keeps the render path pure.
  const landMat = useRef<THREE.ShaderMaterial>(null)
  const pulseGeo = useRef<THREE.BufferGeometry>(null)
  const ringGeo = useRef<THREE.BufferGeometry>(null)
  const ringMat = useRef<THREE.ShaderMaterial>(null)

  // Mutable per-frame state, created lazily in the frame loop.
  const rig = useRef<{
    look: THREE.Vector3
    pos: THREE.Vector3
    focus: THREE.Vector2
    route: Int16Array
    phase: Float32Array
    speed: Float32Array
    tmp: THREE.Vector3
    started: boolean
  } | null>(null)

  const { camera, size, gl } = useThree()

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const g = group.current
    if (!g) return

    if (rig.current === null) {
      const route = new Int16Array(PULSES)
      const phase = new Float32Array(PULSES)
      const speed = new Float32Array(PULSES)
      for (let i = 0; i < PULSES; i++) {
        route[i] = (i * 7 + 3) % routes.length
        phase[i] = (i * 0.137) % 1
        speed[i] = 0.18 + ((i * 37) % 100) / 100 * 0.22
      }
      rig.current = {
        look: new THREE.Vector3(),
        pos: new THREE.Vector3(),
        focus: new THREE.Vector2(),
        route,
        phase,
        speed,
        tmp: new THREE.Vector3(),
        started: false,
      }
    }
    const r = rig.current

    const u = landMat.current?.uniforms
    if (!u) return
    u.uTime.value = t
    u.uPx.value = gl.getPixelRatio() * Math.max(size.height, 520) / 900
    u.uScan.value = ((t * 0.9) % 16) - 8

    /* ── Camera rig ─────────────────────────────────────────────────── */
    const ch = CHAPTERS[chapter.current] ?? CHAPTERS.hero
    const [fx, fy] = ch.city ? project(CITIES[ch.city].lon, CITIES[ch.city].lat) : [0.6, 0.2]

    const aspect = size.width / Math.max(size.height, 1)
    // Side-by-side composition only where the text column leaves room for it.
    const wide = size.width >= 1024 && aspect > 1.15
    // Portrait screens need to pull back for the archipelago's width.
    const baseDist = wide ? 10.5 : Math.min(10.5 * Math.pow(1.3 / aspect, 0.9), 24)
    const dist = baseDist * ch.distance

    r.tmp.set(fx, fy, 0)
    g.localToWorld(r.tmp)

    // Offsetting the look point to the left parks the subject on the right
    // half of the screen, clear of the text column.
    const side = wide ? dist * 0.3 : 0
    const lift = wide ? 0 : dist * (chapter.current === 'hero' ? -0.16 : -0.05)
    const px = state.pointer.x * (wide ? 0.35 : 0.1)
    const py = state.pointer.y * (wide ? 0.22 : 0.06)

    const lookX = r.tmp.x - side
    const lookY = r.tmp.y + lift
    const desiredPos = [lookX + px, lookY + py, r.tmp.z + dist] as const

    if (!r.started) {
      // Open slightly further out so the first frames settle into place.
      r.look.set(lookX, lookY, r.tmp.z)
      r.pos.set(desiredPos[0], desiredPos[1] - 1.2, desiredPos[2] * 1.35)
      r.focus.set(fx, fy)
      r.started = true
    }

    const k = 1 - Math.exp(-dt * 1.9)
    r.look.x += (lookX - r.look.x) * k
    r.look.y += (lookY - r.look.y) * k
    r.look.z += (r.tmp.z - r.look.z) * k
    r.pos.x += (desiredPos[0] - r.pos.x) * k
    r.pos.y += (desiredPos[1] - r.pos.y) * k
    r.pos.z += (desiredPos[2] - r.pos.z) * k
    camera.position.copy(r.pos)
    camera.lookAt(r.look)

    r.focus.x += (fx - r.focus.x) * k
    r.focus.y += (fy - r.focus.y) * k
    const focus = u.uFocus.value as THREE.Vector2
    focus.copy(r.focus)

    g.rotation.z = Math.sin(t * 0.08) * 0.02

    /* ── Active hub ring ────────────────────────────────────────────── */
    const ringAttr = ringGeo.current?.attributes.position as THREE.BufferAttribute | undefined
    if (ringAttr) {
      ringAttr.setXYZ(0, r.focus.x, r.focus.y, 0.04)
      ringAttr.needsUpdate = true
    }
    if (ringMat.current) ringMat.current.visible = ch.city !== null

    /* ── Packets travelling the backbone ────────────────────────────── */
    const attr = pulseGeo.current?.attributes.position as THREE.BufferAttribute | undefined
    if (attr) {
      const out = attr.array as Float32Array
      for (let i = 0; i < PULSES; i++) {
        let p = r.phase[i] + r.speed[i] * dt
        if (p >= 1) {
          p -= 1
          // Hand off to another route that starts where this one ended, so a
          // packet visibly continues across the network.
          const end = routes[r.route[i]].b
          let next = -1
          for (let j = 0; j < routes.length; j++) {
            const c = (r.route[i] + 1 + j + i) % routes.length
            if (routes[c].a === end) { next = c; break }
          }
          r.route[i] = next >= 0 ? next : (r.route[i] * 5 + 11) % routes.length
        }
        r.phase[i] = p
        bezier(routes[r.route[i]], p, out, i * 3)
      }
      attr.needsUpdate = true
    }
  })

  return (
    <group ref={group} rotation={[TILT, 0, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[land.positions, 3]} />
          <bufferAttribute attach="attributes-aKind" args={[land.kind, 1]} />
          <bufferAttribute attach="attributes-aSeed" args={[land.seed, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={landMat}
          vertexShader={LAND_VERT}
          fragmentShader={DOT_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </points>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines.positions, 3]} />
          <bufferAttribute attach="attributes-aAlong" args={[lines.along, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={ROUTE_VERT}
          fragmentShader={ROUTE_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodes.pos, 3]} />
          <bufferAttribute attach="attributes-aColor" args={[nodes.col, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[nodes.size, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={NODE_VERT}
          fragmentShader={GLOW_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points>
        <bufferGeometry ref={pulseGeo}>
          <bufferAttribute attach="attributes-position" args={[pulseState.pos, 3]} />
          <bufferAttribute attach="attributes-aColor" args={[pulseState.col, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[pulseState.size, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={NODE_VERT}
          fragmentShader={GLOW_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points>
        <bufferGeometry ref={ringGeo}>
          <bufferAttribute attach="attributes-position" args={[ringPos, 3]} />
          <bufferAttribute attach="attributes-aColor" args={[new Float32Array([1, 1, 1]), 3]} />
          <bufferAttribute attach="attributes-aSize" args={[new Float32Array([60]), 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={ringMat}
          vertexShader={NODE_VERT}
          fragmentShader={RING_FRAG}
          uniforms={{ ...ringUniforms, uPx: uniforms.uPx }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

/* ────────────────────────────────────────────────────────────────────────
   Static fallback. Reduced motion, no WebGL, or a WebGL crash. The same map,
   drawn once onto a 2D canvas with a fixed oblique projection.
   ──────────────────────────────────────────────────────────────────────── */

export function StaticArchipelago() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const land = buildLand()
    const routes = buildRoutes()

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const wide = w / h > 1.15
      const s = (wide ? w * 0.62 : w * 1.05) / 10.5
      const cx = wide ? w * 0.64 : w * 0.5
      const cy = wide ? h * 0.5 : h * 0.3
      const toScreen = (x: number, y: number) => [cx + x * s, cy - y * s * 0.6] as const

      for (let i = 0; i < land.count; i++) {
        const [x, y] = toScreen(land.positions[i * 3], land.positions[i * 3 + 1])
        ctx.fillStyle = land.kind[i] > 0.5 ? 'rgba(44,51,61,0.8)' : 'rgba(110,126,140,0.55)'
        ctx.fillRect(x, y, 1.3, 1.3)
      }

      ctx.strokeStyle = 'rgba(200,255,77,0.45)'
      ctx.lineWidth = 1
      for (const r of routes) {
        const [ax, ay] = toScreen(r.p0[0], r.p0[1])
        const [mx, my] = toScreen(r.p1[0], r.p1[1] + r.p1[2])
        const [bx, by] = toScreen(r.p2[0], r.p2[1])
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.quadraticCurveTo(mx, my, bx, by)
        ctx.stroke()
      }

      for (const id of Object.keys(CITIES) as CityId[]) {
        const [x, y] = toScreen(...project(CITIES[id].lon, CITIES[id].lat))
        ctx.fillStyle = CITIES[id].hub ? '#C8FF4D' : 'rgba(200,255,77,0.7)'
        ctx.beginPath()
        ctx.arc(x, y, CITIES[id].hub ? 2.6 : 1.7, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <StaticArchipelago /> : this.props.children
  }
}

/**
 * Fixed full-viewport scene behind the whole page. Loaded with ssr:false
 * through SceneMount, so three.js never touches the server bundle or the
 * first paint.
 */
export default function BackboneScene({ animate }: { animate: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  useChapterTracking(host)

  return (
    <div
      ref={host}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000 ease-out"
    >
      {animate ? (
        <SceneBoundary>
          <Canvas
            camera={{ position: [0, 0, 14], fov: 38, near: 0.1, far: 80 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            style={{ position: 'absolute', inset: 0, background: 'transparent' }}
          >
            <Archipelago />
          </Canvas>
        </SceneBoundary>
      ) : (
        <StaticArchipelago />
      )}
      {/* Vignette keeps the edges of the map from fighting the nav and the
          bottom of the fold. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 62% 45%, transparent 40%, rgba(5,7,11,0.85) 100%)',
        }}
      />
    </div>
  )
}
