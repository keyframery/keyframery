<script lang="ts">
/* The chosen option's label, over the select. Each change replays: the old label rises out, the new
   one rises in. Before the first change it simply sits there. Written with usePart, like React. */
import { defineComponent, h } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { nativeSelect } from "@/components/keyframery/core/native-select-core"
import { cn } from "@/lib/utils"
import { valueMotion } from "./parts"

export default defineComponent({
  name: "NativeSelectValue",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof nativeSelect, "value">,
  setup(_props, { attrs, slots }) {
    return usePart(
      nativeSelect,
      "value",
      () => ({}),
      () => ({ ...attrs, class: cn(valueMotion, attrs.class as string) }),
      {
        tag: "span",
        children: (state) =>
          slots.default
            ? slots.default({ state })
            : [
                state.changes > 0 && state.previous
                  ? h(
                      "span",
                      {
                        key: `out-${state.changes}`,
                        "data-slot": "native-select-value-previous",
                        class:
                          "animate-[kf-native-select-out_calc(220ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_forwards] motion-reduce:hidden",
                      },
                      state.previous,
                    )
                  : null,
                h(
                  "span",
                  {
                    key: `in-${state.changes}`,
                    class: cn(
                      state.changes > 0 &&
                        "animate-[kf-native-select-in_calc(480ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_both] motion-reduce:animate-none",
                    ),
                  },
                  state.label,
                ),
              ],
      },
    )
  },
})
</script>
