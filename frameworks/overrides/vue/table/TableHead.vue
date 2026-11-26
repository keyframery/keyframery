<script lang="ts">
/* A column header. With `sort` and `@sort` (or `default-sort` and `@sort-change` / `v-model:sort`) it
   holds a button, so the whole label is the target; the arrow turns over on a spring when the
   direction flips, and fades in when the column becomes the sorted one. Written with usePrimitive +
   usePart, like the React primitive: listeners are read as props so only a header that listens is
   sortable. */
import { defineComponent, h, type PropType } from "vue"
import type { ChangeDetails } from "@ui-sdk/core"
import { type PartSlots, usePart, usePrimitive } from "@ui-sdk/vue/primitive"

import { type SortDirection, tableHead } from "@/components/keyframery/core/table-core"
import { cn } from "@/lib/utils"
import { arrowClass, headClass } from "./parts"

type SortHandler = (sort: SortDirection, details: ChangeDetails<"press">) => void

export default defineComponent({
  name: "TableHead",
  inheritAttrs: false,
  props: {
    /** How this column is sorted, controlled. */
    sort: { type: String as PropType<SortDirection>, default: undefined },
    /** How this column is sorted at first, when you don't control `sort`. Makes the header sortable. */
    defaultSort: { type: String as PropType<SortDirection>, default: undefined },
    /** Runs when the header is pressed, with the direction it turns to. Makes the header sortable. */
    onSort: { type: Function as PropType<SortHandler>, default: undefined },
    /** Runs when the sort changes. Makes the header sortable. */
    onSortChange: { type: Function as PropType<SortHandler>, default: undefined },
    "onUpdate:sort": { type: Function as PropType<(sort: SortDirection) => void>, default: undefined },
  },
  slots: Object as PartSlots<typeof tableHead, "head">,
  setup(props, { attrs, slots }) {
    const handle = usePrimitive(tableHead, () => {
      const update = props["onUpdate:sort"]
      const change = props.onSortChange
      return {
        sort: props.sort,
        defaultSort: props.defaultSort,
        onSort: props.onSort,
        onSortChange:
          change || update
            ? (sort: SortDirection, details: ChangeDetails<"press">) => {
                change?.(sort, details)
                if (!details.canceled) update?.(sort)
              }
            : undefined,
      }
    })
    const arrow = usePart(
      handle,
      "sort-arrow",
      undefined,
      () => ({
        viewBox: "0 0 16 16",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 1.5,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        class: arrowClass,
      }),
      { tag: "svg", children: () => h("path", { d: "M8 12.5v-9M4.5 7 8 3.5 11.5 7" }) },
    )
    const button = usePart(handle, "sort", undefined, () => ({}), {
      tag: "button",
      children: () => [slots.default?.({ state: handle.state as never }), arrow()],
    })
    return usePart(handle, "head", undefined, () => {
      /* React's `colSpan` / `rowSpan` names work too; they render as `colspan` / `rowspan`. */
      const { "col-span": colSpan, colSpan: colSpan2, "row-span": rowSpan, rowSpan: rowSpan2, ...rest } = attrs as Record<string, unknown>
      const spans = { colspan: colSpan ?? colSpan2, rowspan: rowSpan ?? rowSpan2 }
      return { ...rest, ...(spans.colspan !== undefined ? { colspan: spans.colspan } : {}), ...(spans.rowspan !== undefined ? { rowspan: spans.rowspan } : {}), class: cn(headClass, attrs.class as string) }
    }, {
      tag: "th",
      children: (state) => (state.sortable ? button() : slots.default?.({ state })),
    })
  },
})
</script>
