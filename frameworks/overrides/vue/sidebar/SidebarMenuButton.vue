<script lang="ts">
/* A page in the sidebar: a button, or a link when it has `href`. `isActive` marks the current page;
   `tooltip` names it while the sidebar is a rail. Items give under the pointer and spring back. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sidebar } from "@/components/keyframery/core/sidebar-core"
import { cn } from "@/lib/utils"
import { menuButtonClass } from "./parts"

export default defineComponent({
  name: "SidebarMenuButton",
  inheritAttrs: false,
  props: {
    id: { type: String, default: undefined },
    /** Marks the current page. */
    isActive: { type: Boolean, default: undefined },
    /** Names the item while the sidebar is a rail, as a native tooltip. */
    tooltip: { type: String, default: undefined },
    /** Makes the item a link. Set it when the item is created: the element doesn't switch later. */
    href: { type: String, default: undefined },
  },
  slots: Object as PartSlots<typeof sidebar, "menu-button">,
  setup(props, { attrs }) {
    return usePart(
      sidebar,
      "menu-button",
      () => ({ id: props.id, isActive: props.isActive, tooltip: props.tooltip, href: props.href }),
      () => ({ ...attrs, class: cn(menuButtonClass, attrs.class as string) }),
      props.href === undefined ? "button" : "a",
    )
  },
})
</script>
