"use client"

/* Styled tree: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Tree as TreeRoot,
  TreeGroup as TreeGroupPart,
  TreeItem as TreeItemPart,
  TreeItemCheckbox as TreeItemCheckboxPart,
  TreeItemIndicator as TreeItemIndicatorPart,
  TreeItemLabel as TreeItemLabelPart,
  treeFromPaths,
  type TreeItemData,
  type TreeMode,
  type TreeProps,
} from "@/components/primitives/tree"
import { cn } from "@/lib/utils"

const icon = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const

/* Lets rows rendered from data know whether the tree has checkboxes. */
const CheckableContext = React.createContext(false)

function Tree<Mode extends TreeMode = "single">({
  className,
  children,
  ...props
}: TreeProps<Mode>) {
  const { items, paths } = props
  const data = React.useMemo(
    () => items ?? (paths ? treeFromPaths(paths) : undefined),
    [items, paths],
  )
  return (
    <CheckableContext.Provider value={!!props.checkable}>
      <TreeRoot
        className={cn(
          "flex min-w-0 flex-col text-[13px] outline-none",
          /* The two gliding surfaces: a light one under the pointer, the selected row's key. */
          "before:rounded-[8px] before:bg-accent/45 dark:before:bg-accent/40",
          "after:rounded-[8px] after:bg-accent dark:after:bg-accent",
          className,
        )}
        {...props}
      >
        {children ?? (data ? <TreeItems items={data} /> : null)}
      </TreeRoot>
    </CheckableContext.Provider>
  )
}

/* UI SDK calls an item a branch when it finds its own TreeGroup inside. Ours wraps that
   part, so the item looks for either one and says so itself. */
function hasGroup(children: React.ReactNode): boolean {
  return React.Children.toArray(children).some(
    (child) =>
      React.isValidElement<{ children?: React.ReactNode }>(child) &&
      (child.type === TreeGroup ||
        child.type === TreeGroupPart ||
        hasGroup(child.props.children)),
  )
}

function TreeItem({
  className,
  branch,
  children,
  ...props
}: React.ComponentProps<typeof TreeItemPart>) {
  return (
    <TreeItemPart
      branch={
        branch ?? (typeof children === "function" ? undefined : hasGroup(children) || undefined)
      }
      className={cn(
        "outline-none",
        /* Focus stays on the item, and the ring is drawn on its own row. */
        "[&:focus-visible>[data-slot=tree-label]]:ring-2 [&:focus-visible>[data-slot=tree-label]]:ring-ring",
        "[&:focus-visible>[data-slot=tree-label]]:ring-offset-2 [&:focus-visible>[data-slot=tree-label]]:ring-offset-background",
        className,
      )}
      {...props}
    >
      {children}
    </TreeItemPart>
  )
}

/* The row. A leaf is padded by one chevron so it lines up with the branches beside it. */
function TreeItemLabel({
  className,
  ...props
}: React.ComponentProps<typeof TreeItemLabelPart>) {
  return (
    <TreeItemLabelPart
      className={cn(
        "relative mt-px flex h-7 min-w-0 cursor-pointer items-center gap-2 rounded-[8px] pr-2 pl-2 not-data-branch:pl-8",
        "text-[13px] leading-[1.35] font-[450] text-foreground no-underline select-none",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        "transition-[color] duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none!",
        "data-selected:text-accent-foreground data-current:text-accent-foreground",
        "data-disabled:cursor-not-allowed data-disabled:opacity-40 data-pending:cursor-progress",
        className,
      )}
      {...props}
    />
  )
}

/* The chevron. It turns as the branch opens, and gives way to a spinner while children load. */
function TreeItemIndicator({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TreeItemIndicatorPart>) {
  return (
    <TreeItemIndicatorPart
      className={cn(
        "group/indicator -m-0.5 grid size-5 shrink-0 place-items-center rounded-[6px] text-muted-foreground",
        "hover:bg-foreground/[0.08] hover:text-foreground data-failed:text-destructive",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <svg {...icon} className="group-data-loading/indicator:hidden">
            <path d="M6 3.75 10.25 8 6 12.25" />
          </svg>
          <svg
            {...icon}
            className="hidden animate-spin [animation-duration:calc(700ms*var(--kf-speed,1))] group-data-loading/indicator:block motion-reduce:[animation-duration:calc(1600ms*var(--kf-speed,1))]"
          >
            <circle cx="8" cy="8" r="5.75" opacity="0.28" />
            <path d="M8 2.25A5.75 5.75 0 0 1 13.75 8" />
          </svg>
        </>
      )}
    </TreeItemIndicatorPart>
  )
}

/* The check draws itself. A branch with only some of its items checked shows a dash. */
function TreeItemCheckbox({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TreeItemCheckboxPart>) {
  return (
    <TreeItemCheckboxPart
      className={cn(
        "group/checkbox grid size-4 shrink-0 place-items-center rounded-[5px] bg-background text-primary-foreground *:[grid-area:1/1]",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.14),0_1px_2px_rgb(0_0_0/0.05)]",
        "dark:bg-accent/40 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.14)]",
        "not-data-disabled:data-unchecked:hover:shadow-[0_0_0_1px_rgb(0_0_0/0.24),0_1px_2px_rgb(0_0_0/0.06)]",
        "dark:not-data-disabled:data-unchecked:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.24)]",
        "transition-[background-color,box-shadow] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
        "data-checked:bg-primary data-indeterminate:bg-primary dark:data-checked:bg-primary dark:data-indeterminate:bg-primary",
        "data-checked:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] data-indeterminate:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]",
        "dark:data-checked:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)] dark:data-indeterminate:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)]",
        "data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <svg {...icon} strokeWidth={1.75}>
            <path
              d="M4.25 8.4 6.9 11l4.85-5.75"
              pathLength={1}
              className="transition-[stroke-dashoffset] duration-[calc(200ms*var(--kf-speed,1))] ease-house [stroke-dasharray:1] [stroke-dashoffset:1] group-data-checked/checkbox:[stroke-dashoffset:0] motion-reduce:transition-none!"
            />
          </svg>
          <svg {...icon} strokeWidth={1.75}>
            <path
              d="M4.75 8h6.5"
              pathLength={1}
              className="transition-[stroke-dashoffset] duration-[calc(200ms*var(--kf-speed,1))] ease-house [stroke-dasharray:1] [stroke-dashoffset:1] group-data-indeterminate/checkbox:[stroke-dashoffset:0] motion-reduce:transition-none!"
            />
          </svg>
        </>
      )}
    </TreeItemCheckboxPart>
  )
}

/* A branch's children, behind a hairline guide that drops from the chevron above.
   The clip reaches 4px past the box, so a focus ring on a row inside is never cut. */
function TreeGroup({
  className,
  ...props
}: React.ComponentProps<typeof TreeGroupPart>) {
  return (
    <TreeGroupPart
      className={cn(
        "relative ml-[15.5px] flex flex-col pl-[6.5px]",
        "before:absolute before:inset-y-1 before:left-0 before:w-px before:bg-border",
        className,
      )}
      {...props}
    />
  )
}

/* Rows from data: what `<Tree items={...} />` renders when it has no children. */
function TreeItems({ items }: { items: TreeItemData[] }) {
  const checkable = React.useContext(CheckableContext)
  return items.map((item) => (
    <TreeItem
      key={item.value}
      value={item.value}
      branch={item.children !== undefined}
      disabled={item.disabled}
    >
      <TreeItemLabel render={item.href ? <a href={item.href} /> : undefined}>
        {item.children && <TreeItemIndicator />}
        {checkable && <TreeItemCheckbox />}
        <span className="truncate">{item.label}</span>
      </TreeItemLabel>
      {item.children && (
        <TreeGroup>
          <TreeItems items={item.children} />
        </TreeGroup>
      )}
    </TreeItem>
  ))
}

export {
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemCheckbox,
  TreeItemIndicator,
  TreeItemLabel,
  TreeItems,
}
