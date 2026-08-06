'use client'

import { LEDGER } from '@/lib/constants'

/**
 * Continuous ledger of places the work has landed.
 *
 * The list is rendered twice and the track translated by exactly -50%, which
 * is what makes the loop seamless, the second copy is under the cursor at the
 * moment the animation resets. `aria-hidden` on the duplicate keeps screen
 * readers from hearing every name twice.
 */
export function CredibilityStrip() {
  return (
    <section
      aria-label="Organisations worked with"
      className="relative border-y border-line py-7"
    >
      <div className="marquee-hold marquee-mask overflow-hidden">
        <div className="marquee">
          {[0, 1].map(copy => (
            <ul
              key={copy}
              className="flex shrink-0 items-center"
              aria-hidden={copy === 1 || undefined}
            >
              {LEDGER.map(name => (
                <li
                  key={`${copy}-${name}`}
                  className="flex items-center whitespace-nowrap px-7"
                >
                  <span className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-ink-3 transition-colors duration-300 hover:text-ink sm:text-base">
                    {name}
                  </span>
                  <span
                    className="ml-7 h-1 w-1 rounded-full bg-line-3"
                    aria-hidden
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
