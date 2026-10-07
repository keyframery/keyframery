"use client"

/*
 * One copy of the hero's Team app: real shadcn parts, plus ListCut and ValueCut.
 * The invite dialog is staged inside the window (same data-slot and the same stock classes as shadcn's
 * DialogContent), so two copies can be open at once without fighting over focus or the page.
 */

import { XIcon } from "lucide-react"
import * as React from "react"

import { ListCut } from "@/components/keyframery/list-cut"
import { ValueCut } from "@/components/keyframery/value-cut"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { initialSettle, isHidden, nextSettle } from "./settle"
import { SEATS, type Side, type Tab, type TeamDemo } from "./team-demo"

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")

/** True once a closed part has finished its exit animation, so it can stop taking clicks and hide (see settle.ts). */
function useSettledClosed(open: boolean, ref: React.RefObject<HTMLElement | null>) {
  const [state, setState] = React.useState(() => initialSettle(open))
  // Follow `open` during render, as React recommends for state that tracks a prop.
  if (state.open !== open) setState(nextSettle(state, open ? "open" : "close"))
  React.useEffect(() => {
    if (open) return
    const el = ref.current
    const ended = (e?: AnimationEvent) => {
      if (!e || e.target === el) setState((s) => nextSettle(s, "ended"))
    }
    const t = setTimeout(ended, 600)
    el?.addEventListener("animationend", ended)
    return () => {
      clearTimeout(t)
      el?.removeEventListener("animationend", ended)
    }
  }, [open, ref])
  return isHidden(state)
}

function InviteDialog({ demo, side, sendRef }: { demo: TeamDemo; side: Side; sendRef: React.Ref<HTMLButtonElement> }) {
  const { state, actions, next } = demo
  const open = state.dialogOpen
  const content = React.useRef<HTMLDivElement>(null)
  const settled = useSettledClosed(open, content)
  const id = React.useId()
  const phase = open ? { "data-open": "" } : { "data-closed": "" }
  // Same classes as shadcn's DialogOverlay / DialogContent, so the stock side moves exactly like stock shadcn.
  // fill-mode-forwards only keeps the last exit frame until we hide the part; it changes nothing you can see.
  return (
    <>
      <div
        data-slot="dialog-overlay"
        {...phase}
        aria-hidden="true"
        onClick={() => actions.cancel(side)}
        className={cn(
          "absolute inset-0 z-10 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 data-closed:fill-mode-forwards",
          settled && "invisible",
        )}
      />
      <div
        ref={content}
        data-slot="dialog-content"
        role="dialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
        {...phase}
        inert={settled}
        onKeyDown={(e) => {
          if (e.key === "Escape") actions.cancel(side)
        }}
        className={cn(
          "absolute top-1/2 left-1/2 z-20 grid w-[min(20rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 gap-3 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:fill-mode-forwards",
          settled && "invisible",
        )}
      >
        <div className="grid gap-1">
          <p id={`${id}-title`} className="text-base leading-none font-medium">
            Invite a teammate
          </p>
          <p id={`${id}-desc`} className="text-muted-foreground">
            They&apos;ll get an email with a link to join Acme.
          </p>
        </div>
        <Input aria-label="Email" value={next?.email ?? ""} readOnly />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" data-hero="cancel" onClick={() => actions.cancel(side)}>
            Cancel
          </Button>
          <Button ref={sendRef} size="sm" data-hero="send" onClick={() => actions.send(side)}>
            Send invite
          </Button>
        </div>
      </div>
    </>
  )
}

/** The demo's pointer. The player moves it; its tip sits exactly on the point it is given. */
function DemoCursor({ side, shown, ref }: { side: Side; shown: boolean; ref: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} data-testid="hero-cursor" aria-hidden="true" hidden={!shown} className="pointer-events-none absolute top-0 left-0 z-30">
      {/* The click ring: cobalt where Keyframery is on. */}
      <span data-ring="" className={cn("absolute -top-3 -left-3 size-6 rounded-full border-2 opacity-0", side === "kf" ? "border-cut" : "border-foreground/30")} />
      <svg width="22" height="22" viewBox="0 0 22 22" className="-mt-0.5 -ml-[3px] drop-shadow-[0_2px_4px_rgb(22_24_29/0.3)]">
        <path d="M3 2 L3 17 L7.5 13 L10.5 20 L13 19 L10 12 L16 12 Z" fill="var(--foreground)" stroke="var(--background)" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function TeamApp({ side, demo, cursorRef, cursorShown }: { side: Side; demo: TeamDemo; cursorRef: React.Ref<HTMLDivElement>; cursorShown: boolean }) {
  const { state, actions, next, activity } = demo
  const invite = React.useRef<HTMLButtonElement>(null)
  const send = React.useRef<HTMLButtonElement>(null)

  // Focus follows a person's click on this side, like a real dialog. The self-playing demo never moves focus.
  const wasOpen = React.useRef(state.dialogOpen)
  React.useEffect(() => {
    if (state.focus === side && state.dialogOpen !== wasOpen.current) (state.dialogOpen ? send : invite).current?.focus()
    wasOpen.current = state.dialogOpen
  }, [state.dialogOpen, state.focus, side])

  return (
    <div data-window="" className="relative overflow-hidden rounded-xl border bg-card text-left shadow-[0_1px_0_rgb(22_24_29/0.04),0_16px_40px_-20px_rgb(22_24_29/0.22)]">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <span aria-hidden="true" className="flex gap-1">
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
        </span>
        <span className="text-[13px] font-medium">Acme workspace</span>
      </div>
      <div className="h-[21.25rem] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[15px] leading-tight font-semibold tracking-tight">Team</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              <ValueCut value={state.members.length} locale="en-US" /> of {SEATS} seats used
            </p>
          </div>
          <Button ref={invite} size="sm" data-hero="invite" disabled={!next} onClick={() => actions.openInvite(side)}>
            Invite
          </Button>
        </div>
        <Tabs value={state.tab} onValueChange={(v) => actions.setTab(v as Tab)} className="mt-3">
          <TabsList>
            <TabsTrigger value="members" data-hero="tab-members">
              Members
            </TabsTrigger>
            <TabsTrigger value="activity" data-hero="tab-activity">
              Activity
            </TabsTrigger>
          </TabsList>
          <TabsContent value="members" className="mt-1">
            <ListCut as="ul" aria-label="Members" className="grid">
              {state.members.map((m) => (
                <ListCut.Item key={m.id} id={m.id} as="li" className="flex h-11 items-center gap-3 border-b last:border-b-0">
                  <Avatar size="sm">
                    <AvatarFallback className="text-[10px]">{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  {m.role === "Invited" ? (
                    <span className="flex items-center gap-1">
                      <Badge variant="outline">Invited</Badge>
                      <Button variant="ghost" size="icon-xs" aria-label={`Remove ${m.name}`} data-hero={`remove-${m.id}`} onClick={() => actions.remove(m.id)}>
                        <XIcon />
                      </Button>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">{m.role}</span>
                  )}
                </ListCut.Item>
              ))}
            </ListCut>
          </TabsContent>
          <TabsContent value="activity" className="mt-1">
            <ListCut as="ul" aria-label="Activity" className="grid">
              {activity.map((a) => (
                <ListCut.Item key={a.id} id={a.id} as="li" className="flex h-11 items-center justify-between gap-3 border-b text-sm last:border-b-0">
                  <span className="truncate">{a.text}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{a.when}</span>
                </ListCut.Item>
              ))}
            </ListCut>
          </TabsContent>
        </Tabs>
      </div>
      <InviteDialog demo={demo} side={side} sendRef={send} />
      <DemoCursor ref={cursorRef} side={side} shown={cursorShown} />
    </div>
  )
}
