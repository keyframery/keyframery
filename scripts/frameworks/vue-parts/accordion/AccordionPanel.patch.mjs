/* React: plain text in the panel is wrapped in a <p>, so it has an element to cascade. */
export default (src, { replace }) => {
  const m = src.match(/\n( *)<template v-for="name in slotNames" :key="name" #\[name\]="s">\n *<slot :name="name" v-bind="s \?\? \{\}" \/>\n *<\/template>/)
  if (!m) throw new Error("AccordionPanel: generated root changed")
  const pad = m[1]
  src = replace(src, m[0], `\n${pad}<template v-if="slots.default" #default="scope">\n${pad}  <TextAsParagraphs :nodes="slots.default?.(scope)" />\n${pad}</template>\n${pad}<template v-for="name in namedSlots" :key="name" #[name]="s">\n${pad}  <slot :name="name" v-bind="s ?? {}" />\n${pad}</template>`)
  src = replace(src, `const slotNames = computed(() => Object.keys(slots))\n`, "")
  return replace(src, `import { cn } from "@/lib/utils"`, `import { TextAsParagraphs } from "@/lib/keyframery"\nimport { cn } from "@/lib/utils"`)
}
