"use client"

/* Backroom's pages and its sidebar, as data.

   `routes` is the router's table: add a page here and its address works. `nav` is the sidebar,
   the command menu and the profile menu: an entry only shows once its page is in `routes`, so the
   admin never links to a page that isn't there. (The table lives here rather than in router.tsx
   so the router doesn't import the pages that import it.) */

import { Blocks, Boxes, CircleHelp, CreditCard, Inbox, Landmark, LayoutGrid, type LucideIcon, Package, Settings, ShoppingBag, Star, TicketPercent, UserRound, Users } from "lucide-react"

import * as seed from "./data"
import { ForgotPasswordPage, ResetPasswordPage, SignInPage, SignUpPage, VerifyPage } from "./auth"
import { CustomerPage, CustomersPage } from "./customers"
import { Dashboard } from "./dashboard"
import { DiscountsPage } from "./discounts"
import { InvoicePage, PackingSlipPage } from "./documents"
import { InventoryPage } from "./inventory"
import { PayoutPage, PayoutsPage } from "./payouts"
import { ReviewPage, ReviewsPage } from "./reviews"
import { InboxPage } from "./inbox"
import { AppsPage, HelpPage, NotificationsPage } from "./workspace"
import { NewOrderPage } from "./order-new"
import { OrderPage, OrdersPage } from "./orders"
import { ProductPage, ProductsPage } from "./products"
import { SETTINGS_SECTIONS, SettingsPage } from "./settings"
import { ErrorPage, type ErrorCode, errorCodes } from "./errors"
import type { RouteDef } from "./router"
import type { State } from "./store"
import { inboxUnread, reviewState, unfulfilledCount } from "./store"

/* Names for titles and the breadcrumb. Seed names are enough: a product renamed this session keeps its
   first name in the tab title until the next visit, which the page heading shows correctly anyway. */
const productName = (id: string) => seed.products.find((p) => p.id === id)?.name
const customerName = (id: string) => seed.customers.find((c) => c.id === id)?.name
const reviewTitle = (id: string) => seed.reviews.find((r) => r.id === id)?.title
const payoutTitle = (id: string) => (/^po-\d{4}-\d{2}-\d{2}$/.test(id) ? `Payout ${Number(id.slice(11))} ${new Date(`${id.slice(3)}T00:00:00Z`).toLocaleString("en-IE", { month: "short", timeZone: "UTC" })}` : "Payout")
/** Orders named in the address of the bulk packing slips: ?orders=1042,1043. */
const orderNumbers = (query: URLSearchParams) => (query.get("orders") ?? "").split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0)

/** Reviews waiting for the shop to answer, for the sidebar's badge. */
export const reviewsWaiting = (state: State) => state.reviews.filter((r) => reviewState(r) === "needs_reply").length

export const routes: RouteDef[] = [
  {
    pattern: "/",
    title: "Dashboard",
    crumbs: () => [{ label: "Dashboard" }],
    render: () => <Dashboard />,
  },
  {
    pattern: "/orders",
    title: "Orders",
    render: () => <OrdersPage />,
  },
  {
    pattern: "/orders/new",
    title: "Create order",
    crumbs: () => [{ label: "Orders", to: "/orders" }, { label: "Create order" }],
    render: () => <NewOrderPage />,
  },
  /* An order's printable documents, outside the shell. They need a signed-in person like any order. */
  {
    pattern: "/orders/packing-slips",
    title: ({ query }) => `Packing slips · ${orderNumbers(query).length} orders`,
    layout: "bare",
    auth: true,
    render: ({ query }) => <PackingSlipPage numbers={orderNumbers(query)} />,
  },
  {
    pattern: "/orders/:number/invoice",
    title: ({ params }) => `Invoice INV-${params.number}`,
    layout: "bare",
    auth: true,
    render: ({ params }) => <InvoicePage key={params.number} number={Number(params.number)} />,
  },
  {
    pattern: "/orders/:number/packing-slip",
    title: ({ params }) => `Packing slip #${params.number}`,
    layout: "bare",
    auth: true,
    render: ({ params }) => <PackingSlipPage key={params.number} numbers={[Number(params.number)]} />,
  },
  {
    pattern: "/orders/:number",
    title: ({ params }) => `Order #${params.number}`,
    crumbs: ({ params }) => [{ label: "Orders", to: "/orders" }, { label: `#${params.number}` }],
    render: ({ params }) => <OrderPage key={params.number} number={Number(params.number)} />,
  },
  {
    pattern: "/products",
    title: "Products",
    render: () => <ProductsPage />,
  },
  {
    pattern: "/products/new",
    title: "Add product",
    crumbs: () => [{ label: "Products", to: "/products" }, { label: "Add product" }],
    render: () => <ProductPage id={null} />,
  },
  {
    pattern: "/products/:id",
    title: ({ params }) => productName(params.id) ?? "Product",
    crumbs: ({ params }) => [{ label: "Products", to: "/products" }, { label: productName(params.id) ?? "Product" }],
    render: ({ params }) => <ProductPage key={params.id} id={params.id} />,
  },
  { pattern: "/inventory", title: "Inventory", render: () => <InventoryPage /> },
  {
    pattern: "/customers",
    title: "Customers",
    render: () => <CustomersPage />,
  },
  {
    pattern: "/customers/:id",
    title: ({ params }) => customerName(params.id) ?? "Customer",
    crumbs: ({ params }) => [{ label: "Customers", to: "/customers" }, { label: customerName(params.id) ?? "Customer" }],
    render: ({ params }) => <CustomerPage key={params.id} id={params.id} />,
  },
  {
    pattern: "/settings",
    title: "Settings",
    crumbs: () => [{ label: "Settings", to: "/settings" }, { label: "Store details" }],
    render: () => <SettingsPage section="" />,
  },
  {
    pattern: "/settings/:section",
    title: ({ params }) => SETTINGS_SECTIONS.find((s) => s.to === `/settings/${params.section}`)?.label ?? "Settings",
    crumbs: ({ params }) => [{ label: "Settings", to: "/settings" }, { label: SETTINGS_SECTIONS.find((s) => s.to === `/settings/${params.section}`)?.label ?? "Not found" }],
    render: ({ params }) => <SettingsPage section={params.section} />,
  },
  { pattern: "/reviews", title: "Reviews", render: () => <ReviewsPage /> },
  {
    pattern: "/reviews/:id",
    title: ({ params }) => reviewTitle(params.id) ?? "Review",
    crumbs: ({ params }) => [{ label: "Reviews", to: "/reviews" }, { label: reviewTitle(params.id) ?? "Review" }],
    render: ({ params }) => <ReviewPage key={params.id} id={params.id} />,
  },
  { pattern: "/discounts", title: "Discounts", render: () => <DiscountsPage /> },
  { pattern: "/payouts", title: "Payouts", render: () => <PayoutsPage /> },
  {
    pattern: "/payouts/:id",
    title: ({ params }) => payoutTitle(params.id),
    crumbs: ({ params }) => [{ label: "Payouts", to: "/payouts" }, { label: payoutTitle(params.id).replace("Payout ", "") }],
    render: ({ params }) => <PayoutPage key={params.id} id={params.id} />,
  },
  { pattern: "/inbox", title: "Inbox", render: () => <InboxPage id={null} /> },
  {
    pattern: "/inbox/:id",
    title: "Inbox",
    crumbs: () => [{ label: "Inbox", to: "/inbox" }, { label: "Conversation" }],
    render: ({ params }) => <InboxPage id={params.id} />,
  },
  { pattern: "/apps", title: "Apps", render: () => <AppsPage /> },
  { pattern: "/notifications", title: "Notifications", render: () => <NotificationsPage /> },
  { pattern: "/help", title: "Help", render: () => <HelpPage /> },
  /* Signing in, outside the shell. */
  { pattern: "/sign-in", title: "Sign in", layout: "bare", auth: false, render: () => <SignInPage /> },
  { pattern: "/verify", title: "Enter your code", layout: "bare", auth: false, render: () => <VerifyPage /> },
  { pattern: "/sign-up", title: "Create your account", layout: "bare", auth: false, render: () => <SignUpPage /> },
  { pattern: "/forgot-password", title: "Reset your password", layout: "bare", auth: false, render: () => <ForgotPasswordPage /> },
  { pattern: "/reset-password", title: "Choose a new password", layout: "bare", auth: false, render: () => <ResetPasswordPage /> },
  /* The error pages, inside the shell (/errors/404) and on their own (/404). */
  {
    pattern: "/errors/:code",
    title: ({ params }) => (errorCodes.includes(params.code as ErrorCode) ? `Error ${params.code}` : "Page not found"),
    crumbs: ({ params }) => [{ label: "Errors" }, { label: params.code }],
    render: ({ params }) => <ErrorPage code={errorCodes.includes(params.code as ErrorCode) ? (params.code as ErrorCode) : "404"} />,
  },
  ...errorCodes.map(
    (code): RouteDef => ({
      pattern: `/${code}`,
      title: `Error ${code}`,
      layout: "bare",
      auth: false,
      render: () => <ErrorPage code={code} standalone />,
    }),
  ),
]

export type NavItem = {
  to: string
  label: string
  icon?: LucideIcon
  /** A count beside the label, from the store. Hidden at zero. */
  badge?: (state: State) => number
  /** Words the command menu also matches. */
  keywords?: string[]
  children?: NavItem[]
}

export type NavGroup = { label: string; items: NavItem[] }

export const nav: NavGroup[] = [
  {
    label: "Store",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutGrid, keywords: ["home", "overview", "analytics"] },
      { to: "/orders", label: "Orders", icon: ShoppingBag, badge: unfulfilledCount, keywords: ["sales", "fulfil"] },
      { to: "/products", label: "Products", icon: Package, keywords: ["prints", "catalogue"] },
      { to: "/inventory", label: "Inventory", icon: Boxes, keywords: ["stock", "low stock", "sku", "adjust", "frames"] },
      { to: "/customers", label: "Customers", icon: Users, keywords: ["people", "buyers"] },
      { to: "/reviews", label: "Reviews", icon: Star, badge: reviewsWaiting, keywords: ["ratings", "stars", "feedback", "reply"] },
      { to: "/discounts", label: "Discounts", icon: TicketPercent, keywords: ["codes", "sale", "coupons", "promotions"] },
      { to: "/payouts", label: "Payouts", icon: Landmark, keywords: ["bank", "money", "stripe", "transfers", "balance"] },
    ],
  },
  {
    label: "Workspace",
    items: [
      { to: "/inbox", label: "Inbox", icon: Inbox, badge: inboxUnread, keywords: ["messages", "email", "chat", "support"] },
      { to: "/apps", label: "Apps", icon: Blocks, keywords: ["integrations", "stripe", "gmail", "connect"] },
    ],
  },
  {
    label: "Account",
    items: [
      {
        to: "/settings",
        label: "Settings",
        icon: Settings,
        children: [
          { to: "/settings", label: "Store details" },
          { to: "/settings/account", label: "Account" },
          { to: "/settings/appearance", label: "Appearance" },
          { to: "/settings/notifications", label: "Notifications" },
          { to: "/settings/team", label: "Team and roles" },
          { to: "/settings/billing", label: "Billing" },
        ],
      },
      { to: "/help", label: "Help", icon: CircleHelp, keywords: ["support", "faq", "questions", "shortcuts"] },
    ],
  },
]

/** The profile menu's account links, in order. Each shows once its page exists. */
export const accountLinks: NavItem[] = [
  { to: "/settings/account", label: "Profile", icon: UserRound },
  { to: "/settings/billing", label: "Billing", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
]
