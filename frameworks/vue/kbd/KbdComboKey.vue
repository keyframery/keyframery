<script lang="ts">
/* One key of a combo. With no content it shows the key's label: "mod" is ⌘ or Ctrl. Written with
   usePart, like the React primitive: the key slot is keyed by `value`. */
import { defineComponent, type PropType } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { kbdCombo } from "@/components/keyframery/core/kbd-core"
import { cn } from "@/lib/utils"
import { kbdMotion } from "./parts"

export default defineComponent({
  name: "KbdComboKey",
  inheritAttrs: false,
  props: { value: { type: String as PropType<string>, required: true } },
  slots: Object as PartSlots<typeof kbdCombo, "key">,
  setup(props, { attrs, slots }) {
    return usePart(
      kbdCombo,
      "key",
      () => ({ value: props.value }),
      () => ({ ...attrs, class: cn(kbdMotion, attrs.class as string) }),
      { tag: "kbd", children: (state) => (slots.default ? slots.default({ state }) : state.label) },
    )
  },
})
</script>
