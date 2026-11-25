/* Sample data for the Inbox, Discounts and Apps pages. Like data.ts it is fixed, so the server and the
   browser agree, and it points at the same customers (c001…) and orders (#1455…) as the rest of the store. */

import { type Cents, type Iso, iso, NOW } from "./data"

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR
const at = (msAgo: number): Iso => iso(NOW - msAgo)

/* ------------------------------------------------------------------ inbox */

export type ChatMessage = {
  id: string
  /** "customer" or a team member's id. */
  from: "customer" | string
  at: Iso
  text: string
  /** A photo the customer sent, like a damaged corner. */
  photo?: { src: string; name: string; size: string }
}

export type Conversation = {
  id: string
  customerId: string
  subject: string
  /** The order it is about, if any. */
  order?: number
  channel: "email" | "chat"
  status: "open" | "done"
  unread: number
  messages: ChatMessage[]
}

export const conversations: Conversation[] = [
  {
    id: "t1",
    customerId: "c001",
    subject: "Oak frame for the gift order",
    order: 1458,
    channel: "chat",
    status: "open",
    unread: 2,
    messages: [
      { id: "t1-1", from: "customer", at: at(19 * HOUR), text: "Hello! I ordered Mountain road last night, two of the 30×40 unframed." },
      { id: "t1-2", from: "customer", at: at(19 * HOUR - 2 * MIN), text: "Could one of them go in an oak frame instead? It's a gift for my sister." },
      { id: "t1-3", from: "m3", at: at(17 * HOUR), text: "Of course, Clara. The oak frame adds €55. Shall I change it and send you a payment link for the difference?" },
      { id: "t1-4", from: "customer", at: at(42 * MIN), text: "Yes please! And could you leave the price off the packing slip?" },
      { id: "t1-5", from: "customer", at: at(40 * MIN), text: "Thank you, you're very kind." },
    ],
  },
  {
    id: "t2",
    customerId: "c006",
    subject: "Invoice for order #1461",
    order: 1461,
    channel: "email",
    status: "open",
    unread: 1,
    messages: [
      { id: "t2-1", from: "m4", at: at(3 * HOUR), text: "Hi Declan, the invoice for #1461 is attached: eight prints for the Christmas window, €378 due in 30 days." },
      { id: "t2-2", from: "customer", at: at(2 * HOUR), text: "Thanks Pieter. Could we pay half now and half in January? December is our tight month." },
    ],
  },
  {
    id: "t3",
    customerId: "c002",
    subject: "Late set in 70×100?",
    channel: "chat",
    status: "open",
    unread: 1,
    messages: [
      { id: "t3-1", from: "customer", at: at(26 * HOUR), text: "Is Late set available bigger than 70×100? I'd love it for the back wall of the shop." },
      { id: "t3-2", from: "m1", at: at(25 * HOUR), text: "The negative holds up to 100×140. It would be a special print, about three weeks. Want a quote?" },
      { id: "t3-3", from: "customer", at: at(5 * HOUR), text: "Yes, a quote for 100×140 in black frame, please." },
    ],
  },
  {
    id: "t4",
    customerId: "c003",
    subject: "Corner damaged in transit",
    order: 1402,
    channel: "email",
    status: "open",
    unread: 0,
    messages: [
      {
        id: "t4-1",
        from: "customer",
        at: at(2 * DAY),
        text: "The print arrived today but the bottom corner is bent. Photo attached.",
        photo: { src: "/demo/coast-5.jpg", name: "corner.jpg", size: "1.4 MB" },
      },
      { id: "t4-2", from: "m2", at: at(2 * DAY - 3 * HOUR), text: "I'm so sorry, Freya. We'll print a new one today and send it tracked. No need to return the first." },
      { id: "t4-3", from: "customer", at: at(DAY + 4 * HOUR), text: "Thank you, that's great service." },
    ],
  },
  {
    id: "t5",
    customerId: "c009",
    subject: "Restock for De Kaart",
    channel: "email",
    status: "open",
    unread: 0,
    messages: [
      { id: "t5-1", from: "customer", at: at(3 * DAY), text: "Hoi! We sold out of Canal houses. Can you send six more 30×40 and four 50×70?" },
      { id: "t5-2", from: "m4", at: at(3 * DAY - 2 * HOUR), text: "Hi Sem, yes. I'll raise the order today; they ship Thursday by courier." },
    ],
  },
  {
    id: "t6",
    customerId: "c004",
    subject: "Collecting from the studio",
    channel: "chat",
    status: "done",
    unread: 0,
    messages: [
      { id: "t6-1", from: "customer", at: at(5 * DAY), text: "Can I pick up my order from the studio on Saturday?" },
      { id: "t6-2", from: "m3", at: at(5 * DAY - HOUR), text: "Saturday 10 to 1 works. Ring the bell at Unit 4." },
      { id: "t6-3", from: "customer", at: at(4 * DAY), text: "Got it, thanks!" },
    ],
  },
  {
    id: "t7",
    customerId: "c008",
    subject: "Press photos for the shop window",
    channel: "email",
    status: "done",
    unread: 0,
    messages: [
      { id: "t7-1", from: "customer", at: at(9 * DAY), text: "Bonjour! Do you have photos of the prints framed, for our newsletter?" },
      { id: "t7-2", from: "m1", at: at(8 * DAY), text: "Bonjour Juliette, here's a shared folder with eight framed shots. Use any you like." },
    ],
  },
]

/** The replies a person can drop in with one click. */
export const savedReplies = [
  { title: "Shipping times", text: "Prints are made to order and ship within 3 working days. Ireland takes 1 to 2 days, the rest of Europe 3 to 5." },
  { title: "Frames", text: "Every size comes unframed, in natural oak or in black ash. Frames add €55 to €125 depending on the size." },
  { title: "Damaged in transit", text: "I'm sorry it arrived damaged. We'll print a new one today and send it tracked. There's no need to return the first." },
]

/* ------------------------------------------------------------------ discounts */

export type DiscountKind = "percent" | "amount" | "shipping"

export type Discount = {
  id: string
  code: string
  kind: DiscountKind
  /** Percent (10 = 10%) or cents off; ignored for free shipping. */
  value: number
  /** Least the order must come to, in cents. 0 for none. */
  minimum: Cents
  appliesTo: "all" | "Coast" | "Walks" | "Places" | "Kitchen"
  startsAt: Iso
  endsAt?: Iso
  /** Most uses in total, or null for no limit. */
  limit: number | null
  used: number
  /** Switched off by hand, whatever the dates say. */
  paused: boolean
}

export const discounts: Discount[] = [
  { id: "d1", code: "TIDE10", kind: "percent", value: 10, minimum: 0, appliesTo: "all", startsAt: at(180 * DAY), limit: null, used: 0, paused: false },
  { id: "d2", code: "WINTER25", kind: "percent", value: 25, minimum: 15000, appliesTo: "all", startsAt: iso(Date.UTC(2026, 10, 27)), endsAt: iso(Date.UTC(2026, 11, 1)), limit: 300, used: 0, paused: false },
  { id: "d3", code: "COASTFRAME", kind: "amount", value: 2000, minimum: 10000, appliesTo: "Coast", startsAt: at(40 * DAY), endsAt: iso(Date.UTC(2026, 11, 31)), limit: 100, used: 37, paused: false },
  { id: "d4", code: "SHIPFREE", kind: "shipping", value: 0, minimum: 6000, appliesTo: "all", startsAt: at(60 * DAY), endsAt: at(10 * DAY), limit: null, used: 212, paused: false },
  { id: "d5", code: "STUDIO15", kind: "percent", value: 15, minimum: 0, appliesTo: "all", startsAt: at(120 * DAY), limit: 50, used: 50, paused: false },
  { id: "d6", code: "KITCHEN5", kind: "amount", value: 500, minimum: 4000, appliesTo: "Kitchen", startsAt: at(30 * DAY), limit: null, used: 18, paused: true },
  { id: "d7", code: "FAIR2026", kind: "percent", value: 20, minimum: 0, appliesTo: "all", startsAt: at(70 * DAY), endsAt: at(66 * DAY), limit: 40, used: 31, paused: false },
]

/* ------------------------------------------------------------------ apps */

export type App = {
  id: string
  name: string
  /** "/demo/brands/stripe.svg": the company's own mark. */
  logo: string
  category: "Payments" | "Messages" | "Files" | "Reports" | "Sales channels"
  description: string
  connected: boolean
  /** What is connected, shown once it is: an account or a folder. */
  account?: string
}

export const apps: App[] = [
  { id: "stripe", name: "Stripe", logo: "/demo/brands/stripe.svg", category: "Payments", description: "Take card, Apple Pay and Google Pay payments at checkout, paid out every Wednesday and Saturday.", connected: true, account: "Tideline Prints Ltd · payouts to AIB ending 4417" },
  { id: "paypal", name: "PayPal", logo: "/demo/brands/paypal.svg", category: "Payments", description: "Let customers pay with their PayPal balance or Pay in 3.", connected: false },
  { id: "gmail", name: "Gmail", logo: "/demo/brands/gmail.svg", category: "Messages", description: "Bring hello@ into the Inbox, and send replies from your own address.", connected: true, account: "hello@tidelineprints.com" },
  { id: "slack", name: "Slack", logo: "/demo/brands/slack.svg", category: "Messages", description: "Post new orders, refunds and low stock to a channel of your choosing.", connected: false },
  { id: "drive", name: "Google Drive", logo: "/demo/brands/google-drive.svg", category: "Files", description: "Keep each print's full-size file in Drive and attach it to the product.", connected: true, account: "Print masters folder" },
  { id: "dropbox", name: "Dropbox", logo: "/demo/brands/dropbox.svg", category: "Files", description: "Send print files to the lab from a shared Dropbox folder.", connected: false },
  { id: "sheets", name: "Google Sheets", logo: "/demo/brands/google-sheets.svg", category: "Reports", description: "Copy every order to a sheet each night, for your accountant.", connected: false },
  { id: "notion", name: "Notion", logo: "/demo/brands/notion.svg", category: "Reports", description: "Keep the print calendar and fair schedule next to your orders.", connected: false },
  { id: "shopify", name: "Shopify", logo: "/demo/brands/shopify.svg", category: "Sales channels", description: "Import products, customers and order history from a Shopify store.", connected: false },
]
