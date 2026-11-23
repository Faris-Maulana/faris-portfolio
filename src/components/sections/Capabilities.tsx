import { SectionHeader } from '@/components/ui/SectionHeader'
import { Reveal } from '@/components/ui/Reveal'
import { SKILLS } from '@/lib/constants'

export function Capabilities() {
  return (
    <section id="capabilities" className="section section-dark">
      <div className="container">
        <SectionHeader
          index="05"
          label="Technical field"
          meta="Tools grouped by decision, not keyword volume"
          title={['A full-stack view', <span key="2" className="text-ink-3">of AI delivery.</span>]}
          lead="The important capability is knowing where each layer belongs: governed data below, deterministic controls around probabilistic models, and product operations above."
        />
        <dl className="mt-16 border-t border-line">
          {SKILLS.map((group, index) => (
            <Reveal key={group.category} className="grid gap-5 border-b border-line py-7 md:grid-cols-12 md:gap-6" delay={index * 45}>
              <dt className="md:col-span-3"><span className="t-meta mr-3 text-signal">0{index + 1}</span><span className="font-display text-xl font-semibold text-ink">{group.category}</span></dt>
              <dd className="text-sm text-ink-3 md:col-span-3">{group.note}</dd>
              <dd className="md:col-span-6"><ul className="flex flex-wrap gap-x-5 gap-y-2">{group.items.map(item => <li key={item} className="text-base text-ink-2">{item}</li>)}</ul></dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}
