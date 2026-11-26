import { Plus } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { EXPERIENCES } from '@/lib/constants'

export function Experience() {
  return (
    <section id="experience" className="section section-dark">
      <div className="container">
        <SectionHeader
          label="Experience"
          meta={`${EXPERIENCES.length} roles / telco, maritime, research and security`}
          title={['Different domains.', <span key="2" className="text-ink-3">One operating discipline.</span>]}
          lead="Make an unfamiliar system legible, establish reliable decisions around it and leave an operating structure behind. Expand any role for delivery detail and technical context."
        />

        <div className="experience-ledger panel">
          {EXPERIENCES.map((item, index) => (
            <Reveal key={`${item.company}-${item.period}`} delay={Math.min(index * 40, 160)}>
              <details className="group border-b border-line" name="career-roles">
                <summary className="grid cursor-pointer list-none gap-4 py-7 sm:grid-cols-12 sm:items-center sm:gap-6">
                  <span className="t-meta sm:col-span-2">{String(index + 1).padStart(2, '0')} / {item.period}</span>
                  <span className="sm:col-span-5">
                    <span className="block font-display text-xl font-semibold text-ink">{item.role}</span>
                    <span className="mt-1 block text-sm text-ink-2">{item.company}</span>
                  </span>
                  <span className="hidden text-sm text-ink-3 sm:col-span-4 sm:block">{item.summary}</span>
                  <span className="absolute right-0 sm:relative sm:col-span-1 sm:text-right"><Plus className="inline transition-transform group-open:rotate-45" size={20} aria-hidden /></span>
                </summary>
                <div className="grid gap-8 pb-9 sm:grid-cols-12">
                  <div className="sm:col-start-3 sm:col-span-6">
                    <p className="t-body mb-5 text-base sm:hidden">{item.summary}</p>
                    <ul className="space-y-3">
                      {item.bullets.map(bullet => <li key={bullet} className="grid grid-cols-[1rem_1fr] gap-2 text-base text-ink-2"><span className="text-signal" aria-hidden>·</span>{bullet}</li>)}
                    </ul>
                    <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${item.role} technology stack`}>{item.stack.map(skill => <li key={skill} className="chip">{skill}</li>)}</ul>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="t-meta">Engagement status</span>
                    <p className="mt-2 capitalize text-ink-2">{item.status}</p>
                  </div>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
