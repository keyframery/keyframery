/* React: with your own element (render) the content is passed as it is, without the label/spinner swap. */
export default (src, { replace }) => {
  const m = src.match(/\n( *)<span :class="k\[1\]">/)
  if (!m) throw new Error("AlertDialogClose: generated content changed")
  return replace(src, m[0], `\n${m[1]}<slot v-if="slots.render" v-bind="scope ?? {}" />\n${m[1]}<span v-else :class="k[1]">`)
}
