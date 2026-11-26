/* The context menu's own classes, as in the React primitive and ui files. */
import { cn } from "@/lib/utils"

/* Unfold from the point: no travel, a deeper scale and blur, the same spring in and quick fade out.
   The fade and a 0.95 scale are feedback; the deeper scale and the blur scale with --kf-flourish. */
export const contextMenuMotion = cn(
  "data-starting-style:[translate:0_0] data-starting-style:scale-[calc(0.95-0.35*var(--kf-flourish,1))] data-starting-style:blur-[calc(8px*var(--kf-flourish,1))]",
  "data-ending-style:scale-[0.94]",
  "motion-reduce:data-starting-style:scale-100 motion-reduce:data-starting-style:blur-none motion-reduce:data-ending-style:scale-100",
)

/* The context-menu theme variables, mapped onto the menu's. */
export const contextTheme =
  "[--menu-surface:var(--context-menu-face,var(--popover))] [--menu-ink:var(--context-menu-ink,var(--popover-foreground))] [--menu-highlight:var(--context-menu-accent,var(--accent))] [--menu-danger:var(--context-menu-danger,var(--destructive))] [--menu-radius:var(--context-menu-radius,14px)] [--menu-item-radius:var(--context-menu-item-radius,8px)] [--menu-row-height:var(--context-menu-row-height,2rem)]"
