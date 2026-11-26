<script lang="ts">
/* One number: label, value and delta by default (motion-only parts, as in React). Written with usePrimitive + usePart, like the
   React primitive. Style `data-trend`, `data-tone` and `data-loading`. */
import { defineComponent, h, type PropType } from "vue"
import { type PartSlots, usePart, usePrimitive } from "@ui-sdk/vue/primitive"

import { stat, type StatDeltaFormatter, type StatValueFormatter } from "@/components/keyframery/core/stat-core"
import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { statClass } from "./parts"
import { BareStatDelta, BareStatLabel, BareStatValue } from "./bare"

export default defineComponent({
  name: "Stat",
  inheritAttrs: false,
  props: {
    /** What the number is, like "Revenue". Names the stat for screen readers and agents. */
    label: { type: String, default: undefined },
    /** The number. `null` while there is none. */
    value: { type: Number as PropType<number | null>, default: undefined },
    /** Formats the value, like `(v) => "$" + v.toLocaleString()`. */
    formatValue: { type: Function as PropType<StatValueFormatter>, default: undefined },
    /** The change against the comparison period, as a share: 0.124 is up 12.4%. `null` for none. */
    delta: { type: Number as PropType<number | null>, default: undefined },
    /** Formats the delta's size. Defaults to "12.4%". */
    formatDelta: { type: Function as PropType<StatDeltaFormatter>, default: undefined },
    /** A fall is good news (refunds, churn, costs): the tone turns round. */
    downIsGood: { type: Boolean, default: undefined },
    /** A delta smaller than this counts as flat. Defaults to 0.0005 (0.05%). */
    flatThreshold: { type: Number, default: undefined },
    /** Shows placeholders at the parts' own size instead of the numbers. */
    loading: { type: Boolean, default: undefined },
    /** How fast the component moves: "fast", "normal", "slow" or a multiplier. */
    speed: { type: [String, Number] as PropType<Speed>, default: undefined },
  },
  slots: Object as PartSlots<typeof stat, "root">,
  setup(props, { attrs, slots }) {
    const handle = usePrimitive(stat, () => ({
      label: props.label,
      value: props.value,
      formatValue: props.formatValue,
      delta: props.delta,
      formatDelta: props.formatDelta,
      downIsGood: props.downIsGood,
      flatThreshold: props.flatThreshold,
      loading: props.loading,
    }))
    const speedStyle = useSpeed(() => props.speed)
    return usePart(
      handle,
      "root",
      undefined,
      () => ({ ...attrs, class: cn(statClass, attrs.class as string), style: [speedStyle.value, attrs.style as any] }),
      { tag: "div", children: (state) => (slots.default ? slots.default({ state }) : [h(BareStatLabel), h(BareStatValue), h(BareStatDelta)]) },
    )
  },
})
</script>

<style>
/* kf-stat: the keyframes this part animates with (React's <style href="kf-stat">), shipped with the component. */
@keyframes kf-stat-part{from{opacity:0;translate:0 10px;filter:blur(5px)}}
</style>
