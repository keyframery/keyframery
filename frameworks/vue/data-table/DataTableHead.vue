<script lang="ts">
/* One column's header: it reports its sort with aria-sort (the primitive part, written with usePart like
   React's, keyed by `value`). Use the `#render="{ props }"` slot to draw it as your table's header cell. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { dataTable } from "@/components/keyframery/core/data-table-core"

export default defineComponent({
  name: "DataTableHead",
  inheritAttrs: false,
  props: { value: { type: String, required: true } },
  slots: Object as PartSlots<typeof dataTable, "head">,
  setup(props) {
    return usePart(dataTable, "head", () => ({ value: props.value }), undefined, "th")
  },
})
</script>
