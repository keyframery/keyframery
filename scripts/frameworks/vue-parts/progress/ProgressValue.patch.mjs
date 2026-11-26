/* React: children ?? ((state) => <Roll text={state.text} />). */
import { useRoll } from "../_roll.mjs"
export default (src, { replace }) => useRoll(src, replace)
