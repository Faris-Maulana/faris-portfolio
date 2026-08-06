import { ImageResponse } from 'next/og'
import { HERO_METRICS, SITE_CONFIG } from '@/lib/constants'

export const alt = 'Faris Maulana, AI Engineering Manager'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Generated at request time and cached, rather than shipped as a static PNG.
 *
 * The card stays in sync with the metrics in constants.ts, so a number can
 * never be right on the page and stale in the link preview. Fonts are left to
 * the runtime default: loading a webfont here would add a file read to every
 * cold render for a difference nobody sees at preview size.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#07080A',
          padding: '68px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Ambient wash standing in for the live backbone visual */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(700px 420px at 78% 28%, rgba(92,242,192,0.16), transparent 70%), radial-gradient(560px 380px at 22% 84%, rgba(139,123,255,0.13), transparent 72%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: 99,
              background: '#5CF2C0',
              display: 'flex',
            }}
          />
          <div
            style={{
              color: '#5CF2C0',
              fontSize: 19,
              letterSpacing: 5,
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            Available for work
          </div>
          <div
            style={{
              color: '#454D59',
              fontSize: 19,
              letterSpacing: 5,
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            {SITE_CONFIG.location}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              color: '#ECEEF1',
              fontSize: 116,
              fontWeight: 800,
              letterSpacing: -5,
              lineHeight: 0.92,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>FARIS</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              MAULANA
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 99,
                  background: '#5CF2C0',
                  display: 'flex',
                }}
              />
            </span>
          </div>
          <div
            style={{
              marginTop: 26,
              color: '#A4AEBB',
              fontSize: 28,
              lineHeight: 1.4,
              maxWidth: 760,
              display: 'flex',
            }}
          >
            {SITE_CONFIG.role} at a 25,000 km DWDM fiber backbone operator.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 56,
            borderTop: '1px solid rgba(255,255,255,0.09)',
            paddingTop: 26,
          }}
        >
          {HERO_METRICS.map(metric => (
            <div
              key={metric.label}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div
                style={{
                  color: '#ECEEF1',
                  fontSize: 38,
                  fontWeight: 800,
                  letterSpacing: -1,
                  display: 'flex',
                }}
              >
                {metric.value}
                {metric.unit}
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: '#6C7684',
                  fontSize: 17,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  display: 'flex',
                }}
              >
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
