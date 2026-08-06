'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { buildTopology } from './backbone'

/* ────────────────────────────────────────────────────────────────────────
   Nodes, additive point sprites with a soft radial falloff.

   Drawn as a shader rather than a sprite texture: no image to download, the
   glow stays crisp at any DPR, and per-node twinkle costs one sin() in the
   vertex stage instead of a CPU-side attribute rewrite every frame.
   ──────────────────────────────────────────────────────────────────────── */

const NODE_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3  aColor;
  uniform float uTime;
  uniform float uScale;
  varying vec3  vColor;
  varying float vFade;

  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float depth = -mv.z;

    // Breathing keyed off world position so neighbours never pulse in step.
    float twinkle = 0.80 + 0.20 * sin(uTime * 1.1 + position.x * 1.7 + position.y * 2.3);

    // 240 is the perspective scale factor: point sprites do not get size
    // attenuation for free, so the division by depth has to be scaled into
    // pixel space by hand. Too small a constant and every node renders
    // sub-pixel and vanishes, leaving only the edges visible.
    gl_PointSize = aSize * uScale * twinkle * (240.0 / max(depth, 0.001));
    vFade = clamp(1.0 - (depth - 7.0) / 28.0, 0.10, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`

const NODE_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vFade;

  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    if (r > 0.5) discard;
    float alpha = pow(smoothstep(0.5, 0.0, r), 2.4);
    gl_FragColor = vec4(vColor, alpha * vFade);
  }
`

const PULSE_COUNT = 30

function Backbone({ intensity }: { intensity: number }) {
  const topo = useMemo(() => buildTopology({ hubs: 8, leavesPerHub: 20 }), [])

  const group = useRef<THREE.Group>(null)
  const nodeMat = useRef<THREE.ShaderMaterial>(null)
  const pulseGeo = useRef<THREE.BufferGeometry>(null)

  const { size } = useThree()

  /* Travelling pulses: light moving through the fibre. Only a sample of the
     edges carries traffic, so the eye can follow individual packets instead
     of reading the whole field as shimmer. */
  const pulseRoutes = useMemo(
    () =>
      Array.from({ length: PULSE_COUNT }, (_, i) => {
        const edge = topo.edgeIndices[(i * 7 + 3) % topo.edgeIndices.length]
        return {
          a: edge[0] * 3,
          b: edge[1] * 3,
          speed: 0.1 + (((i * 37) % 100) / 100) * 0.2,
        }
      }),
    [topo]
  )

  const pulseSeed = useMemo(() => new Float32Array(PULSE_COUNT * 3), [])
  const pulseSizes = useMemo(
    () => Float32Array.from({ length: PULSE_COUNT }, () => 1.5),
    []
  )
  const pulseColors = useMemo(() => {
    const c = new Float32Array(PULSE_COUNT * 3)
    for (let i = 0; i < PULSE_COUNT; i++) {
      c[i * 3] = 0.55
      c[i * 3 + 1] = 1.0
      c[i * 3 + 2] = 0.85
    }
    return c
  }, [])

  const nodeUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uScale: { value: 1 } }),
    []
  )

  // Per-frame mutable state lives in refs and is initialised on first frame,
  // never during render, the render path stays pure.
  const phase = useRef<Float32Array | null>(null)
  const tilt = useRef({ x: 0, y: 0 })

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const dt = Math.min(delta, 0.05)

    if (phase.current === null) {
      const seeded = new Float32Array(PULSE_COUNT)
      for (let i = 0; i < PULSE_COUNT; i++) seeded[i] = i / PULSE_COUNT
      phase.current = seeded
    }
    const phases = phase.current

    if (nodeMat.current) {
      nodeMat.current.uniforms.uTime.value = t
      nodeMat.current.uniforms.uScale.value = (size.height / 900) * intensity
    }

    // Pointer parallax is eased toward a target; applying raw pointer values
    // makes the whole field jitter with every mouse sample.
    const g = group.current
    if (g) {
      tilt.current.x = state.pointer.y * 0.1
      tilt.current.y = state.pointer.x * 0.16
      g.rotation.x += (tilt.current.x - g.rotation.x) * 0.035
      g.rotation.y += (tilt.current.y + t * 0.028 - g.rotation.y) * 0.035
      g.position.y = Math.sin(t * 0.22) * 0.25
    }

    // Advance each packet along its edge, writing straight into the live
    // buffer attribute that three.js owns.
    const attr = pulseGeo.current?.attributes.position as
      | THREE.BufferAttribute
      | undefined
    if (attr) {
      const out = attr.array as Float32Array
      const p = topo.positions
      for (let i = 0; i < PULSE_COUNT; i++) {
        const route = pulseRoutes[i]
        let next = phases[i] + route.speed * dt
        if (next > 1) next -= 1
        phases[i] = next
        const o = i * 3
        out[o] = p[route.a] + (p[route.b] - p[route.a]) * next
        out[o + 1] = p[route.a + 1] + (p[route.b + 1] - p[route.a + 1]) * next
        out[o + 2] = p[route.a + 2] + (p[route.b + 2] - p[route.a + 2]) * next
      }
      attr.needsUpdate = true
    }
  })

  return (
    <group ref={group}>
      {/* Edges */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[topo.edgePositions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[topo.edgeColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.5 * intensity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Nodes */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[topo.positions, 3]}
          />
          <bufferAttribute attach="attributes-aColor" args={[topo.colors, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[topo.sizes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={nodeMat}
          vertexShader={NODE_VERT}
          fragmentShader={NODE_FRAG}
          uniforms={nodeUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Travelling pulses */}
      <points>
        <bufferGeometry ref={pulseGeo}>
          <bufferAttribute attach="attributes-position" args={[pulseSeed, 3]} />
          <bufferAttribute attach="attributes-aColor" args={[pulseColors, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[pulseSizes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={NODE_VERT}
          fragmentShader={NODE_FRAG}
          uniforms={nodeUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

/* ────────────────────────────────────────────────────────────────────────
   Static fallback, reduced motion, small touch screens, low-memory devices.
   Same colour story, zero GPU cost.
   ──────────────────────────────────────────────────────────────────────── */
function StaticField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        background: `
          radial-gradient(ellipse 55% 45% at 62% 42%, rgba(92,242,192,0.10), transparent 62%),
          radial-gradient(ellipse 45% 40% at 28% 62%, rgba(139,123,255,0.09), transparent 66%),
          radial-gradient(ellipse 70% 50% at 50% 0%,  rgba(88,185,255,0.05), transparent 70%)
        `,
      }}
    />
  )
}

/**
 * Capability gate. Read through useSyncExternalStore rather than an effect so
 * the very first client render already knows the answer, no flash of canvas
 * on a device that is about to be told not to use one, and no cascading
 * setState during mount.
 */
function useWebGLAllowed() {
  const subscribe = useCallback((onChange: () => void) => {
    const queries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(pointer: coarse)'),
      window.matchMedia('(min-width: 768px)'),
    ]
    queries.forEach(q => q.addEventListener('change', onChange))
    return () => queries.forEach(q => q.removeEventListener('change', onChange))
  }, [])

  const getSnapshot = useCallback(() => {
    const nav = navigator as Navigator & { deviceMemory?: number }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false
    if (
      window.matchMedia('(pointer: coarse)').matches &&
      !window.matchMedia('(min-width: 768px)').matches
    ) {
      return false
    }
    return true
  }, [])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

/**
 * True while any part of `ref` is on screen.
 *
 * The page is ~15,000px tall and the canvas lives in the hero. Left running,
 * it burns GPU and battery for the entire scroll, so the render loop is
 * suspended the moment the hero leaves the viewport.
 */
function useOnScreen(ref: React.RefObject<HTMLElement | null>) {
  const [onScreen, setOnScreen] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: '120px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])

  return onScreen
}

export function SignalField({
  className = 'absolute inset-0',
  intensity = 1,
}: {
  className?: string
  intensity?: number
}) {
  const allowed = useWebGLAllowed()
  const host = useRef<HTMLDivElement>(null)
  const onScreen = useOnScreen(host)

  if (!allowed) return <StaticField className={className} />

  return (
    <div ref={host} className={className} aria-hidden>
      <StaticField className="absolute inset-0" />
      <Canvas
        camera={{ position: [0, 0, 20], fov: 46, near: 0.1, far: 60 }}
        // Capped at 1.4 rather than device DPR. This is a soft additive glow, // it gains almost nothing from a 3× pixel budget, and on a 2× display
        // the uncapped canvas was pushing 4.3M pixels per frame.
        dpr={[1, 1.4]}
        frameloop={onScreen ? 'always' : 'never'}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ position: 'absolute', inset: 0, background: 'transparent' }}
      >
        <Backbone intensity={intensity} />
      </Canvas>
    </div>
  )
}
