/* The key on its own, as React draws it: above the labels (z-10), since the list puts a copy of the
   labels inside it (extract.mjs's adaptation puts it under them for the stylesheet-only targets). */
export default (src, { replace, cls }) => src.replace(/^const c0 = .*$/m, `const c0 = ${cls("SegmentedControlIndicator,0,orig")}`)
