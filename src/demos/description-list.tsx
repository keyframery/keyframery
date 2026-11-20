import { Pencil } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DescriptionList,
  DescriptionListActions,
  DescriptionListCopy,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
  DescriptionListValue,
} from "@/components/ui/description-list"

export const meta = { name: "Description list", group: "Display" }

/* Copy the email, then the phone number. */
export const play = [
  { wait: 900 },
  { click: '[data-item="email"] [data-slot="description-list-copy"]', wait: 1900 },
  { click: '[data-item="phone"] [data-slot="description-list-copy"]', wait: 2600 },
]

export const controls = {
  layout: { type: "select", label: "Layout", options: ["rows", "stacked", "grid"], default: "rows" },
  columns: { type: "slider", label: "Grid columns", min: 2, max: 3, step: 1, default: 2 },
  truncate: { type: "switch", label: "Truncate long values", default: false },
  copy: { type: "switch", label: "Copy buttons", default: true },
  edit: { type: "switch", label: "Edit action", default: true },
  title: { type: "text", label: "Heading", default: "Customer" },
  label: { type: "slider", label: "Label column", min: 6, max: 14, step: 1, default: 10, unit: "rem", group: "Layout" },
  gap: { type: "slider", label: "Row padding", min: 6, max: 20, step: 1, default: 12, unit: "px", group: "Layout" },
  font: { type: "slider", label: "Value size", min: 12, max: 16, step: 1, default: 13, unit: "px", group: "Layout" },
  term: { type: "color", label: "Labels", default: "", group: "Colours" },
  ink: { type: "color", label: "Values", default: "", group: "Colours" },
  rule: { type: "color", label: "Hairlines", default: "", group: "Colours" },
} as const

export default function DescriptionListDemo({
  layout = "rows",
  columns = 2,
  truncate = false,
  copy = true,
  edit = true,
  title = "Customer",
  label = 10,
  gap = 12,
  font = 13,
  term = "",
  ink = "",
  rule = "",
}: {
  layout?: "rows" | "stacked" | "grid"
  columns?: number
  truncate?: boolean
  copy?: boolean
  edit?: boolean
  title?: string
  label?: number
  gap?: number
  font?: number
  term?: string
  ink?: string
  rule?: string
}) {
  const style = {
    "--description-list-label": `${label}rem`,
    "--description-list-gap": `${gap}px`,
    "--description-list-font": `${font}px`,
    ...(term ? { "--description-list-term": term } : null),
    ...(ink ? { "--description-list-ink": ink } : null),
    ...(rule ? { "--description-list-rule": rule } : null),
  } as React.CSSProperties

  return (
    <div
      style={style}
      className="w-full max-w-[560px] rounded-[16px] bg-background px-5 pt-4 pb-2 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]"
    >
      <div className="flex items-baseline justify-between gap-3 pb-2">
        <div className="text-[15px] font-semibold tracking-tight">{title}</div>
        <div className="text-[12px] text-muted-foreground">Since March 2021</div>
      </div>
      <DescriptionList aria-label={title} layout={layout} columns={columns} truncate={truncate}>
        <DescriptionListItem>
          <DescriptionListTerm>Name</DescriptionListTerm>
          <DescriptionListDetails>
            <DescriptionListValue>Maya Okafor</DescriptionListValue>
          </DescriptionListDetails>
        </DescriptionListItem>
        <DescriptionListItem data-item="email">
          <DescriptionListTerm>Email</DescriptionListTerm>
          <DescriptionListDetails>
            <DescriptionListValue>maya.okafor@northwind-studio.com</DescriptionListValue>
            {copy && (
              <DescriptionListActions>
                <DescriptionListCopy />
              </DescriptionListActions>
            )}
          </DescriptionListDetails>
        </DescriptionListItem>
        <DescriptionListItem data-item="phone">
          <DescriptionListTerm>Phone</DescriptionListTerm>
          <DescriptionListDetails>
            <DescriptionListValue>+44 20 7946 0321</DescriptionListValue>
            {copy && (
              <DescriptionListActions>
                <DescriptionListCopy />
              </DescriptionListActions>
            )}
          </DescriptionListDetails>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Customer since</DescriptionListTerm>
          <DescriptionListDetails>
            <DescriptionListValue>14 March 2021</DescriptionListValue>
          </DescriptionListDetails>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Lifetime spend</DescriptionListTerm>
          <DescriptionListDetails>
            <DescriptionListValue className="font-medium">$4,812.60 · 23 orders</DescriptionListValue>
          </DescriptionListDetails>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Default address</DescriptionListTerm>
          <DescriptionListDetails>
            <DescriptionListValue>Flat 4, 18 Clerkenwell Close, London EC1R 0AA, United Kingdom</DescriptionListValue>
            {edit && (
              <DescriptionListActions>
                <Button variant="ghost" size="sm" aria-label="Edit default address">
                  <Pencil size={14} strokeWidth={1.75} aria-hidden />
                  Edit
                </Button>
              </DescriptionListActions>
            )}
          </DescriptionListDetails>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Tags</DescriptionListTerm>
          <DescriptionListDetails>
            <DescriptionListValue className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">Wholesale</Badge>
              <Badge variant="secondary">Newsletter</Badge>
              <Badge variant="success">Repeat buyer</Badge>
            </DescriptionListValue>
          </DescriptionListDetails>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Notes</DescriptionListTerm>
          <DescriptionListDetails>
            <DescriptionListValue className="text-muted-foreground">
              Prefers delivery after 2pm. Ask before substituting linen colours on wholesale orders.
            </DescriptionListValue>
          </DescriptionListDetails>
        </DescriptionListItem>
      </DescriptionList>
    </div>
  )
}
