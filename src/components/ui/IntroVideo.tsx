'use client'

import { useRef } from 'react'
import { Play, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Click-to-play intro. A native <dialog> gives focus containment, Escape to
 * close and an inert page behind it for free. The video is `preload="none"`,
 * so not one byte of it loads until someone asks for it.
 */
export function IntroVideo({ className }: { className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const video = useRef<HTMLVideoElement>(null)

  const open = () => {
    dialog.current?.showModal()
    video.current?.play().catch(() => {
      // Autoplay with sound can be refused; the native controls remain.
    })
  }

  const close = () => {
    video.current?.pause()
    dialog.current?.close()
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={cn('group inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-ink', className)}
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-md border border-line-2 bg-canvas/60 transition-colors duration-300 group-hover:border-signal">
          <Play size={14} className="translate-x-px fill-current text-signal" aria-hidden />
        </span>
        <span>
          Watch the intro
          <span className="t-meta ml-2">1:42</span>
        </span>
      </button>

      <dialog
        ref={dialog}
        onClose={() => video.current?.pause()}
        onClick={e => {
          // A click on the backdrop lands on the dialog element itself.
          if (e.target === dialog.current) close()
        }}
        aria-label="Introduction video"
        className="m-auto w-[min(960px,calc(100vw-2rem))] overflow-visible bg-transparent p-0 text-ink backdrop:bg-canvas/85 backdrop:backdrop-blur-sm"
      >
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
            <p className="text-sm font-semibold">Faris Maulana, in his own words</p>
            <button
              type="button"
              onClick={close}
              aria-label="Close video"
              className="flex h-9 w-9 items-center justify-center rounded-md text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink"
            >
              <X size={16} />
            </button>
          </div>
          <video
            ref={video}
            controls
            playsInline
            preload="none"
            poster="/video/intro-poster.jpg"
            className="block aspect-video w-full bg-canvas"
          >
            <source src="/video/intro.webm" type="video/webm" />
            <source src="/video/intro.mp4" type="video/mp4" />
            <track kind="captions" src="/video/intro.en.vtt" srcLang="en" label="English" default />
            Your browser cannot play this video.{' '}
            <a href="/video/intro.mp4" className="link-draw">Download it instead</a>.
          </video>
        </div>
      </dialog>
    </>
  )
}
