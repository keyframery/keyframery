/* React: style { "--kf-i": index, ...style } (the wave's order), and the typed character in a span
   keyed by it, so each new character mounts and rises in from its starting style. */
export default (src, { replace }) => {
  src = replace(src, `<OTPInputSlotPart v-bind="forwarded"`, `<OTPInputSlotPart :style="{ '--kf-i': attrs.index }" v-bind="forwarded"`)
  src = src.replace(/<span (class="inline-block \[transition[^"]*") \/>/, (_, cls) => `<span :key="scope.state.char" ${cls}>{{ scope.state.char }}</span>`)
  src = replace(src, `        <template v-else>\n\n        </template>\n`, "")
  if (!src.includes(`{{ scope.state.char }}`)) throw new Error("otp: span not found")
  return src
}
