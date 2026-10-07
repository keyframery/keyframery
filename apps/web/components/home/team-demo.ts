"use client"

/*
 * The hero's little Team app. One state drives both copies (stock and Keyframery), so a click on either
 * side plays on both and the two can never drift apart.
 */

import * as React from "react"

export type Side = "stock" | "kf"
export type Tab = "members" | "activity"
export type Member = { id: string; name: string; email: string; role: "Owner" | "Admin" | "Member" | "Invited" }

const TEAM: Member[] = [
  { id: "ana", name: "Ana Ruiz", email: "ana@acme.com", role: "Owner" },
  { id: "ben", name: "Ben Okafor", email: "ben@acme.com", role: "Admin" },
  { id: "chloe", name: "Chloé Martin", email: "chloe@acme.com", role: "Member" },
]
const INVITEES = [
  { id: "maya", name: "Maya Chen", email: "maya@acme.com" },
  { id: "leo", name: "Leo Park", email: "leo@acme.com" },
]
export const SEATS = 10

export type TeamState = { members: Member[]; tab: Tab; dialogOpen: boolean; focus: Side | null }

export function useTeamDemo() {
  const [state, setState] = React.useState<TeamState>({ members: TEAM, tab: "members", dialogOpen: false, focus: null })
  const next = INVITEES.find((p) => !state.members.some((m) => m.id === p.id)) ?? null

  // `from` is the side a person clicked, so focus can move there. The demo passes null and never moves focus.
  const actions = React.useMemo(
    () => ({
      openInvite: (from: Side | null) => setState((s) => ({ ...s, dialogOpen: true, focus: from })),
      cancel: (from: Side | null) => setState((s) => ({ ...s, dialogOpen: false, focus: from })),
      send: (from: Side | null) =>
        setState((s) => {
          const who = INVITEES.find((p) => !s.members.some((m) => m.id === p.id))
          return { ...s, dialogOpen: false, focus: from, members: who ? [...s.members, { ...who, role: "Invited" }] : s.members }
        }),
      remove: (id: string) => setState((s) => ({ ...s, members: s.members.filter((m) => m.id !== id) })),
      setTab: (tab: Tab) => setState((s) => ({ ...s, tab })),
    }),
    [],
  )

  const invited = state.members.filter((m) => m.role === "Invited")
  const activity = [
    ...[...invited].reverse().map((m) => ({ id: `invited-${m.id}`, text: `${m.name} was invited`, when: "Just now" })),
    { id: "plan", text: "Ben Okafor moved the team to the Team plan", when: "2h ago" },
    { id: "joined", text: "Chloé Martin joined", when: "Yesterday" },
  ]
  return { state, actions, next, activity }
}

export type TeamDemo = ReturnType<typeof useTeamDemo>
export type TeamActions = TeamDemo["actions"]

export type Step = { target: string; wait: number; act: (a: TeamActions) => void }

/**
 * The demo's next click, read from the current state, so it picks up wherever a visitor left things.
 * One loop: invite → send → Activity → Members → remove, which lands back where it started.
 */
export function nextStep(s: TeamState, sawActivity: boolean): Step {
  const invited = s.members.filter((m) => m.role === "Invited")
  if (s.dialogOpen) return { target: "send", wait: 1500, act: (a) => a.send(null) }
  if (s.tab === "activity") return { target: "tab-members", wait: 900, act: (a) => a.setTab("members") }
  if (invited.length && !sawActivity) return { target: "tab-activity", wait: 1400, act: (a) => a.setTab("activity") }
  if (invited.length) {
    const last = invited[invited.length - 1]
    return { target: `remove-${last.id}`, wait: 1400, act: (a) => a.remove(last.id) }
  }
  return { target: "invite", wait: 1150, act: (a) => a.openInvite(null) }
}
