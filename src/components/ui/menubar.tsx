"use client"

/* Styled menubar: the animated primitive plus the Keyframery look. */

import {
  Menu as MenuRoot,
  MenuCheckboxItem as MenuCheckboxItemPart,
  MenuContent as MenuContentPart,
  MenuContextTrigger as MenuContextTriggerPart,
  type MenuData,
  MenuGroup as MenuGroupPart,
  MenuGroupLabel as MenuGroupLabelPart,
  MenuItem as MenuItemPart,
  MenuItemIcon as MenuItemIconPart,
  MenuItemIndicator as MenuItemIndicatorPart,
  MenuRadioGroup as MenuRadioGroupPart,
  MenuRadioItem as MenuRadioItemPart,
  MenuSeparator as MenuSeparatorPart,
  MenuShortcut as MenuShortcutPart,
  MenuSub as MenuSubRoot,
  MenuSubContent as MenuSubContentPart,
  MenuSubTrigger as MenuSubTriggerPart,
  MenuTrigger as MenuTriggerPart,
  Menubar as MenubarRoot,
} from "@/components/primitives/menubar"
import * as React from "react"

import { mapChildren, Speed, type SpeedProps, useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* The sheet. Its motion (unfold, cascade, the gliding highlight) comes from the primitive;
   here the highlight gets its colour and radius, and turns red under a destructive row. */
const sheet = cn(
  "m-0 max-h-(--available-height) min-w-44 overflow-y-auto overscroll-contain border-0 p-1.5 outline-none",
  "rounded-[14px] bg-popover text-popover-foreground",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
  "before:rounded-[8px] before:bg-accent",
  "has-[[data-destructive][data-highlighted]]:before:bg-destructive/10",
  "has-[[data-disabled][data-highlighted]]:before:bg-accent/50",
)

/* One row for every kind of item. No background of its own: the sheet's highlight glides under it,
   and that highlight is the focus indicator. */
const row = cn(
  "relative flex min-h-8 cursor-default items-center gap-2 rounded-[8px] px-2 py-1.5 text-[13px] leading-4 outline-none select-none",
  "data-highlighted:text-accent-foreground",
  "data-disabled:text-muted-foreground/60 data-disabled:data-highlighted:text-muted-foreground/60",
  /* Rows without an icon keep the icon column when another row in the same menu has one. */
  "[[data-has-icons]>&:not([data-has-icon])]:ps-8 [[data-has-icons]>[role=group]>&:not([data-has-icon])]:ps-8",
)

const shortcut = "ms-auto ps-5 text-[12px] leading-4 tracking-[0.04em] text-muted-foreground"

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="m6 3.5 4.5 4.5L6 12.5" />
    </svg>
  )
}

/* The check. The primitive draws its stroke in. */
function Check() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-4"
    >
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  )
}

/* The bar: plain, one tab stop. Its triggers sit flat on it until hovered or open. */
function Menubar({
  speed,
  className,
  ...props
}: React.ComponentProps<typeof MenubarRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <MenubarRoot
        className={cn(
          "flex items-center gap-0.5 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
          "before:rounded-[8px] before:bg-accent",
          "data-disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

/* The menu as data, shared with its content. */
const MenuDataContext = React.createContext<{ items: MenuData | undefined; place: () => () => void } | null>(null)

/* Pass `items` to write a menu as data. Like UI SDK, the root then renders the content for you,
   unless you place a MenuContent of your own. */
function Menu({ children, ...props }: React.ComponentProps<typeof MenuRoot>) {
  const { items } = props
  const [placed, setPlaced] = React.useState(0)
  const place = React.useCallback(() => {
    setPlaced((n) => n + 1)
    return () => setPlaced((n) => n - 1)
  }, [])
  const data = React.useMemo(() => ({ items, place }), [items, place])
  const hasContent =
    placed > 0 || React.Children.toArray(children).some((child) => React.isValidElement(child) && child.type === MenuContent)
  return (
    <MenuDataContext value={data}>
      <MenuRoot {...props}>
        {children}
        {items && !hasContent ? <MenuSheet /> : null}
      </MenuRoot>
    </MenuDataContext>
  )
}

/* A flat label on the bar. The bar's highlight glides under it on hover and while it is open. */
function MenuTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenuTriggerPart>) {
  return (
    <MenuTriggerPart
      className={cn(
        "inline-flex h-7 shrink-0 cursor-default items-center justify-center gap-1.5 rounded-[8px] px-2.5 text-[13px] leading-none font-medium whitespace-nowrap text-foreground outline-none select-none [&_svg]:size-4 [&_svg]:shrink-0",
        "hover:text-accent-foreground data-open:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "aria-disabled:pointer-events-none aria-disabled:opacity-40 data-disabled:pointer-events-none data-disabled:opacity-40",
        className,
      )}
      {...props}
    />
  )
}

/* The area a right-click or a long press opens the menu from. It has no look of its own. */
function MenuContextTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenuContextTriggerPart>) {
  return (
    <MenuContextTriggerPart
      className={cn(
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    />
  )
}

/* The sheet itself. With no children it renders the root's `items`. */
function MenuSheet<Payload = unknown>({
  className,
  sideOffset = 6,
  align = "start",
  style,
  children,
  ...props
}: React.ComponentProps<typeof MenuContentPart<Payload>>) {
  const data = React.useContext(MenuDataContext)
  return (
    <MenuContentPart<Payload>
      sideOffset={sideOffset}
      align={align}
      className={cn(sheet, className)}
      {...props}
      style={useSpeedStyle(style)}
    >
      {children ?? (data?.items ? <MenuItems items={data.items} /> : undefined)}
    </MenuContentPart>
  )
}

function MenuContent<Payload = unknown>(props: React.ComponentProps<typeof MenuContentPart<Payload>>) {
  const place = React.useContext(MenuDataContext)?.place
  React.useLayoutEffect(() => place?.(), [place])
  return <MenuSheet<Payload> {...props} />
}

function MenuItem({
  className,
  ...props
}: React.ComponentProps<typeof MenuItemPart>) {
  return (
    <MenuItemPart
      className={cn(
        row,
        "*:data-[slot=menu-shortcut]:ms-auto *:data-[slot=menu-shortcut]:ps-5 *:data-[slot=menu-shortcut]:text-[12px] *:data-[slot=menu-shortcut]:tracking-[0.04em] *:data-[slot=menu-shortcut]:text-muted-foreground",
        "data-destructive:text-destructive data-destructive:data-highlighted:text-destructive",
        "data-pending:cursor-progress data-pending:text-muted-foreground",
        "data-pending:after:ms-auto data-pending:after:size-3 data-pending:after:shrink-0 data-pending:after:animate-spin data-pending:after:rounded-full data-pending:after:border-[1.5px] data-pending:after:border-current data-pending:after:border-t-transparent motion-reduce:data-pending:after:animate-none!",
        className,
      )}
      {...props}
    />
  )
}

function MenuShortcut({
  className,
  ...props
}: React.ComponentProps<typeof MenuShortcutPart>) {
  return <MenuShortcutPart className={cn(shortcut, className)} {...props} />
}

function MenuCheckboxItem({
  className,
  ...props
}: React.ComponentProps<typeof MenuCheckboxItemPart>) {
  return <MenuCheckboxItemPart className={cn(row, className)} {...props} />
}

function MenuRadioGroup<T extends string = string>({
  className,
  ...props
}: React.ComponentProps<typeof MenuRadioGroupPart<T>>) {
  return <MenuRadioGroupPart<T> className={cn(className)} {...props} />
}

function MenuRadioItem({
  className,
  ...props
}: React.ComponentProps<typeof MenuRadioItemPart>) {
  return <MenuRadioItemPart className={cn(row, className)} {...props} />
}

/* The check of a checkbox or radio item, at the end of its row. It stays mounted so it can draw in and out. */
function MenuItemIndicator({
  className,
  children,
  keepMounted = true,
  ...props
}: React.ComponentProps<typeof MenuItemIndicatorPart>) {
  return (
    <MenuItemIndicatorPart
      keepMounted={keepMounted}
      className={cn(
        "order-last ms-auto flex size-4 shrink-0 items-center justify-center ps-0 [&>svg]:size-4",
        className,
      )}
      {...props}
    >
      {children ?? <Check />}
    </MenuItemIndicatorPart>
  )
}

function MenuItemIcon({
  className,
  ...props
}: React.ComponentProps<typeof MenuItemIconPart>) {
  return (
    <MenuItemIconPart
      className={cn(
        "flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4",
        "in-data-destructive:text-current in-data-highlighted:text-current",
        "rtl:data-mirror:-scale-x-100",
        className,
      )}
      {...props}
    />
  )
}

function MenuGroup({
  className,
  ...props
}: React.ComponentProps<typeof MenuGroupPart>) {
  return <MenuGroupPart className={cn(className)} {...props} />
}

function MenuGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof MenuGroupLabelPart>) {
  return (
    <MenuGroupLabelPart
      className={cn(
        "px-2 pt-1.5 pb-1 text-[11px] leading-4 font-medium text-muted-foreground select-none",
        /* Lines up with the item text when the rows carry icons. */
        "[[data-has-icons]>&]:ps-8 [[data-has-icons]>[role=group]>&]:ps-8",
        className,
      )}
      {...props}
    />
  )
}

function MenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenuSeparatorPart>) {
  return (
    <MenuSeparatorPart
      className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  )
}

function MenuSub(props: React.ComponentProps<typeof MenuSubRoot>) {
  return <MenuSubRoot {...props} />
}

/* A row that keeps its highlight while its submenu is open, with a chevron that points to it. */
function MenuSubTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenuSubTriggerPart>) {
  return (
    <MenuSubTriggerPart
      className={cn(
        row,
        "data-open:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {mapChildren(children, (content) => (
        <>
          {content}
          <Chevron className="ms-auto -me-0.5 size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" />
        </>
      ))}
    </MenuSubTriggerPart>
  )
}

function MenuSubContent<Payload = unknown>({
  className,
  sideOffset = 8,
  style,
  ...props
}: React.ComponentProps<typeof MenuSubContentPart<Payload>>) {
  return (
    <MenuSubContentPart<Payload>
      sideOffset={sideOffset}
      className={cn(sheet, className)}
      {...props} style={useSpeedStyle(style)}
    />
  )
}

/* Renders a menu written as data with the styled parts above. */
function MenuItems({ items }: { items: MenuData }) {
  return items.map((entry, index) => {
    const item = typeof entry === "string" ? { value: entry, label: entry } : entry
    if (!("type" in item) || item.type === undefined || item.type === "item") {
      return (
        <MenuItem
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          shortcut={item.shortcut}
          closeOnSelect={item.closeOnSelect}
          destructive={item.destructive}
        >
          {item.label}
        </MenuItem>
      )
    }
    switch (item.type) {
      case "separator":
        return <MenuSeparator key={`separator-${index}`} />
      case "group":
        return (
          <MenuGroup key={`group-${index}`}>
            {item.label && <MenuGroupLabel>{item.label}</MenuGroupLabel>}
            <MenuItems items={item.items} />
          </MenuGroup>
        )
      case "checkbox":
        return (
          <MenuCheckboxItem
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            checked={item.checked}
            defaultChecked={item.defaultChecked}
            closeOnSelect={item.closeOnSelect}
          >
            {item.label}
            <MenuItemIndicator />
          </MenuCheckboxItem>
        )
      case "radio-group":
        return (
          <MenuRadioGroup
            key={item.name}
            name={item.name}
            value={item.value}
            defaultValue={item.defaultValue}
          >
            {item.label && <MenuGroupLabel>{item.label}</MenuGroupLabel>}
            {item.items.map((radio) => (
              <MenuRadioItem key={radio.value} value={radio.value} disabled={radio.disabled}>
                {radio.label}
                <MenuItemIndicator />
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        )
      case "submenu":
        return (
          <MenuSub key={`submenu-${index}`}>
            <MenuSubTrigger disabled={item.disabled}>{item.label}</MenuSubTrigger>
            <MenuSubContent>
              <MenuItems items={item.items} />
            </MenuSubContent>
          </MenuSub>
        )
    }
  })
}

export { createMenuController, createMenubarController, type MenuData } from "@/components/primitives/menubar"
export {
  Menu,
  Menubar,
  MenuCheckboxItem,
  MenuContent,
  MenuContextTrigger,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIcon,
  MenuItemIndicator,
  MenuItems,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
}
