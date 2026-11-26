<script lang="ts">
/* The sidebar. It narrows to a rail (labels leave first, and rise back in after the width opens);
   on a narrow shell it slides in over the page as a sheet, over a scrim that closes it. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sidebar } from "@/components/keyframery/core/sidebar-core"
import { cn } from "@/lib/utils"
import { scrimClass, sidebarClass } from "./parts"

export default defineComponent({
  name: "Sidebar",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof sidebar, "root">,
  setup(_, { attrs }) {
    const scrim = usePart(sidebar, "scrim", undefined, () => ({ class: scrimClass }), { tag: "div", children: () => null })
    const aside = usePart(sidebar, "root", undefined, () => ({ ...attrs, class: cn(sidebarClass, attrs.class as string) }), "aside")
    return () => [scrim(), aside()]
  },
})
</script>

<style>
/* kf-sidebar: the keyframes this part animates with (React's <style href="kf-sidebar">), shipped with the component. */
@keyframes kf-sidebar-badge{from{scale:.6;opacity:0}}
</style>
