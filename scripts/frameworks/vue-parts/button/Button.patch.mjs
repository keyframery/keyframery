/* React: `pendingIndicator` (default a spinner, `null` for none). Vue: the same prop (null hides it)
   or a #pendingIndicator slot for your own. */
export default (src, { replace }) => {
  src = replace(src, `  speed?: "fast" | "normal" | "slow" | number\n}\n`, `  speed?: "fast" | "normal" | "slow" | number\n  /** What rises in while the button is pending. Defaults to a spinner; pass \`null\` for none (or use the #pendingIndicator slot). */\n  pendingIndicator?: string | null\n}\n`)
  src = replace(src, `>(), { `, `>(), { pendingIndicator: undefined, `)
  src = replace(src, `<span :aria-hidden="true" data-slot="button-pending"`, `<span v-if="props.pendingIndicator !== null" :aria-hidden="true" data-slot="button-pending"`)
  const m = src.match(/\n( *)<svg viewBox="0 0 16 16"/)
  src = replace(src, m[0], `\n${m[1]}<slot name="pendingIndicator">{{ props.pendingIndicator }}</slot>\n${m[1]}<svg v-if="props.pendingIndicator === undefined && !slots.pendingIndicator" viewBox="0 0 16 16"`)
  src = replace(src, `const namedSlots = computed(() => Object.keys(slots).filter((name) => name !== "default"))`, `const namedSlots = computed(() => Object.keys(slots).filter((name) => name !== "default" && name !== "pendingIndicator"))`)
  return src
}
