'use client'

import { useEffect } from 'react'

export function useGSAPScrollAnimations() {
  useEffect(() => {
    let gsap: typeof import('gsap').gsap | undefined
    let ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger | undefined

    const init = async () => {
      const g  = await import('gsap')
      const st = await import('gsap/ScrollTrigger')
      gsap = g.gsap
      ScrollTrigger = st.ScrollTrigger
      gsap.registerPlugin(ScrollTrigger)

      gsap!.utils.toArray<HTMLElement>('.section-heading').forEach(el => {
        if (el.dataset.processed === 'true') return
        el.dataset.processed = 'true'

        const html = el.innerHTML
        const newHtml = html.replace(/(>)([^<]+)(<)/g, (_, p1, text, p3) => {
          const chars = text.split('').map((c: string) =>
            c === ' ' ? ' ' : `<span style="display:inline-block;transform:translateY(60px) rotateX(-90deg);opacity:0;transform-origin:50% 100%">${c}</span>`
          ).join('')
          return p1 + chars + p3
        })
        el.innerHTML = newHtml

        gsap!.to(el.querySelectorAll('span'), {
          y: 0, rotateX: 0, opacity: 1,
          duration: 0.9, stagger: 0.03, ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        })
      })

      gsap!.utils.toArray<HTMLElement>('.section-heading-tag').forEach(el => {
        gsap!.fromTo(el,
          { x: -32, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
        )
      })

      gsap!.utils.toArray<HTMLElement>('.dagger-line').forEach(el => {
        gsap!.fromTo(el,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.2, ease: 'power3.inOut',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
        )
      })

      gsap!.utils.toArray<HTMLElement>('[data-gsap="card"]').forEach((el, i) => {
        gsap!.fromTo(el,
          { y: 50, opacity: 0, filter: 'blur(8px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)',
            duration: 0.8, delay: (i % 4) * 0.08, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
        )
      })

      gsap!.utils.toArray<HTMLElement>('[data-gsap="exp"]').forEach((el, i) => {
        gsap!.fromTo(el,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, delay: i * 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
        )
      })

      gsap!.utils.toArray<HTMLElement>('[data-gsap="project"]').forEach((el, i) => {
        gsap!.fromTo(el,
          { y: 40, opacity: 0, rotateY: -20, transformPerspective: 1000 },
          { y: 0, opacity: 1, rotateY: 0,
            duration: 0.8, delay: i * 0.08, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
        )
      })

      gsap!.utils.toArray<HTMLElement>('[data-gsap="stat"]').forEach((el, i) => {
        gsap!.fromTo(el,
          { scale: 0.7, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, delay: i * 0.08,
            ease: 'back.out(1.6)',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
        )
      })

      gsap!.utils.toArray<HTMLElement>('[data-parallax]').forEach(el => {
        const speed = parseFloat(el.dataset.parallax || '0.3')
        gsap!.to(el, {
          y: () => -window.innerHeight * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          }
        })
      })

      gsap!.utils.toArray<HTMLElement>('section').forEach(el => {
        const id = el.id
        if (!id || id === '') return
        gsap!.fromTo(el,
          { opacity: 0.6 },
          { opacity: 1,
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              end: 'top 30%',
              scrub: 0.8,
            }
          }
        )
      })

      gsap!.utils.toArray<HTMLElement>('[data-pin-title="true"]').forEach(section => {
        const title = section.querySelector('.section-heading')
        if (!title) return
        ScrollTrigger!.create({
          trigger: section,
          start: 'top top+=80',
          end: 'bottom bottom-=100',
          pin: title as HTMLElement,
          pinSpacing: false,
        })
      })
    }

    init()

    return () => {
      ScrollTrigger?.getAll().forEach(t => t.kill())
    }
  }, [])
}
