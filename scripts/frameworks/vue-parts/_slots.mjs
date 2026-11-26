/* For patches: a generated root that only forwards slots (<template v-for="name in slotNames">) gets
   its own default content. `inner` is rendered in the default slot's fallback (indent it from 0;
   it is re-indented), with `scope` the part's slot props ({ state }). */
export function withDefault(src, replace, inner) {
  const m = src.match(/\n( *)<template v-for="name in slotNames" :key="name" #\[name\]="s">\n *<slot :name="name" v-bind="s \?\? \{\}" \/>\n *<\/template>/)
  if (!m) throw new Error("withDefault: no slot-forwarding root")
  const pad = m[1]
  const body = inner.split("\n").map((l) => pad + "    " + l).join("\n")
  src = replace(
    src,
    m[0],
    `\n${pad}<template #default="scope">\n${pad}  <slot v-bind="scope ?? {}">\n${body}\n${pad}  </slot>\n${pad}</template>\n${pad}<template v-for="name in namedSlots" :key="name" #[name]="s">\n${pad}  <slot :name="name" v-bind="s ?? {}" />\n${pad}</template>`,
  )
  return src.replace(`const slotNames = computed(() => Object.keys(slots))\n`, "")
}
