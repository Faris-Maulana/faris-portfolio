export function StaticAtlas({ className = '' }: { className?: string }) {
  return (
    <figure className={`atlas-figure ${className}`} aria-label="Conceptual Indonesian backbone topology">
      <div className="atlas-map-head"><span>Infrastructure atlas</span><span>Public abstraction</span></div>
      <div className="atlas-map-canvas">
        <span className="atlas-reticle atlas-reticle-a" aria-hidden />
        <span className="atlas-reticle atlas-reticle-b" aria-hidden />
        <svg viewBox="0 0 700 480" className="block h-auto w-full" role="img" aria-labelledby="atlas-title atlas-desc">
          <title id="atlas-title">Conceptual infrastructure topology</title>
          <desc id="atlas-desc">A stylised topology connecting Java, Sumatra, Kalimantan, Sulawesi and Papua. Routes and nodes are conceptual, not live network telemetry.</desc>
          <defs>
            <pattern id="atlas-grid-pattern" width="35" height="35" patternUnits="userSpaceOnUse">
              <path d="M 35 0 L 0 0 0 35" fill="none" stroke="var(--color-grid)" strokeWidth="1" />
            </pattern>
            <radialGradient id="atlas-signal-field">
              <stop offset="0" stopColor="var(--color-signal)" stopOpacity="0.13" />
              <stop offset="1" stopColor="var(--color-signal)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="700" height="480" fill="url(#atlas-grid-pattern)" />
          <ellipse cx="410" cy="224" rx="260" ry="205" fill="url(#atlas-signal-field)" />
          <g fill="none" stroke="var(--color-line)" strokeWidth="1">
            <path d="M-40 110 C116 21 257 36 391 92 S620 157 742 66" />
            <path d="M-40 137 C116 48 257 63 391 119 S620 184 742 93" />
            <path d="M-40 368 C100 288 241 330 362 365 S598 402 742 310" />
            <path d="M-40 397 C100 317 241 359 362 394 S598 431 742 339" />
            <path d="M76 -20 C30 113 48 253 139 504" />
            <path d="M606 -20 C662 134 658 284 578 504" />
          </g>

          <g fill="var(--color-surface-2)" stroke="var(--color-line-3)" strokeWidth="1.4">
            <path d="M42 145 L100 98 L169 116 L205 162 L172 193 L116 174 L75 207 L39 180 Z" />
            <path d="M169 260 L244 238 L348 254 L382 283 L307 292 L228 282 Z" />
            <path d="M265 88 L339 56 L405 91 L375 169 L306 183 L256 145 Z" />
            <path d="M419 135 L450 82 L470 147 L522 121 L495 183 L530 226 L465 199 L431 259 L418 200 L379 174 Z" />
            <path d="M530 205 L611 178 L674 218 L642 279 L568 267 Z" />
          </g>
          <g fill="var(--color-surface-2)" stroke="var(--color-line-2)" strokeWidth="1">
            <path d="M376 287 l42 -5 31 12 -40 6 Z" />
            <path d="M444 299 l36 -7 24 11 -31 8 Z" />
            <path d="M506 294 l27 -9 23 12 -29 6 Z" />
            <path d="M518 150 l13 -12 11 19 -14 9 Z" />
            <path d="M545 170 l10 -8 8 13 -12 7 Z" />
          </g>

          <g fill="none" stroke="var(--color-line-2)" strokeWidth="1" strokeDasharray="2 7">
            <path d="M78 167 C162 214 188 260 250 264 S388 185 445 180 S565 239 636 225" />
            <path d="M184 149 C261 111 314 109 357 119 S417 160 450 179" />
            <path d="M250 264 C328 325 459 323 547 283" />
          </g>
          <g fill="none" stroke="var(--color-signal)" strokeWidth="2">
            <path className="map-route" pathLength="1" d="M78 167 C162 214 188 260 250 264 S388 185 445 180 S565 239 636 225" />
            <path className="map-route" pathLength="1" d="M184 149 C261 111 314 109 357 119 S417 160 450 179" opacity="0.5" />
          </g>
          <path d="M250 264 C328 325 459 323 547 283" fill="none" stroke="var(--color-data)" strokeWidth="1.5" opacity="0.65" />

          <g fill="var(--color-canvas)" stroke="var(--color-signal)" strokeWidth="2">
            <circle cx="250" cy="264" r="8" /><circle cx="450" cy="180" r="7" /><circle cx="636" cy="225" r="6" />
          </g>
          <g fill="none" stroke="var(--color-signal)" opacity="0.45">
            <circle className="atlas-node-ring" cx="250" cy="264" r="17" />
            <circle className="atlas-node-ring" cx="450" cy="180" r="15" />
            <circle className="atlas-node-ring" cx="636" cy="225" r="13" />
          </g>
          <g fill="var(--color-data)" stroke="var(--color-canvas)" strokeWidth="3">
            <circle cx="78" cy="167" r="5" /><circle cx="184" cy="149" r="5" /><circle cx="357" cy="119" r="5" /><circle cx="547" cy="283" r="5" />
          </g>

          <g fill="var(--color-ink-2)" fontFamily="var(--font-body)" fontSize="12" fontWeight="650" letterSpacing="1.5">
            <text x="215" y="304">JAKARTA</text><text x="470" y="172">MAKASSAR</text><text x="575" y="260">JAYAPURA</text>
          </g>
          <g fill="var(--color-ink-3)" fontFamily="var(--font-mono)" fontSize="9">
            <text x="18" y="26">095 E</text><text x="326" y="26">120 E</text><text x="626" y="26">141 E</text>
            <text x="18" y="458">06.20 S / 106.84 E</text><text x="568" y="458">SCHEMATIC / 01</text>
          </g>
          <g stroke="var(--color-signal)" strokeWidth="1" opacity="0.55">
            <path d="M250 229v15m-7-7h14M450 145v15m-7-7h14M636 193v15m-7-7h14" />
          </g>
        </svg>
      </div>
      <figcaption className="atlas-map-footer">
        <span><i className="atlas-legend-signal" aria-hidden />Control path</span>
        <span><i className="atlas-legend-data" aria-hidden />Data path</span>
        <span>Conceptual, not live telemetry</span>
      </figcaption>
    </figure>
  )
}
