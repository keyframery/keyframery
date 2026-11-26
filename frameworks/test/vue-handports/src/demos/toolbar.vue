<script setup lang="ts">
/* Mirrors src/demos/toolbar.tsx at its defaults. */
import { ref } from "vue"
import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggle, ToolbarToggleGroup } from "@/components/keyframery/toolbar"
import { cn } from "@/lib/utils"

const alignments = [
  { value: "left", label: "Align left", d: "M2.75 4h10.5M2.75 8h6.5M2.75 12h8.5" },
  { value: "center", label: "Align center", d: "M2.75 4h10.5M4.75 8h6.5M3.75 12h8.5" },
  { value: "right", label: "Align right", d: "M2.75 4h10.5M6.75 8h6.5M4.75 12h8.5" },
]
const theme = { "--toolbar-gap": "2px", "--toolbar-radius": "12px", "--toolbar-item-radius": "8px", "--toolbar-height": "28px" }
const styles = ref<string[]>(["bold"])
const align = ref("left")
const svg = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", "stroke-width": "1.5", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" } as const
</script>

<template>
  <div :style="{ ...theme, maxWidth: '400px', alignItems: 'center', gap: '12px' }" class="relative mb-5 w-full">
    <article style="min-width: 0; flex: 1" class="rounded-[14px] bg-card px-6 pt-5 pb-10 text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <h3 class="text-[15px] font-semibold tracking-tight">Allotment, Saturday</h3>
      <p class="mt-1 text-[12px] text-muted-foreground">Edited just now</p>
      <p :class="cn('mt-4 text-[14px] leading-[1.7]', align === 'center' && 'text-center', align === 'right' && 'text-right')">
        Seed potatoes in by ten.
        <span :class="cn('rounded-[3px] bg-ring/20 box-decoration-clone px-0.5 py-0.5', styles.includes('bold') && 'font-semibold', styles.includes('italic') && 'italic', styles.includes('underline') && 'underline decoration-[1.5px] underline-offset-[3px]')">Net the brassicas before the pigeons find them.</span>
        Take the long twine.
      </p>
    </article>
    <Toolbar orientation="horizontal" :loop="true" :disabled="false" aria-label="Formatting" class="absolute -bottom-5 left-1/2 -translate-x-1/2">
      <ToolbarButton aria-label="Undo" :focusable-when-disabled="true"><svg v-bind="svg"><path d="M5.75 3.75l-3 3 3 3M3 6.75h6.5a3.25 3.25 0 010 6.5h-2" /></svg></ToolbarButton>
      <ToolbarButton aria-label="Redo" :disabled="true" :focusable-when-disabled="true"><svg v-bind="svg"><path d="M10.25 3.75l3 3-3 3M13 6.75H6.5a3.25 3.25 0 000 6.5h2" /></svg></ToolbarButton>
      <ToolbarSeparator />
      <ToolbarToggleGroup :multiple="true" orientation="horizontal" :loop="true" :value="styles" @value-change="(v: any) => (styles = v)" aria-label="Text style">
        <ToolbarToggle value="bold" aria-label="Bold"><span class="font-bold">B</span></ToolbarToggle>
        <ToolbarToggle value="italic" aria-label="Italic"><span class="italic">I</span></ToolbarToggle>
        <ToolbarToggle value="underline" aria-label="Underline"><span class="underline decoration-[1.5px] underline-offset-[3px]">U</span></ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarToggleGroup :value="align ? [align] : []" orientation="horizontal" :loop="true" @value-change="(v: any) => (align = v[0] ?? '')" :deselectable="false" aria-label="Alignment">
        <ToolbarToggle v-for="a in alignments" :key="a.value" :value="a.value" :aria-label="a.label"><svg v-bind="svg"><path :d="a.d" /></svg></ToolbarToggle>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarButton :focusable-when-disabled="true" class="px-2" data-play="link">
        <svg v-bind="svg"><path d="M6.9 9.1a2.6 2.6 0 003.7 0l1.9-1.9a2.6 2.6 0 00-3.7-3.7l-.7.7M9.1 6.9a2.6 2.6 0 00-3.7 0L3.5 8.8a2.6 2.6 0 003.7 3.7l.7-.7" /></svg>
        Link
      </ToolbarButton>
    </Toolbar>
  </div>
</template>
