"use client"

/* StateCut: replace a whole view while its content and height settle into the next state. */

import * as React from "react"

import { playGhost, snapshot, type Snapshot } from "@/lib/keyframery/ghost"
import { easingOf, emitCut, reducedMotion, scaled } from "@/lib/keyframery/motion"
import { optedOut } from "@/lib/keyframery/state"

export type StateCutProps = {
  /** Change this key when the whole content changes (for example, "empty" → "success"). */
  state: string | number
  children?: React.ReactNode
  /** "slide" adds a small vertical handoff; "none" swaps content immediately. */
  cut?: "fade" | "slide" | "none"
  pace?: number
  className?: string
}

type StateShot = { snap: Snapshot; height: number }

/** A pre-commit snapshot keeps React's current content interactive without retaining an old tree. */
export class StateCut extends React.Component<StateCutProps, Record<string, never>, StateShot | null> {
  private host = React.createRef<HTMLDivElement>()
  private content = React.createRef<HTMLDivElement>()
  private animations: Animation[] = []
  private ghost: HTMLElement | null = null

  private cancel = () => {
    this.animations.forEach((animation) => animation.cancel())
    this.animations = []
    this.ghost?.remove()
    this.ghost = null
  }

  getSnapshotBeforeUpdate(previous: StateCutProps): StateShot | null {
    const host = this.host.current
    const content = this.content.current
    if (Object.is(previous.state, this.props.state) || !host || !content) return null
    const height = host.getBoundingClientRect().height
    const snap = snapshot(content)
    // Cancel before the old content leaves. Removal is synchronous even though finished promises
    // settle in a microtask, so a rapid switch never stacks stale ghosts on the next view.
    this.cancel()
    return { snap, height }
  }

  componentDidUpdate(previous: StateCutProps, _previousState: Record<string, never>, before: StateShot | null) {
    const host = this.host.current
    const content = this.content.current
    if (!host || !content) return
    if (this.props.cut === "none" || optedOut(host)) {
      this.cancel()
      return
    }
    if (!before) {
      if (previous.cut !== this.props.cut || previous.pace !== this.props.pace) this.cancel()
      return
    }
    const reduced = reducedMotion()
    const cut = this.props.cut ?? "fade"
    const ms = scaled(260, host)
    const exitMs = scaled(180, host)
    const slide = cut === "slide" && !reduced
    const enter: Keyframe[] = slide
      ? [{ opacity: 0, translate: "0 12px" }, { opacity: 1, translate: "0 0" }]
      : [{ opacity: 0 }, { opacity: 1 }]
    const exit: Keyframe[] = slide
      ? [{ opacity: 1, translate: "0 0" }, { opacity: 0, translate: "0 -12px" }]
      : [{ opacity: 1 }, { opacity: 0 }]

    this.ghost = before.snap.clone
    this.animations.push(playGhost(before.snap, exit, { duration: exitMs, easing: easingOf(host, "exit") }, { host }))
    this.animations.push(content.animate(enter, { duration: ms, easing: easingOf(host) }))
    const height = host.getBoundingClientRect().height
    if (!reduced && Math.abs(height - before.height) > 1) {
      this.animations.push(host.animate(
        [{ height: `${before.height}px`, boxSizing: "border-box", overflow: "clip" }, { height: `${height}px`, boxSizing: "border-box", overflow: "clip" }],
        { duration: ms, easing: easingOf(host) },
      ))
    }
    emitCut({ cut, component: "state", phase: "exit", ms: Math.round(exitMs) })
    emitCut({ cut, component: "state", phase: "enter", ms: Math.round(ms) })
    const running = this.animations
    Promise.allSettled(running.map((animation) => animation.finished)).then(() => {
      if (this.animations !== running) return
      this.animations = []
      this.ghost = null
    })
  }

  componentWillUnmount() {
    this.cancel()
  }

  render() {
    const { state, children, cut, pace, className } = this.props
    const style = { position: "relative", ...(pace ? { "--kf-pace": pace } : {}) } as React.CSSProperties
    return (
      <div ref={this.host} data-slot="state-cut" data-cut={cut === "none" ? "none" : undefined} className={className} style={style}>
        <div ref={this.content} key={`${typeof state}:${state}`} data-kf-state-content="" style={{ display: "flow-root" }}>
          {children}
        </div>
      </div>
    )
  }
}
