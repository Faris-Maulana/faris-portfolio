export interface CameraKeyframe {
  section: string
  position: [number, number, number]
  target: [number, number, number]
}

export const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  { section: 'hero',        position: [0,   0,   15], target: [0,  0,   0] },
  { section: 'about',       position: [3,  -0.5, 13], target: [0, -0.3, 0] },
  { section: 'experience',  position: [5,  -1.5, 14], target: [0, -1,   0] },
  { section: 'projects',    position: [4,  -2.5, 16], target: [0, -2,   0] },
  { section: 'skills',      position: [2,  -3.5, 15], target: [0, -3,   0] },
  { section: 'research',    position: [0,  -4,   13], target: [0, -4,   0] },
  { section: 'certificates',position: [-2, -4.5, 14], target: [0, -4.5, 0] },
  { section: 'blog',        position: [-4, -5,   15], target: [0, -5,   0] },
  { section: 'contact',     position: [-3, -6,   13], target: [0, -6,   0] },
]

export function getCameraState(progress: number): {
  position: [number, number, number]
  target: [number, number, number]
} {
  const clamped = Math.max(0, Math.min(1, progress))
  const total = CAMERA_KEYFRAMES.length - 1
  const index = clamped * total
  const i0 = Math.floor(index)
  const i1 = Math.min(i0 + 1, total)
  const t = index - i0

  const a = CAMERA_KEYFRAMES[i0]
  const b = CAMERA_KEYFRAMES[i1]

  const ease = t * t * (3 - 2 * t)

  return {
    position: [
      a.position[0] + (b.position[0] - a.position[0]) * ease,
      a.position[1] + (b.position[1] - a.position[1]) * ease,
      a.position[2] + (b.position[2] - a.position[2]) * ease,
    ],
    target: [
      a.target[0] + (b.target[0] - a.target[0]) * ease,
      a.target[1] + (b.target[1] - a.target[1]) * ease,
      a.target[2] + (b.target[2] - a.target[2]) * ease,
    ],
  }
}
