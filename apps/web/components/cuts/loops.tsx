"use client"

/* Live loops for the Cuts page. They stage shadcn parts inline (same data-slot names), so the real CSS cuts play without opening modals. */

import * as React from "react"

import { ListCut } from "@/components/keyframery/list-cut"
import { LoadCut } from "@/components/keyframery/load-cut"
import { MatchCut } from "@/components/keyframery/match-cut"
import { ValueCut } from "@/components/keyframery/value-cut"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const press = (el: Element | null) => el?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse", isPrimary: true }))

/** Runs `step` every `ms` while the element is on screen; under reduced motion it waits for Play. */
function useLoop(ms: number, step: () => void) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [still, setStill] = React.useState(false)
  const saved = React.useRef(step)
  saved.current = step
  React.useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true)
      return
    }
    let timer = 0
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer)
      if (e.isIntersecting) timer = window.setInterval(() => saved.current(), ms)
    })
    if (ref.current) io.observe(ref.current)
    return () => {
      clearInterval(timer)
      io.disconnect()
    }
  }, [ms])
  return { ref, still, playOnce: () => saved.current() }
}

function Frame({ label, still, playOnce, children, loopRef }: { label: string; still: boolean; playOnce: () => void; children: React.ReactNode; loopRef: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={loopRef} className="relative grid min-h-56 place-items-center overflow-hidden rounded-xl border bg-card p-6">
      {children}
      {still && (
        <Button variant="outline" size="sm" className="absolute right-3 bottom-3" aria-label={`Play the ${label} loop`} onClick={playOnce}>
          Play
        </Button>
      )}
    </div>
  )
}

export function RackFocusLoop() {
  const [open, setOpen] = React.useState(false)
  const trigger = React.useRef<HTMLButtonElement>(null)
  const loop = useLoop(1800, () => {
    if (!open) press(trigger.current)
    setOpen((o) => !o)
  })
  return (
    <Frame label="rack focus" {...loop} loopRef={loop.ref}>
      <div className="relative grid h-40 w-full max-w-sm place-items-center">
        <button ref={trigger} type="button" tabIndex={-1} className="absolute top-0 left-0 rounded-md border px-2.5 py-1 text-sm">Edit profile</button>
        <div data-slot="dialog-content" {...(open ? { "data-open": "" } : { "data-closed": "" })} className={`w-64 rounded-xl border bg-popover p-4 text-sm shadow-lg ${open ? "" : "opacity-0"}`} aria-hidden="true">
          <p className="font-medium">Edit profile</p>
          <p className="mt-1 text-muted-foreground">Grows from the button that opened it.</p>
        </div>
      </div>
    </Frame>
  )
}

export function JCutLoop() {
  const [tab, setTab] = React.useState("a")
  const host = React.useRef<HTMLDivElement>(null)
  const loop = useLoop(1600, () => {
    const next = tab === "a" ? "b" : "a"
    press(host.current?.querySelector(`[data-value="${next}"]`) ?? null)
    setTab(next)
  })
  return (
    <Frame label="J-cut" {...loop} loopRef={loop.ref}>
      <div ref={host} className="w-full max-w-sm">
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
          <TabsList>
            <TabsTrigger value="a" data-value="a">Overview</TabsTrigger>
            <TabsTrigger value="b" data-value="b">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="a" className="mt-3 rounded-lg border p-3 text-sm">Revenue is up 12% this week.</TabsContent>
          <TabsContent value="b" className="mt-3 rounded-lg border p-3 text-sm">1,284 visitors, 3.2% conversion.<div className="mt-2 h-10 rounded bg-muted" /></TabsContent>
        </Tabs>
      </div>
    </Frame>
  )
}

export function MatchCutLoop() {
  const [big, setBig] = React.useState(false)
  const loop = useLoop(2000, () => setBig((b) => !b))
  return (
    <Frame label="match cut" {...loop} loopRef={loop.ref}>
      {big ? (
        <MatchCut key="big" id="cuts-page-order" className="w-full max-w-sm rounded-2xl border bg-background p-6">
          <p className="font-medium">Order #1044</p>
          <p className="mt-2 text-sm text-muted-foreground">The card grew into this page.</p>
          <div className="mt-4 h-16 rounded bg-muted" />
        </MatchCut>
      ) : (
        <MatchCut key="small" id="cuts-page-order" className="w-40 rounded-xl border bg-background p-3 text-sm">Order #1044</MatchCut>
      )}
    </Frame>
  )
}

export function CutOnActionLoop() {
  const [items, setItems] = React.useState([1, 2])
  const add = React.useRef<HTMLButtonElement>(null)
  const next = React.useRef(3)
  const loop = useLoop(1500, () => {
    if (items.length >= 4) {
      setItems((xs) => xs.slice(1))
      return
    }
    press(add.current)
    setItems((xs) => [...xs, next.current++])
  })
  return (
    <Frame label="cut on action" {...loop} loopRef={loop.ref}>
      <div className="grid w-full max-w-sm gap-2">
        <ListCut as="ul" className="grid gap-1.5">
          {items.map((n) => (
            <ListCut.Item key={n} id={n} as="li" className="rounded-md border px-3 py-1.5 text-sm">Message {n}</ListCut.Item>
          ))}
        </ListCut>
        <button ref={add} type="button" tabIndex={-1} className="w-fit rounded-md bg-foreground px-3 py-1 text-sm text-background">Send</button>
      </div>
    </Frame>
  )
}

export function PunchInLoop() {
  const [n, setN] = React.useState(1284)
  const loop = useLoop(1200, () => setN((v) => v + Math.ceil(Math.random() * 9)))
  return (
    <Frame label="punch-in" {...loop} loopRef={loop.ref}>
      <p className="text-5xl font-semibold tracking-tight"><ValueCut value={n} locale="en-US" /></p>
    </Frame>
  )
}

export function DissolveLoop() {
  const [loading, setLoading] = React.useState(false)
  const loop = useLoop(2200, () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 900)
  })
  return (
    <Frame label="dissolve" {...loop} loopRef={loop.ref}>
      <div className="w-full max-w-sm">
        <LoadCut loading={loading} skeleton={<div className="h-20 rounded-md bg-muted" />}>
          <div className="rounded-md border p-3 text-sm">Report ready. 3 charts, 12 rows.<div className="mt-2 h-14 rounded bg-muted/60" /></div>
        </LoadCut>
      </div>
    </Frame>
  )
}
