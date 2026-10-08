/** Starts and stops the layer. Reference-counted: several <Cuts /> (or React StrictMode) are safe. */

import { arrivalAdapter } from "./adapters/arrival"
import { errorAdapter } from "./adapters/error"
import { highlightAdapter } from "./adapters/highlight"
import { overlayAdapter } from "./adapters/overlay"
import { panelAdapter } from "./adapters/panel"
import { tabsAdapter } from "./adapters/tabs"
import { toastAdapter } from "./adapters/toast"
import { toggleAdapter } from "./adapters/toggle"
import { tunedAdapter } from "./adapters/tuned"
import { parsePace } from "./motion"
import { observe, type Adapter } from "./observe"
import { createPressTracker, type Press, type PressTracker } from "./press"

export type DialogCut = "rack-focus" | "punch-in" | "fade" | "none"
export type SheetCut = "slide-sink" | "slide" | "fade" | "none"
export type DrawerCut = "slide-sink" | "none"
export type TabsCut = "j-cut" | "whip" | "fade" | "none"
export type ToastCut = "cut-on-action" | "none"
export type Menus = { dialog?: DialogCut; sheet?: SheetCut; drawer?: DrawerCut; tabs?: TabsCut; toast?: ToastCut }

export const DEFAULT_MENUS: Required<Menus> = {
  dialog: "rack-focus",
  sheet: "slide-sink",
  drawer: "slide-sink",
  tabs: "j-cut",
  toast: "cut-on-action",
}

/** Every adapter the engine runs. Each cut group adds its factory here. */
export const ADAPTER_FACTORIES: Array<(press: PressTracker) => Adapter> = [overlayAdapter, panelAdapter, tabsAdapter, toastAdapter, tunedAdapter, toggleAdapter, highlightAdapter, errorAdapter, arrivalAdapter]

let refs = 0
let activePress: PressTracker | null = null
let stopEngine: (() => void) | null = null

function applyPace(el: HTMLElement) {
  el.style.setProperty("--kf-pace", String(parsePace(el.getAttribute("data-cut-pace"))))
}

const paceAdapter: Adapter = {
  match: "[data-cut-pace]",
  init: () => document.querySelectorAll<HTMLElement>("[data-cut-pace]").forEach(applyPace),
  added: applyPace,
  changed: (el, attribute) => {
    if (attribute === "data-cut-pace") applyPace(el)
  },
}

function install(): () => void {
  const press = createPressTracker(document)
  activePress = press
  const adapters = [paceAdapter, ...ADAPTER_FACTORIES.map((make) => make(press))]
  const disconnect = observe(document.body, adapters)
  adapters.forEach((a) => a.init?.())
  return () => {
    activePress = null
    disconnect()
    adapters.forEach((a) => a.dispose?.())
    press.dispose()
    const html = document.documentElement
    for (const name of [...html.getAttributeNames()]) if (name === "data-kf" || name.startsWith("data-kf-")) html.removeAttribute(name)
    html.style.removeProperty("--kf-pace")
  }
}

export function start(): () => void {
  refs += 1
  if (refs === 1) stopEngine = install()
  let released = false
  return () => {
    if (released) return
    released = true
    refs -= 1
    if (refs === 0 && stopEngine) {
      stopEngine()
      stopEngine = null
    }
  }
}

export function applyMenus(menus: Menus): void {
  const html = document.documentElement
  for (const [group, value] of Object.entries({ ...DEFAULT_MENUS, ...stripUndefined(menus) })) html.setAttribute(`data-kf-${group}`, value)
}

function stripUndefined(menus: Menus): Menus {
  return Object.fromEntries(Object.entries(menus).filter(([, v]) => v !== undefined)) as Menus
}

export function setEnabled(on: boolean): void {
  if (on) document.documentElement.setAttribute("data-kf", "")
  else document.documentElement.removeAttribute("data-kf")
}

/** "none" turns off every response (press, toggle, drag, fill); cuts keep playing. */
export type Responses = "on" | "none"

export function setResponses(responses: Responses | undefined): void {
  if (responses === "none") document.documentElement.setAttribute("data-kf-responses", "none")
  else document.documentElement.removeAttribute("data-kf-responses")
}

export function setPace(pace: number | undefined): void {
  if (pace === undefined) document.documentElement.style.removeProperty("--kf-pace")
  else document.documentElement.style.setProperty("--kf-pace", String(parsePace(String(pace))))
}

/** The last press, for helpers that cut from what the user pressed. Null when no <Cuts /> is running. */
export function lastPress(maxAgeMs?: number): Press | null {
  return activePress?.last(maxAgeMs) ?? null
}
