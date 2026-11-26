/* React: children ?? ((state) => (state.items ? <CommandItems items={state.items} /> : null)). */
export default (src, { replace }) => {
  src = replace(src, `import { cn } from "@/lib/utils"`, `import { cn } from "@/lib/utils"\nimport CommandItems from "./CommandItems.vue"`)
  const m = src.match(/( *)<template v-if="scope\?\.state\?\.items">[\s\S]*?<template v-else>[\s\S]*?<\/template>\n/)
  if (!m) throw new Error("CommandList: generated default changed")
  return src.replace(m[0], `${m[1]}<CommandItems v-if="scope?.state?.items" :items="scope.state.items" />\n`)
}
