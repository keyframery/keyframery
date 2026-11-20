"use client"

/* Three workspace pages: Apps (the services the store connects to), Notifications (everything the
   bell has said, by day) and Help (answers, keyboard shortcuts and a message to support). */

import { Check, CircleHelp, Keyboard, LifeBuoy, Search } from "lucide-react"
import * as React from "react"

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { date, time } from "./format"
import type { App } from "./extras"
import { Choice, icon, LabelledField, pageStack, PageHeader } from "./kit"
import { KIND_ICON } from "./notifications"
import { linkProps, useRouter } from "./router"
import { useShellState } from "./shell-state"
import { me, toaster, useStore } from "./store"

/* ------------------------------------------------------------------ apps */

const SHOW = [
  { value: "all", label: "All apps" },
  { value: "connected", label: "Connected" },
  { value: "available", label: "Not connected" },
]
const SORT = [
  { value: "category", label: "By kind" },
  { value: "az", label: "A to Z" },
  { value: "za", label: "Z to A" },
]

export function AppsPage() {
  const { state } = useStore()
  const router = useRouter()
  const q = router.query
  const search = q.get("q") ?? ""
  const show = q.get("show") ?? "all"
  const sort = q.get("sort") ?? "category"
  const [connecting, setConnecting] = React.useState<App | null>(null)
  const [managing, setManaging] = React.useState<App | null>(null)

  const list = state.apps
    .filter((a) => (show === "connected" ? a.connected : show === "available" ? !a.connected : true))
    .filter((a) => !search.trim() || `${a.name} ${a.category} ${a.description}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => (sort === "az" ? a.name.localeCompare(b.name) : sort === "za" ? b.name.localeCompare(a.name) : 0))
  const connected = state.apps.filter((a) => a.connected).length

  return (
    <div className={pageStack}>
      <PageHeader title="Apps" description={`${connected} of ${state.apps.length} connected. Each one works with the orders, products and customers already here.`} />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search {...icon} className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search apps" placeholder="Search apps" value={search} className="ps-8" onChange={(event) => router.setQuery({ q: event.target.value || null }, { replace: true })} />
        </div>
        <Choice label="Show" value={show} onChange={(v) => router.setQuery({ show: v === "all" ? null : v }, { replace: true })} options={SHOW} className="w-40" />
        <Choice label="Sort" value={sort} onChange={(v) => router.setQuery({ sort: v === "category" ? null : v }, { replace: true })} options={SORT} className="w-36 sm:ms-auto" />
      </div>
      {list.length ? (
        <ul className="grid gap-[var(--br-gap)] sm:grid-cols-2 xl:grid-cols-3" aria-label="Apps">
          {list.map((a) => (
            <li key={a.id}>
              <Card className="h-full gap-4">
                <CardContent className="flex flex-1 flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-background shadow-[0_0_0_1px_var(--border)] dark:bg-white">
                      <img src={a.logo} alt="" className="size-6 object-contain" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <CardTitle>{a.name}</CardTitle>
                      <span className="text-[12px] text-muted-foreground">{a.category}</span>
                    </div>
                    {a.connected && (
                      <Badge variant="success" className="shrink-0 self-start">
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{a.connected && a.account ? a.account : a.description}</p>
                </CardContent>
                <CardFooter>
                  {a.connected ? (
                    <Button onClick={() => setManaging(a)}>Manage</Button>
                  ) : (
                    <Button variant="primary" onClick={() => setConnecting(a)}>
                      Connect
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyTitle>No apps match</EmptyTitle>
            <EmptyDescription>Try another name, or show all apps.</EmptyDescription>
          </EmptyHeader>
          <Button onClick={() => router.setQuery({ q: null, show: null }, { replace: true })}>Clear the search</Button>
        </Empty>
      )}
      <ConnectDialog app={connecting} onClose={() => setConnecting(null)} />
      <ManageDialog app={managing} onClose={() => setManaging(null)} />
    </div>
  )
}

/** What each app asks to do, shown before connecting, and what it needs from you. */
const PERMISSIONS: Record<App["category"], string[]> = {
  Payments: ["Create payments at checkout", "Refund payments you refund here", "Read payouts for the dashboard"],
  Messages: ["Read and send messages for the Inbox", "Post alerts you choose"],
  Files: ["Read the folder you choose", "Attach files to products"],
  Reports: ["Write a copy of orders and stock", "Read nothing back"],
  "Sales channels": ["Read products, customers and orders once", "Nothing is changed in the other store"],
}
const ASK: Record<App["category"], { label: string; placeholder: string }> = {
  Payments: { label: "Account email", placeholder: "accounts@tidelineprints.com" },
  Messages: { label: "Address or channel", placeholder: "#orders" },
  Files: { label: "Folder", placeholder: "Print masters" },
  Reports: { label: "Where to write", placeholder: "Tideline orders 2026" },
  "Sales channels": { label: "Store address", placeholder: "tideline.myshopify.com" },
}

function ConnectDialog({ app, onClose }: { app: App | null; onClose: () => void }) {
  const { actions } = useStore()
  const [value, setValue] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  React.useEffect(() => {
    if (app) (setValue(""), setError(null), setBusy(false))
  }, [app])
  if (!app) return null
  const ask = ASK[app.category]
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (value.trim().length < 3) return setError(`Enter the ${ask.label.toLowerCase()}.`)
    setBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    actions.connectApp(app.id, value.trim())
    onClose()
  }
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogBackdrop />
      <DialogContent>
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Connect {app.name}</DialogTitle>
            <DialogDescription>{app.description}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 rounded-[12px] bg-muted/70 p-3.5 text-[13px]">
            <span className="font-medium">{app.name} will be able to</span>
            <ul className="flex flex-col gap-1.5">
              {PERMISSIONS[app.category].map((p) => (
                <li key={p} className="flex items-start gap-2 text-muted-foreground">
                  <Check {...icon} className="mt-0.5 shrink-0 text-foreground" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <LabelledField label={ask.label} error={error}>
            <Input value={value} autoFocus placeholder={ask.placeholder} onChange={(event) => (setValue(event.target.value), setError(null))} />
          </LabelledField>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button variant="primary" type="submit" disabled={busy}>
              {busy ? "Connecting…" : `Connect ${app.name}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ManageDialog({ app, onClose }: { app: App | null; onClose: () => void }) {
  const { actions } = useStore()
  const [confirming, setConfirming] = React.useState(false)
  React.useEffect(() => setConfirming(false), [app])
  return (
    <>
      <Dialog open={!!app && !confirming} onOpenChange={(open) => !open && onClose()}>
        <DialogBackdrop />
        <DialogContent>
          <div className="flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle>{app?.name}</DialogTitle>
              <DialogDescription>Connected to {app?.account}.</DialogDescription>
            </DialogHeader>
            <ul className="flex flex-col gap-1.5 text-[13px] text-muted-foreground">
              {app &&
                PERMISSIONS[app.category].map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <Check {...icon} className="mt-0.5 shrink-0 text-foreground" />
                    {p}
                  </li>
                ))}
            </ul>
            <DialogFooter className="sm:justify-between">
              <Button variant="destructive" onClick={() => setConfirming(true)}>
                Disconnect
              </Button>
              <DialogClose>Done</DialogClose>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!app && confirming} onOpenChange={(open) => !open && setConfirming(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {app?.name}?</AlertDialogTitle>
            <AlertDialogDescription>{app?.category === "Payments" ? "Customers can't pay this way until you connect it again." : "It stops at once. Nothing already copied is deleted."}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose>Keep it</AlertDialogClose>
            <AlertDialogClose
              variant="destructive"
              data-agent-confirm={`Disconnects ${app?.name}`}
              onClick={() => {
                if (app) actions.disconnectApp(app.id)
                onClose()
              }}
            >
              Disconnect
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/* ------------------------------------------------------------------ notifications */

export function NotificationsPage() {
  const { state, actions } = useStore()
  const router = useRouter()
  const show = router.query.get("show") === "unread" ? "unread" : "all"
  const list = [...state.notifications].filter((n) => show === "all" || !n.read).sort((a, b) => b.at.localeCompare(a.at))
  const unread = state.notifications.filter((n) => !n.read).length

  /* Grouped by day: Today, Yesterday, then dates. */
  const groups: { label: string; items: typeof list }[] = []
  for (const n of list) {
    const d = Math.floor((Date.now() - Date.parse(n.at)) / 86_400_000)
    const label = d < 1 ? "Today" : d < 2 ? "Yesterday" : date(n.at)
    const last = groups[groups.length - 1]
    if (last?.label === label) last.items.push(n)
    else groups.push({ label, items: [n] })
  }

  return (
    <div className={`${pageStack} max-w-[760px]`}>
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread` : "All read"}
        actions={
          <>
            <SegmentedControl aria-label="Show" value={show} onValueChange={(v) => v && router.setQuery({ show: v === "unread" ? "unread" : null }, { replace: true })}>
              <SegmentedControlItem value="all">All</SegmentedControlItem>
              <SegmentedControlItem value="unread">Unread</SegmentedControlItem>
            </SegmentedControl>
            <Button disabled={!unread} onClick={() => actions.markNotificationsRead("all")}>
              <Check {...icon} />
              Mark all read
            </Button>
          </>
        }
      />
      {groups.length ? (
        groups.map((g) => (
          <section key={g.label} aria-label={g.label} className="flex flex-col gap-2">
            <h2 className="px-1 text-[12px] font-medium text-muted-foreground">{g.label}</h2>
            <Card className="py-1.5">
              <ul className="flex flex-col px-1.5">
                {g.items.map((n) => {
                  const Glyph = KIND_ICON[n.kind]
                  const link = n.to && router.exists(n.to)
                  const content = (
                    <>
                      <ItemMedia variant="icon" className="size-9 rounded-[10px]">
                        <Glyph {...icon} />
                      </ItemMedia>
                      <ItemContent className="gap-0.5">
                        <ItemTitle className={cn("text-[13.5px]", n.read ? "font-medium" : "font-semibold")}>{n.title}</ItemTitle>
                        <ItemDescription className="text-[12.5px]">{n.body}</ItemDescription>
                      </ItemContent>
                      <span className="flex shrink-0 items-center gap-2 self-start pt-0.5 text-[12px] text-muted-foreground tabular-nums">
                        {time(n.at)}
                        <span aria-label={n.read ? undefined : "Unread"} className={cn("size-2 rounded-full", n.read ? "bg-transparent" : "bg-[var(--chart-1)]")} />
                      </span>
                    </>
                  )
                  return (
                    <li key={n.id}>
                      {link ? (
                        <Item size="sm" className="rounded-[10px] px-2.5 py-2.5 hover:bg-foreground/[0.04]" render={<a {...linkProps(router, n.to!, () => actions.markNotificationsRead([n.id]))} />}>
                          {content}
                        </Item>
                      ) : (
                        <Item size="sm" className="rounded-[10px] px-2.5 py-2.5">
                          {content}
                        </Item>
                      )}
                    </li>
                  )
                })}
              </ul>
            </Card>
          </section>
        ))
      ) : (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyTitle>Nothing unread</EmptyTitle>
            <EmptyDescription>New orders, low stock and payouts show up here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ help */

const FAQ: { topic: string; items: { q: string; a: string }[] }[] = [
  {
    topic: "Orders",
    items: [
      { q: "How do I send an order?", a: "Open the order and press Fulfil order. Enter the tracking number from the label, and the customer gets an email with the link. Several at once: select them in Orders and choose Fulfil." },
      { q: "How do refunds work?", a: "Press Refund on the order and choose how much. The money reaches the customer's card in 5 to 10 days. A refunded order stays in your reports, net of the refund." },
      { q: "Can I take an order by phone?", a: "Yes. Orders › Create order walks you through the customer, the prints, shipping and payment. Mark it paid, or send an invoice due in 30 days." },
    ],
  },
  {
    topic: "Products",
    items: [
      { q: "How do I add a new print?", a: "Products › Add product. Give it a name and a photo, choose the sizes and finishes, and save it as a draft. Publish it when it's ready to sell." },
      { q: "What does running low mean?", a: "A size or frame at or under the low-stock level, 3 by default. Change it in Settings › Notifications." },
    ],
  },
  {
    topic: "Customers and messages",
    items: [
      { q: "Where do customer emails go?", a: "Into the Inbox, when Gmail is connected in Apps. Your replies go from hello@ and land in the same conversation." },
      { q: "What are saved replies?", a: "Answers you send often, like shipping times. Choose Saved replies under the reply box to drop one in, then edit it before sending." },
    ],
  },
  {
    topic: "Your account",
    items: [
      { q: "How do I add someone to the team?", a: "Settings › Team and roles › Invite. Staff can handle orders, products and customers; only the owner sees billing." },
      { q: "Can AI assistants use Backroom?", a: "Yes. Every page can be read and used through UI SDK's agent bridge. Anything that moves money or removes something asks you first." },
    ],
  },
]

export function HelpPage() {
  const { state } = useStore()
  const { setOpen } = useShellState()
  const [query, setQuery] = React.useState("")
  const [topic, setTopic] = React.useState("Orders")
  const [message, setMessage] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const q = query.trim().toLowerCase()
  const groups = FAQ.map((g) => ({ ...g, items: g.items.filter((i) => !q || `${i.q} ${i.a}`.toLowerCase().includes(q)) })).filter((g) => g.items.length)

  return (
    <div className={pageStack}>
      <PageHeader title="Help" description="Answers to what people ask most, and a way to reach us." />
      <div className="grid gap-[var(--br-gap)] lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-[var(--br-gap)]">
          <div className="relative">
            <Search {...icon} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Search help" placeholder="Search for an answer" value={query} className="h-10 ps-9" onChange={(event) => setQuery(event.target.value)} />
          </div>
          {groups.length ? (
            groups.map((g) => (
              <Card key={g.topic}>
                <CardHeader>
                  <CardTitle>{g.topic}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion multiple={!!q} defaultValue={q ? g.items.map((i) => i.q) : undefined} key={q ? `q-${q}` : "all"}>
                    {g.items.map((i) => (
                      <AccordionItem key={i.q} value={i.q}>
                        <AccordionHeader>
                          <AccordionTrigger>{i.q}</AccordionTrigger>
                        </AccordionHeader>
                        <AccordionPanel>
                          <p className="text-[13px] leading-relaxed text-muted-foreground">{i.a}</p>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))
          ) : (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CircleHelp {...icon} />
                </EmptyMedia>
                <EmptyTitle>No answer for "{query}"</EmptyTitle>
                <EmptyDescription>Ask us with the form; a person replies within a working day.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-[var(--br-gap)]">
          <Card>
            <form
              noValidate
              className="flex flex-col gap-[inherit]"
              onSubmit={(event) => {
                event.preventDefault()
                if (message.trim().length < 10) return setError("Tell us a little more, so we can help the first time.")
                toaster.success("Message sent to support", { description: `We'll reply to ${me(state)?.email} within a working day.` })
                setMessage("")
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LifeBuoy {...icon} />
                  Ask support
                </CardTitle>
                <CardDescription>A person replies within a working day, Monday to Friday.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <LabelledField label="About">
                  <Choice label="About" value={topic} onChange={setTopic} options={[...FAQ.map((g) => ({ value: g.topic, label: g.topic })), { value: "Billing", label: "Billing" }, { value: "Something else", label: "Something else" }]} />
                </LabelledField>
                <LabelledField label="Message" error={error}>
                  <Textarea rows={5} value={message} placeholder="What happened, and what you expected" onChange={(event) => (setMessage(event.target.value), setError(null))} />
                </LabelledField>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="primary" type="submit">
                  Send
                </Button>
              </CardFooter>
            </form>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2.5 text-[13px]">
                <Keyboard {...icon} className="text-muted-foreground" />
                Keyboard shortcuts
              </span>
              <Button size="sm" onClick={() => setOpen("shortcuts", true)}>
                Show
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
