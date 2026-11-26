/* React: props.orientation === "vertical" && "self-stretch" (before the user's class, so their self-* wins). */
export default (src, { replace }) =>
  replace(src, `:class="cn(c0, attrs.class as any)"`, `:class="cn(c0, attrs.orientation === 'vertical' && 'self-stretch', attrs.class as any)"`)
