import { describe, expect, it } from "vitest"

import { decode, DEFAULTS, encode, toCode } from "../../apps/web/lib/theme-url"

describe("theme-url", () => {
  it("encodes only what differs from the defaults", () => {
    expect(encode(DEFAULTS)).toBe("")
    const s = { menus: { ...DEFAULTS.menus, dialog: "punch-in" }, vars: { ...DEFAULTS.vars, pace: 1.4, blur: 4 } }
    expect(encode(s)).toBe("dialog=punch-in&pace=1.4&blur=4")
  })

  it("round-trips through the URL", () => {
    const s = { menus: { ...DEFAULTS.menus, tabs: "whip", sheet: "fade" }, vars: { ...DEFAULTS.vars, depth: 0.9, ease: "snappy" } }
    expect(decode(encode(s))).toEqual(s)
  })

  it("falls back to defaults for values it doesn't know", () => {
    expect(decode("dialog=explode&pace=-3&blur=abc&ease=bouncy")).toEqual(DEFAULTS)
  })

  it("writes the <Cuts> line and the CSS for non-defaults only", () => {
    const s = { menus: { ...DEFAULTS.menus, dialog: "punch-in" }, vars: { ...DEFAULTS.vars, pace: 1.4, blur: 4, ease: "snappy" } }
    const { jsx, css } = toCode(s)
    expect(jsx).toBe('<Cuts dialog="punch-in" pace={1.4} />')
    expect(css).toBe(":root {\n  --kf-ease: cubic-bezier(0.2, 0.9, 0.1, 1);\n  --kf-blur: 4px;\n}")
    expect(toCode(DEFAULTS)).toEqual({ jsx: "<Cuts />", css: "" })
  })
})
