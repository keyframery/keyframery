<script setup lang="ts">
/* The scrolling body on a sunk ground. With no content it renders the whole diff. Switching views remounts
   the body, which arrives from the side of the view chosen (split from the right, unified from the left). */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import DiffViewerBlocks from "./DiffViewerBlocks.vue"
import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

/* Token colours, as the code block has them. */
const tokens = cn(
  "[&_[data-token=keyword]]:text-ring [&_[data-token=tag]]:text-ring",
  "[&_[data-token=string]]:text-[color-mix(in_oklab,var(--destructive)_72%,var(--foreground))]",
  "[&_[data-token=number]]:text-[color-mix(in_oklab,var(--destructive)_55%,var(--ring))]",
  "[&_[data-token=comment]]:text-muted-foreground [&_[data-token=comment]]:italic",
  "[&_[data-token=function]]:font-medium [&_[data-token=function]]:text-foreground",
  "[&_[data-token=type]]:text-[color-mix(in_oklab,var(--ring)_55%,var(--foreground))]",
  "[&_[data-token=property]]:text-[color-mix(in_oklab,var(--ring)_40%,var(--foreground))]",
  "[&_[data-token=attribute]]:text-[color-mix(in_oklab,var(--ring)_55%,var(--foreground))]",
  "[&_[data-token=variable]]:text-[color-mix(in_oklab,var(--destructive)_55%,var(--ring))]",
  "[&_[data-token=punctuation]]:text-muted-foreground",
)

/* Line tints: the row a light wash of its colour, changed words stronger. */
const lines = cn(
  "[&_[data-slot=diff-viewer-line]]:grid [&_[data-slot=diff-viewer-line]]:grid-cols-[var(--diff-num)_var(--diff-num)_1.25rem_1fr]",
  "[--diff-num:calc(4ch+0.875rem)] group-data-[numbers=off]/diff-viewer:[&_[data-slot=diff-viewer-line]]:grid-cols-[0_0_1.5rem_1fr]",
  "group-data-[numbers=off]/diff-viewer:[&_[data-slot=diff-viewer-line-number]]:invisible",
  "[&_[data-slot=diff-viewer-row]]:grid [&_[data-slot=diff-viewer-row]]:grid-cols-2",
  "[&_[data-slot=diff-viewer-cell]]:grid [&_[data-slot=diff-viewer-cell]]:min-w-0 [&_[data-slot=diff-viewer-cell]]:grid-cols-[var(--diff-num)_1.25rem_1fr]",
  "group-data-[numbers=off]/diff-viewer:[&_[data-slot=diff-viewer-cell]]:grid-cols-[0_1.5rem_1fr]",
  "[&_[data-slot=diff-viewer-cell][data-side=new]]:border-s [&_[data-slot=diff-viewer-cell][data-side=new]]:border-border/60",
  "[&_[data-slot=diff-viewer-cell]_[data-slot=diff-viewer-line-content]]:whitespace-pre-wrap [&_[data-slot=diff-viewer-cell]_[data-slot=diff-viewer-line-content]]:[overflow-wrap:anywhere]",
  "[&_[data-slot=diff-viewer-cell][data-kind=empty]]:bg-[repeating-linear-gradient(135deg,transparent_0_5px,color-mix(in_oklab,var(--foreground)_4%,transparent)_5px_6px)]",
  "[&_[data-slot=diff-viewer-line-number]]:pe-2.5 [&_[data-slot=diff-viewer-line-number]]:text-end [&_[data-slot=diff-viewer-line-number]]:text-muted-foreground/55 [&_[data-slot=diff-viewer-line-number]]:tabular-nums [&_[data-slot=diff-viewer-line-number]]:select-none",
  "[&_[data-slot=diff-viewer-line-sign]]:text-center [&_[data-slot=diff-viewer-line-sign]]:select-none [&_[data-slot=diff-viewer-line-content]]:pe-4",
  "[&_[data-kind=added]]:bg-[color-mix(in_oklab,var(--diff-add)_10%,transparent)] [&_[data-kind=added]_[data-slot=diff-viewer-line-number]]:bg-[color-mix(in_oklab,var(--diff-add)_8%,transparent)]",
  "[&_[data-kind=added]_[data-slot=diff-viewer-line-number]]:text-[color:color-mix(in_oklab,var(--diff-add)_70%,var(--foreground))]",
  "[&_[data-kind=added]_[data-slot=diff-viewer-line-sign]]:text-[color:var(--diff-add)]",
  "[&_[data-kind=added]_[data-changed]]:rounded-[3px] [&_[data-kind=added]_[data-changed]]:bg-[color-mix(in_oklab,var(--diff-add)_26%,transparent)] [&_[data-kind=added]_[data-changed]]:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--diff-add)_26%,transparent)]",
  "[&_[data-kind=removed]]:bg-[color-mix(in_oklab,var(--diff-del)_8%,transparent)] [&_[data-kind=removed]_[data-slot=diff-viewer-line-number]]:bg-[color-mix(in_oklab,var(--diff-del)_6%,transparent)]",
  "[&_[data-kind=removed]_[data-slot=diff-viewer-line-number]]:text-[color:color-mix(in_oklab,var(--diff-del)_70%,var(--foreground))]",
  "[&_[data-kind=removed]_[data-slot=diff-viewer-line-sign]]:text-[color:var(--diff-del)]",
  "[&_[data-kind=removed]_[data-changed]]:rounded-[3px] [&_[data-kind=removed]_[data-changed]]:bg-[color-mix(in_oklab,var(--diff-del)_22%,transparent)] [&_[data-kind=removed]_[data-changed]]:[box-shadow:0_0_0_1px_color-mix(in_oklab,var(--diff-del)_22%,transparent)]",
  "dark:[&_[data-kind=added]]:bg-[color-mix(in_oklab,var(--diff-add)_14%,transparent)]",
  "dark:[&_[data-kind=removed]]:bg-[color-mix(in_oklab,var(--diff-del)_12%,transparent)]",
)

/* The slim rows above a hunk and after the last one: fold, range, review. */
const bars = cn(
  "[&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:sticky [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:start-0",
  "[&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:flex [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:h-[var(--diff-fold-height)] [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:w-[100cqw]",
  "[&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:items-center [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:gap-2 [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:px-1.5",
  "[&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:font-sans [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:text-[12px] [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:text-muted-foreground",
  "[&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:bg-[color-mix(in_oklab,var(--muted)_70%,var(--diff-viewer-face,var(--card)))]",
  "[&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:border-y [&_:is([data-slot=diff-viewer-hunk-header],[data-slot=diff-viewer-gap])]:border-border/50",
  "[&_[data-slot=diff-viewer-body]>:first-child]:border-t-0",
  "[&_[data-slot=diff-viewer-fold]]:inline-flex [&_[data-slot=diff-viewer-fold]]:h-6 [&_[data-slot=diff-viewer-fold]]:shrink-0 [&_[data-slot=diff-viewer-fold]]:cursor-pointer [&_[data-slot=diff-viewer-fold]]:items-center [&_[data-slot=diff-viewer-fold]]:gap-1.5 [&_[data-slot=diff-viewer-fold]]:rounded-[7px] [&_[data-slot=diff-viewer-fold]]:px-2 [&_[data-slot=diff-viewer-fold]]:font-medium [&_[data-slot=diff-viewer-fold]]:outline-none",
  "[&_[data-slot=diff-viewer-fold]_svg]:size-3.5 [&_[data-slot=diff-viewer-fold]:hover]:bg-foreground/[0.06] [&_[data-slot=diff-viewer-fold]:hover]:text-foreground [&_[data-slot=diff-viewer-fold]:focus-visible]:ring-2 [&_[data-slot=diff-viewer-fold]:focus-visible]:ring-ring",
  "[&_[data-slot=diff-viewer-fold][data-disabled]]:cursor-default [&_[data-slot=diff-viewer-fold][data-disabled]]:bg-transparent [&_[data-slot=diff-viewer-fold][data-disabled]]:text-muted-foreground",
  "[&_[data-slot=diff-viewer-range]]:min-w-0 [&_[data-slot=diff-viewer-range]]:flex-1 [&_[data-slot=diff-viewer-range]]:truncate [&_[data-slot=diff-viewer-range]]:ps-1 [&_[data-slot=diff-viewer-range]]:font-mono [&_[data-slot=diff-viewer-range]]:text-[11px] [&_[data-slot=diff-viewer-range]]:text-muted-foreground/75",
  "[&_[data-slot=diff-viewer-section]]:text-muted-foreground",
  "[&_[data-slot=diff-viewer-fold]+[data-slot=diff-viewer-range]]:@max-[30rem]/diff-viewer:hidden @max-[26rem]/diff-viewer:[&_[data-slot=diff-viewer-fold-word]]:hidden",
  "[&_[data-slot=diff-viewer-review]]:ms-auto [&_[data-slot=diff-viewer-review]]:flex [&_[data-slot=diff-viewer-review]]:shrink-0 [&_[data-slot=diff-viewer-review]]:items-center [&_[data-slot=diff-viewer-review]]:gap-1",
  "[&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:h-6 [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:cursor-pointer [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:rounded-[7px] [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:px-2.5 [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:text-[12px] [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:leading-none [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:font-medium [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo])]:outline-none",
  "[&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo]):focus-visible]:ring-2 [&_:is([data-slot=diff-viewer-accept],[data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo]):focus-visible]:ring-ring",
  "[&_:is([data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo]):hover]:bg-foreground/[0.06] [&_:is([data-slot=diff-viewer-reject],[data-slot=diff-viewer-undo]):hover]:text-foreground",
  "[&_[data-slot=diff-viewer-accept]]:bg-primary [&_[data-slot=diff-viewer-accept]]:text-primary-foreground [&_[data-slot=diff-viewer-accept]]:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] [&_[data-slot=diff-viewer-accept]:hover]:bg-primary/90",
  "[&_[data-slot=diff-viewer-status]]:inline-flex [&_[data-slot=diff-viewer-status]]:items-center [&_[data-slot=diff-viewer-status]]:gap-1 [&_[data-slot=diff-viewer-status]]:pe-1 [&_[data-slot=diff-viewer-status]]:font-medium [&_[data-slot=diff-viewer-status]_svg]:size-3.5",
  "[&_[data-slot=diff-viewer-status][data-decision=accepted]]:text-[oklch(0.62_0.16_150)] [&_[data-slot=diff-viewer-status][data-decision=rejected]]:text-muted-foreground",
  "[&_[data-slot=diff-viewer-hunk][data-decision=rejected]]:opacity-45 [&_[data-slot=diff-viewer-hunk][data-decision=rejected]]:grayscale",
)

const base = cn(
  "isolate",
  "@container min-h-0 max-h-[var(--diff-viewer-max-height,none)] min-w-0 overflow-auto font-mono text-[length:var(--diff-viewer-font,12.5px)] leading-[1.7] outline-none [scrollbar-width:thin] [--diff-fold-height:2.125rem]",
  "bg-[color-mix(in_oklab,var(--muted)_40%,var(--diff-viewer-face,var(--card)))] dark:bg-[color-mix(in_oklab,var(--muted)_30%,var(--diff-viewer-face,var(--card)))]",
  "[&_[data-slot=diff-viewer-body]]:min-w-full [&_[data-slot=diff-viewer-body]]:pb-1.5",
  "[&_[data-slot=diff-viewer-body][data-view=unified]]:w-max [&_[data-slot=diff-viewer-body][data-view=unified]_[data-slot=diff-viewer-line-content]]:whitespace-pre",
  lines,
  bars,
  tokens,
)
const body = cn(
  "[--diff-from:calc(-1*(6px+10px*var(--kf-flourish,1)))] data-[view=split]:[--diff-from:calc(6px+10px*var(--kf-flourish,1))]",
  "group-data-switched/diff-viewer:animate-[kf-diff-view_calc(300ms*var(--kf-speed,1))_var(--ease-house)_both] motion-reduce:animate-none!",
)
</script>

<template>
  <parts.Content v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="{ state }">
      <slot :state="state">
        <div :key="state.view" data-slot="diff-viewer-body" :data-view="state.view" :class="body">
          <DiffViewerBlocks :blocks="state.model.blocks" :view="state.view" :expanded="state.expanded" :review="state.review" :language="state.language" :words="state.wordDiff" />
        </div>
      </slot>
    </template>
  </parts.Content>
</template>
