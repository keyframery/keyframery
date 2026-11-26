/* React's classes (the selected colour comes from the copy inside the key, not the item). */
export default (src, { replace, cls }) => src.replace(/^const c0 = .*$/m, `const c0 = ${cls("SegmentedControlItem,0,orig")}`)
