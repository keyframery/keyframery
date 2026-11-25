"use client"

export * from "@/components/primitives/filter"

/* Styled faceted filter: the animated primitive plus the Keyframery look. A chip with a dashed
   outline that names a column; its list is searchable, every option has a box, an optional icon and
   a count; what is chosen shows in the chip as small badges after a hairline.

   `Filter` with no children renders the whole thing from `options`. Pass children to compose the
   parts yourself (`FilterTrigger`, `FilterContent`, `FilterOption`, …).

   Theming: set these CSS variables on a filter, a bar or anything around them. Each falls back to
   the theme's own token, so nothing changes until you set one.
     --filter-face     the chip's surface while hovered or open, and the list's sheet  (default: --popover)
     --filter-ink      the chip's label and the options                               (default: --foreground)
     --filter-border   the chip's dashed outline                                      (default: --border)
     --filter-accent   a checked option's box                                         (default: --primary)
     --filter-badge    the chosen values' badges                                      (default: --secondary)
     --filter-radius   the chip's corners                                             (default: 9px)
     --filter-height   the chip's height                                              (default: 2rem) */

import { CirclePlus, Search, X } from "lucide-react"
import * as React from "react"

import { Badge, Roll } from "@/components/ui/badge"
import {
  Filter as FilterPrimitive,
  FilterBar as FilterBarPrimitive,
  FilterBarReset as FilterBarResetPrimitive,
  FilterClear as FilterClearPrimitive,
  FilterContent as FilterContentPrimitive,
  FilterEmpty as FilterEmptyPrimitive,
  FilterInput as FilterInputPrimitive,
  FilterList as FilterListPrimitive,
  FilterOption as FilterOptionPrimitive,
  type FilterOptionData,
  FilterOptionIndicator as FilterOptionIndicatorPrimitive,
  FilterSeparator as FilterSeparatorPrimitive,
  FilterTrigger as FilterTriggerPrimitive,
  FilterValues as FilterValuesPrimitive,
} from "@/components/primitives/filter"
import { Speed, type SpeedProps, useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* One size and one stroke for every icon in the filter. */
const icon = { size: 14, strokeWidth: 1.75, "aria-hidden": true } as const

/* UI SDK parts take a class name or a function of the part's state. Keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/** An option, with an icon if you like. */
type FilterItem = FilterOptionData & { icon?: React.ReactNode }

function FilterTrigger({ className, ...props }: React.ComponentProps<typeof FilterTriggerPrimitive>) {
  return (
    <FilterTriggerPrimitive
      className={withClass(
        cn(
          "inline-flex h-[var(--filter-height,2rem)] shrink-0 cursor-pointer items-center rounded-[var(--filter-radius,9px)] pr-1.5 pl-2.5 text-[13px] leading-none font-medium whitespace-nowrap text-[color:var(--filter-ink,var(--foreground))] outline-none select-none",
          "border border-dashed border-[color:var(--filter-border,var(--border))] bg-transparent",
          "[&>svg]:mr-1.5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground",
          "hover:border-[color:color-mix(in_oklab,var(--filter-border,var(--border)),var(--foreground)_18%)] hover:bg-[color-mix(in_oklab,var(--filter-ink,var(--foreground))_4%,transparent)]",
          "data-open:border-solid data-open:bg-[var(--filter-face,var(--popover))] data-open:shadow-[0_1px_2px_rgb(0_0_0/0.06)] dark:data-open:bg-accent",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "data-disabled:pointer-events-none data-disabled:opacity-50",
          /* Without values the label keeps an even right inset. */
          "has-[[data-slot=filter-values][data-empty]]:pr-2.5",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The chosen values: a hairline, then up to `max` badges, else "3 selected" with the number rolling.
   In a narrow bar (under 28rem) only the number shows. */
function FilterValues({ max = 2, className, ...props }: Omit<React.ComponentProps<typeof FilterValuesPrimitive>, "children"> & { max?: number }) {
  return (
    <FilterValuesPrimitive className={className} {...props}>
      {(state) =>
        state.count === 0
          ? null
          : [
              <span key="rule" className="mx-2 h-4 w-px bg-border" />,
              <Badge
                key="count"
                variant="secondary"
                count={state.count}
                className={cn(
                  "h-5 rounded-[5px] bg-[var(--filter-badge,var(--secondary))] px-1.5 font-medium",
                  state.count > max ? "inline-flex" : "hidden @max-md/filter-bar:inline-flex",
                )}
              >
                {state.count > max ? "selected" : null}
              </Badge>,
              ...(state.count > max
                ? []
                : state.chosen.map((label, index) => (
                    <Badge
                      key={state.value[index]}
                      variant="secondary"
                      className="ml-1 h-5 rounded-[5px] bg-[var(--filter-badge,var(--secondary))] px-1.5 font-medium first-of-type:ml-0 @max-md/filter-bar:hidden"
                    >
                      {label}
                    </Badge>
                  ))),
            ]
      }
    </FilterValuesPrimitive>
  )
}

function FilterContent({ className, children, sideOffset = 6, style, ...props }: React.ComponentProps<typeof FilterContentPrimitive>) {
  return (
    <FilterContentPrimitive
      sideOffset={sideOffset}
      className={withClass(
        cn(
          "group/content flex w-[var(--filter-list-width,15rem)] flex-col overflow-hidden rounded-[14px] bg-[var(--filter-face,var(--popover))] text-[color:var(--filter-ink,var(--popover-foreground))] outline-none",
          "[--list-height:var(--available-height)]",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
          "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
        ),
        className,
      )}
      style={useSpeedStyle(style)}
      {...props}
    >
      {children}
    </FilterContentPrimitive>
  )
}

/* The search field: a magnifier and bare text over a hairline. */
function FilterInput({ className, ...props }: React.ComponentProps<typeof FilterInputPrimitive>) {
  return (
    <div data-slot="filter-search" className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3 text-muted-foreground">
      <Search {...icon} />
      <FilterInputPrimitive
        className={withClass(
          "h-full min-w-0 flex-1 bg-transparent text-[13px] text-[color:var(--filter-ink,var(--foreground))] outline-none placeholder:text-muted-foreground",
          className,
        )}
        {...props}
      />
    </div>
  )
}

function FilterList({ className, ...props }: React.ComponentProps<typeof FilterListPrimitive>) {
  return (
    <FilterListPrimitive
      className={withClass(
        cn(
          "max-h-[min(calc(var(--list-height,100vh)-56px),17rem)] scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 outline-none",
          "group-has-[[data-slot=combobox-empty][data-empty]]/content:hidden",
          "before:rounded-[8px] before:bg-accent",
        ),
        className,
      )}
      {...props}
    />
  )
}

const row =
  "group/item relative flex min-h-8 cursor-default items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-[13px] leading-[1.3] outline-none select-none data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-40"

/* A box that fills and draws its check when the option is chosen. */
function FilterOptionIndicator({ className, keepMounted = true, ...props }: React.ComponentProps<typeof FilterOptionIndicatorPrimitive>) {
  return (
    <FilterOptionIndicatorPrimitive
      keepMounted={keepMounted}
      className={withClass(
        cn(
          "grid size-4 shrink-0 place-items-center rounded-[5px] text-transparent",
          "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.18)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.2)]",
          "transition-[background-color,box-shadow,scale] duration-[calc(320ms*var(--kf-speed,1))] ease-pop",
          "data-selected:bg-[var(--filter-accent,var(--primary))] data-selected:text-primary-foreground data-selected:shadow-[inset_0_0_0_1px_var(--filter-accent,var(--primary))]",
          "group-active/item:scale-[0.88]",
          "[&_path]:[stroke-dasharray:1_2] [&_path]:[stroke-dashoffset:1.2] [&_path]:transition-[stroke-dashoffset] [&_path]:delay-[calc(60ms*var(--kf-speed,1))] [&_path]:duration-[calc(260ms*var(--kf-speed,1))] [&_path]:ease-house",
          "data-selected:[&_path]:[stroke-dashoffset:0] group-data-starting-style/content:[&_path]:[stroke-dashoffset:1.2]!",
          "motion-reduce:transition-none! motion-reduce:[&_path]:transition-none!",
        ),
        className,
      )}
      {...props}
    >
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3.5 8.5 3 3 6-7" pathLength={1} />
      </svg>
    </FilterOptionIndicatorPrimitive>
  )
}

/* One option: box, icon, label and a count at the end that rolls when it changes. */
function FilterOption({
  className,
  icon: optionIcon,
  count,
  children,
  ...props
}: React.ComponentProps<typeof FilterOptionPrimitive> & { icon?: React.ReactNode; count?: number }) {
  return (
    <FilterOptionPrimitive className={withClass(row, className)} {...props}>
      {(state) => (
        <>
          <FilterOptionIndicator />
          {optionIcon && <span className="grid size-4 shrink-0 place-items-center text-muted-foreground [&_svg]:size-3.5">{optionIcon}</span>}
          <span className="min-w-0 flex-1 truncate">{typeof children === "function" ? children(state) : children}</span>
          {count !== undefined && (
            <span className="ml-auto pl-2 font-mono text-[12px] text-muted-foreground tabular-nums">
              <Roll text={String(count)} />
              <span className="sr-only">{count}</span>
            </span>
          )}
        </>
      )}
    </FilterOptionPrimitive>
  )
}

function FilterSeparator({ className, ...props }: React.ComponentProps<typeof FilterSeparatorPrimitive>) {
  return <FilterSeparatorPrimitive className={withClass("-mx-1.5 my-1.5 h-px bg-border", className)} {...props} />
}

/* "Clear filter", centred under a hairline. */
function FilterClear({ className, ...props }: React.ComponentProps<typeof FilterClearPrimitive>) {
  return <FilterClearPrimitive className={withClass(cn(row, "justify-center font-medium"), className)} {...props} />
}

function FilterEmpty({ className, ...props }: React.ComponentProps<typeof FilterEmptyPrimitive>) {
  return (
    <FilterEmptyPrimitive
      className={withClass("hidden px-3 py-6 text-center text-[13px] text-muted-foreground data-empty:block", className)}
      {...props}
    />
  )
}

type FilterProps = Omit<React.ComponentProps<typeof FilterPrimitive>, "options"> &
  SpeedProps & {
    /** The values to choose from, each with an optional `icon` and `count`. */
    options?: readonly FilterItem[]
    /** How many chosen values show as badges before they read "3 selected". */
    maxBadges?: number
    /** The search field's placeholder. Defaults to the label. */
    placeholder?: string
    /** What the list says when nothing matches. */
    emptyText?: string
    /** Leaves out the search field. */
    hideSearch?: boolean
  }

/* With no children, the whole filter from `options`: chip, list, counts and the clear row. */
function Filter({ speed, options, maxBadges = 2, placeholder, emptyText = "No results.", hideSearch = false, label, className, children, ...props }: FilterProps) {
  return (
    <Speed speed={speed}>
      <FilterPrimitive label={label} options={options} className={withClass("inline-flex", className)} {...props}>
        {children ?? (
          <>
            <FilterTrigger>
              <CirclePlus {...icon} />
              {label}
              <FilterValues max={maxBadges} />
            </FilterTrigger>
            <FilterContent>
              {!hideSearch && <FilterInput placeholder={placeholder ?? label} />}
              <FilterEmpty>{emptyText}</FilterEmpty>
              <FilterList>
                {(options ?? []).map((option) => (
                  <FilterOption key={option.value} data-value={option.value} value={option.value} label={option.label} disabled={option.disabled} icon={option.icon} count={option.count}>
                    {option.label}
                  </FilterOption>
                ))}
                <FilterClearRow />
              </FilterList>
            </FilterContent>
          </>
        )}
      </FilterPrimitive>
    </Speed>
  )
}

/* The clear row with the hairline above it; both leave together. */
function FilterClearRow() {
  return (
    <>
      <FilterSeparator className="hidden has-[+[data-slot=combobox-item]]:block" />
      <FilterClear />
    </>
  )
}

/* The toolbar row. Wraps at phone width, and is the container the chips read their width from. */
function FilterBar({ className, ...props }: React.ComponentProps<typeof FilterBarPrimitive>) {
  return <FilterBarPrimitive className={withClass("@container/filter-bar flex w-full flex-wrap items-center gap-2", className)} {...props} />
}

function FilterBarReset({ className, children, ...props }: React.ComponentProps<typeof FilterBarResetPrimitive>) {
  return (
    <FilterBarResetPrimitive
      className={withClass(
        "inline-flex h-[var(--filter-height,2rem)] cursor-pointer items-center gap-1.5 rounded-[var(--filter-radius,9px)] px-2.5 text-[13px] leading-none font-medium text-muted-foreground outline-none hover:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          Reset
          <X {...icon} />
        </>
      )}
    </FilterBarResetPrimitive>
  )
}

export {
  Filter,
  FilterBar,
  FilterBarReset,
  FilterClear,
  FilterContent,
  FilterEmpty,
  FilterInput,
  FilterList,
  FilterOption,
  FilterOptionIndicator,
  FilterSeparator,
  FilterTrigger,
  FilterValues,
  type FilterItem,
}
