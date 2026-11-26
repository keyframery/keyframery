<script lang="ts">
/* A small well beside the label. Put an icon in it. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { stat } from "@/components/keyframery/core/stat-core"
import { cn } from "@/lib/utils"
import { iconClass } from "./parts"

export default defineComponent({
  name: "StatIcon",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof stat, "icon">,
  setup(_props, { attrs }) {
    return usePart(stat, "icon", undefined, () => ({ ...attrs, class: cn(iconClass, attrs.class as string) }), "div")
  },
})
</script>
