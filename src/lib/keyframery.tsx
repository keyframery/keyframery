"use client"

/* Speed for Keyframery components, as a prop.

   Every duration in the components is written as calc(Nms * var(--kf-speed, 1)). These helpers set
   that variable for you, so nobody has to know it exists:

     <Tabs speed="fast">                      one component
     <KeyframeryProvider speed="slow">        the whole app

   Parts that render in a portal (popups, menus, dialogs) are not inside the component in the page,
   so they pick the speed up through React context instead of the CSS cascade. */

import * as React from "react"

/** `"fast"` (0.6×), `"normal"` (1×), `"slow"` (1.4×), or any multiplier: `0.8` is 20% quicker. */
export type Speed = "fast" | "normal" | "slow" | number

export type SpeedProps = {
  /** How fast the component moves. `"fast"` (0.6×), `"normal"` (1×), `"slow"` (1.4×), or a multiplier like `0.8`. Popups follow it too. */
  speed?: Speed
}

export type MotionStyleName = "springy" | "calm" | "snappy" | "playful"

const presets = { fast: 0.6, normal: 1, slow: 1.4 } as const

export function speedValue(speed: Speed | undefined): number | undefined {
  if (speed === undefined) return undefined
  return typeof speed === "number" ? speed : presets[speed]
}

const SpeedContext = React.createContext<number | undefined>(undefined)

type SpeedStyle = React.CSSProperties & { "--kf-speed"?: number }

/* Wraps a component's parts. Without `speed` it adds nothing to the page. With it, a
   `display: contents` element carries the variable to the parts in place, and context carries it
   to the parts in a portal. */
export function Speed({ speed, children }: SpeedProps & { children?: React.ReactNode }) {
  const value = speedValue(speed)
  if (value === undefined) return children
  const style: SpeedStyle = { display: "contents", "--kf-speed": value }
  return (
    <SpeedContext value={value}>
      <span data-slot="speed" style={style}>
        {children}
      </span>
    </SpeedContext>
  )
}

/* For parts that render in a portal: adds the speed of the component they belong to. `style` can
   be an object or UI SDK's function of the part's state. */
export function useSpeedStyle<S>(style: S): S {
  return withSpeed(style, React.useContext(SpeedContext))
}

/* Adds a speed to a part's own `style`, for a part that takes `speed` and renders in a portal. */
export function withSpeed<S>(style: S, speed: Speed | undefined): S {
  const value = speedValue(speed)
  if (value === undefined) return style
  if (typeof style === "function")
    return ((state: unknown) => ({ "--kf-speed": value, ...(style as (s: unknown) => React.CSSProperties)(state) })) as S
  return { "--kf-speed": value, ...(style as React.CSSProperties | undefined) } as S
}

/* UI SDK parts take `children` as content or as a function of the part's state. A styled part
   that adds elements of its own (a chevron, a moving key) wraps either form with this, so the
   function form keeps working. */
export function mapChildren<State>(
  children: React.ReactNode | ((state: State) => React.ReactNode),
  wrap: (content: React.ReactNode) => React.ReactNode,
): React.ReactNode | ((state: State) => React.ReactNode) {
  return typeof children === "function" ? (state: State) => wrap(children(state)) : wrap(children)
}

/* Sets speed and motion style for the whole app, popups included. A component's own `speed` prop
   still wins inside that component. Server-rendered pages can put `data-motion` on <html> directly
   to avoid a change after hydration. */
export function KeyframeryProvider({
  speed,
  motion,
  children,
}: SpeedProps & {
  /** The motion style for the whole app: `"springy"` (the default), `"calm"`, `"snappy"` or `"playful"`. */
  motion?: MotionStyleName
  children?: React.ReactNode
}) {
  const value = speedValue(speed)
  React.useLayoutEffect(() => {
    const html = document.documentElement
    if (motion) html.setAttribute("data-motion", motion)
    if (value !== undefined) html.style.setProperty("--kf-speed", String(value))
    return () => {
      if (motion) html.removeAttribute("data-motion")
      if (value !== undefined) html.style.removeProperty("--kf-speed")
    }
  }, [motion, value])
  return children
}
