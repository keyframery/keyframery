"use client"

/* Reviews: what customers wrote about their prints after delivery. The list (stars and status
   filters, search, paging, hide and publish in bulk, all kept in the address) with the shop's
   average and its spread of stars above it, and a review's own page: the full text, the order it
   came from, and the shop's reply, which shows under the review in the shop. Every change goes
   through the store. */

import { Eye, EyeOff, MessageSquareReply, Pencil } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable, DataTableBulkAction, type DataTableColumnDef } from "@/components/ui/data-table"
import { MenuItem, MenuSeparator } from "@/components/ui/menu"
import { Meter, MeterIndicator, MeterTrack } from "@/components/ui/meter"
import { Rating } from "@/components/ui/rating"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import type { Review } from "./data"
import { ErrorPage } from "./errors"
import { date, day, money, plural, when } from "./format"
import { icon, InlineLink, pageStack, PageHeader, PersonAvatar, PrintPhoto } from "./kit"
import { useRouter } from "./router"
import { customerOf, orderByNumber, reviewState, type ReviewState, type State, useStore } from "./store"

/* ------------------------------------------------------------------ shared */

export const REVIEW_STATE: Record<ReviewState, { label: string }> = {
  published: { label: "Published" },
  needs_reply: { label: "Needs reply" },
  hidden: { label: "Hidden" },
}

export function ReviewBadge({ review }: { review: Review }) {
  const s = reviewState(review)
  if (s === "hidden")
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Hidden
      </Badge>
    )
  if (s === "needs_reply")
    return (
      <Badge variant="outline">
        <span aria-hidden className="size-1.5 rounded-full bg-[var(--chart-4)]" />
        Needs reply
      </Badge>
    )
  return <Badge variant="secondary">Published</Badge>
}

/** Stars for a score, read only. Small in lists, larger on a review's page. */
export function Stars({ value, size = "sm", className }: { value: number; size?: "sm" | "md"; className?: string }) {
  return (
    <Rating
      value={value}
      readOnly
      getValueLabel={(v, max) => `Rated ${Math.round(v * 10) / 10} out of ${max}`}
      className={cn(size === "sm" ? "[--rating-gap:0px] [--rating-icon-size:0.875rem] [--rating-size:0.9375rem]" : "[--rating-gap:1px] [--rating-icon-size:1.125rem] [--rating-size:1.25rem]", className)}
    />
  )
}

const starsLabel = (n: number) => (n === 1 ? "1 star" : `${n} stars`)

/** The reviews the shop shows: everything not hidden. */
const shown = (state: State) => state.reviews.filter((r) => r.status !== "hidden")

/* ------------------------------------------------------------------ the list */

type Row = Review & { productName: string; photo: string; variant: string; customerName: string; avatar?: string; state: ReviewState }

const FILTER_KEYS = ["rating", "state"] as const

export function ReviewsPage() {
  const { state, actions } = useStore()
  const router = useRouter()
  const q = router.query
  const [selected, setSelected] = React.useState<string[]>([])

  const rows = React.useMemo<Row[]>(
    () =>
      state.reviews.map((r) => {
        const product = state.products.find((p) => p.id === r.productId)
        const variant = product?.variants.find((v) => v.id === r.variantId)
        const customer = customerOf(state, r.customerId)
        return {
          ...r,
          productName: product?.name ?? "Removed print",
          photo: product?.photo ?? "",
          variant: variant ? `${variant.size} cm · ${variant.finish}` : "",
          customerName: customer?.name ?? "Customer",
          avatar: customer?.avatar,
          state: reviewState(r),
        }
      }),
    [state],
  )

  const columns = React.useMemo<DataTableColumnDef<Row>[]>(
    () => [
      {
        id: "product",
        header: "Print",
        searchable: true,
        hideable: false,
        sticky: true,
        accessor: (r) => r.productName,
        cell: (r) => (
          <span className="flex min-w-0 items-center gap-3">
            {r.photo && <PrintPhoto src={r.photo} className="size-[calc(var(--br-row-tall,3.5rem)-1rem)]" />}
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-medium">{r.productName}</span>
              <span className="truncate text-[12px] text-muted-foreground">{r.variant}</span>
            </span>
          </span>
        ),
      },
      {
        id: "rating",
        header: "Rating",
        accessor: (r) => starsLabel(r.rating),
        sortValue: (r) => r.rating,
        filter: { options: [5, 4, 3, 2, 1].map((n) => ({ value: starsLabel(n) })) },
        cell: (r) => <Stars value={r.rating} />,
      },
      {
        id: "review",
        header: "Review",
        searchable: true,
        sortable: false,
        accessor: (r) => `${r.title} ${r.body}`,
        cell: (r) => (
          <span className="flex max-w-[22rem] min-w-[11rem] flex-col gap-0.5">
            <InlineLink to={`/reviews/${r.id}`} className="max-w-full self-start truncate" label={`Review: ${r.title}`}>
              {r.title}
            </InlineLink>
            <span className="truncate text-[12px] text-muted-foreground">{r.body}</span>
          </span>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        hideBelow: "lg",
        searchable: true,
        accessor: (r) => r.customerName,
        cell: (r) => (
          <span className="flex min-w-0 items-center gap-2">
            <PersonAvatar person={{ name: r.customerName, avatar: r.avatar }} />
            <span className="truncate">{r.customerName}</span>
          </span>
        ),
      },
      { id: "date", header: "Date", hideBelow: "lg", accessor: (r) => r.createdAt, cell: (r) => <span className="text-muted-foreground tabular-nums">{day(r.createdAt)}</span> },
      {
        id: "state",
        header: "Status",
        accessor: (r) => REVIEW_STATE[r.state].label,
        filter: { title: "Status", options: Object.values(REVIEW_STATE).map(({ label }) => ({ value: label })) },
        cell: (r) => <ReviewBadge review={r} />,
      },
    ],
    [],
  )

  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, q.get(key)?.split(",").filter(Boolean) ?? []]))
  const sortParam = q.get("sort")
  const sort = sortParam ? { id: sortParam.replace(/^-/, ""), direction: sortParam.startsWith("-") ? ("descending" as const) : ("ascending" as const) } : { id: "date", direction: "descending" as const }
  const page = Math.max(0, Number(q.get("page") ?? 1) - 1)

  const waiting = rows.filter((r) => r.state === "needs_reply").length
  const setStatus = (ids: string[], status: Review["status"]) => {
    for (const r of state.reviews) if (ids.includes(r.id) && r.status !== status) actions.setReviewStatus(r.id, status)
    setSelected([])
  }

  return (
    <div className={pageStack}>
      <PageHeader
        title="Reviews"
        description={
          <>
            {plural(state.reviews.length, "review")} from customers after delivery · <span className="tabular-nums">{waiting}</span> waiting for a reply
          </>
        }
      />
      <ReviewSummary onStars={(n) => router.setQuery({ rating: starsLabel(n), page: null }, { replace: true })} />
      <DataTable<Row>
        label="Reviews"
        className="[--data-table-row-height:var(--br-row-tall,3.5rem)]"
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        searchPlaceholder="Search reviews"
        search={q.get("q") ?? ""}
        onSearchChange={(next) => router.setQuery({ q: next || null, page: null }, { replace: true })}
        filters={filters}
        onFiltersChange={(next) => router.setQuery({ ...Object.fromEntries(FILTER_KEYS.map((key) => [key, next[key]?.length ? next[key].join(",") : null])), page: null }, { replace: true })}
        sort={sort}
        onSortChange={(next) => router.setQuery({ sort: next && !(next.id === "date" && next.direction === "descending") ? `${next.direction === "descending" ? "-" : ""}${next.id}` : null, page: null }, { replace: true })}
        page={page}
        onPageChange={(next) => router.setQuery({ page: next ? String(next + 1) : null }, { replace: true })}
        defaultPageSize={20}
        pageSizes={[10, 20, 50]}
        emptyTitle="No reviews match"
        emptyDescription="Try another search, or clear the filters."
        rowActions={(r) => (
          <>
            <MenuItem value="view" onClick={() => router.navigate(`/reviews/${r.id}`)}>
              View review
            </MenuItem>
            <MenuItem value="reply" onClick={() => router.navigate(`/reviews/${r.id}?reply=1`)}>
              {r.reply ? "Edit reply" : "Reply"}
            </MenuItem>
            <MenuSeparator />
            {r.status === "hidden" ? (
              <MenuItem value="publish" onClick={() => setStatus([r.id], "published")}>
                Publish
              </MenuItem>
            ) : (
              <MenuItem value="hide" onClick={() => setStatus([r.id], "hidden")} data-agent-confirm="Hides a customer's review from the shop">
                Hide from the shop
              </MenuItem>
            )}
          </>
        )}
        bulkActions={(ids) => (
          <>
            <DataTableBulkAction icon={<Eye {...icon} />} label="Publish" onClick={() => setStatus(ids, "published")} />
            <DataTableBulkAction icon={<EyeOff {...icon} />} label="Hide" onClick={() => setStatus(ids, "hidden")} data-agent-confirm="Hides customers' reviews from the shop" />
          </>
        )}
      />
    </div>
  )
}

/** The average the shop shows, and how the stars are spread. Hidden reviews count for neither. */
function ReviewSummary({ onStars }: { onStars: (stars: number) => void }) {
  const { state } = useStore()
  const list = shown(state)
  const average = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0
  const most = Math.max(1, ...[1, 2, 3, 4, 5].map((n) => list.filter((r) => r.rating === n).length))
  return (
    <Card className="py-5">
      <CardContent className="grid items-center gap-x-10 gap-y-5 sm:grid-cols-[auto_minmax(0,1fr)]">
        <div className="flex flex-col gap-2 sm:pe-10 sm:shadow-[1px_0_0_var(--border)] rtl:sm:shadow-[-1px_0_0_var(--border)]">
          <span className="text-[13px] text-muted-foreground">Average rating</span>
          <span className="flex items-baseline gap-2">
            <span className="text-[32px] leading-none font-semibold tracking-tight tabular-nums">{average.toFixed(1)}</span>
            <span className="text-[13px] text-muted-foreground">out of 5</span>
          </span>
          <Stars value={average} size="md" className="-ms-px" />
          <span className="text-[12px] text-muted-foreground">From {plural(list.length, "review")} shown in the shop</span>
        </div>
        <ul className="flex flex-col gap-1" aria-label="Reviews by stars">
          {[5, 4, 3, 2, 1].map((n) => {
            const count = list.filter((r) => r.rating === n).length
            return (
              <li key={n}>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Show ${starsLabel(n)} reviews, ${count}`}
                  onClick={() => onStars(n)}
                  className="h-7 w-full justify-start gap-3 rounded-[8px] bg-none! px-2 font-normal shadow-none! dark:bg-none! dark:shadow-none! not-data-disabled:hover:bg-foreground/[0.04]!"
                >
                  <span className="w-12 shrink-0 text-start text-[12px] text-muted-foreground tabular-nums">{starsLabel(n)}</span>
                  <Meter value={count} max={most} aria-label={`${starsLabel(n)}, ${count} reviews`} className="min-w-0 flex-1">
                    <MeterTrack className="h-1.5">
                      <MeterIndicator />
                    </MeterTrack>
                  </Meter>
                  <span className="w-6 shrink-0 text-end text-[12px] tabular-nums">{count}</span>
                </Button>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ a review */

export function ReviewPage({ id }: { id: string }) {
  const { state, actions } = useStore()
  const router = useRouter()
  const review = state.reviews.find((r) => r.id === id)
  if (!review) return <ErrorPage code="404" />

  const product = state.products.find((p) => p.id === review.productId)
  const variant = product?.variants.find((v) => v.id === review.variantId)
  const customer = customerOf(state, review.customerId)
  const order = orderByNumber(state, review.orderNumber)
  const line = order?.lines.find((l) => l.variantId === review.variantId)
  const delivered = order?.events.find((e) => e.kind === "delivered")
  const forPrint = shown(state).filter((r) => r.productId === review.productId)
  const printAverage = forPrint.length ? forPrint.reduce((s, r) => s + r.rating, 0) / forPrint.length : 0
  const hidden = review.status === "hidden"

  return (
    <div className={pageStack}>
      <PageHeader
        back={{ to: "/reviews", label: "Back to reviews" }}
        title={review.title}
        badges={<ReviewBadge review={review} />}
        description={
          <>
            {product?.name} · {starsLabel(review.rating)} · {date(review.createdAt)}
          </>
        }
        actions={
          <Button
            onClick={() => actions.setReviewStatus(review.id, hidden ? "published" : "hidden")}
            data-agent-confirm={hidden ? undefined : "Hides a customer's review from the shop"}
          >
            {hidden ? <Eye {...icon} /> : <EyeOff {...icon} />}
            {hidden ? "Publish review" : "Hide from the shop"}
          </Button>
        }
      />

      <div className="grid gap-[var(--br-gap)] lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="min-w-0 self-start">
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <PersonAvatar person={customer} size="md" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[13px] font-medium">{customer?.name}</span>
                <span className="truncate text-[12px] text-muted-foreground">
                  Verified buyer · {customer?.address.city}, {customer?.address.country}
                </span>
              </div>
              <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">{when(review.createdAt)}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              <Stars value={review.rating} size="md" className="-ms-0.5" />
              <p className="text-[15px] leading-[1.6] text-pretty">{review.body}</p>
              {hidden && <p className="text-[12px] text-muted-foreground">Hidden: only the team sees this review.</p>}
            </div>
            <ReplyBox review={review} autoFocus={router.query.get("reply") === "1"} />
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-[var(--br-gap)]">
          {order && (
            <Card>
              <CardHeader>
                <CardTitle>From order</CardTitle>
                <CardDescription>
                  Placed {day(order.createdAt)}
                  {delivered ? ` · delivered ${day(delivered.at)}` : ""}
                </CardDescription>
                <CardAction>
                  <InlineLink to={`/orders/${order.number}`} label={`Order ${order.number}`} className="tabular-nums">
                    #{order.number}
                  </InlineLink>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {line && (
                  <div className="flex items-center gap-3">
                    <PrintPhoto src={line.photo} className="size-12" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <InlineLink to={`/products/${line.productId}`} className="self-start">
                        {line.name}
                      </InlineLink>
                      <span className="text-[12px] text-muted-foreground">{variant ? `${variant.size} cm · ${variant.finish}` : line.variantTitle}</span>
                    </div>
                    <span className="text-[13px] text-muted-foreground tabular-nums">
                      {line.quantity > 1 ? `${line.quantity} × ` : ""}
                      {money(line.price)}
                    </span>
                  </div>
                )}
                {customer && (
                  <div className="flex items-center justify-between gap-3 border-t border-border pt-4 text-[13px]">
                    <span className="text-muted-foreground">Customer</span>
                    <InlineLink to={`/customers/${customer.id}`}>{customer.name}</InlineLink>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {product && (
            <Card>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{forPrint.length ? `${printAverage.toFixed(1)} average from ${plural(forPrint.length, "review")}` : "No reviews in the shop yet"}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5">
                {[5, 4, 3, 2, 1].map((n) => {
                  const count = forPrint.filter((r) => r.rating === n).length
                  return (
                    <div key={n} className="flex items-center gap-3">
                      <span className="w-12 shrink-0 text-[12px] text-muted-foreground tabular-nums">{starsLabel(n)}</span>
                      <Meter value={count} max={Math.max(1, forPrint.length)} aria-label={`${product.name}, ${starsLabel(n)}, ${count}`} className="min-w-0 flex-1">
                        <MeterTrack className="h-1.5">
                          <MeterIndicator />
                        </MeterTrack>
                      </Meter>
                      <span className="w-6 shrink-0 text-end text-[12px] tabular-nums">{count}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

/** The shop's reply: shown under the review once posted, with Edit and Remove; a box to write one until then. */
function ReplyBox({ review, autoFocus }: { review: Review; autoFocus: boolean }) {
  const { state, actions } = useStore()
  const [editing, setEditing] = React.useState(!review.reply)
  const [text, setText] = React.useState(review.reply?.text ?? "")
  const [error, setError] = React.useState<string | null>(null)
  const first = customerOf(state, review.customerId)?.name.split(" ")[0] ?? "there"

  const post = () => {
    const value = text.trim()
    if (value.length < 2) return setError("Write a reply first.")
    actions.replyToReview(review.id, value)
    setEditing(false)
    setError(null)
  }

  if (review.reply && !editing)
    return (
      <div className="flex flex-col gap-2 rounded-[12px] bg-muted/50 p-4" aria-label="Your reply">
        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 text-[12px]">
            <MessageSquareReply {...icon} className="shrink-0 text-muted-foreground rtl:-scale-x-100" />
            <span className="truncate font-medium">{state.settings.name} replied</span>
            <span className="shrink-0 text-muted-foreground">
              · {review.reply.by.split(" ")[0]}, {day(review.reply.at)}
            </span>
          </span>
          <span className="-me-1.5 flex shrink-0 items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => (setText(review.reply?.text ?? ""), setEditing(true))}>
              <Pencil {...icon} />
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => (actions.removeReply(review.id), setText(""), setEditing(true))} data-agent-confirm="Removes the shop's public reply">
              Remove
            </Button>
          </span>
        </div>
        <p className="text-[13px] leading-[1.55] text-pretty">{review.reply.text}</p>
      </div>
    )

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-5">
      <label htmlFor={`reply-${review.id}`} className="text-[13px] font-medium">
        {review.reply ? "Edit your reply" : "Reply"}
      </label>
      <Textarea
        id={`reply-${review.id}`}
        aria-label="Reply to the review"
        data-page-autofocus={autoFocus ? "" : undefined}
        placeholder={review.rating <= 3 ? `Sorry to hear that, ${first}. …` : `Thank you, ${first}! …`}
        value={text}
        aria-invalid={error ? true : undefined}
        onChange={(event) => {
          setText(event.target.value)
          setError(null)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) post()
        }}
        className="min-h-[88px]"
      />
      {error && <p className="text-[12px] text-destructive">{error}</p>}
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] text-muted-foreground">Shows under the review in the shop, and {first} gets an email.</span>
        <span className="flex shrink-0 items-center gap-2">
          {review.reply && (
            <Button size="sm" variant="ghost" onClick={() => (setEditing(false), setError(null))}>
              Cancel
            </Button>
          )}
          <Button size="sm" variant="primary" onClick={post} disabled={!text.trim()}>
            {review.reply ? "Save reply" : "Post reply"}
          </Button>
        </span>
      </div>
    </div>
  )
}
