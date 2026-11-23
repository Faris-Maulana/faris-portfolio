import { ImageResponse } from 'next/og'
import { HERO_METRICS, SITE_CONFIG } from '@/lib/constants'
import { PALETTE } from '@/lib/design-tokens'

export const alt = 'Faris Maulana, AI Engineering Manager'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Generated at build time with the same content source as the homepage. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: PALETTE.canvas, padding: '58px 66px', fontFamily: 'sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', background: `radial-gradient(700px 420px at 82% 26%, ${PALETTE.signalWash}, transparent 70%), radial-gradient(560px 380px at 18% 86%, ${PALETTE.agentWash}, transparent 72%)` }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 38, height: 38, border: `2px solid ${PALETTE.signal}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: PALETTE.signal, fontSize: 17, fontWeight: 800 }}>FM</div>
          <div style={{ color: PALETTE.ink, fontSize: 22, display: 'flex' }}>{SITE_CONFIG.name}</div>
        </div>
        <div style={{ color: PALETTE.signal, fontSize: 16, letterSpacing: 3, textTransform: 'uppercase', display: 'flex' }}>Infrastructure atlas / 2026</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: PALETTE.ink, fontSize: 78, fontWeight: 800, letterSpacing: -4, lineHeight: 0.95, display: 'flex', flexDirection: 'column', textTransform: 'uppercase' }}><span>Accountable</span><span style={{ color: PALETTE.signal, display: 'flex' }}>AI systems.</span></div>
        <div style={{ marginTop: 25, color: PALETTE.ink2, fontSize: 24, lineHeight: 1.4, maxWidth: 860, display: 'flex' }}>{SITE_CONFIG.role}. Governed data platforms, evaluated LLM systems and explicit operating controls.</div>
      </div>

      <div style={{ display: 'flex', gap: 44, borderTop: `1px solid ${PALETTE.line}`, paddingTop: 24 }}>
        {HERO_METRICS.map(metric => (
          <div key={metric.label} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ color: PALETTE.ink, fontSize: 32, fontWeight: 800, display: 'flex' }}>{metric.value} <span style={{ color: PALETTE.signal, fontSize: 16, marginLeft: 8, display: 'flex' }}>{metric.unit}</span></div>
            <div style={{ marginTop: 8, color: PALETTE.ink2, fontSize: 15, lineHeight: 1.25, display: 'flex' }}>{metric.label}</div>
          </div>
        ))}
      </div>
    </div>,
    size,
  )
}
