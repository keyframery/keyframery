/* React's useControlState: the label watches the control it names (its `for` target, or the control
   it wraps) and mirrors data-focused (focus anywhere inside it) and data-invalid (it, or a part of
   it, is marked invalid) for CSS. Nothing about naming, focus or presses changes. */
export default (src, { replace }) => {
  src = replace(src, `import { computed, useAttrs, useSlots } from "vue"`, `import { computed, onBeforeUnmount, ref, useAttrs, useSlots, watch } from "vue"`)
  src = replace(
    src,
    `const slots = useSlots()`,
    `const INVALID = '[aria-invalid="true"],[data-invalid]'
const labelRef = ref<any>(null)
const focused = ref(false)
const invalid = ref(false)
let stop: (() => void) | undefined
watch(
  [labelRef, () => attrs.for ?? attrs.htmlFor],
  ([instance, htmlFor]) => {
    stop?.()
    stop = undefined
    const node: HTMLElement | null = instance?.$el ?? instance ?? null
    if (!node || !(node instanceof HTMLElement)) return
    const doc = node.ownerDocument
    const control = () => (htmlFor ? doc.getElementById(String(htmlFor)) : null) ?? node
    const readFocus = () => {
      const active = doc.activeElement
      focused.value = !!active && active !== doc.body && (control().contains(active) || node.contains(active))
    }
    const readInvalid = () => {
      const el = control()
      invalid.value = el.matches(INVALID) || !!el.querySelector(INVALID)
    }
    readFocus()
    readInvalid()
    doc.addEventListener("focusin", readFocus)
    doc.addEventListener("focusout", readFocus)
    const target = htmlFor ? doc.getElementById(String(htmlFor)) : node
    const observer = new MutationObserver(readInvalid)
    if (target) observer.observe(target, { attributes: true, subtree: true, attributeFilter: ["aria-invalid", "data-invalid"] })
    stop = () => {
      doc.removeEventListener("focusin", readFocus)
      doc.removeEventListener("focusout", readFocus)
      observer.disconnect()
    }
  },
  { flush: "post" },
)
onBeforeUnmount(() => stop?.())
const slots = useSlots()`,
  )
  src = replace(src, `<LabelPart v-bind="forwarded"`, `<LabelPart ref="labelRef" :data-focused="focused || undefined" :data-invalid="invalid || undefined" v-bind="forwarded"`)
  return src
}
