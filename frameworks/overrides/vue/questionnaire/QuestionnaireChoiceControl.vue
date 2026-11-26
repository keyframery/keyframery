<script lang="ts">
/* The radio or checkbox for the choice around it: Keyframery's. Use the choice's `control` slot to
   render your own. */
import { defineComponent, h, type PropType } from "vue"

import { Checkbox } from "@/components/keyframery/checkbox"
import { Radio } from "@/components/keyframery/radio"

export default defineComponent({
  name: "QuestionnaireChoiceControl",
  props: {
    value: { type: String, required: true },
    type: { type: String as PropType<"radio" | "checkbox">, required: true },
    disabled: { type: Boolean, default: undefined },
  },
  setup(props) {
    return () =>
      props.type === "checkbox"
        ? h(Checkbox as any, { value: props.value, disabled: props.disabled })
        : h(Radio as any, { value: props.value, disabled: props.disabled, class: "data-checked:[anchor-name:none]" })
  },
})
</script>
