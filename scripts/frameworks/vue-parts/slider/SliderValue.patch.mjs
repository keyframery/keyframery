/* React: children ?? ((state) => <Roll text={state.text} />), the slider's roll (digits keep a 0's width). */
import { useRoll } from "../_roll.mjs"
export default (src, { replace }) => useRoll(src, replace, { centered: true })
