import * as React from "react"

import {
  createTriggerMenuController,
  TriggerMenu,
  TriggerMenuContent,
  type TriggerMenuDataItem,
  TriggerMenuEmpty,
  TriggerMenuGroup,
  TriggerMenuGroupLabel,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuItemIcon,
  TriggerMenuList,
  TriggerMenuStatus,
} from "@/components/ui/trigger-menu"

export const meta = { name: "Trigger Menu", group: "Menus" }

/* The demo plays itself: typing @ unfolds the list, the highlight glides down, a person is
   inserted, then the same for a / action, and the reply clears. */
export const play = [
  { type: "Can you check with ", into: "#trip-reply", wait: 500 },
  { click: "#kf-mention", wait: 1000 },
  { key: "ArrowDown", wait: 450 },
  { key: "ArrowDown", wait: 650 },
  { key: "Enter", wait: 700 },
  { type: "Can you check with @Joanna Park about ", into: "#trip-reply", wait: 300 },
  { click: "#kf-action", wait: 1000 },
  { key: "ArrowDown", wait: 450 },
  { key: "ArrowDown", wait: 650 },
  { key: "Escape", wait: 600 },
  { type: "", into: "#trip-reply", wait: 900 },
]

const people = [
  { value: "ines", label: "Dana Whitfield", hint: "Owner" },
  { value: "kofi", label: "Marcus Bell", hint: "Booked the van" },
  { value: "aiko", label: "Joanna Park", hint: "Has the keys" },
  { value: "tomas", label: "Tomás Reyes", hint: "Joins Friday" },
]

const actions = [
  { value: "date", label: "date", hint: "Insert a date", icon: "M3 4.5h10v8.5H3zM3 7h10M6 3v3M10 3v3" },
  { value: "place", label: "place", hint: "Pin a place", icon: "M8 14s4.5-4 4.5-7.5a4.5 4.5 0 0 0-9 0C3.5 10 8 14 8 14zM8 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" },
  { value: "split", label: "split", hint: "Split a cost", icon: "M8 2.5v11M11 5H6.75a1.75 1.75 0 0 0 0 3.5h2.5a1.75 1.75 0 0 1 0 3.5H5" },
  { value: "poll", label: "poll", hint: "Ask the group", icon: "M4 13V9M8 13V3.5M12 13V6.5" },
]

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")

export const controls = {
  side: { type: "select", label: "Side", options: ["top", "right", "bottom", "left"], default: "bottom" },
  align: { type: "select", label: "Align", options: ["start", "center", "end"], default: "start" },
  sideOffset: { type: "slider", label: "Popup gap", min: 0, max: 24, step: 1, default: 6, unit: "px", group: "Layout" },
  autoHighlight: { type: "switch", label: "Auto highlight", default: true, group: "Behaviour" },
  loop: { type: "switch", label: "Loop", default: true, group: "Behaviour" },
  dismissible: { type: "switch", label: "Dismissible", default: true, group: "Behaviour" },
  keepMounted: { type: "switch", label: "Keep mounted", default: false, group: "Behaviour" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  items: { type: "slider", label: "Suggestions per trigger", min: 1, max: 4, step: 1, default: 4, unit: "", group: "Layout" },
  width: { type: "slider", label: "Demo width", min: 300, max: 560, step: 1, default: 400, unit: "px", group: "Layout" },
  menuWidth: { type: "slider", label: "Menu width", min: 200, max: 360, step: 1, default: 240, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Editor height", min: 60, max: 180, step: 1, default: 84, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", min: 0, max: 28, step: 1, default: 14, unit: "px", group: "Layout" },
  itemRadius: { type: "slider", label: "Item radius", min: 0, max: 16, step: 1, default: 8, unit: "px", group: "Layout" },
  title: { type: "text", label: "Title", default: "Reply to moving day" },
  placeholder: { type: "text", label: "Placeholder", default: "Van comes at eight. Who is bringing tape?" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
} as const

export default function TriggerMenuDemo({
  side = "bottom",
  align = "start",
  sideOffset = 6,
  autoHighlight = true,
  loop = true,
  dismissible = true,
  keepMounted = false,
  disabled = false,
  readOnly = false,
  items = 4,
  width = 400,
  menuWidth = 240,
  height = 84,
  radius = 14,
  itemRadius = 8,
  title = "Reply to moving day",
  placeholder = "Van comes at eight. Who is bringing tape?",
  face = "",
  ink = "",
  accent = "",
}: {
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  sideOffset?: number
  autoHighlight?: boolean
  loop?: boolean
  dismissible?: boolean
  keepMounted?: boolean
  disabled?: boolean
  readOnly?: boolean
  items?: number
  width?: number
  menuWidth?: number
  height?: number
  radius?: number
  itemRadius?: number
  title?: string
  placeholder?: string
  face?: string
  ink?: string
  accent?: string
} = {}) {
  const theme = {
    "--trigger-menu-width": `${menuWidth}px`,
    "--trigger-menu-height": `${height}px`,
    "--trigger-menu-radius": `${radius}px`,
    "--trigger-menu-item-radius": `${itemRadius}px`,
    ...(face ? { "--trigger-menu-face": face } : {}),
    ...(ink ? { "--trigger-menu-ink": ink } : {}),
    ...(accent ? { "--trigger-menu-accent": accent } : {}),
  } as React.CSSProperties
  const [menu] = React.useState(createTriggerMenuController)
  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor="trip-reply" className="text-[13px] leading-none font-medium">
          {title}
        </label>
        <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
          {[
            { id: "kf-mention", char: "@", label: "people" },
            { id: "kf-action", char: "/", label: "actions" },
          ].map((t) => (
            <button
              key={t.id}
              id={t.id}
              disabled={disabled || readOnly}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => menu.open({ trigger: t.char })}
              className="flex h-6 cursor-pointer items-center gap-1.5 rounded-[7px] px-1.5 outline-none transition-[scale,color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] motion-reduce:transition-none"
            >
              <kbd className="grid h-[18px] min-w-[18px] place-items-center rounded-[5px] bg-muted px-1 font-sans text-[11px] font-medium text-foreground">
                {t.char}
              </kbd>
              {t.label}
            </button>
          ))}
        </span>
      </div>
      <TriggerMenu
        controller={menu} autoHighlight={autoHighlight} loop={loop} dismissible={dismissible}
        triggers={[
          { char: "@", items: people.slice(0, items), spaces: 1 },
          { char: "/", items: actions.slice(0, items), insert: (item) => `/${item.label} ` },
        ]}
      >
        <TriggerMenuInput
          id="trip-reply" disabled={disabled} readOnly={readOnly}
          spellCheck={false}
          placeholder={placeholder}
        />
        <TriggerMenuStatus />
        <TriggerMenuContent style={theme} side={side} align={align} sideOffset={sideOffset} keepMounted={keepMounted}>
          <TriggerMenuEmpty>No match</TriggerMenuEmpty>
          <TriggerMenuList>
            {(state) =>
              state.trigger === "/" ? (
                <TriggerMenuGroup>
                  <TriggerMenuGroupLabel>Actions</TriggerMenuGroupLabel>
                  {(state.items as TriggerMenuDataItem[]).map((item) => {
                    const action = actions.find((a) => a.value === item.value)
                    return (
                      <TriggerMenuItem key={item.value} value={item.value} label={item.label}>
                        <TriggerMenuItemIcon>
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d={action?.icon} />
                          </svg>
                        </TriggerMenuItemIcon>
                        <span className="font-medium">/{item.label}</span>
                        <span className="ms-auto text-[12px] text-muted-foreground">{action?.hint}</span>
                      </TriggerMenuItem>
                    )
                  })}
                </TriggerMenuGroup>
              ) : (
                <TriggerMenuGroup>
                  <TriggerMenuGroupLabel>People on this trip</TriggerMenuGroupLabel>
                  {(state.items as TriggerMenuDataItem[]).map((item) => {
                    const person = people.find((p) => p.value === item.value)
                    return (
                      <TriggerMenuItem key={item.value} value={item.value} label={item.label}>
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.04)] group-data-highlighted/item:bg-background dark:group-data-highlighted/item:bg-popover">
                          {initials(item.label)}
                        </span>
                        <span className="truncate">{item.label}</span>
                        <span className="ms-auto shrink-0 text-[12px] text-muted-foreground">{person?.hint}</span>
                      </TriggerMenuItem>
                    )
                  })}
                </TriggerMenuGroup>
              )
            }
          </TriggerMenuList>
        </TriggerMenuContent>
      </TriggerMenu>
    </div>
  )
}
