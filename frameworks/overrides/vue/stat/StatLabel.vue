<script lang="ts">
/* The label. With no content it shows the stat's label. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { stat } from "@/components/keyframery/core/stat-core"
import { cn } from "@/lib/utils"
import { labelClass } from "./parts"

export default defineComponent({
  name: "StatLabel",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof stat, "label">,
  setup(_props, { attrs, slots }) {
    return usePart(stat, "label", undefined, () => ({ ...attrs, class: cn(labelClass, attrs.class as string) }), { tag: "div", children: (state) => (slots.default ? slots.default({ state }) : state.label) })
  },
})
</script>
