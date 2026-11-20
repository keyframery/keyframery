"use client"

/* The bell in the header: a popover of what happened in the store, newest first, with the unread
   ones marked, and "Mark all read". A notification that points at a page opens it. */

import { Bell, BellOff, CircleDollarSign, PackageX, RotateCcw, ShoppingBag, Star, UserRoundPlus } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from "@/components/ui/scroll-area"

import type { NotificationKind } from "./data"
import { ago } from "./format"
import { linkProps, useRouter } from "./router"
import { unreadCount, useStore } from "./store"

const icon = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const

export const KIND_ICON: Record<NotificationKind, React.ComponentType<typeof icon>> = {
  order: ShoppingBag,
  stock: PackageX,
  refund: RotateCcw,
  payout: CircleDollarSign,
  team: UserRoundPlus,
  review: Star,
}

export function Notifications() {
  const { state, actions } = useStore()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const unread = unreadCount(state)
  const list = [...state.notifications].sort((a, b) => b.at.localeCompare(a.at))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        render={<Button variant="ghost" size="icon" className="relative" />}
      >
        <Bell {...icon} />
        {unread > 0 && (
          <span aria-hidden className="absolute top-1.5 end-1.5 size-2 rounded-full bg-[var(--chart-1)] shadow-[0_0_0_2px_var(--background)]" />
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(380px,calc(100vw-16px))] p-0 [--popover-padding:0]">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <PopoverTitle className="text-[14px] font-semibold">
            Notifications
            {unread > 0 && <span className="ms-2 text-[12px] font-medium text-muted-foreground tabular-nums">{unread} new</span>}
          </PopoverTitle>
          <Button size="sm" variant="ghost" disabled={!unread} onClick={() => actions.markNotificationsRead("all")} className="-me-1.5">
            Mark all read
          </Button>
        </div>
        {list.length === 0 ? (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BellOff {...icon} />
              </EmptyMedia>
              <EmptyTitle>You're all caught up</EmptyTitle>
              <EmptyDescription>New orders, low stock and payouts show up here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ScrollArea className="max-h-[min(420px,60vh)]">
            <ScrollAreaViewport className="max-h-[min(420px,60vh)]">
              <ScrollAreaContent>
                <ul className="flex flex-col p-1.5" aria-label="Notifications">
                  {list.map((n) => {
                    const Glyph = KIND_ICON[n.kind]
                    const link = n.to && router.exists(n.to)
                    const row = (
                      <>
                        <ItemMedia variant="icon" className="size-8 rounded-[9px]">
                          <Glyph {...icon} />
                        </ItemMedia>
                        <ItemContent className="gap-0.5">
                          <ItemTitle className="flex w-full items-baseline gap-2 text-[13px]">
                            <span className="min-w-0 flex-1 truncate">{n.title}</span>
                            <span className="shrink-0 text-[11px] font-normal text-muted-foreground tabular-nums">{ago(n.at)}</span>
                          </ItemTitle>
                          <ItemDescription className="line-clamp-2 text-[12px] leading-[1.45]">{n.body}</ItemDescription>
                        </ItemContent>
                        {!n.read && <span aria-label="Unread" className="mt-1.5 size-2 shrink-0 self-start rounded-full bg-[var(--chart-1)]" />}
                      </>
                    )
                    return (
                      <li key={n.id}>
                        {link ? (
                          <Item
                            size="sm"
                            className="rounded-[10px] px-2.5 hover:bg-foreground/[0.04]"
                            render={
                              <a
                                {...linkProps(router, n.to!, () => {
                                  actions.markNotificationsRead([n.id])
                                  setOpen(false)
                                })}
                              />
                            }
                          >
                            {row}
                          </Item>
                        ) : (
                          <Item size="sm" className="rounded-[10px] px-2.5" data-unread={n.read ? undefined : ""}>
                            {row}
                          </Item>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </ScrollAreaContent>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar>
              <ScrollAreaThumb />
            </ScrollAreaScrollbar>
          </ScrollArea>
        )}
        {router.exists("/notifications") && (
          <div className="border-t border-border p-1.5">
            <Button variant="ghost" size="sm" className="w-full" render={<a {...linkProps(router, "/notifications", () => setOpen(false))} />}>
              See all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
