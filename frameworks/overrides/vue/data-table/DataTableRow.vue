<script lang="ts">
/* One row: data-selected and aria-selected while selected (the primitive part, written with usePart like
   React's, keyed by `value`). Use the `#render="{ props }"` slot to draw it as your table's row. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { dataTable } from "@/components/keyframery/core/data-table-core"

export default defineComponent({
  name: "DataTableRow",
  inheritAttrs: false,
  props: { value: { type: String, required: true } },
  slots: Object as PartSlots<typeof dataTable, "row">,
  setup(props) {
    return usePart(dataTable, "row", () => ({ value: props.value }), undefined, "tr")
  },
})
</script>
