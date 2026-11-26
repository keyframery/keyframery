/* Lets rows rendered from data know whether the tree has checkboxes. */
import type { InjectionKey, Ref } from "vue"

export const checkableKey: InjectionKey<Ref<boolean>> = Symbol("kf-tree-checkable")
