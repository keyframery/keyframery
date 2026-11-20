"use client"

/* Inbox: the store's conversations with customers, by email and chat, in one place. The list on the
   left (search, Open and Done), the thread on the right with the customer's order beside it, and a
   composer with saved replies. On phones the thread takes the whole screen, with a way back. */

import { ArrowLeft, ArrowUp, Check, MessageSquareText, MoreHorizontal, PenSquare, RotateCcw } from "lucide-react"
import * as React from "react"

import { Attachment, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle } from "@/components/ui/attachment"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Combobox, ComboboxContent, ComboboxControl, ComboboxEmpty, ComboboxInput, ComboboxItems, ComboboxList, ComboboxTrigger } from "@/components/ui/combobox"
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Item } from "@/components/ui/item"
import { Menu, MenuContent, MenuGroup, MenuGroupLabel, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu"
import { Message, MessageAvatar, MessageContent, MessageFooter } from "@/components/ui/message"
import { MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerViewport } from "@/components/ui/message-scroller"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import type { Conversation } from "./extras"
import { savedReplies } from "./extras"
import { ago, date, initials, time } from "./format"
import { icon, InlineLink, LabelledField, PersonAvatar } from "./kit"
import { linkProps, useRouter } from "./router"
import { useStore } from "./store"

export function InboxPage({ id }: { id: string | null }) {
  const { state, actions } = useStore()
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [composing, setComposing] = React.useState(false)
  const view = router.query.get("view") === "done" ? "done" : "open"

  const customerOf = (c: Conversation) => state.customers.find((x) => x.id === c.customerId)
  const list = state.conversations
    .filter((c) => c.status === view)
    .filter((c) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      const who = customerOf(c)
      return [who?.name, who?.company, c.subject, ...c.messages.map((m) => m.text)].some((t) => t?.toLowerCase().includes(q))
    })
    .sort((a, b) => b.messages[b.messages.length - 1].at.localeCompare(a.messages[a.messages.length - 1].at))
  const open = id ? state.conversations.find((c) => c.id === id) : undefined

  React.useEffect(() => {
    if (open?.unread) actions.readConversation(open.id)
  }, [open?.id, open?.unread, actions])

  const keepView = view === "done" ? "?view=done" : ""
  const counts = { open: state.conversations.filter((c) => c.status === "open").length, done: state.conversations.filter((c) => c.status === "done").length }

  return (
    <div className="flex flex-col gap-4">
      <div className={cn("flex flex-wrap items-end justify-between gap-4", id && "max-md:hidden")}>
        <div className="flex flex-col gap-1.5">
          <h1 data-page-heading tabIndex={-1} className="text-[24px] leading-tight font-semibold tracking-tight outline-none">
            Inbox
          </h1>
          <p className="text-[13px] text-muted-foreground">Questions from customers and stockists, by email and chat.</p>
        </div>
        <Button variant="primary" onClick={() => setComposing(true)}>
          <PenSquare {...icon} />
          New message
        </Button>
      </div>

      <div className="grid h-[calc(100svh-12.5rem)] min-h-[540px] overflow-hidden rounded-[16px] bg-card shadow-[0_0_0_1px_var(--border)] md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)_280px] max-md:h-[calc(100svh-6.5rem)]">
        {/* The list */}
        <section aria-label="Conversations" className={cn("flex min-h-0 flex-col border-border md:border-e", id && "max-md:hidden")}>
          <div className="flex flex-col gap-2.5 border-b border-border p-3">
            <Input aria-label="Search conversations" placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
            <SegmentedControl
              aria-label="Show"
              value={view}
              onValueChange={(v) => v && router.navigate(`/inbox${id ? `/${id}` : ""}${v === "done" ? "?view=done" : ""}`, { replace: true })}
              className="flex w-full [&>[data-slot=segmented-control-item]]:flex-1 [&_[data-slot=segmented-control-item-copy]]:flex-1"
            >
              <SegmentedControlItem value="open">Open · {counts.open}</SegmentedControlItem>
              <SegmentedControlItem value="done">Done · {counts.done}</SegmentedControlItem>
            </SegmentedControl>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto p-1.5">
            {list.map((c) => {
              const who = customerOf(c)
              const last = c.messages[c.messages.length - 1]
              const active = c.id === id
              return (
                <li key={c.id}>
                  <Item
                    size="sm"
                    aria-current={active ? "page" : undefined}
                    className={cn("items-start gap-3 rounded-[10px] px-2.5 py-2.5", active ? "bg-accent" : "hover:bg-foreground/[0.04]")}
                    render={<a {...linkProps(router, `/inbox/${c.id}${keepView}`)} />}
                  >
                    <PersonAvatar person={who} size="md" />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex items-center gap-2">
                        <span className={cn("min-w-0 flex-1 truncate text-[13px]", c.unread ? "font-semibold" : "font-medium")}>{who?.company ?? who?.name}</span>
                        <span className="shrink-0 text-[11.5px] text-muted-foreground tabular-nums">{ago(last.at)}</span>
                      </span>
                      <span className="truncate text-[12.5px]">{c.subject}</span>
                      <span className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-[12px] text-muted-foreground">
                          {last.from === "customer" ? "" : "You: "}
                          {last.text}
                        </span>
                        {c.unread > 0 && (
                          <span className="grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-full bg-primary px-1 text-[10.5px] font-semibold text-primary-foreground tabular-nums">
                            <span className="sr-only">Unread: </span>
                            {c.unread}
                          </span>
                        )}
                      </span>
                    </span>
                  </Item>
                </li>
              )
            })}
            {!list.length && (
              <Empty className="py-10">
                <EmptyHeader>
                  <EmptyTitle>{query ? "Nothing matches" : view === "done" ? "Nothing done yet" : "All caught up"}</EmptyTitle>
                  <EmptyDescription>{query ? "Try a name, a shop or a word from the message." : "New questions from customers land here."}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </ul>
        </section>

        {/* The thread */}
        {open ? (
          <Thread key={open.id} conversation={open} keepView={keepView} />
        ) : (
          <div className="grid place-items-center max-md:hidden lg:col-span-2">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageSquareText {...icon} />
                </EmptyMedia>
                <EmptyTitle>Choose a conversation</EmptyTitle>
                <EmptyDescription>Or start a new one with a customer.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}
      </div>
      <NewMessageDialog open={composing} onClose={() => setComposing(false)} />
    </div>
  )
}

/* ------------------------------------------------------------------ a thread */

function Thread({ conversation: c, keepView }: { conversation: Conversation; keepView: string }) {
  const { state, actions } = useStore()
  const router = useRouter()
  const [draft, setDraft] = React.useState("")
  const who = state.customers.find((x) => x.id === c.customerId)
  const order = c.order ? state.orders.find((o) => o.number === c.order) : undefined
  const theirOrders = state.orders.filter((o) => o.customerId === c.customerId)
  const member = (id: string) => state.team.find((m) => m.id === id)

  const send = () => {
    const text = draft.trim()
    if (!text) return
    actions.sendMessage(c.id, text)
    setDraft("")
  }

  /* A day label before the first message of each day. */
  let lastDay = ""

  return (
    <>
      <section aria-label={`Conversation with ${who?.name}`} className="flex min-h-0 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Button variant="ghost" size="icon" aria-label="Back to conversations" className="md:hidden rtl:-scale-x-100" render={<a {...linkProps(router, `/inbox${keepView}`)} />}>
            <ArrowLeft {...icon} />
          </Button>
          <PersonAvatar person={who} size="md" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-[14px] font-semibold">{c.subject}</span>
            <span className="truncate text-[12px] text-muted-foreground">
              {who?.name}
              {who?.company ? `, ${who.company}` : ""} · by {c.channel}
            </span>
          </div>
          {c.status === "open" ? (
            <Button onClick={() => actions.setConversationStatus(c.id, "done")}>
              <Check {...icon} />
              <span className="max-sm:sr-only">Mark as done</span>
            </Button>
          ) : (
            <Button onClick={() => actions.setConversationStatus(c.id, "open")}>
              <RotateCcw {...icon} />
              <span className="max-sm:sr-only">Reopen</span>
            </Button>
          )}
          <Menu>
            <MenuTrigger render={<Button variant="ghost" size="icon" aria-label="More" />}>
              <MoreHorizontal {...icon} />
            </MenuTrigger>
            <MenuContent align="end" className="w-52">
              {who && (
                <MenuItem value="customer" onClick={() => router.navigate(`/customers/${who.id}`)}>
                  View customer
                </MenuItem>
              )}
              {order && (
                <MenuItem value="order" onClick={() => router.navigate(`/orders/${order.number}`)}>
                  View order #{order.number}
                </MenuItem>
              )}
              {who && (
                <MenuItem value="new-order" onClick={() => router.navigate(`/orders/new?customer=${who.id}`)}>
                  Create order for {who.name.split(" ")[0]}
                </MenuItem>
              )}
            </MenuContent>
          </Menu>
        </header>

        <MessageScroller stickToEnd className="min-h-0 flex-1">
          <MessageScrollerViewport aria-label="Messages">
            <MessageScrollerContent className="px-4 py-5">
              {c.messages.map((m) => {
                const mine = m.from !== "customer"
                const day = date(m.at)
                const label = day !== lastDay ? day : null
                lastDay = day
                const author = mine ? member(m.from) : who
                return (
                  <MessageScrollerItem key={m.id} value={m.id} follow={mine}>
                    {label && <div className="mb-3 text-center text-[11.5px] font-medium text-muted-foreground">{label}</div>}
                    <Message align={mine ? "end" : "start"}>
                      <MessageAvatar aria-hidden>{author?.avatar ? <img src={author.avatar} alt="" /> : initials(author?.name ?? "")}</MessageAvatar>
                      <MessageContent>
                        <Bubble variant={mine ? "default" : "muted"} align={mine ? "end" : "start"}>
                          <BubbleContent>{m.text}</BubbleContent>
                        </Bubble>
                        {m.photo && (
                          <Attachment orientation="vertical" className="w-44">
                            <AttachmentMedia variant="image" className="aspect-[4/3]">
                              <img src={m.photo.src} alt="" />
                            </AttachmentMedia>
                            <AttachmentContent>
                              <AttachmentTitle>{m.photo.name}</AttachmentTitle>
                              <AttachmentDescription>{m.photo.size}</AttachmentDescription>
                            </AttachmentContent>
                          </Attachment>
                        )}
                        <MessageFooter>
                          {mine ? `${author?.name.split(" ")[0] ?? "You"} · ` : ""}
                          {time(m.at)}
                        </MessageFooter>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )
              })}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>

        <form
          className="flex flex-col gap-2 border-t border-border p-3"
          onSubmit={(event) => {
            event.preventDefault()
            send()
          }}
        >
          <Textarea
            aria-label={`Reply to ${who?.name}`}
            placeholder={`Reply to ${who?.name.split(" ")[0]}`}
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                send()
              }
            }}
            className="min-h-[64px] resize-none"
          />
          <div className="flex items-center justify-between gap-2">
            <Menu>
              <MenuTrigger render={<Button variant="ghost" size="sm" />}>Saved replies</MenuTrigger>
              <MenuContent align="start" className="w-64">
                <MenuGroup>
                  <MenuGroupLabel>Insert</MenuGroupLabel>
                  {savedReplies.map((r) => (
                    <MenuItem key={r.title} value={r.title} onClick={() => setDraft((d) => (d.trim() ? `${d.trim()}\n\n${r.text}` : r.text))}>
                      {r.title}
                    </MenuItem>
                  ))}
                </MenuGroup>
                <MenuSeparator />
                <MenuItem value="manage" onClick={() => router.navigate("/help")} disabled={!router.exists("/help")}>
                  How saved replies work
                </MenuItem>
              </MenuContent>
            </Menu>
            <span className="flex items-center gap-2">
              <span className="text-[11.5px] text-muted-foreground max-sm:hidden">Enter to send, Shift+Enter for a new line</span>
              <Button variant="primary" size="sm" type="submit" disabled={!draft.trim()}>
                <ArrowUp {...icon} />
                Send
              </Button>
            </span>
          </div>
        </form>
      </section>

      {/* Who they are, beside the thread on wide screens. */}
      <aside aria-label="About the customer" className="hidden min-h-0 flex-col gap-5 overflow-y-auto border-s border-border p-4 lg:flex">
        <div className="flex flex-col items-center gap-2 pt-2 text-center">
          <PersonAvatar person={who} size="lg" />
          <InlineLink to={`/customers/${c.customerId}`} className="ms-0">
            {who?.name}
          </InlineLink>
          <span className="text-[12px] text-muted-foreground">
            {who?.company ? `${who.company} · ` : ""}
            {who?.address.city}, {who?.address.country}
          </span>
          {who?.tags.length ? (
            <span className="flex flex-wrap justify-center gap-1">
              {who.tags.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-muted-foreground">Recent orders</span>
          <ul className="flex flex-col gap-0.5">
            {theirOrders
              .sort((a, b) => b.number - a.number)
              .slice(0, 4)
              .map((o) => (
                <li key={o.number} className="flex items-center justify-between gap-2 text-[12.5px]">
                  <InlineLink to={`/orders/${o.number}`}>#{o.number}</InlineLink>
                  <span className="text-muted-foreground tabular-nums">{ago(o.createdAt)}</span>
                </li>
              ))}
          </ul>
        </div>
        {who?.note && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted-foreground">Note</span>
            <p className="text-[12.5px] leading-relaxed">{who.note}</p>
          </div>
        )}
      </aside>
    </>
  )
}

/* ------------------------------------------------------------------ a new message */

function NewMessageDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, actions } = useStore()
  const router = useRouter()
  const [customerId, setCustomerId] = React.useState<string | null>(null)
  const [subject, setSubject] = React.useState("")
  const [text, setText] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  React.useEffect(() => {
    if (open) (setCustomerId(null), setSubject(""), setText(""), setErrors({}))
  }, [open])
  const items = React.useMemo(() => [...state.customers].sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ value: c.id, label: c.company ? `${c.name}, ${c.company}` : c.name })), [state.customers])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (!customerId) next.customer = "Choose who to write to."
    if (!subject.trim()) next.subject = "Add a subject."
    if (!text.trim()) next.text = "Write a message."
    setErrors(next)
    if (Object.keys(next).length || !customerId) return
    const id = actions.startConversation(customerId, subject.trim(), text.trim())
    onClose()
    router.navigate(`/inbox/${id}`)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogBackdrop />
      <DialogContent className="[--dialog-width:520px]">
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>New message</DialogTitle>
            <DialogDescription>It goes by email from hello@tidelineprints.com. Their reply comes back here.</DialogDescription>
          </DialogHeader>
          <LabelledField label="To" error={errors.customer}>
            <Combobox items={items} value={customerId} onValueChange={(v) => (setCustomerId(typeof v === "string" ? v : null), setErrors((e) => ({ ...e, customer: "" })))}>
              <ComboboxControl>
                <ComboboxInput placeholder="Search customers" aria-label="To" />
                <ComboboxTrigger aria-label="Show customers" />
              </ComboboxControl>
              <ComboboxContent>
                <ComboboxEmpty>No customer has that name.</ComboboxEmpty>
                <ComboboxList>{(list) => <ComboboxItems items={list.items} />}</ComboboxList>
              </ComboboxContent>
            </Combobox>
          </LabelledField>
          <LabelledField label="Subject" error={errors.subject}>
            <Input value={subject} onChange={(event) => (setSubject(event.target.value), setErrors((e) => ({ ...e, subject: "" })))} />
          </LabelledField>
          <LabelledField label="Message" error={errors.text}>
            <Textarea rows={5} value={text} onChange={(event) => (setText(event.target.value), setErrors((e) => ({ ...e, text: "" })))} />
          </LabelledField>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button variant="primary" type="submit">
              Send
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
