/* React: `high` works like the native meter's; a reading above it sets data-high (destructive colour). */
export default (src, { replace }) => {
  src = replace(src, `  speed?: "fast" | "normal" | "slow" | number\n}\n`, `  speed?: "fast" | "normal" | "slow" | number\n  /** A reading above this is the bad range: only then the meter turns destructive. */\n  high?: number\n}\n`)
  src = replace(src, `<MeterPart v-bind="forwarded"`, `<MeterPart :data-high="props.high !== undefined && Number(attrs.value) > props.high ? '' : undefined" v-bind="forwarded"`)
  return src
}
