/* React: aria-label={variant === "icon" && !children ? "Close" : undefined} (before the user's props). */
export default (src, { replace }) =>
  replace(
    src,
    `  <template v-if="props.variant === 'icon'">\n    <DialogClosePart :data-variant="props.variant" v-bind="forwarded"`,
    `  <template v-if="props.variant === 'icon'">\n    <DialogClosePart :data-variant="props.variant" :aria-label="slots.default ? undefined : 'Close'" v-bind="forwarded"`,
  )
