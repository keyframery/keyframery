/* The menu as data, shared with its content (React's MenuDataContext), and how many contents are placed. */
import { inject, onBeforeUnmount, onMounted, type ComputedRef, type InjectionKey } from "vue"
import type { MenuData } from "@ui-sdk/vue/menu"

export type MenuDataShared = { items: ComputedRef<MenuData | undefined>; place: () => () => void }
export const menuDataKey: InjectionKey<MenuDataShared> = Symbol("kf-menubar-menu-data")

/* A content says it was placed while it is mounted. */
export function usePlaced() {
  const data = inject(menuDataKey, null)
  let off: (() => void) | undefined
  onMounted(() => (off = data?.place()))
  onBeforeUnmount(() => off?.())
}
