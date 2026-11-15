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

export default function TriggerMenuDemo() {
  const [menu] = React.useState(createTriggerMenuController)
  return (
    <div className="w-[400px]">
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor="trip-reply" className="text-[13px] leading-none font-medium">
          Reply to moving day
        </label>
        <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
          {[
            { id: "kf-mention", char: "@", label: "people" },
            { id: "kf-action", char: "/", label: "actions" },
          ].map((t) => (
            <button
              key={t.id}
              id={t.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => menu.open({ trigger: t.char })}
              className="flex h-6 cursor-pointer items-center gap-1.5 rounded-[7px] px-1.5 outline-none transition-[scale,color] duration-200 ease-pop hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] motion-reduce:transition-none"
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
        controller={menu}
        triggers={[
          { char: "@", items: people, spaces: 1 },
          { char: "/", items: actions, insert: (item) => `/${item.label} ` },
        ]}
      >
        <TriggerMenuInput
          id="trip-reply"
          spellCheck={false}
          placeholder="Van comes at eight. Who is bringing tape?"
        />
        <TriggerMenuStatus />
        <TriggerMenuContent className="w-60">
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
