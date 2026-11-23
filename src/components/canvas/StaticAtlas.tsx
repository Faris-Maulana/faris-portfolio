export function StaticAtlas({ className = '' }: { className?: string }) {
  return (
    <figure className={className} aria-label="Conceptual Indonesian backbone topology">
      <svg viewBox="0 0 700 480" className="h-auto w-full" role="img" aria-labelledby="atlas-title atlas-desc">
        <title id="atlas-title">Infrastructure atlas</title>
        <desc id="atlas-desc">A conceptual topology connecting Java, Sumatra, Kalimantan, Sulawesi and Papua. It does not represent live network telemetry.</desc>
        <defs>
          <pattern id="atlas-grid-pattern" width="35" height="35" patternUnits="userSpaceOnUse">
            <path d="M 35 0 L 0 0 0 35" fill="none" stroke="var(--color-grid)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="700" height="480" fill="url(#atlas-grid-pattern)" />
        <g fill="var(--color-surface-2)" stroke="var(--color-line-3)" strokeWidth="1.5">
          <path d="M42 145 L100 98 L169 116 L205 162 L172 193 L116 174 L75 207 L39 180 Z" />
          <path d="M169 260 L244 238 L348 254 L382 283 L307 292 L228 282 Z" />
          <path d="M265 88 L339 56 L405 91 L375 169 L306 183 L256 145 Z" />
          <path d="M419 135 L450 82 L470 147 L522 121 L495 183 L530 226 L465 199 L431 259 L418 200 L379 174 Z" />
          <path d="M530 205 L611 178 L674 218 L642 279 L568 267 Z" />
        </g>
        <g fill="none" stroke="var(--color-signal)" strokeWidth="2" opacity="0.85">
          <path className="map-route" pathLength="1" d="M78 167 C162 214 188 260 250 264 S388 185 445 180 S565 239 636 225" />
          <path className="map-route" pathLength="1" d="M184 149 C261 111 314 109 357 119 S417 160 450 179" opacity="0.55" />
        </g>
        <g fill="var(--color-canvas)" stroke="var(--color-signal)" strokeWidth="2">
          <circle cx="250" cy="264" r="8" /><circle cx="450" cy="180" r="7" /><circle cx="636" cy="225" r="6" />
        </g>
        <g fill="var(--color-signal)" fontFamily="var(--font-mono)" fontSize="12">
          <text x="216" y="296">JAKARTA</text><text x="470" y="172">MAKASSAR</text><text x="585" y="258">JAYAPURA</text>
        </g>
      </svg>
      <figcaption className="t-meta mt-3">Conceptual topology / not live telemetry</figcaption>
    </figure>
  )
}
