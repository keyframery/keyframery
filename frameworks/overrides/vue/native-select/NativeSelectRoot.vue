<script lang="ts">
/* The wrapper <div> that owns the select's state, for composing the parts yourself. Written with
   usePrimitive + usePart (not createParts' Root) so it can ask the select to show its value once
   the options are in the page: in Vue the control binds before its element is registered, so the
   first label would otherwise stay empty until the first change. */
import { defineComponent, nextTick, onMounted, type PropType } from "vue"
import { type PartSlots, usePart, usePrimitive } from "@ui-sdk/vue/primitive"
import type { ChangeDetails } from "@ui-sdk/core"

import { nativeSelect, type NativeSelectValueChangeReason } from "@/components/keyframery/core/native-select-core"

export default defineComponent({
  name: "NativeSelectRoot",
  inheritAttrs: false,
  props: {
    value: { type: String, default: undefined },
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    size: { type: String as PropType<"sm" | "default">, default: undefined },
    disabled: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
  },
  emits: {
    valueChange: (_value: string, _details: ChangeDetails<NativeSelectValueChangeReason>) => true,
    "update:value": (_value: string) => true,
    "update:modelValue": (_value: string) => true,
  },
  slots: Object as PartSlots<typeof nativeSelect, "root">,
  setup(props, { emit }) {
    const handle = usePrimitive(nativeSelect, () => ({
      value: props.value ?? props.modelValue,
      defaultValue: props.defaultValue,
      size: props.size,
      disabled: props.disabled,
      invalid: props.invalid,
      onValueChange: (value: string, details: ChangeDetails<NativeSelectValueChangeReason>) => {
        emit("valueChange", value, details)
        if (!details.canceled) {
          emit("update:value", value)
          emit("update:modelValue", value)
        }
      },
    }))
    onMounted(() => nextTick(() => handle.api.show()))
    return usePart(handle, "root", undefined, undefined, "div")
  },
})
</script>
