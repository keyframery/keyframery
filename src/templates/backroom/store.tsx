"use client"

/* Backroom's store: one in-memory state, seeded from data.ts, that every page reads and writes.
   An action on one page shows on every other (refund an order and the dashboard's refund rate
   moves). Nothing is saved: reload and the store is back to its seed. Every change ends in a toast.

   Read it with `useStore()`: `{ state, actions }`. The selectors at the bottom compute what the
   pages show (the dashboard's numbers, an order's customer, the unfulfilled count) from `state`.

   To connect a real backend, keep the action names and make each one call your API before (or
   instead of) dispatching. */

import * as React from "react"

import { createToaster } from "@/components/ui/toast"

import * as seed from "./data"
import type { Cents, Channel, Customer, Device, Member, Notification, Order, OrderEvent, Product, Role, Source, StoreSettings, Variant } from "./data"
import * as extras from "./extras"
import type { App, ChatMessage, Conversation, Discount } from "./extras"
import { money } from "./format"

/* ------------------------------------------------------------------ state */

export type Theme = "light" | "dark" | "system"
export type SidebarStyle = "inset" | "floating" | "plain"
export type Density = "comfortable" | "compact"
export type Dir = "ltr" | "rtl"
export type Period = 7 | 30 | 90

export type Appearance = {
  theme: Theme
  sidebar: SidebarStyle
  density: Density
  dir: Dir
  /** Multiplies every duration: 0.5 is twice as fast, 2 twice as slow. The motion style itself is a UI SDK preference (see backroom.tsx). */
  speed: number
}

export const DEFAULT_APPEARANCE: Appearance = { theme: "system", sidebar: "inset", density: "comfortable", dir: "ltr", speed: 1 }

export type State = {
  orders: Order[]
  products: Product[]
  customers: Customer[]
  team: Member[]
  notifications: Notification[]
  settings: StoreSettings
  plan: typeof seed.plan
  invoices: typeof seed.invoices
  traffic: typeof seed.traffic
  /** The store being looked at (the workspace switcher). */
  workspace: string
  /** The person signed in, by member id, or null after signing out. */
  session: { memberId: string } | null
  appearance: Appearance
  /** The dashboard's period, in days. */
  period: Period
  /** The signed-in account's security and the card the plan is paid with. */
  account: { twoStep: boolean; card: { brand: string; last4: string; expiry: string } }
  conversations: Conversation[]
  discounts: Discount[]
  apps: App[]
}

const initialState = (): State => ({
  orders: seed.orders,
  products: seed.products,
  customers: seed.customers,
  team: seed.team,
  notifications: seed.notifications,
  settings: seed.settings,
  plan: seed.plan,
  invoices: seed.invoices,
  traffic: seed.traffic,
  workspace: seed.workspaces[0].id,
  session: { memberId: seed.me.id },
  appearance: DEFAULT_APPEARANCE,
  period: 30,
  account: { twoStep: true, card: { brand: "Visa", last4: "4242", expiry: "08/28" } },
  conversations: extras.conversations,
  discounts: extras.discounts,
  apps: extras.apps,
})

/* ------------------------------------------------------------------ actions */

type Action =
  | { type: "order/fulfil"; number: number; carrier: string; tracking: string; by: string }
  | { type: "order/refund"; number: number; amount: Cents; reason: string; by: string }
  | { type: "order/cancel"; number: number; reason: string; by: string }
  | { type: "order/markPaid"; number: number; by: string }
  | { type: "order/note"; number: number; text: string; by: string }
  | { type: "order/create"; order: Order }
  | { type: "product/update"; id: string; patch: Partial<Omit<Product, "id" | "variants">> }
  | { type: "product/create"; product: Product }
  | { type: "product/save"; product: Product }
  | { type: "product/stock"; variantId: string; stock: number }
  | { type: "product/variant"; variantId: string; patch: Partial<Omit<Variant, "id" | "productId">> }
  | { type: "customer/update"; id: string; patch: Partial<Omit<Customer, "id">> }
  | { type: "customer/create"; customer: Customer }
  | { type: "team/invite"; member: Member }
  | { type: "team/role"; id: string; role: Role }
  | { type: "team/remove"; id: string }
  | { type: "team/update"; id: string; patch: Partial<Omit<Member, "id">> }
  | { type: "team/register"; member: Member }
  | { type: "plan/change"; name: string; price: Cents; seats: number }
  | { type: "account/set"; patch: Partial<State["account"]> }
  | { type: "inbox/send"; id: string; message: ChatMessage }
  | { type: "inbox/update"; id: string; patch: Partial<Omit<Conversation, "id" | "messages">> }
  | { type: "inbox/start"; conversation: Conversation }
  | { type: "discount/save"; discount: Discount }
  | { type: "discount/delete"; ids: string[] }
  | { type: "discount/import"; discounts: Discount[] }
  | { type: "app/set"; id: string; connected: boolean; account?: string }
  | { type: "settings/update"; patch: Partial<StoreSettings> }
  | { type: "notifications/read"; ids: string[] | "all" }
  | { type: "appearance/set"; patch: Partial<Appearance> }
  | { type: "workspace/switch"; id: string }
  | { type: "period/set"; period: Period }
  | { type: "session/signIn"; memberId: string }
  | { type: "session/signOut" }

const nowIso = () => new Date().toISOString()

function withEvent(order: Order, kind: OrderEvent["kind"], text: string, by?: string): OrderEvent[] {
  return [...order.events, { id: `${order.number}-${order.events.length + 1}-${Date.now()}`, at: nowIso(), kind, text, by }]
}

function reducer(state: State, action: Action): State {
  const editOrder = (number: number, edit: (o: Order) => Order) => ({ ...state, orders: state.orders.map((o) => (o.number === number ? edit(o) : o)) })
  switch (action.type) {
    case "order/fulfil":
      return editOrder(action.number, (o) => ({
        ...o,
        fulfilment: "fulfilled",
        tracking: { carrier: action.carrier, number: action.tracking },
        events: withEvent(o, "fulfilled", `Fulfilled ${o.lines.reduce((n, l) => n + l.quantity, 0)} items. ${action.carrier} ${action.tracking}.`, action.by),
      }))
    case "order/refund":
      return editOrder(action.number, (o) => {
        const refunded = Math.min(o.total, o.refunded + action.amount)
        return {
          ...o,
          refunded,
          payment: refunded >= o.total ? "refunded" : "partially_refunded",
          events: withEvent(o, "refunded", `Refunded ${money(action.amount)}.${action.reason ? ` ${action.reason}` : ""}`, action.by),
        }
      })
    case "order/cancel":
      return editOrder(action.number, (o) => ({
        ...o,
        status: "cancelled",
        payment: o.payment === "paid" ? "refunded" : "voided",
        refunded: o.payment === "paid" ? o.total : o.refunded,
        events: withEvent(o, "cancelled", `Cancelled.${action.reason ? ` ${action.reason}` : ""}`, action.by),
      }))
    case "order/markPaid":
      return editOrder(action.number, (o) => ({ ...o, payment: "paid", events: withEvent(o, "paid", `Marked as paid (${money(o.total)}).`, action.by) }))
    case "order/note":
      return editOrder(action.number, (o) => ({ ...o, events: withEvent(o, "note", action.text, action.by) }))
    case "order/create":
      return { ...state, orders: [...state.orders, action.order] }
    case "product/update":
      return { ...state, products: state.products.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)) }
    case "product/create":
      return { ...state, products: [...state.products, action.product] }
    case "product/save":
      return { ...state, products: state.products.map((p) => (p.id === action.product.id ? action.product : p)) }
    case "product/stock":
    case "product/variant": {
      const patch = action.type === "product/stock" ? { stock: Math.max(0, Math.round(action.stock)) } : action.patch
      return {
        ...state,
        products: state.products.map((p) =>
          p.variants.some((v) => v.id === action.variantId) ? { ...p, variants: p.variants.map((v) => (v.id === action.variantId ? { ...v, ...patch } : v)) } : p,
        ),
      }
    }
    case "customer/update":
      return { ...state, customers: state.customers.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)) }
    case "customer/create":
      return { ...state, customers: [...state.customers, action.customer] }
    case "team/invite":
      return { ...state, team: [...state.team, action.member] }
    case "team/role":
      return { ...state, team: state.team.map((m) => (m.id === action.id ? { ...m, role: action.role } : m)) }
    case "team/remove":
      return { ...state, team: state.team.filter((m) => m.id !== action.id) }
    case "team/update":
      return { ...state, team: state.team.map((m) => (m.id === action.id ? { ...m, ...action.patch } : m)) }
    case "team/register":
      return { ...state, team: [...state.team, action.member], session: { memberId: action.member.id } }
    case "plan/change":
      return {
        ...state,
        plan: { ...state.plan, name: action.name, price: action.price, usage: state.plan.usage.map((u) => (u.label === "Staff seats" ? { ...u, limit: action.seats } : u)) },
      }
    case "account/set":
      return { ...state, account: { ...state.account, ...action.patch } }
    case "inbox/send":
      return { ...state, conversations: state.conversations.map((c) => (c.id === action.id ? { ...c, status: "open", messages: [...c.messages, action.message] } : c)) }
    case "inbox/update":
      return { ...state, conversations: state.conversations.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)) }
    case "inbox/start":
      return { ...state, conversations: [action.conversation, ...state.conversations] }
    case "discount/save":
      return state.discounts.some((d) => d.id === action.discount.id)
        ? { ...state, discounts: state.discounts.map((d) => (d.id === action.discount.id ? action.discount : d)) }
        : { ...state, discounts: [action.discount, ...state.discounts] }
    case "discount/delete":
      return { ...state, discounts: state.discounts.filter((d) => !action.ids.includes(d.id)) }
    case "discount/import":
      return { ...state, discounts: [...action.discounts, ...state.discounts.filter((d) => !action.discounts.some((n) => n.code === d.code))] }
    case "app/set":
      return { ...state, apps: state.apps.map((a) => (a.id === action.id ? { ...a, connected: action.connected, account: action.connected ? action.account : undefined } : a)) }
    case "settings/update":
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case "notifications/read":
      return { ...state, notifications: state.notifications.map((n) => (action.ids === "all" || action.ids.includes(n.id) ? { ...n, read: true } : n)) }
    case "appearance/set":
      return { ...state, appearance: { ...state.appearance, ...action.patch } }
    case "workspace/switch":
      return { ...state, workspace: action.id }
    case "period/set":
      return { ...state, period: action.period }
    case "session/signIn":
      return { ...state, session: { memberId: action.memberId } }
    case "session/signOut":
      return { ...state, session: null }
  }
}

/** Backroom's own toasts. `<ToastRegion toaster={toaster} />` is in backroom.tsx. */
export const toaster = createToaster()

function useActions(dispatch: React.Dispatch<Action>, get: () => State) {
  return React.useMemo(() => {
    const by = () => {
      const s = get()
      return s.team.find((m) => m.id === s.session?.memberId)?.name ?? "Staff"
    }
    const order = (number: number) => get().orders.find((o) => o.number === number)
    return {
      /** Marks an order fulfilled with its tracking number. */
      fulfilOrder(number: number, shipment: { carrier: string; tracking: string; notify?: boolean }) {
        dispatch({ type: "order/fulfil", number, carrier: shipment.carrier, tracking: shipment.tracking, by: by() })
        toaster.success(`Order #${number} fulfilled`, { description: shipment.notify === false ? `${shipment.carrier} ${shipment.tracking}` : "The customer has been emailed the tracking link." })
      },
      /** Refunds part or all of an order. `amount` in cents. */
      refundOrder(number: number, amount: Cents, reason = "") {
        dispatch({ type: "order/refund", number, amount, reason, by: by() })
        toaster.success(`Refunded ${money(amount)} on #${number}`, { description: "It reaches the customer's card in 5 to 10 days." })
      },
      /** Cancels an order; a paid one is refunded in full. */
      cancelOrder(number: number, reason = "") {
        const paid = order(number)?.payment === "paid"
        dispatch({ type: "order/cancel", number, reason, by: by() })
        toaster.success(`Order #${number} cancelled`, { description: paid ? "The payment was refunded in full." : "Its payment was voided." })
      },
      markPaid(number: number) {
        dispatch({ type: "order/markPaid", number, by: by() })
        toaster.success(`Order #${number} marked as paid`)
      },
      addOrderNote(number: number, text: string) {
        dispatch({ type: "order/note", number, text, by: by() })
        toaster.success("Note added", { description: `On order #${number}` })
      },
      /** Adds an order and returns its number. Pass everything but the number. */
      createOrder(draft: Omit<Order, "number" | "events">) {
        const number = Math.max(...get().orders.map((o) => o.number)) + 1
        const created: Order = { ...draft, number, events: [{ id: `${number}-1`, at: draft.createdAt, kind: "placed", text: "Order created by staff.", by: by() }] }
        dispatch({ type: "order/create", order: created })
        toaster.success(`Order #${number} created`, { description: money(created.total) })
        return number
      },
      updateProduct(id: string, patch: Partial<Omit<Product, "id" | "variants">>, message = "Product saved") {
        dispatch({ type: "product/update", id, patch })
        toaster.success(message, { description: get().products.find((p) => p.id === id)?.name })
      },
      /** Saves a whole product, its variants included, in one go. */
      saveProduct(product: Product, message = "Product saved") {
        dispatch({ type: "product/save", product })
        toaster.success(message, { description: product.name })
      },
      createProduct(product: Product) {
        dispatch({ type: "product/create", product })
        toaster.success("Product added", { description: product.name })
      },
      archiveProduct(id: string) {
        dispatch({ type: "product/update", id, patch: { status: "archived" } })
        toaster.success("Product archived", { description: get().products.find((p) => p.id === id)?.name })
      },
      setStock(variantId: string, stock: number) {
        dispatch({ type: "product/stock", variantId, stock })
        toaster.success("Stock updated", { description: `${Math.max(0, Math.round(stock))} in stock` })
      },
      updateVariant(variantId: string, patch: Partial<Omit<Variant, "id" | "productId">>) {
        dispatch({ type: "product/variant", variantId, patch })
        toaster.success("Variant saved")
      },
      updateCustomer(id: string, patch: Partial<Omit<Customer, "id">>, message = "Customer saved") {
        dispatch({ type: "customer/update", id, patch })
        toaster.success(message, { description: get().customers.find((c) => c.id === id)?.name })
      },
      createCustomer(customer: Customer) {
        dispatch({ type: "customer/create", customer })
        toaster.success("Customer added", { description: customer.name })
      },
      inviteMember(email: string, role: Role, name = email.split("@")[0]) {
        const id = `m${Date.now()}`
        dispatch({ type: "team/invite", member: { id, name, email, role, title: "", status: "invited", lastActive: nowIso() } })
        toaster.success("Invitation sent", { description: email })
        return id
      },
      changeRole(id: string, role: Role) {
        dispatch({ type: "team/role", id, role })
        toaster.success("Role changed", { description: `${get().team.find((m) => m.id === id)?.name} is now ${role === "admin" ? "an" : "a"} ${role}` })
      },
      removeMember(id: string) {
        const name = get().team.find((m) => m.id === id)?.name
        dispatch({ type: "team/remove", id })
        toaster.success("Removed from the team", { description: name })
      },
      updateMember(id: string, patch: Partial<Omit<Member, "id">>, message = "Profile saved") {
        dispatch({ type: "team/update", id, patch })
        toaster.success(message)
      },
      /** A new account from the sign-up page: it joins as the owner of a new store and is signed in. */
      register(name: string, email: string) {
        const id = `m${Date.now().toString(36)}`
        dispatch({ type: "team/register", member: { id, name, email, role: "owner", title: "", status: "active", lastActive: nowIso() } })
        toaster.success(`Welcome to Backroom, ${name.split(" ")[0]}`)
        return id
      },
      changePlan(name: string, price: Cents, seats: number) {
        dispatch({ type: "plan/change", name, price, seats })
        toaster.success(`You're on the ${name} plan`, { description: `${money(price)} a month from your next bill.` })
      },
      setAccount(patch: Partial<State["account"]>, message?: string) {
        dispatch({ type: "account/set", patch })
        if (message) toaster.success(message)
      },
      /** Sends a reply as the person signed in. */
      sendMessage(conversationId: string, text: string) {
        const s = get()
        const memberId = s.session?.memberId ?? s.team[0].id
        dispatch({ type: "inbox/send", id: conversationId, message: { id: `${conversationId}-${Date.now()}`, from: memberId, at: nowIso(), text } })
      },
      readConversation(id: string) {
        if (get().conversations.find((c) => c.id === id)?.unread) dispatch({ type: "inbox/update", id, patch: { unread: 0 } })
      },
      setConversationStatus(id: string, status: Conversation["status"]) {
        dispatch({ type: "inbox/update", id, patch: { status } })
        toaster.success(status === "done" ? "Marked as done" : "Moved back to open")
      },
      /** Starts a conversation with a customer and returns its id. */
      startConversation(customerId: string, subject: string, text: string) {
        const s = get()
        const id = `t${Date.now().toString(36)}`
        const memberId = s.session?.memberId ?? s.team[0].id
        dispatch({ type: "inbox/start", conversation: { id, customerId, subject, channel: "email", status: "open", unread: 0, messages: [{ id: `${id}-1`, from: memberId, at: nowIso(), text }] } })
        toaster.success("Message sent", { description: s.customers.find((c) => c.id === customerId)?.email })
        return id
      },
      saveDiscount(discount: Discount, isNew: boolean) {
        dispatch({ type: "discount/save", discount })
        toaster.success(isNew ? `${discount.code} created` : `${discount.code} saved`)
      },
      setDiscountPaused(id: string, paused: boolean) {
        const d = get().discounts.find((x) => x.id === id)
        if (!d) return
        dispatch({ type: "discount/save", discount: { ...d, paused } })
        toaster.success(`${d.code} ${paused ? "paused" : "switched back on"}`)
      },
      deleteDiscounts(ids: string[]) {
        const codes = get().discounts.filter((d) => ids.includes(d.id)).map((d) => d.code)
        dispatch({ type: "discount/delete", ids })
        toaster.success(codes.length === 1 ? `${codes[0]} deleted` : `${codes.length} discounts deleted`)
      },
      importDiscounts(list: Discount[]) {
        dispatch({ type: "discount/import", discounts: list })
        toaster.success(`Imported ${list.length} discount${list.length === 1 ? "" : "s"}`)
      },
      connectApp(id: string, account: string) {
        dispatch({ type: "app/set", id, connected: true, account })
        toaster.success(`${get().apps.find((a) => a.id === id)?.name} connected`, { description: account })
      },
      disconnectApp(id: string) {
        dispatch({ type: "app/set", id, connected: false })
        toaster.success(`${get().apps.find((a) => a.id === id)?.name} disconnected`)
      },
      updateSettings(patch: Partial<StoreSettings>, message = "Settings saved") {
        dispatch({ type: "settings/update", patch })
        toaster.success(message)
      },
      markNotificationsRead(ids: string[] | "all" = "all") {
        const unread = get().notifications.filter((n) => !n.read && (ids === "all" || ids.includes(n.id))).length
        dispatch({ type: "notifications/read", ids })
        if (ids === "all" && unread) toaster.success(`${unread} notification${unread === 1 ? "" : "s"} marked as read`)
      },
      /** Appearance changes are quiet: the page itself shows them. */
      setAppearance(patch: Partial<Appearance>) {
        dispatch({ type: "appearance/set", patch })
      },
      switchWorkspace(id: string) {
        if (id === get().workspace) return
        dispatch({ type: "workspace/switch", id })
        toaster.success(`Switched to ${seed.workspaces.find((w) => w.id === id)?.name}`)
      },
      setPeriod(period: Period) {
        dispatch({ type: "period/set", period })
      },
      signIn(memberId: string) {
        dispatch({ type: "session/signIn", memberId })
        toaster.success(`Welcome back, ${get().team.find((m) => m.id === memberId)?.name.split(" ")[0]}`)
      },
      signOut() {
        dispatch({ type: "session/signOut" })
        toaster.success("Signed out")
      },
    }
  }, [dispatch, get])
}

export type Actions = ReturnType<typeof useActions>

const StoreContext = React.createContext<{ state: State; actions: Actions } | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, undefined, initialState)
  const ref = React.useRef(state)
  ref.current = state
  /* Reads the state after a dispatch, so an action's toast can name what it changed. */
  const get = React.useCallback(() => ref.current, [])
  const actions = useActions(
    React.useCallback((action: Action) => {
      ref.current = reducer(ref.current, action)
      dispatch(action)
    }, []),
    get,
  )
  const value = React.useMemo(() => ({ state, actions }), [state, actions])
  return <StoreContext value={value}>{children}</StoreContext>
}

export function useStore() {
  const store = React.useContext(StoreContext)
  if (!store) throw new Error("useStore must be used inside <Backroom>.")
  return store
}

/* ------------------------------------------------------------------ selectors */

const DAY = 86_400_000

export const me = (state: State) => state.team.find((m) => m.id === state.session?.memberId) ?? null
export const customerOf = (state: State, id: string) => state.customers.find((c) => c.id === id)
export const orderByNumber = (state: State, number: number) => state.orders.find((o) => o.number === number)
export const unfulfilledCount = (state: State) => state.orders.filter((o) => o.status === "open" && o.fulfilment === "unfulfilled").length
export const inboxUnread = (state: State) => state.conversations.filter((c) => c.status === "open" && c.unread > 0).length
export const unreadCount = (state: State) => state.notifications.filter((n) => !n.read).length
export const workspaceOf = (state: State) => seed.workspaces.find((w) => w.id === state.workspace) ?? seed.workspaces[0]

/** A period's time range: [start, end) in ms, ending tonight at midnight. `back` 1 is the period before. */
export function range(period: Period, back = 0): [number, number] {
  const end = seed.TODAY + DAY - back * period * DAY
  return [end - period * DAY, end]
}

const inRange = (iso: string, [from, to]: [number, number]) => {
  const t = Date.parse(iso)
  return t >= from && t < to
}

/** The orders placed in a period, oldest first. Cancelled ones are left out of every figure. */
export const ordersIn = (state: State, period: Period, back = 0) => state.orders.filter((o) => inRange(o.createdAt, range(period, back)))

/** The buckets a period is drawn in: days for 7 and 30, weeks for 90 (the first week shorter). */
export function bucketsOf(period: Period): { from: number; to: number }[] {
  const [start, end] = range(period)
  const size = period === 90 ? 7 * DAY : DAY
  const out: { from: number; to: number }[] = []
  for (let to = end; to > start; to -= size) out.unshift({ from: Math.max(start, to - size), to })
  return out
}

const net = (o: Order) => o.total - o.refunded

function figures(list: Order[]) {
  const live = list.filter((o) => o.status !== "cancelled")
  const gross = live.reduce((s, o) => s + o.total, 0)
  const refunded = live.reduce((s, o) => s + o.refunded, 0)
  const revenue = gross - refunded
  return { revenue, orders: live.length, average: live.length ? revenue / live.length : 0, refundRate: gross ? refunded / gross : 0 }
}

const change = (now: number, before: number) => (before ? (now - before) / before : null)

export const CHANNEL_LABEL: Record<Channel, string> = { online: "Online store", wholesale: "Wholesale", marketplace: "Marketplace" }

/** Everything the dashboard's Overview shows for a period, from the orders in the store. */
export function overview(state: State, period: Period) {
  const now = ordersIn(state, period)
  const before = ordersIn(state, period, 1)
  const a = figures(now)
  const b = figures(before)
  const buckets = bucketsOf(period).map((bucket) => {
    const list = now.filter((o) => o.status !== "cancelled" && inRange(o.createdAt, [bucket.from, bucket.to]))
    const f = figures(list)
    const byChannel = { online: 0, wholesale: 0, marketplace: 0 } as Record<Channel, Cents>
    for (const o of list) byChannel[o.channel] += net(o)
    return { ...bucket, ...f, byChannel, list }
  })
  const units = new Map<string, { units: number; revenue: Cents; perBucket: number[] }>()
  buckets.forEach((bucket, i) => {
    for (const o of bucket.list)
      for (const line of o.lines) {
        const row = units.get(line.productId) ?? { units: 0, revenue: 0, perBucket: buckets.map(() => 0) }
        row.units += line.quantity
        row.revenue += line.price * line.quantity
        row.perBucket[i] += line.quantity
        units.set(line.productId, row)
      }
  })
  const bestSellers = [...units.entries()]
    .sort((x, y) => y[1].units - x[1].units || y[1].revenue - x[1].revenue)
    .slice(0, 5)
    .map(([id, row]) => ({ product: state.products.find((p) => p.id === id)!, ...row }))
  return {
    revenue: { value: a.revenue, delta: change(a.revenue, b.revenue) },
    orders: { value: a.orders, delta: change(a.orders, b.orders) },
    average: { value: a.average, delta: change(a.average, b.average) },
    refundRate: { value: a.refundRate, delta: change(a.refundRate, b.refundRate) },
    buckets,
    recent: [...state.orders].sort((x, y) => y.createdAt.localeCompare(x.createdAt)).slice(0, 6),
    bestSellers,
  }
}

/** Everything the dashboard's Analytics shows for a period, from the shop's traffic and orders. */
export function analytics(state: State, period: Period) {
  const take = (back: number) => {
    const r = range(period, back)
    const days = state.traffic.filter((d) => inRange(d.date, r))
    const sum = (pick: (d: (typeof days)[number]) => number) => days.reduce((s, d) => s + pick(d), 0)
    const purchased = state.orders.filter((o) => o.channel === "online" && inRange(o.createdAt, r)).length
    return {
      days,
      sessions: sum((d) => d.sessions),
      addedToCart: sum((d) => d.addedToCart),
      reachedCheckout: sum((d) => d.reachedCheckout),
      purchased,
      sources: Object.fromEntries((Object.keys(seed.SOURCE_LABEL) as Source[]).map((k) => [k, sum((d) => d.sources[k])])) as Record<Source, number>,
      devices: Object.fromEntries((Object.keys(seed.DEVICE_LABEL) as Device[]).map((k) => [k, sum((d) => d.devices[k])])) as Record<Device, number>,
    }
  }
  const now = take(0)
  const before = take(1)
  const buckets = bucketsOf(period).map((b) => {
    const days = now.days.filter((d) => inRange(d.date, [b.from, b.to]))
    const purchased = state.orders.filter((o) => o.channel === "online" && inRange(o.createdAt, [b.from, b.to])).length
    return { ...b, sessions: days.reduce((s, d) => s + d.sessions, 0), purchased }
  })
  return {
    now,
    before,
    conversion: { value: now.sessions ? now.purchased / now.sessions : 0, delta: change(now.sessions ? now.purchased / now.sessions : 0, before.sessions ? before.purchased / before.sessions : 0) },
    sessionsDelta: change(now.sessions, before.sessions),
    buckets,
  }
}
