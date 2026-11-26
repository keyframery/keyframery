"use client"

export * from "@/components/primitives/diff-viewer"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --diff-viewer-face: Sheet; default: bg-card.
   --diff-viewer-ink: Code text; default: text-card-foreground.
   --diff-viewer-added: Added lines and words; default: oklch(0.62 0.16 150).
   --diff-viewer-removed: Removed lines and words; default: var(--destructive).
   --diff-viewer-radius: Sheet corners; default: rounded-[14px].
   --diff-viewer-font: Code size; default: text-[12.5px].
   --diff-viewer-max-height: Body height before it scrolls; default: none.
*/

/* Styled diff viewer: the animated primitive plus the Keyframery look. A quiet sheet with the file
   and its counts on top, the code on a slightly sunk ground, added and removed lines tinted from two
   variables (green and the theme's destructive by default), changed words a stronger tint of the
   same, and slim rows above each hunk for its fold, its range and the review buttons. */

import * as React from "react"

import {
  DiffViewer as DiffViewerRoot,
  DiffViewerActions as DiffViewerActionsPrimitive,
  DiffViewerContent as DiffViewerContentPrimitive,
  DiffViewerCopyButton as DiffViewerCopyButtonPrimitive,
  DiffViewerHeader as DiffViewerHeaderPrimitive,
  DiffViewerStats as DiffViewerStatsPrimitive,
  DiffViewerTitle as DiffViewerTitlePrimitive,
  DiffViewerViewSwitch as DiffViewerViewSwitchPrimitive,
} from "@/components/primitives/diff-viewer"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* The two diff colours, once: --diff-add and --diff-del. */
const colors = "[--diff-add:var(--diff-viewer-added,oklch(0.62_0.16_150))] [--diff-del:var(--diff-viewer-removed,var(--destructive))]"

/* Token colours, as the code block has them. */
const tokens = cn(
  "[&_[data-token=keyword]]:text-ring [&_[data-token=tag]]:text-ring",
  "[&_[data-token=string]]:text-[color-mix(in_oklab,var(--destructive)_72%,var(--foreground))]",
  "[&_[data-token=number]]:text-[color-mix(in_oklab,var(--destructive)_55%,var(--ring))]",
  "[&_[data-token=comment]]:text-muted-foreground [&_[data-token=comment]]:italic",
  "[&_[data-token=function]]:font-medium [&_[data-token=function]]:text-foreground",
  "[&_[data-token=type]]:text-[color-mix(in_oklab,var(--ring)_55%,var(--foreground))]",
  "[&_[data-token=property]]:text-[color-mix(in_oklab,var(--ring)_40%,var(--foreground))]",
  "[&_[data-token=attribute]]:text-[color-mix(in_oklab,var(--ring)_55%,var(--foreground))]",
  "[&_[data-token=variable]]:text-[color-mix(in_oklab,var(--destructive)_55%,var(--ring))]",
  "[&_[data-token=punctuation]]:text-muted-foreground",
)

function DiffViewer({
  speed,
  className,
  lineNumbers = true,
  children,
  ...props
}: React.ComponentProps<typeof DiffViewerRoot> &
  SpeedProps & {
    /** Shows the old and new line numbers. */
    lineNumbers?: boolean
  }) {
  return (
    <Speed speed={speed}>
      <DiffViewerRoot
        data-numbers={lineNumbers ? undefined : "off"}
        className={withClass(
          cn(
            colors,
            "@container/diff-viewer flex w-full min-w-0 flex-col overflow-hidden rounded-[var(--diff-viewer-radius,14px)] bg-[var(--diff-viewer-face,var(--card))] text-[13px] text-[color:var(--diff-viewer-ink,var(--card-foreground))]",
            "shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)]",
            "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_8px_24px_-12px_rgb(0_0_0/0.7)]",
            "has-[>[data-slot=diff-viewer-content]:focus-visible]:ring-2 has-[>[data-slot=diff-viewer-content]:focus-visible]:ring-ring",
          ),
          className,
        )}
        {...props}
      >
        {children ?? (
          <>
            <DiffViewerHeader>
              <DiffViewerTitle />
              <DiffViewerStats />
              <DiffViewerActions>
                <DiffViewerViewSwitch />
                <DiffViewerCopyButton />
              </DiffViewerActions>
            </DiffViewerHeader>
            <DiffViewerContent />
          </>
        )}
      </DiffViewerRoot>
    </Speed>
  )
}

function DiffViewerHeader({ className, ...props }: React.ComponentProps<typeof DiffViewerHeaderPrimitive>) {
  return (
    <DiffViewerHeaderPrimitive
      className={withClass("flex h-11 min-w-0 shrink-0 items-center gap-2.5 border-b border-border/70 ps-3.5 pe-2 text-muted-foreground", className)}
      {...props}
    />
  )
}

function FileIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 2.75H5A1.25 1.25 0 0 0 3.75 4v8c0 .69.56 1.25 1.25 1.25h6c.69 0 1.25-.56 1.25-1.25V6L9 2.75Z" />
      <path d="M9 2.75V6h3.25" />
    </svg>
  )
}

/* The file name: its folder quiet, its name in full ink. With no children it reads `filename`. */
function DiffViewerTitle({ className, children, ...props }: React.ComponentProps<typeof DiffViewerTitlePrimitive>) {
  return (
    <DiffViewerTitlePrimitive
      className={withClass(
        "flex min-w-0 items-center gap-1.5 text-[12.5px] leading-none font-medium text-foreground [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children ??
        ((state) => {
          const cut = state.filename.lastIndexOf("/") + 1
          return (
            <>
              <FileIcon />
              <span className="min-w-0 truncate">
                <span className="text-muted-foreground @max-[28rem]/diff-viewer:hidden">{state.filename.slice(0, cut)}</span>
                {state.filename.slice(cut)}
              </span>
            </>
          )
        })}
    </DiffViewerTitlePrimitive>
  )
}

function DiffViewerStats({ className, ...props }: React.ComponentProps<typeof DiffViewerStatsPrimitive>) {
  return (
    <DiffViewerStatsPrimitive
      className={withClass(
        cn(
          "shrink-0 gap-1.5 font-mono text-[11.5px] leading-none font-medium",
          "*:data-[slot=diff-viewer-additions]:text-[color:color-mix(in_oklab,var(--diff-add)_88%,var(--foreground))]",
          "*:data-[slot=diff-viewer-deletions]:text-[color:color-mix(in_oklab,var(--diff-del)_88%,var(--foreground))]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function DiffViewerActions({ className, ...props }: React.ComponentProps<typeof DiffViewerActionsPrimitive>) {
  return <DiffViewerActionsPrimitive className={withClass("ms-auto flex shrink-0 items-center gap-1.5", className)} {...props} />
}

/* A small well with a key that slides between Unified and Split. Hidden while the viewer is too
   narrow for split. */
function DiffViewerViewSwitch({ className, ...props }: React.ComponentProps<typeof DiffViewerViewSwitchPrimitive>) {
  return (
    <DiffViewerViewSwitchPrimitive
      className={withClass(
        cn(
          "h-7 rounded-[9px] bg-muted p-0.5 shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
          "before:inset-y-0.5 before:start-0.5 before:w-[calc(50%-2px)] before:rounded-[7px] before:bg-background",
          "before:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_2px_4px_-2px_rgb(0_0_0/0.1)]",
          "dark:before:bg-accent dark:before:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08)]",
          "data-narrow:hidden",
          "*:h-6 *:cursor-pointer *:rounded-[7px] *:px-2.5 *:text-[12px] *:leading-none *:font-medium *:text-muted-foreground *:outline-none",
          "*:hover:text-foreground *:data-selected:text-foreground *:focus-visible:ring-2 *:focus-visible:ring-ring",
        ),
        className,
      )}
      {...props}
    />
  )
}

function DiffViewerCopyButton({ className, ...props }: React.ComponentProps<typeof DiffViewerCopyButtonPrimitive>) {
  return (
    <DiffViewerCopyButtonPrimitive
      className={withClass(
        cn(
          "grid size-7 shrink-0 cursor-pointer place-items-center rounded-[8px] text-muted-foreground outline-none",
          "hover:bg-foreground/[0.06] hover:text-foreground",
          "data-copied:text-[oklch(0.62_0.16_150)] data-copied:hover:text-[oklch(0.62_0.16_150)]",
          "focus-visible:ring-2 focus-visible:ring-ring",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Line tints: the row a light wash of its colour, changed words stronger. */

const lines = cn(
  /* Unified rows: old number, new number, sign, code. */
  "[&_[data-slot=diff-viewer-line]]:grid [&_[data-slot=diff-viewer-line]]:grid-cols-[var(--diff-num)_var(--diff-num)_1.25rem_1fr]",
  "[--diff-num:calc(4ch+0.875rem)] group-data-[numbers=off]/diff-viewer:[&_[data-slot=diff-viewer-line]]:grid-cols-[0_0_1.5rem_1fr]",
  "group-data-[numbers=off]/diff-viewer:[&_[data-slot=diff-viewer-line-number]]:invisible",
  /* Split rows: two cells, each number, sign, code; the code wraps. */
  "[&_[data-slot=diff-viewer-row]]:grid [&_[data-slot=diff-viewer-row]]:grid-cols-2",
  "[&_[data-slot=diff-viewer-cell]]:grid [&_[data-slot=diff-viewer-cell]]:min-w-0 [&_[data-slot=diff-viewer-cell]]:grid-cols-[var(--diff-num)_1.25rem_1fr]",
  "group-data-[numbers=off]/diff-viewer:[&_[data-slot=diff-viewer-cell]]:grid-cols-[0_1.5rem_1fr]",
  "[&_[data-slot=diff-viewer-cell][data-side=new]]:border-s [&_[data-slot=diff-viewer-cell][data-side=new]]:border-border/60",
  "[&_[data-slot=diff-viewer-cell]_[data-slot=diff-viewer-line-content]]:whitespace-pre-wrap [&_[data-slot=diff-viewer-cell]_[data-slot=diff-viewer-line-content]]:[overflow-wrap:anywhere]",
  "[&_[data-slot=diff-viewer-cell][data-kind=empty]]:bg-[repeating-linear-gradient(135deg,transparent_0_5px,color-mix(in_oklab,var(--foreground)_4%,transparent)_5px_6px)]",
  /* Gutter. */
  "[&_[data-slot=diff-viewer-line-number]]:pe-2.5 [&_[data-slot=diff-viewer-line-number]]:text-end [&_[data-slot=diff-viewer-line-number]]:text-muted-foreground/55 [&_[data-slot=diff-viewer-line-number]]:tabular-nums [&_[data-slot=diff-viewer-line-number]]:select-none",
  "[&_[data-slot=diff-viewer-line-sign]]:text-center [&_[data-slot=diff-viewer-line-sign]]:select-none [&_[data-slot=diff-viewer-line-content]]:pe-4",
  /* Added. */
  "[&_[data-kind=added]]:bg-[color-mix(in_oklab,var(--diff-add)_10%,transparent)] [&_[data-kind=added]_[data-slot=diff-viewer-line-number]]:bg-[color-mix(in_oklab,var(--diff-add)_8%,transparent)]",
  "[&_[data-kind=added]_[data-slot=diff-viewer-line-number]]:text-[color:color-mix(in_oklab,var(--diff-add)_70%,var(--foreground))]",
  "[&_[data-kind=added]_[data-slot=diff-viewer-line-sign]]:text-[color:var(--diff-add)]",
  "[&_[data-kind=added]_[data-changed]]:rounded-[3px] [&_[data-kind=added]_[data-changed]]:bg-[color-mix(in_oklab,var(--diff-add)_26%,transparent)] [&_[data-kind=added]_[data-changed]]:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--diff-add)_26%,transparent)]",
  /* Removed. */
  "[&_[data-kind=removed]]:bg-[color-mix(in_oklab,var(--diff-del)_8%,transparent)] [&_[data-kind=removed]_[data-slot=diff-viewer-line-number]]:bg-[color-mix(in_oklab,var(--diff-del)_6%,transparent)]",
  "[&_[data-kind=removed]_[data-slot=diff-viewer-line-number]]:text-[color:color-mix(in_oklab,var(--diff-del)_70%,var(--foreground))]",
  "[&_[data-kind=removed]_[data-slot=diff-viewer-line-sign]]:text-[color:var(--diff-del)]",
  "[&_[data-kind=removed]_[data-changed]]:rounded-[3px] [&_[data-kind=removed]_[data-changed]]:bg-[color-mix(in_oklab,var(--diff-del)_22%,transparent)] [&_[data-kind=removed]_[data-changed]]:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--diff-del)_22%,transparent)]",
  "dark:[&_[data-kind=added]]:bg-[color-mix(in_oklab,var(--diff-add)_14%,transparent)]",
  "dark:[&_[data-kind=removed]]:bg-[color-mix(in_oklab,var(--diff-del)_12%,transparent)]",
)

/* The slim rows above a hunk and after the last one: fold, range, review. */
const bars = cn(
  "[&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:sticky [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:start-0",
  "[&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:flex [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:h-[var(--diff-fold-height)] [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:w-[100cqw]",
  "[&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:items-center [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:gap-2 [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:px-1.5",
  "[&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:font-sans [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:text-[12px] [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:text-muted-foreground",
  "[&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:bg-[color-mix(in_oklab,var(--muted)_70%,var(--diff-viewer-face,var(--card)))]",
  "[&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:border-y [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:border-border/50",
  "[&_[data-slot=diff-viewer-body]>:first-child]:border-t-0",
  /* Fold button. */
  "[&_[data-slot=diff-viewer-fold]]:inline-flex [&_[data-slot=diff-viewer-fold]]:h-6 [&_[data-slot=diff-viewer-fold]]:shrink-0 [&_[data-slot=diff-viewer-fold]]:cursor-pointer [&_[data-slot=diff-viewer-fold]]:items-center [&_[data-slot=diff-viewer-fold]]:gap-1.5 [&_[data-slot=diff-viewer-fold]]:rounded-[7px] [&_[data-slot=diff-viewer-fold]]:px-2 [&_[data-slot=diff-viewer-fold]]:font-medium [&_[data-slot=diff-viewer-fold]]:outline-none",
  "[&_[data-slot=diff-viewer-fold]_svg]:size-3.5 [&_[data-slot=diff-viewer-fold]:hover]:bg-foreground/[0.06] [&_[data-slot=diff-viewer-fold]:hover]:text-foreground [&_[data-slot=diff-viewer-fold]:focus-visible]:ring-2 [&_[data-slot=diff-viewer-fold]:focus-visible]:ring-ring",
  "[&_[data-slot=diff-viewer-fold][data-disabled]]:cursor-default [&_[data-slot=diff-viewer-fold][data-disabled]]:bg-transparent [&_[data-slot=diff-viewer-fold][data-disabled]]:text-muted-foreground",
  /* Range. */
  "[&_[data-slot=diff-viewer-range]]:min-w-0 [&_[data-slot=diff-viewer-range]]:flex-1 [&_[data-slot=diff-viewer-range]]:truncate [&_[data-slot=diff-viewer-range]]:ps-1 [&_[data-slot=diff-viewer-range]]:font-mono [&_[data-slot=diff-viewer-range]]:text-[11px] [&_[data-slot=diff-viewer-range]]:text-muted-foreground/75",
  "[&_[data-slot=diff-viewer-section]]:text-muted-foreground",
  "[&_[data-slot=diff-viewer-fold]+[data-slot=diff-viewer-range]]:@max-[30rem]/diff-viewer:hidden @max-[26rem]/diff-viewer:[&_[data-slot=diff-viewer-fold-word]]:hidden",
  /* Review. */
  "[&_[data-slot=diff-viewer-review]]:ms-auto [&_[data-slot=diff-viewer-review]]:flex [&_[data-slot=diff-viewer-review]]:shrink-0 [&_[data-slot=diff-viewer-review]]:items-center [&_[data-slot=diff-viewer-review]]:gap-1",
  "[&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:h-6 [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:cursor-pointer [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:rounded-[7px] [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:px-2.5 [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:text-[12px] [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:leading-none [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:font-medium [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:outline-none",
  "[&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo]):focus-visible]:ring-2 [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo]):focus-visible]:ring-ring",
  "[&_:is([data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo]):hover]:bg-foreground/[0.06] [&_:is([data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo]):hover]:text-foreground",
  "[&_[data-slot=diff-viewer-accept]]:bg-primary [&_[data-slot=diff-viewer-accept]]:text-primary-foreground [&_[data-slot=diff-viewer-accept]]:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] [&_[data-slot=diff-viewer-accept]:hover]:bg-primary/90",
  "[&_[data-slot=diff-viewer-status]]:inline-flex [&_[data-slot=diff-viewer-status]]:items-center [&_[data-slot=diff-viewer-status]]:gap-1 [&_[data-slot=diff-viewer-status]]:pe-1 [&_[data-slot=diff-viewer-status]]:font-medium [&_[data-slot=diff-viewer-status]_svg]:size-3.5",
  "[&_[data-slot=diff-viewer-status][data-decision=accepted]]:text-[oklch(0.62_0.16_150)] [&_[data-slot=diff-viewer-status][data-decision=rejected]]:text-muted-foreground",
  /* A rejected hunk steps back. */
  "[&_[data-slot=diff-viewer-hunk][data-decision=rejected]]:opacity-45 [&_[data-slot=diff-viewer-hunk][data-decision=rejected]]:grayscale",
)

/* The sunk ground the code sits on. With no children it renders the whole diff. */
function DiffViewerContent({ className, ...props }: React.ComponentProps<typeof DiffViewerContentPrimitive>) {
  return (
    <DiffViewerContentPrimitive
      className={withClass(
        cn(
          "@container min-h-0 max-h-[var(--diff-viewer-max-height,none)] min-w-0 overflow-auto font-mono text-[length:var(--diff-viewer-font,12.5px)] leading-[1.7] outline-none [scrollbar-width:thin] [--diff-fold-height:2.125rem]",
          "bg-[color-mix(in_oklab,var(--muted)_40%,var(--diff-viewer-face,var(--card)))] dark:bg-[color-mix(in_oklab,var(--muted)_30%,var(--diff-viewer-face,var(--card)))]",
          "[&_[data-slot=diff-viewer-body]]:min-w-full [&_[data-slot=diff-viewer-body]]:pb-1.5",
          "[&_[data-slot=diff-viewer-body][data-view=unified]]:w-max [&_[data-slot=diff-viewer-body][data-view=unified]_[data-slot=diff-viewer-line-content]]:whitespace-pre",
          lines,
          bars,
          tokens,
        ),
        className,
      )}
      {...props}
    />
  )
}

export {
  DiffViewer,
  DiffViewerActions,
  DiffViewerContent,
  DiffViewerCopyButton,
  DiffViewerHeader,
  DiffViewerStats,
  DiffViewerTitle,
  DiffViewerViewSwitch,
}
