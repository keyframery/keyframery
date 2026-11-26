<script setup lang="ts">
// Your own elements
// `components` swaps any element by its tag name, and `codeBlock` replaces fenced code. Each gets the element's props, including its `data-slot`, so the styles still reach it. Keep the object outside render.

import { h } from "vue"

import { Markdown, type MarkdownComponents } from "@/components/keyframery/markdown"

const components: MarkdownComponents = {
  a: (props: Record<string, unknown>) => h("a", { ...props, class: "font-medium text-primary" }),
}
</script>

<template>
  <Markdown class="max-w-[380px]" :components="components">Your refund is on its way. Track it in [your orders](#orders) or reply here with the order number.</Markdown>
</template>
