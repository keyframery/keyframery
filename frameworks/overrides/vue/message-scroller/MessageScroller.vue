<script lang="ts">
/* The scroller: a box holding Keyframery's scroll area, which keeps the newest message in view
   (`stickToEnd`) and owns "jump to latest". The core adds history, the unread count and following
   your own messages. Give it a height (or put it in a column that has one). */
import { defineComponent, h, type PropType } from "vue"
import type { ChangeDetails } from "@ui-sdk/core"
import { type PartSlots, usePart, usePrimitive } from "@ui-sdk/vue/primitive"
import { createScrollAreaController } from "@ui-sdk/vue/scroll-area"

import { messageScroller, type MessageScrollerUnreadReason } from "@/components/keyframery/core/message-scroller-core"
import { ScrollArea, ScrollAreaScrollbar, ScrollAreaThumb } from "@/components/keyframery/scroll-area"
import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { rootClass } from "./parts"

type ScrollAreaController = ReturnType<typeof createScrollAreaController>

export default defineComponent({
  name: "MessageScroller",
  inheritAttrs: false,
  props: {
    /** The scroll area's controller. Pass one to scroll from your own code; one is made otherwise. */
    controller: { type: Object as PropType<ScrollAreaController>, default: undefined },
    /** Keeps the newest message in view as the conversation grows. On by default. */
    stickToEnd: { type: Boolean, default: true },
    /** How many messages arrived while the reader was away from the end. */
    unread: { type: Number, default: undefined },
    defaultUnread: { type: Number, default: undefined },
    speed: { type: [String, Number] as PropType<Speed>, default: undefined },
  },
  emits: {
    unreadChange: (_unread: number, _details: ChangeDetails<MessageScrollerUnreadReason>) => true,
    "update:unread": (_unread: number) => true,
  },
  slots: Object as PartSlots<typeof messageScroller, "root">,
  setup(props, { attrs, slots, emit }) {
    const own = createScrollAreaController()
    const scroller = () => props.controller ?? own
    const handle = usePrimitive(messageScroller, () => ({
      scroller: scroller(),
      unread: props.unread,
      defaultUnread: props.defaultUnread,
      onUnreadChange: (unread: number, details: ChangeDetails<MessageScrollerUnreadReason>) => {
        emit("unreadChange", unread, details)
        if (!details.canceled) emit("update:unread", unread)
      },
    }))
    const speedStyle = useSpeed(() => props.speed)
    return usePart(
      handle,
      "root",
      () => ({}),
      () => ({ ...attrs, style: [speedStyle.value, attrs.style], class: cn(rootClass, attrs.class as string) }),
      {
        tag: "div",
        children: (state) =>
          h(
            ScrollArea,
            { controller: scroller(), stickToEnd: props.stickToEnd, class: "min-h-0 flex-1 rounded-[inherit]" },
            { default: () => [slots.default?.({ state }), h(ScrollAreaScrollbar, null, { default: () => h(ScrollAreaThumb) })] },
          ),
      },
    )
  },
})
</script>
