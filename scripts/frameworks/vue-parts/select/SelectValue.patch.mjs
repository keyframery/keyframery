/* React's primitive renders the value through `render`: the text sits in a span keyed by its label,
   so a newly chosen value mounts fresh and rises in (kf-value-up); a readiness gate keeps the first
   value still on load. Here that is the part's #render slot; pass your own #render to take over.
   The two class strings are read from src/components/primitives/select.tsx. */
import fs from "node:fs"
import { fileURLToPath } from "node:url"

const prim = fs.readFileSync(fileURLToPath(new URL("../../../../src/components/primitives/select.tsx", import.meta.url)), "utf8")
const block = prim.match(/className=\{cn\(\s*"([^"]+)",\s*ready && "([^"]+)",/)
if (!block) throw new Error("SelectValue: React's value span changed")

export default (src) => {
  const m = src.match(/\n( *)<template v-for="name in slotNames"/)
  const pad = m[1]
  return src.replace(
    m[0],
    `
${pad}<template v-if="!slots.render" #render="r">
${pad}  <span v-bind="r.props">
${pad}    <span :key="r.state.placeholder ? '\\u0000placeholder' : r.state.label" :class="cn(${JSON.stringify(block[1]).replace(/"/g, "'")}, ready && ${JSON.stringify(block[2]).replace(/"/g, "'")})">
${pad}      <component :is="r.children" />
${pad}    </span>
${pad}  </span>
${pad}</template>
${pad}<template v-for="name in slotNames"`,
  )
}
