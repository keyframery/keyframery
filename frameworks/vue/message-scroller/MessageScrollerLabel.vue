<script lang="ts">
/* The words on the jump-to-latest button: "Jump to latest", or how many new messages wait, with the
   count rolling up (each digit a column of 0 to 9 that slides to its value). Pass your own content
   in the default slot, which receives `{ state: { unread } }`. */
import { defineComponent, h } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { messageScroller } from "@/components/keyframery/core/message-scroller-core"

function roll(value: number) {
  const text = value > 99 ? "99" : String(value)
  return h("span", { "aria-hidden": "true", class: "inline-flex h-[1em] overflow-hidden leading-none tabular-nums" }, [
    ...text.split("").map((digit, index) =>
      h(
        "span",
        {
          key: text.length - index,
          style: { "--d": Number(digit) },
          class:
            "flex flex-col transition-[translate] duration-[calc(500ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring [translate:0_calc(var(--d)*-1em)] motion-reduce:transition-none",
        },
        Array.from({ length: 10 }, (_, d) => h("span", { key: d, class: "h-[1em]" }, String(d))),
      ),
    ),
    value > 99 ? "+" : null,
  ])
}

export default defineComponent({
  name: "MessageScrollerLabel",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof messageScroller, "label">,
  setup(_props, { attrs, slots }) {
    return usePart(messageScroller, "label", () => ({}), () => attrs, {
      tag: "span",
      children: (state) =>
        slots.default
          ? slots.default({ state })
          : state.unread
            ? [h("span", { class: "sr-only" }, String(state.unread)), roll(state.unread), ` new ${state.unread === 1 ? "message" : "messages"}`]
            : "Jump to latest",
    })
  },
})
</script>
