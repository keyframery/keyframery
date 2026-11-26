/* React: children ?? ((state) => state.status === "complete" && <svg>check</svg>). */
import { withDefault } from "../_slots.mjs"
export default (src, { replace }) =>
  withDefault(
    src,
    replace,
    `<svg v-if="scope?.state?.status === 'complete'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\n  <path d="m4.5 8.25 2.25 2.25 4.75-5" />\n</svg>`,
  )
