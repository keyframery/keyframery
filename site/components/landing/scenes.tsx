"use client"

/* The live pieces of the landing page. Every scene is a real Keyframery component playing its own demo. */

import Link from "next/link"
import * as React from "react"
import { RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { type PlayStep, useAutoplay } from "@/lib/autoplay"

import { MotionStyle, motionStyle, type MotionStyleValue, usePreference } from "@/components/primitives/preferences"
import { MotionStyleSwitcher } from "@/components/ui/preferences"
import * as accordion from "@/demos/accordion"
import * as button from "@/demos/button"
import * as carousel from "@/demos/carousel"
import * as checkbox from "@/demos/checkbox"
import * as menu from "@/demos/menu"
import * as meter from "@/demos/meter"
import * as numberInput from "@/demos/number-input"
import * as otpInput from "@/demos/otp-input"
import * as radio from "@/demos/radio"
import * as segmentedControl from "@/demos/segmented-control"
import * as slider from "@/demos/slider"
import * as switchDemo from "@/demos/switch"
import * as tabs from "@/demos/tabs"
import * as timeline from "@/demos/timeline"
import * as tooltip from "@/demos/tooltip"
import { cn } from "@/lib/utils"
import { Demo, DemoFrame } from "@site/components/demo"
import type { DemoModule } from "@site/lib/demo-types"

/* The carousel sits far down the landing: its photos wait until it is near the screen. On its own docs page they load at once. */
function LandingCarousel(props: React.ComponentProps<typeof carousel.default>) {
  return <carousel.default {...props} lazyPhotos />
}

/* Bundled with the page, so they are in the first paint. Anything else loads on demand. */
const BUNDLED: Record<string, DemoModule> = {
  accordion,
  button,
  carousel: { ...carousel, default: LandingCarousel },
  checkbox,
  menu,
  meter,
  "number-input": numberInput,
  "otp-input": otpInput,
  radio,
  "segmented-control": segmentedControl,
  slider,
  switch: switchDemo,
  tabs,
  timeline,
  tooltip,
}

export function Scene({ slug, className, pad }: { slug: string; className?: string; pad?: number }) {
  const demo = BUNDLED[slug]
  // Every scene sits in a box of fixed height, so it is scaled to fit both ways.
  return demo ? <DemoFrame demo={demo} slug={slug} className={className} pad={pad} fitHeight /> : <Demo slug={slug} className={className} pad={pad} fitHeight />
}

/* The landing page is always dark. Popups render at the end of <body>, outside the page's own .dark
   wrapper, so <body> carries the class too while the landing is open. */
export function ForceDark() {
  React.useEffect(() => {
    document.body.classList.add("dark")
    return () => document.body.classList.remove("dark")
  }, [])
  return null
}

/* ---------------------------------------------------------------- Hero: a board of live components */

const BOARD = [
  { slug: "tabs", name: "Tabs" },
  { slug: "menu", name: "Menu" },
  { slug: "calendar", name: "Calendar" },
  { slug: "otp-input", name: "OTP Input" },
  { slug: "meter", name: "Meter" },
  { slug: "switch", name: "Switch" },
]

export function HeroBoard() {
  return (
    <div className="rounded-[28px] bg-white/[0.04] p-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_0_0_1px_rgb(255_255_255/0.07),0_50px_120px_-40px_rgb(0_0_0/0.9)] backdrop-blur-sm sm:p-3 md:rounded-[36px]">
      <div className="overflow-hidden rounded-[20px] bg-[#08090c] ring-1 ring-white/[0.08] md:rounded-[26px]">
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-2.5">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
          </span>
          <p className="ml-1 hidden text-[12.5px] text-white/50 sm:block">Live components. Point at one to take over.</p>
          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden text-[12.5px] text-white/50 md:inline">Motion style</span>
            <MotionStyleSwitcher />
          </div>
        </div>
        <ul aria-label="Live components" className="grid grid-cols-[minmax(0,1fr)] gap-px bg-white/[0.07] md:grid-cols-3">
          {BOARD.map(({ slug, name }, i) => (
            <li key={slug} className={cn("relative min-w-0 bg-[#0a0b0f]", i > 2 && "hidden md:block")}>
              <Scene slug={slug} className="lp-stage h-[360px] pb-10!" pad={24} />
              <Link
                prefetch={false}
                href={`/docs/components/${slug}`}
                className="absolute bottom-3 left-4 rounded-full px-2 py-0.5 font-mono text-[11px] text-white/45 outline-none ring-1 ring-white/10 hover:text-white focus-visible:ring-white/60"
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- The same click, twice */

const TAB_ORDER = [3, 1, 2, 0]
const comparisonPlay: PlayStep[] = TAB_ORDER.flatMap((index) => [
  { click: `[data-side="still"] [role="tab"]:nth-of-type(${index + 1})`, wait: 0 },
  { click: `[data-side="moving"] [role="tab"]:nth-of-type(${index + 1})`, wait: 2200 },
])

/* Two copies of the same tabs. The left one has every transition and animation turned off, which is what
   UI SDK gives you before you add motion. A script clicks the same tab in both at the same moment. */
export function SameClick() {
  const root = React.useRef<HTMLDivElement>(null)
  const [run, setRun] = React.useState(0)
  const still: DemoModule = React.useMemo(() => ({ default: tabs.default, meta: tabs.meta }), [])
  useAutoplay(root, comparisonPlay, run)

  return (
    <div ref={root} className="grid gap-5 md:grid-cols-2">
      {[
        { side: "still", dot: "bg-white/35", name: "UI SDK", note: "as it ships: the tab changes at once", frame: "kf-still" },
        { side: "moving", dot: "bg-[#8098ff]", name: "with Keyframery", note: "the key stretches across and the panel follows", frame: "" },
      ].map(({ side, dot, name, note, frame }) => (
        <div key={side} data-side={side} className="min-w-0">
          <p className="mb-3 flex flex-wrap items-center gap-x-2 text-[13.5px]">
            <span aria-hidden="true" className={cn("size-2 rounded-full", dot)} />
            <span className="font-medium">{name}</span>
            <span className="lp-muted">{note}</span>
          </p>
          <div className={cn("lp-card relative overflow-hidden rounded-2xl", frame)}>
            {side === "moving" && <Button variant="ghost" size="icon" onClick={() => setRun((now) => now + 1)} aria-label="Replay the comparison" title="Replay both examples"
              className="absolute top-3 right-3 z-20 size-8 rounded-[10px] border border-border/70 bg-background/90 text-muted-foreground shadow-sm hover:text-foreground">
              <RotateCw aria-hidden className="size-3.5" />
            </Button>}
            <DemoFrame key={run} demo={still} slug={`tabs-${side}`} className="lp-stage h-[300px]" pad={24} fitHeight replay={false} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- Motion styles */

const STYLES: { value: MotionStyleValue; name: string; pace: string; body: string }[] = [
  { value: "calm", name: "Calm", pace: "1.35× slower", body: "No bounce. For dashboards, finance and long working sessions." },
  { value: "springy", name: "Springy", pace: "The default", body: "A small spring and pop. Feels physical without showing off." },
  { value: "snappy", name: "Snappy", pace: "0.6×", body: "Fast and crisp. For developer tools and dense apps." },
  { value: "playful", name: "Playful", pace: "1.15×", body: "Bigger springs, bolder pops. For consumer apps." },
]

/* Four cards that set the motion style for the whole page, and remember it. */
export function StylePicker() {
  const { value } = usePreference(motionStyle)
  return (
    <MotionStyle preference={motionStyle}>
      <div role="radiogroup" aria-label="Motion style" className="grid gap-3 sm:grid-cols-2">
        {STYLES.map((s) => {
          const on = value === s.value
          return (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={(event) => motionStyle.set(s.value, { reason: "press", event: event.nativeEvent })}
              className={cn(
                "rounded-xl p-4 text-left outline-none ring-1 transition-[scale,background-color,box-shadow] duration-[calc(200ms*var(--kf-speed,1))] ease-pop focus-visible:ring-2 focus-visible:ring-[#8098ff] active:scale-[0.98] motion-reduce:transition-none",
                on ? "bg-white/[0.07] ring-[#8098ff]/60" : "bg-white/[0.02] ring-white/10 hover:bg-white/[0.05]",
              )}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[15px] font-semibold">
                  <span aria-hidden="true" className={cn("size-2 rounded-full transition-colors", on ? "bg-[#8098ff]" : "bg-white/20")} />
                  {s.name}
                </span>
                <span className="font-mono text-[11px] text-white/45">{s.pace}</span>
              </span>
              <span className="mt-1.5 block text-[13.5px] leading-relaxed lp-muted">{s.body}</span>
            </button>
          )
        })}
      </div>
    </MotionStyle>
  )
}
