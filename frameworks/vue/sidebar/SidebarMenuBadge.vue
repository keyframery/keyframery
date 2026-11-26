<script lang="ts">
/* A count that pops when its number changes, and steps aside on the rail. */
import { defineComponent, h, Text, type VNode } from "vue"

import { cn } from "@/lib/utils"
import { badgeClass, parts } from "./parts"

/* The text of plain content, to key the pop on: a new number remounts it. */
function textOf(nodes: VNode[] | undefined): string | undefined {
  const only = nodes?.length === 1 ? nodes[0] : undefined
  if (!only || only.type !== Text) return undefined
  return String(only.children)
}

export default defineComponent({
  name: "SidebarMenuBadge",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => {
      const { class: _class, ...rest } = attrs
      return h(parts.MenuBadge, { ...rest, class: cn(badgeClass, attrs.class as string) }, {
        default: (scope: any) => {
          const content = slots.default?.(scope)
          return h(
            "span",
            {
              key: textOf(content),
              class: "inline-block animate-[kf-sidebar-badge_calc(320ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)] motion-reduce:animate-none",
            },
            content,
          )
        },
      })
    }
  },
})
</script>
