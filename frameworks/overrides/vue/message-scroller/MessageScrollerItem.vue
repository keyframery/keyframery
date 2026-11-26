<script lang="ts">
/* One message in the scroller, keyed by `value`. A message that arrives after the first frame rises
   into place; `follow` brings the view down when it arrives, for the person's own messages. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { messageScroller } from "@/components/keyframery/core/message-scroller-core"
import { cn } from "@/lib/utils"
import { itemClass } from "./parts"

export default defineComponent({
  name: "MessageScrollerItem",
  inheritAttrs: false,
  props: {
    value: { type: String, required: true },
    follow: { type: Boolean, default: undefined },
  },
  slots: Object as PartSlots<typeof messageScroller, "item">,
  setup(props, { attrs }) {
    return usePart(
      messageScroller,
      "item",
      () => ({ value: props.value, follow: props.follow }),
      () => ({ ...attrs, class: cn(itemClass, attrs.class as string) }),
      "div",
    )
  },
})
</script>
