"use client"

import * as React from "react"

import { MatchCut } from "@/components/keyframery/match-cut"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { T } from "../trigger"

export function MatchDemo() {
  const [open, setOpen] = React.useState<number | null>(null)
  const [generation, remount] = React.useReducer((n: number) => n + 1, 0)
  return (
    <section className="grid max-w-2xl gap-3" data-testid="match-demo">
      <h2 className="font-medium">MatchCut</h2>
      {open === null ? (
        <div key={generation} className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <MatchCut key={n} id={`order-${n}`} className="rounded-xl border p-4" data-testid={`card-${n}`}>
              <button data-testid={`open-${n}`} className="text-left" onClick={() => setOpen(n)}>
                Order #{n}
              </button>
            </MatchCut>
          ))}
        </div>
      ) : (
        <MatchCut id={`order-${open}`} className="rounded-2xl border p-8" data-testid="detail">
          <p className="text-lg font-medium">Order #{open}</p>
          <div className="h-40" />
          <Button data-testid="close-detail" onClick={() => setOpen(null)}>Close</Button>
        </MatchCut>
      )}
      <Button variant="outline" className="w-fit" data-testid="rerender" onClick={remount}>Remount the cards</Button>
      <div className="flex items-center gap-3">
        <MatchCut id="profile" className="w-32 rounded-lg border p-3 text-sm" data-testid="profile-card">Profile</MatchCut>
        <Dialog>
          {T(DialogTrigger, <Button variant="outline" data-testid="profile-open">Open profile</Button>)}
          <DialogContent>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>Grown from the card.</DialogDescription>
            <MatchCut id="profile" className="rounded-lg border p-6" data-testid="profile-detail">Profile details</MatchCut>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
