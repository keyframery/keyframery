/* React: children = defaultRenderToast. Every toast renders this unless the region gets a default slot
   (which receives { toast }, as UI SDK's region gives it). */
import { withDefault } from "../_slots.mjs"
export default (src, { replace }) => {
  src = replace(src, `import { cn } from "@/lib/utils"`, `import { cn } from "@/lib/utils"\nimport Toast from "./Toast.vue"\nimport ToastAction from "./ToastAction.vue"\nimport ToastClose from "./ToastClose.vue"\nimport ToastDescription from "./ToastDescription.vue"\nimport ToastIcon from "./ToastIcon.vue"\nimport ToastTitle from "./ToastTitle.vue"`)
  /* UI SDK's React region writes the empty stack's sizes (0px, count 0) at rest; the Vue one writes
     them only once a toast arrives, so the region's height had nothing to transition from. Seed them
     once on mount, on the element (not in the render, which would write them again on every update). */
  src = replace(src, `import { computed, useAttrs, useSlots } from "vue"`, `import { computed, onMounted, ref, useAttrs, useSlots } from "vue"`)
  src = replace(
    src,
    `const slots = useSlots()`,
    `const regionRef = ref<any>(null)
onMounted(() => {
  const el: HTMLElement | undefined = regionRef.value?.$el ?? regionRef.value
  if (!(el instanceof HTMLElement)) return
  for (const [k, v] of [["--toast-front-height", "0px"], ["--toast-stack-height", "0px"], ["--toast-count", "0"]]) if (!el.style.getPropertyValue(k)) el.style.setProperty(k, v)
})
const slots = useSlots()`,
  )
  src = src.replace(/<ToastRegionPart /, '<ToastRegionPart ref="regionRef" ')
  return withDefault(
    src,
    replace,
    `<Toast>
  <ToastIcon :type="scope?.toast?.type" />
  <div class="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
    <ToastTitle />
    <ToastDescription />
  </div>
  <ToastAction v-if="scope?.toast?.action" />
  <ToastClose v-if="scope?.toast?.dismissible !== false" />
</Toast>`,
  )
}
