'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = /* glsl */`
  uniform float uTime;
  uniform vec2  uMouse;
  varying float vDisp;
  varying vec3  vPos;

  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g;
    vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 xx=floor(j*ns.z); vec4 yy=floor(j-7.0*xx);
    vec4 x=xx*ns.x+ns.yyyy; vec4 y=yy*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  void main(){
    vPos = position;
    float n1 = snoise(vec3(position.xy * 0.3, uTime * 0.08));
    float n2 = snoise(vec3(position.yz * 0.6 + uMouse * 0.4, uTime * 0.15));
    float d = n1 * 0.22 + n2 * 0.10;
    vDisp = d;
    vec3 np = position + normal * d;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(np, 1.0);
  }
`

const fragmentShader = /* glsl */`
  varying float vDisp;
  varying vec3  vPos;
  void main(){
    float d = vDisp * 3.0 + 0.5;
    vec3 deep    = vec3(0.05, 0.02, 0.13);
    vec3 monarch = vec3(0.66, 0.33, 0.97);
    vec3 ice     = vec3(0.22, 0.74, 0.97);
    vec3 col = mix(deep, monarch, smoothstep(-0.3, 0.5, d));
    col = mix(col, ice, smoothstep(0.4, 1.0, d) * 0.5);
    float a = smoothstep(-0.5, 0.4, vDisp) * 0.18;
    gl_FragColor = vec4(col, a);
  }
`

function ShadowMesh() {
  const mouse  = useRef([0, 0])
  const target = useMemo(() => new THREE.Vector2(0, 0), [])
  const { viewport } = useThree()

  const uniforms = useMemo(() => ({
    uTime:  { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = [
        (e.clientX / window.innerWidth - 0.5) * 2,
        -(e.clientY / window.innerHeight - 0.5) * 2,
      ]
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime()
    target.set(mouse.current[0], mouse.current[1])
    uniforms.uMouse.value.lerp(target, 0.04)
  })

  return (
    <mesh rotation={[-0.3, 0.2, 0]}>
      <icosahedronGeometry args={[viewport.width * 0.55, 90]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function ShadowParticles() {
  const ref = useRef<THREE.Points>(null!)
  const COUNT = 800

  const { positions, velocities, sizes } = useMemo(() => {
    const positions  = new Float32Array(COUNT * 3)
    const velocities = new Float32Array(COUNT)
    const sizes      = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      positions[i*3]   = (Math.random() - 0.5) * 30
      positions[i*3+1] = (Math.random() - 0.5) * 20
      positions[i*3+2] = (Math.random() - 0.5) * 10
      velocities[i]    = 0.005 + Math.random() * 0.015
      sizes[i]         = 0.02 + Math.random() * 0.06
    }
    return { positions, velocities, sizes }
  }, [])

  useFrame(() => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < COUNT; i++) {
      pos[i*3+1] += velocities[i]
      if (pos[i*3+1] > 12) {
        pos[i*3]   = (Math.random() - 0.5) * 30
        pos[i*3+1] = -12
        pos[i*3+2] = (Math.random() - 0.5) * 10
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size"     args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        color="#a855f7"
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export function ParticleField() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <ShadowMesh />
        <ShadowParticles />
      </Canvas>
    </div>
  )
}
