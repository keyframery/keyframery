// The motion tokens as plain CSS, written from the `css` object of the registry's motion item: the same
// rules the shadcn CLI adds to a project's global stylesheet. The Installation page shows this block so a
// manual install gets exactly what a CLI install gets.

const indent = (depth) => "  ".repeat(depth)

function rules(object, depth) {
  const lines = []
  for (const [key, value] of Object.entries(object)) {
    if (value && typeof value === "object") {
      lines.push(`${indent(depth)}${key} {`, ...rules(value, depth + 1), `${indent(depth)}}`)
    } else {
      lines.push(`${indent(depth)}${key}: ${value};`)
    }
  }
  return lines
}

/** The motion item's `css` object as a stylesheet, blocks separated by a blank line. */
export function motionCss(css) {
  return Object.entries(css)
    .map(([key, value]) => rules({ [key]: value }, 0).join("\n"))
    .join("\n\n")
}
