"use client"

/* The command menu (⌘K): every page, recent orders, customers and products by name, theme and
   motion style, and the admin's actions. A row only shows when what it opens exists. */

import {
  ArrowRight,
  Bell,
  Check,
  CircleAlert,
  Download,
  Keyboard,
  LogOut,
  Monitor,
  Moon,
  Package,
  PanelLeft,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sun,
  UserRound,
  Waves,
} from "lucide-react"
import * as React from "react"

import {
  Command,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandItemText,
  CommandList,
  CommandSearch,
  CommandShortcut,
} from "@/components/ui/command"
import { Dialog, DialogBackdrop, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { type MotionStyleValue, usePreference } from "@/components/ui/motion-style"

import { backroomMotion } from "./appearance"
import { downloadOrdersCsv } from "./export"
import { money } from "./format"
import { nav } from "./routes"
import { useRouter } from "./router"
import { useShellState } from "./shell-state"
import { customerOf, toaster, useStore } from "./store"

const icon = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const

type Row = { value: string; label: string; keywords?: string[]; icon?: React.ReactNode; shortcut?: string; current?: boolean; detail?: string; run: () => void }
type Group = { label: string; rows: Row[] }

export function CommandMenu({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { open, setOpen } = useShellState()
  const router = useRouter()
  const { state, actions } = useStore()
  const { value: motion } = usePreference(backroomMotion)

  const groups = React.useMemo<Group[]>(() => {
    const go = (to: string) => () => router.navigate(to)
    const pages: Row[] = []
    for (const group of nav)
      for (const item of group.items) {
        if (!router.exists(item.to)) continue
        pages.push({ value: `page:${item.to}`, label: item.label, keywords: item.keywords, icon: item.icon ? <item.icon {...icon} /> : null, run: go(item.to) })
        for (const child of item.children ?? [])
          if (child.to !== item.to && router.exists(child.to))
            pages.push({ value: `page:${child.to}`, label: `${item.label} › ${child.label}`, icon: item.icon ? <item.icon {...icon} /> : null, run: go(child.to) })
      }
    if (router.exists("/")) pages.splice(1, 0, { value: "page:/?tab=analytics", label: "Dashboard › Analytics", keywords: ["sessions", "traffic", "conversion"], icon: <ArrowRight {...icon} className="rtl:-scale-x-100" />, run: go("/?tab=analytics") })
    pages.push({ value: "page:errors", label: "Error pages › Not found", keywords: ["404", "error"], icon: <CircleAlert {...icon} />, run: go("/errors/404") })

    const recent = [...state.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
    const orders: Row[] = recent
      .filter((o) => router.exists(`/orders/${o.number}`))
      .map((o) => ({ value: `order:${o.number}`, label: `#${o.number} · ${customerOf(state, o.customerId)?.name ?? ""}`, detail: money(o.total), keywords: [String(o.number)], icon: <ShoppingBag {...icon} />, run: go(`/orders/${o.number}`) }))
    const customers: Row[] = state.customers
      .filter((c) => router.exists(`/customers/${c.id}`))
      .map((c) => ({ value: `customer:${c.id}`, label: c.company ? `${c.name} · ${c.company}` : c.name, keywords: [c.email], icon: <UserRound {...icon} />, run: go(`/customers/${c.id}`) }))
    const products: Row[] = state.products
      .filter((p) => router.exists(`/products/${p.id}`))
      .map((p) => ({ value: `product:${p.id}`, label: p.name, keywords: [p.collection], icon: <Package {...icon} />, run: go(`/products/${p.id}`) }))

    const theme = state.appearance.theme
    const themes: Row[] = (
      [
        ["light", "Light theme", <Sun key="s" {...icon} />],
        ["dark", "Dark theme", <Moon key="m" {...icon} />],
        ["system", "System theme", <Monitor key="o" {...icon} />],
      ] as const
    ).map(([value, label, glyph]) => ({ value: `theme:${value}`, label, keywords: ["appearance", "mode"], icon: glyph, current: theme === value, run: () => actions.setAppearance({ theme: value }) }))
    const motions: Row[] = (["calm", "springy", "snappy", "playful"] as MotionStyleValue[]).map((value) => ({
      value: `motion:${value}`,
      label: `${value[0].toUpperCase()}${value.slice(1)} motion`,
      keywords: ["motion style", "animation"],
      icon: <Waves {...icon} />,
      current: motion === value,
      run: () => backroomMotion.set(value),
    }))
    const tools: Row[] = [
      { value: "do:sidebar", label: "Toggle the sidebar", icon: <PanelLeft {...icon} className="rtl:-scale-x-100" />, shortcut: "mod+b", run: onToggleSidebar },
      { value: "do:appearance", label: "Appearance settings", keywords: ["theme", "density", "direction", "rtl"], icon: <SlidersHorizontal {...icon} />, run: () => setOpen("appearance", true) },
      {
        value: "do:export",
        label: `Export the last ${state.period} days of orders`,
        keywords: ["csv", "download"],
        icon: <Download {...icon} />,
        run: () => {
          const { rows, name } = downloadOrdersCsv(state, state.period)
          toaster.success(`Exported ${rows} orders`, { description: name })
        },
      },
      { value: "do:read", label: "Mark all notifications as read", icon: <Bell {...icon} />, run: () => actions.markNotificationsRead("all") },
      { value: "do:shortcuts", label: "Keyboard shortcuts", icon: <Keyboard {...icon} />, shortcut: "shift+?", run: () => setOpen("shortcuts", true) },
      { value: "do:signout", label: "Sign out", icon: <LogOut {...icon} className="rtl:-scale-x-100" />, run: () => setOpen("signOut", true) },
    ]
    return [
      { label: "Pages", rows: pages },
      { label: "Recent orders", rows: orders },
      { label: "Customers", rows: customers },
      { label: "Products", rows: products },
      { label: "Actions", rows: tools },
      { label: "Theme", rows: themes },
      { label: "Motion style", rows: motions },
    ].filter((g) => g.rows.length)
  }, [router, state, actions, motion, onToggleSidebar, setOpen])

  const run = (value: string) => {
    const row = groups.flatMap((g) => g.rows).find((r) => r.value === value)
    if (!row) return
    setOpen("command", false)
    row.run()
  }

  return (
    <Dialog open={open.command} onOpenChange={(next) => setOpen("command", next)}>
      <DialogBackdrop />
      <DialogContent className="mt-[min(14vh,120px)] mb-auto p-0 [--dialog-width:560px]">
        <DialogTitle className="sr-only">Search and commands</DialogTitle>
        <Command aria-label="Search and commands" onAction={run} className="rounded-none bg-transparent shadow-none dark:shadow-none">
          <CommandSearch>
            <Search {...icon} />
            <CommandInput aria-label="Search pages, orders and commands" placeholder="Search pages, orders and commands…" />
          </CommandSearch>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandList className="max-h-[min(400px,60vh)]">
            {groups.map((group) => (
              <CommandGroup key={group.label}>
                <CommandGroupLabel>{group.label}</CommandGroupLabel>
                {group.rows.map((row) => (
                  <CommandItem key={row.value} value={row.value} label={row.label} keywords={row.keywords} shortcut={row.shortcut}>
                    {row.icon && <CommandItemIcon>{row.icon}</CommandItemIcon>}
                    <CommandItemText>{row.label}</CommandItemText>
                    {row.detail && <span className="ms-auto shrink-0 ps-3 text-[12px] text-muted-foreground tabular-nums">{row.detail}</span>}
                    {row.current && <Check {...icon} className="ms-auto shrink-0 text-muted-foreground" aria-label="Current" />}
                    {row.shortcut && <CommandShortcut />}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
          <CommandFooter className="hidden sm:flex">
            <span className="inline-flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              to move
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Kbd>↵</Kbd>
              to open
            </span>
            <span className="ms-auto inline-flex items-center gap-1.5">
              <Kbd>Esc</Kbd>
              to close
            </span>
          </CommandFooter>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
