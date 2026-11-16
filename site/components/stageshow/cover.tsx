"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from "react"

import { COVERS, type CoverName } from "./covers"
import "./cover.css"

/**
 * Each scene loads on its own, in the browser only: it measures its own layout, and a post page should not pay for
 * the other posts' illustrations. The box below keeps the scene's shape while it loads, so nothing on the page moves.
 */
const SCENES: Record<CoverName, ComponentType> = {
  "ui-sdk-with-shadcn": dynamic(() => import("./scenes/kf-uisdk-shadcn"), { ssr: false }),
  "what-is-vercel-ui-sdk": dynamic(() => import("./scenes/kf-uisdk-animate"), { ssr: false }),
  "shadcn-skill-vs-mcp": dynamic(() => import("./scenes/kf-skill-vs-mcp"), { ssr: false }),
  "best-claude-code-skills-ui-animation": dynamic(() => import("./scenes/kf-skills-test"), { ssr: false }),
  author: dynamic(() => import("./scenes/kf-author"), { ssr: false }),
}

/**
 * A self-playing illustration. It is a picture, not a control: screen readers get the description, and nothing in it
 * takes focus. The scene's code is fetched when the box comes near the screen; the stage itself pauses offscreen and
 * shows its still frame when the visitor asks for reduced motion.
 */
export function Cover({ name, className }: { name: CoverName; className?: string }) {
  const Scene = SCENES[name]
  const { label, wide, compact } = COVERS[name]
  const box = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el || near) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true)
      },
      { rootMargin: "400px 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [near])

  const shape = { "--kf-w": wide[0], "--kf-h": wide[1], "--kf-cw": compact[0], "--kf-ch": compact[1] } as CSSProperties
  return (
    <div ref={box} role="img" aria-label={label} data-cover={name} style={shape} className={`kf-cover${className ? ` ${className}` : ""}`}>
      <div aria-hidden="true" inert className="kf-cover-stage">
        {near && <Scene />}
      </div>
    </div>
  )
}
