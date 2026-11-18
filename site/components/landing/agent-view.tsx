"use client"

/* The landing's Agent view: a muted loop of the real inspector on the booking form (hover a part, set
   values, book). A film keeps the landing light; the live inspector is one click away on every
   component page. Reduced motion shows the poster frame and lets the visitor start it. */

import { Play } from "lucide-react"
import * as React from "react"

export function AgentViewFilm() {
  const video = React.useRef<HTMLVideoElement>(null)
  const [still, setStill] = React.useState(false)

  React.useEffect(() => {
    const el = video.current
    if (!el) return
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => {
      setStill(query.matches)
      if (query.matches) el.pause()
      else void el.play().catch(() => {})
    }
    apply()
    query.addEventListener("change", apply)
    return () => query.removeEventListener("change", apply)
  }, [])

  return (
    <div className="relative">
      <video ref={video} className="block aspect-[16/10] w-full bg-[#0f1012]" poster="/videos/agent-view-poster.jpg"
        muted loop playsInline autoPlay preload="metadata" disablePictureInPicture
        aria-label="Agent view on the booking form: each part listed in plain words, a part outlined in the preview on hover, values set and the viewing booked through the same UI SDK actions an agent calls.">
        <source src="/videos/agent-view.webm" type="video/webm" />
        <source src="/videos/agent-view.mp4" type="video/mp4" />
      </video>
      {still && (
        <button type="button" onClick={() => { setStill(false); void video.current?.play() }}
          className="absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full bg-white/90 text-black outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          aria-label="Play the Agent view video">
          <Play aria-hidden className="ms-0.5 size-5 fill-current" />
        </button>
      )}
    </div>
  )
}
