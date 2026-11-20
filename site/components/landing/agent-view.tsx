"use client"

/* The landing's Agent view: a muted loop of the real inspector on the booking form (hover a part, set
   values, book). A film keeps the landing light; the live inspector is one click away on every
   component page. Reduced motion shows the poster frame and lets the visitor start it.

   Nothing here loads with the page. The poster waits until the page has finished loading or the section
   is one screen away, and the film is fetched when it first plays, so neither competes with the hero. */

import { Play } from "lucide-react"
import * as React from "react"

export function AgentViewFilm() {
  const video = React.useRef<HTMLVideoElement>(null)
  const [still, setStill] = React.useState(false)
  const [poster, setPoster] = React.useState(false)
  // With reduced motion on, the film plays only after the visitor presses Play.
  const asked = React.useRef(false)
  const seen = React.useRef(false)

  const sync = React.useCallback(() => {
    const el = video.current
    if (!el) return
    const allowed = asked.current || !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setStill(!allowed)
    if (allowed && seen.current) void el.play().catch(() => {})
    else el.pause()
  }, [])

  React.useEffect(() => {
    const el = video.current
    if (!el) return
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const showPoster = () => setPoster(true)

    const near = new IntersectionObserver(([entry]) => entry.isIntersecting && showPoster(), { rootMargin: "100% 0px" })
    const inView = new IntersectionObserver(
      ([entry]) => {
        seen.current = entry.isIntersecting
        sync()
      },
      { threshold: 0.25 },
    )
    near.observe(el)
    inView.observe(el)

    let timer = 0
    const afterLoad = () => (timer = window.setTimeout(showPoster, 2000))
    if (document.readyState === "complete") afterLoad()
    else window.addEventListener("load", afterLoad, { once: true })

    sync()
    query.addEventListener("change", sync)
    return () => {
      near.disconnect()
      inView.disconnect()
      window.clearTimeout(timer)
      window.removeEventListener("load", afterLoad)
      query.removeEventListener("change", sync)
    }
  }, [sync])

  return (
    <div className="relative">
      <video ref={video} className="block aspect-[16/10] w-full bg-[#0f1012]" poster={poster ? "/videos/agent-view-poster.jpg" : undefined}
        muted loop playsInline preload="none" disablePictureInPicture
        aria-label="Agent view on the booking form: each part listed in plain words, a part outlined in the preview on hover, values set and the viewing booked through the same UI SDK actions an agent calls.">
        <source src="/videos/agent-view.webm" type="video/webm" />
        <source src="/videos/agent-view.mp4" type="video/mp4" />
      </video>
      {still && (
        <button type="button" onClick={() => { asked.current = true; seen.current = true; sync() }}
          className="absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full bg-white/90 text-black outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          aria-label="Play the Agent view video">
          <Play aria-hidden className="ms-0.5 size-5 fill-current" />
        </button>
      )}
    </div>
  )
}
