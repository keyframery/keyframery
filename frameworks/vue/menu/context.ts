/* What the root shares with its parts (React's MenuSharedContext): the menu as data, which parts were
   placed, and whether the menu only opens from a right-click area (it then unfolds from the pointer). */
import { inject, onBeforeUnmount, onMounted, type ComputedRef, type InjectionKey } from "vue"
import type { MenuData } from "@ui-sdk/vue/menu"

export type MenuPartKind = "content" | "trigger" | "context"
export type MenuShared = {
  items: ComputedRef<MenuData | undefined>
  register: (kind: MenuPartKind) => () => void
  fromPointer: ComputedRef<boolean>
}
export const menuSharedKey: InjectionKey<MenuShared> = Symbol("kf-menu-shared")

/* A part says it was placed while it is mounted. */
export function useMenuPart(kind: MenuPartKind) {
  const shared = inject(menuSharedKey, null)
  let off: (() => void) | undefined
  onMounted(() => (off = shared?.register(kind)))
  onBeforeUnmount(() => off?.())
  return shared
}
