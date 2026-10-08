import { describe, expect, it } from "vitest"

import { decode, DEFAULTS, encode, parseTheme, profileOf, PROFILES, serializeTheme, themeAgentPrompt, toCode, toInstall, type ThemeSettings } from "../../apps/web/lib/theme-url"

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
    expect(decode("blur=&travel=%20&ease=toString&easeExit=__proto__")).toEqual(DEFAULTS)
  })

  it("writes the <Cuts> line and the CSS for non-defaults only", () => {
    const s = { menus: { ...DEFAULTS.menus, dialog: "punch-in" }, vars: { ...DEFAULTS.vars, pace: 1.4, blur: 4, ease: "snappy" } }
    const { jsx, css } = toCode(s)
    expect(jsx).toBe('<Cuts dialog="punch-in" pace={1.4} />')
    expect(css).toBe(":root {\n  --kf-ease: cubic-bezier(0.2, 0.9, 0.1, 1);\n  --kf-blur: 4px;\n}")
    expect(toCode(DEFAULTS)).toEqual({ jsx: "<Cuts />", css: "" })
  })

  it("provides complete, distinguishable profiles without sharing editable objects", () => {
    expect(profileOf(DEFAULTS)).toBe("expressive")
    for (const key of ["quiet", "crisp", "expressive"] as const) {
      const preset = PROFILES[key].settings
      expect(parseTheme(serializeTheme(preset))).toEqual(preset)
      expect(decode(encode(preset))).toEqual(preset)
      expect(profileOf(preset)).toBe(key)
      expect(Object.isFrozen(preset.menus)).toBe(true)
      expect(Object.isFrozen(preset.vars)).toBe(true)
      const editable = parseTheme(serializeTheme(preset))
      editable.vars.blur = Number(editable.vars.blur) + 1
      expect(profileOf(editable)).toBeNull()
      expect(editable.vars.blur).not.toBe(preset.vars.blur)
    }
    expect(PROFILES.crisp.settings.vars.pace).toBeLessThan(PROFILES.expressive.settings.vars.pace as number)
    expect(PROFILES.quiet.settings.menus.dialog).toBe("fade")
  })

  it("exports every setting in a versioned file, even defaults, and preserves an optional name", () => {
    const exported = JSON.parse(serializeTheme(DEFAULTS, "  Client app  "))
    expect(exported).toEqual({ version: 1, name: "Client app", settings: DEFAULTS })
    const imported = parseTheme(JSON.stringify(exported))
    expect(imported).toEqual(DEFAULTS)
    expect(imported).not.toBe(DEFAULTS)
    expect(imported.menus).not.toBe(DEFAULTS.menus)
    expect(imported.vars).not.toBe(DEFAULTS.vars)
    expect(JSON.parse(serializeTheme(DEFAULTS))).not.toHaveProperty("name")
  })

  it.each([
    ["not-json", "not valid JSON"],
    ["[]", "theme must be an object"],
    [JSON.stringify({ settings: DEFAULTS }), "Missing field theme.version"],
    [JSON.stringify({ version: 2, settings: DEFAULTS }), "Unsupported theme version"],
    [JSON.stringify({ version: "1", settings: DEFAULTS }), "Unsupported theme version"],
    [JSON.stringify({ version: 1, name: "", settings: DEFAULTS }), "theme.name"],
    [JSON.stringify({ version: 1, name: 1, settings: DEFAULTS }), "theme.name"],
    [JSON.stringify({ version: 1, settings: DEFAULTS, profile: "quiet" }), "Unknown field theme.profile"],
    [JSON.stringify({ version: 1, settings: { menus: DEFAULTS.menus } }), "Missing field theme.settings.vars"],
    [JSON.stringify({ version: 1, settings: { menus: DEFAULTS.menus, vars: [] } }), "theme.settings.vars must be an object"],
  ])("rejects an invalid file with an actionable error (%s)", (file, message) => {
    expect(() => parseTheme(file)).toThrow(message)
  })

  it.each([
    ["menus", "dialog", "explode", "menus.dialog must be one of"],
    ["menus", "dialog", 1, "menus.dialog must be one of"],
    ["menus", "tabs", undefined, "Missing field theme.settings.menus.tabs"],
    ["menus", "surprise", "fade", "Unknown field theme.settings.menus.surprise"],
    ["vars", "pace", "1", "vars.pace must be a number"],
    ["vars", "pace", 9, "vars.pace must be a number"],
    ["vars", "blur", -1, "vars.blur must be a number"],
    ["vars", "depth", 0.7, "vars.depth must be a number"],
    ["vars", "hold", null, "vars.hold must be a number"],
    ["vars", "ease", "toString", "vars.ease must be one of"],
    ["vars", "easeExit", "__proto__", "vars.easeExit must be one of"],
    ["vars", "ease", 1, "vars.ease must be one of"],
  ])("rejects malformed settings: %s.%s", (section, key, value, message) => {
    const file = JSON.parse(serializeTheme(DEFAULTS))
    file.settings[section][key] = value
    expect(() => parseTheme(JSON.stringify(file))).toThrow(message)
  })

  it("rejects prototype fields and doesn't apply partial imports", () => {
    const file = serializeTheme(DEFAULTS).replace('"menus": {', '"menus": {"__proto__": {"dialog": "fade"},')
    expect(() => parseTheme(file)).toThrow("Unknown field theme.settings.menus.__proto__")
    expect(DEFAULTS.menus.dialog).toBe("rack-focus")
    expect(() => serializeTheme({ ...DEFAULTS, vars: { ...DEFAULTS.vars, pace: NaN } })).toThrow("vars.pace")
    expect(() => serializeTheme(DEFAULTS, " ")).toThrow("theme.name")
  })

  it("allows the documented numeric boundaries without changing their values", () => {
    const settings: ThemeSettings = {
      menus: { ...DEFAULTS.menus },
      vars: { ...DEFAULTS.vars, pace: 0.5, travel: 0, blur: 20, depth: 0.8, hold: 1000 },
    }
    expect(parseTheme(serializeTheme(settings))).toEqual(settings)
  })

  it("hands off the exact selected configuration, installation and helper APIs", () => {
    const settings = PROFILES.crisp.settings
    const code = toCode(settings)
    const install = toInstall(settings)
    expect(install).toContain('npx shadcn registry add "@keyframery=https://keyframery.com/r/{name}.json"')
    expect(install).toContain("npx shadcn add @keyframery/cuts")
    expect(install).toContain('import { Cuts } from "@/components/keyframery/cuts"')
    expect(install).toContain(code.jsx)
    expect(install).toContain(code.css)
    expect(install).toContain("{children}")
    expect(install).toContain("src/main.tsx")
    expect(install).toContain("app/root.tsx")
    const prompt = themeAgentPrompt(settings)
    expect(prompt).toContain(serializeTheme(settings))
    for (const helper of ["MatchCut", "ListCut", "ValueCut", "LoadCut", "StateCut"]) expect(prompt).toContain(helper)
    expect(prompt).toContain('<StateCut state={status} cut="fade">{content}</StateCut>')
    expect(prompt).toContain("https://keyframery.com/docs/helpers/state-cut")
    expect(toInstall(DEFAULTS)).toContain("No CSS needed")
  })
})
