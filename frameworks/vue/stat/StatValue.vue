<script lang="ts">
/* The number. With no content its formatted value Rolls to each new number. */
import { defineComponent, h } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { stat } from "@/components/keyframery/core/stat-core"
import { cn } from "@/lib/utils"
import { valueClass } from "./parts"
import Roll from "./Roll.vue"
export default defineComponent({
  name: "StatValue",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof stat, "value">,
  setup(_props, { attrs, slots }) {
    return usePart(stat, "value", undefined, () => ({ ...attrs, class: cn(valueClass, attrs.class as string) }), { tag: "div", children: (state) => (slots.default ? slots.default({ state }) : h(Roll, { text: state.text })) })
  },
})
</script>
