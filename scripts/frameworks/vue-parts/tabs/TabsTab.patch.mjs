/* React's classes (the selected colour comes from the copy inside the key, not the tab). */
export default (src, { replace, cls }) => src.replace(/^const c0 = .*$/m, `const c0 = ${cls("TabsTab,0,orig")}`)
