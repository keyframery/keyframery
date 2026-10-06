"use client"

import * as React from "react"

import { ListCut } from "@/components/keyframery/list-cut"
import { Button } from "@/components/ui/button"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { Screen } from "../screen"

const TRACKS = [
  { id: 1, title: "Night drive", artist: "Halogen", time: "3:42" },
  { id: 2, title: "Low tide", artist: "Mareen", time: "4:05" },
  { id: 3, title: "Paper planes", artist: "Ostrava", time: "2:58" },
  { id: 4, title: "Afterglow", artist: "Kiln", time: "3:31" },
]

export function Playlist({ className }: { className?: string }) {
  const [tracks, setTracks] = React.useState(TRACKS)
  const move = (id: number, to: "top" | "bottom") =>
    setTracks((ts) => {
      const t = ts.find((x) => x.id === id)!
      const rest = ts.filter((x) => x.id !== id)
      return to === "top" ? [t, ...rest] : [...rest, t]
    })
  const shuffle = () => setTracks((ts) => [...ts.slice(1), ts[0]].reverse())
  return (
    <Screen name="playlist" title="Playlist" className={className}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{tracks.length} tracks, 14 min</p>
        <Button variant="outline" size="sm" data-director="shuffle" onClick={shuffle}>Shuffle</Button>
      </div>
      <ListCut as="ol" className="grid gap-1">
        {tracks.map((t, i) => (
          <ListCut.Item key={t.id} id={t.id} as="li" className="min-w-0">
            <ContextMenu>
              <ContextMenuTrigger className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted">
                <span className="w-4 text-right text-sm text-muted-foreground tabular-nums">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{t.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{t.artist}</span>
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">{t.time}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Options for ${t.title}`} />}>⋯</DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => move(t.id, "top")}>Move to top</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => move(t.id, "bottom")}>Move to bottom</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => move(t.id, "top")}>Move to top</ContextMenuItem>
                <ContextMenuItem onClick={() => move(t.id, "bottom")}>Move to bottom</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </ListCut.Item>
        ))}
      </ListCut>
    </Screen>
  )
}
