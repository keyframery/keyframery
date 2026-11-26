<script lang="ts">
/* The table, in a container that scrolls sideways when the table is wider than it. The container is
   a part too (`table-container`) and marks the sides it can scroll toward with `data-scroll-start`
   and `data-scroll-end`. Written with usePrimitive + usePart, like the React primitive. */
import { defineComponent, type PropType } from "vue"
import { type PartSlots, usePart, usePrimitive } from "@ui-sdk/vue/primitive"

import { table } from "@/components/keyframery/core/table-core"
import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { containerMotion, tableClass } from "./parts"

export default defineComponent({
  name: "Table",
  inheritAttrs: false,
  props: {
    /** How fast the component moves: "fast", "normal", "slow" or a multiplier. */
    speed: { type: [String, Number] as PropType<Speed>, default: undefined },
  },
  slots: Object as PartSlots<typeof table, "root">,
  setup(props, { attrs }) {
    const handle = usePrimitive(table, () => ({}))
    const speedStyle = useSpeed(() => props.speed)
    const inner = usePart(handle, "root", undefined, () => ({ ...attrs, class: cn(tableClass, attrs.class as string) }), "table")
    return usePart(
      handle,
      "container",
      undefined,
      () => ({ class: containerMotion, style: speedStyle.value }),
      { tag: "div", children: () => inner() },
    )
  },
})
</script>

<style>
/* kf-table: the keyframes this part animates with (React's <style href="kf-table">), shipped with the component. */
@keyframes kf-table-row{from{opacity:0;translate:0 6px;filter:blur(3px)}}[data-slot=table-body]>tr:nth-child(1){--kf-row:0}[data-slot=table-body]>tr:nth-child(2){--kf-row:1}[data-slot=table-body]>tr:nth-child(3){--kf-row:2}[data-slot=table-body]>tr:nth-child(4){--kf-row:3}[data-slot=table-body]>tr:nth-child(5){--kf-row:4}[data-slot=table-body]>tr:nth-child(6){--kf-row:5}[data-slot=table-body]>tr:nth-child(7){--kf-row:6}[data-slot=table-body]>tr:nth-child(8){--kf-row:7}[data-slot=table-body]>tr:nth-child(9){--kf-row:8}[data-slot=table-body]>tr:nth-child(10){--kf-row:9}[data-slot=table-body]>tr:nth-child(11){--kf-row:10}[data-slot=table-body]>tr:nth-child(12){--kf-row:11}[data-slot=table-body]>tr:nth-child(n+13){--kf-row:12}
</style>
