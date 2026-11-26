/* The lucide icons the React data table draws, as the same markup (no icon dependency): 16px, stroke 1.75,
   aria-hidden, `lucide lucide-<name>` plus your class. */
import { type FunctionalComponent, h } from "vue"

type Node = [string, Record<string, string>]

function lucide(names: string, nodes: Node[]): FunctionalComponent<{ class?: string }> {
  const icon: FunctionalComponent<{ class?: string }> = (props) =>
    h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: 16,
        height: 16,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 1.75,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        class: ["lucide", names, props.class].filter(Boolean).join(" "),
        "aria-hidden": "true",
      },
      nodes.map(([tag, attrs]) => h(tag, attrs)),
    )
  icon.props = ["class"]
  return icon
}

export const ArrowDown = lucide("lucide-arrow-down", [["path", { d: "M12 5v14" }], ["path", { d: "m19 12-7 7-7-7" }]])
export const ArrowUp = lucide("lucide-arrow-up", [["path", { d: "m5 12 7-7 7 7" }], ["path", { d: "M12 19V5" }]])
export const ChevronsUpDown = lucide("lucide-chevrons-up-down", [["path", { d: "m7 15 5 5 5-5" }], ["path", { d: "m7 9 5-5 5 5" }]])
export const Ellipsis = lucide("lucide-ellipsis lucide-more-horizontal", [
  ["circle", { cx: "12", cy: "12", r: "1" }],
  ["circle", { cx: "19", cy: "12", r: "1" }],
  ["circle", { cx: "5", cy: "12", r: "1" }],
])
export const EyeOff = lucide("lucide-eye-off", [
  ["path", { d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" }],
  ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242" }],
  ["path", { d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" }],
  ["path", { d: "m2 2 20 20" }],
])
export const Search = lucide("lucide-search", [["path", { d: "m21 21-4.34-4.34" }], ["circle", { cx: "11", cy: "11", r: "8" }]])
export const SearchX = lucide("lucide-search-x", [
  ["path", { d: "m13.5 8.5-5 5" }],
  ["path", { d: "m8.5 8.5 5 5" }],
  ["circle", { cx: "11", cy: "11", r: "8" }],
  ["path", { d: "m21 21-4.3-4.3" }],
])
export const Settings2 = lucide("lucide-settings-2", [
  ["path", { d: "M14 17H5" }],
  ["path", { d: "M19 7h-9" }],
  ["circle", { cx: "17", cy: "17", r: "3" }],
  ["circle", { cx: "7", cy: "7", r: "3" }],
])
export const X = lucide("lucide-x", [["path", { d: "M18 6 6 18" }], ["path", { d: "m6 6 12 12" }]])
