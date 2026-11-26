/* The direction an element is laid out in, kept current as any `dir` in the page changes (React's useDirection).
   Pass a template ref to read it where that element sits; without one it reads the page's. */
import { onBeforeUnmount, onMounted, ref, type Ref } from "vue"

import { type Dir, directionOf, watchDirection } from "@/components/keyframery/core/direction-core"

export function useDirection(target?: Ref<Element | { $el?: Element } | null | undefined>): Ref<Dir> {
  const dir = ref<Dir>("ltr")
  let stop: (() => void) | undefined
  onMounted(() => {
    const value = target?.value
    const el = (value instanceof Element ? value : value?.$el instanceof Element ? value.$el : null) ?? document.documentElement
    dir.value = directionOf(el)
    stop = watchDirection(el, (next) => (dir.value = next))
  })
  onBeforeUnmount(() => stop?.())
  return dir
}
