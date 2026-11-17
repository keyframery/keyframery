import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import test, { after, before, describe } from "node:test"
import ts from "typescript"

const root = path.resolve(import.meta.dirname, "../..")
const coreDirectory = path.join(root, "src/components/core")
const require = createRequire(import.meta.url)
const sdk = require("@ui-sdk/core")
const definitions = new WeakMap()
const modules = new Map()

// Exercise the installed SDK definitions, retaining their declared agent policy for the audit.
const core = {
  ...sdk,
  definePrimitive(definition) {
    const primitive = sdk.definePrimitive(definition)
    definitions.set(primitive, definition)
    return primitive
  },
}

function loadLocal(file) {
  if (modules.has(file)) return modules.get(file).exports
  const module = { exports: {} }
  modules.set(file, module)
  const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    fileName: file,
  })
  const localRequire = (specifier) => {
    if (specifier === "@ui-sdk/core") return core
    if (!specifier.startsWith("@/")) return require(specifier)
    const base = path.join(root, "src", specifier.slice(2))
    const resolved = [base, `${base}.ts`, `${base}.tsx`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile())
    assert.ok(resolved, `Unresolved local import: ${specifier}`)
    return loadLocal(resolved)
  }
  new Function("require", "module", "exports", outputText)(localRequire, module, module.exports)
  return module.exports
}

for (const filename of fs.readdirSync(coreDirectory).filter((name) => name.endsWith(".ts"))) {
  for (const [name, primitive] of Object.entries(loadLocal(path.join(coreDirectory, filename)))) {
    const definition = typeof primitive === "function" ? definitions.get(primitive) : undefined
    if (!definition || definition.agent?.actions?.length) continue
    test(`${filename}: ${name} exposes its default read-only agent surface`, () => {
      const state = definition.state({})
      assert.notEqual(definition.agent?.shown?.(state), false, `${name} hides every instance instead of exposing its readable content and state`)
      assert.deepEqual(definition.agent?.actions, [], `${name} must not advertise internal event or animation methods as agent actions`)
    })
  }
}

// Keep the normal Node checks browser-free. Run real bridge integration explicitly with:
// KEYFRAMERY_AGENT_BROWSER_TESTS=1 node --test scripts/tests/agent-exposure.test.mjs
describe("real UI SDK agent bridge", { skip: process.env.KEYFRAMERY_AGENT_BROWSER_TESTS !== "1" }, () => {
  let browser
  let script

  before(async () => {
    const [{ build }, { chromium }] = await Promise.all([import("vite"), import("playwright-core")])
    const filenames = fs.readdirSync(coreDirectory).filter((name) => name.endsWith(".ts"))
    const fixture = [
      'import { mount } from "@ui-sdk/core/testing"',
      'import { createAgent } from "@ui-sdk/react/agent"',
      'import { createElement, Fragment } from "react"',
      'import { createRoot } from "react-dom/client"',
      `import * as messageParts from ${JSON.stringify(path.join(root, "src/components/primitives/message.tsx"))}`,
      `import * as badgeParts from ${JSON.stringify(path.join(root, "src/components/primitives/badge.tsx"))}`,
      `import * as tableParts from ${JSON.stringify(path.join(root, "src/components/primitives/table.tsx"))}`,
      ...filenames.map((name, index) => `import * as module${index} from ${JSON.stringify(path.join(coreDirectory, name))}`),
      `window.agentFixture = { mount, createAgent, createElement, Fragment, createRoot, reactParts: { ...messageParts, ...badgeParts, ...tableParts }, primitives: Object.assign({}, ${filenames.map((_, index) => `module${index}`).join(", ")}) }`,
    ].join("\n")
    const bundle = await build({
      configFile: false,
      logLevel: "silent",
      resolve: { alias: { "@": path.join(root, "src") } },
      plugins: [{
        name: "agent-test-fixture",
        resolveId(id) { if (id === "virtual:agent-test-fixture") return "\0agent-test-fixture" },
        load(id) { if (id === "\0agent-test-fixture") return fixture },
      }],
      build: {
        write: false,
        minify: false,
        rollupOptions: {
          input: "virtual:agent-test-fixture",
          output: { format: "iife", name: "AgentFixture", inlineDynamicImports: true },
        },
      },
    })
    script = bundle.output.find((output) => output.type === "chunk").code
    browser = await chromium.launch({ channel: "chrome", headless: true })
  })

  after(async () => { await browser?.close() })

  async function pageFor(t) {
    const page = await browser.newPage()
    t.after(() => page.close())
    await page.route("https://agent-fixture.test/**", (route) => route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html><head><style>root { display: block }</style></head><body></body></html>',
    }))
    await page.goto("https://agent-fixture.test/")
    await page.addScriptTag({ content: script })
    await page.evaluate(() => { window.agentFixture.agent = window.agentFixture.createAgent() })
    return page
  }

  async function snapshot(t, name, options, markup) {
    const page = await pageFor(t)
    return page.evaluate(({ name, options, markup }) => {
      const fixture = window.agentFixture
      fixture.mounted = fixture.mount(fixture.primitives[name], options, markup)
      return fixture.agent.snapshot().filter((entry) => !entry.offPage)
    }, { name, options, markup })
  }

  test("a badge exposes its count and displayed value without invented actions", async (t) => {
    const entries = await snapshot(t, "badge", { count: 3, text: "Unread" }, '<root aria-label="Unread messages">3 unread</root>')
    const badge = entries.find((entry) => entry.component === "badge")
    assert.ok(badge, "The visible badge is missing from the agent snapshot")
    assert.equal(badge.count, 3)
    assert.equal(badge.value, "3 unread")
    assert.deepEqual(badge.actions, [])
  })

  test("a text badge exposes its displayed status", async (t) => {
    const entries = await snapshot(t, "badge", { text: "Confirmed" }, '<root aria-label="Booking status">Confirmed</root>')
    const badge = entries.find((entry) => entry.component === "badge")
    assert.ok(badge, "The visible badge is missing from the agent snapshot")
    assert.equal(badge.value, "Confirmed")
    assert.deepEqual(badge.actions, [])
  })

  test("a badge exposes the capped count that is actually displayed", async (t) => {
    const entries = await snapshot(t, "badge", { count: 120, max: 99 }, '<root>99+</root>')
    const badge = entries.find((entry) => entry.component === "badge")
    assert.ok(badge, "The visible badge is missing from the agent snapshot")
    assert.equal(badge.count, 120)
    assert.equal(badge.max, 99)
    assert.equal(badge.value, "99+")
    assert.deepEqual(badge.actions, [])
  })

  test("a spinner exposes the loading label", async (t) => {
    const entries = await snapshot(t, "spinner", { label: "Loading bookings" }, '<root></root>')
    const spinner = entries.find((entry) => entry.component === "spinner")
    assert.ok(spinner, "The loading status is missing from the agent snapshot")
    assert.equal(spinner.label, "Loading bookings")
    assert.deepEqual(spinner.actions, [])
  })

  test("a skeleton swap exposes whether its content is loading", async (t) => {
    const entries = await snapshot(t, "skeletonSwap", { loading: true }, '<root aria-label="Booking details"><fallback>Loading</fallback><content>Ready</content></root>')
    const swap = entries.find((entry) => entry.component === "skeleton-swap")
    assert.ok(swap, "The loading region is missing from the agent snapshot")
    assert.equal(swap.loading, true)
    assert.deepEqual(swap.actions, [])
  })

  test("a keycap exposes its pressed state without offering a press action", async (t) => {
    const entries = await snapshot(t, "kbd", { pressed: true }, '<root aria-label="Command key">⌘</root>')
    const keycap = entries.find((entry) => entry.component === "kbd")
    assert.ok(keycap, "The visible keycap is missing from the agent snapshot")
    assert.equal(keycap.pressed, true)
    assert.deepEqual(keycap.actions, [])
  })

  test("a keycap exposes its symbol without an explicit label", async (t) => {
    const entries = await snapshot(t, "kbd", {}, '<root>⌘</root>')
    const keycap = entries.find((entry) => entry.component === "kbd")
    assert.ok(keycap, "The visible keycap is missing from the agent snapshot")
    assert.ok(keycap.content.includes("⌘"))
    assert.deepEqual(keycap.actions, [])
  })

  test("a marker exposes pending work", async (t) => {
    const entries = await snapshot(t, "marker", { pending: true, live: true }, '<root aria-label="Searching flights"><content>Searching flights</content></root>')
    const marker = entries.find((entry) => entry.component === "marker")
    assert.ok(marker, "The visible marker is missing from the agent snapshot")
    assert.equal(marker.pending, true)
    assert.deepEqual(marker.actions, [])
  })

  test("a marker exposes its work text without an explicit label", async (t) => {
    const entries = await snapshot(t, "marker", { pending: true }, '<root><content>Searching flights to Kyoto</content></root>')
    const marker = entries.find((entry) => entry.component === "marker")
    assert.ok(marker, "The visible marker is missing from the agent snapshot")
    assert.ok(marker.content.includes("Searching flights to Kyoto"))
    assert.equal(marker.pending, true)
    assert.deepEqual(marker.actions, [])
  })

  test("a breadcrumb exposes its visible path without an explicit label", async (t) => {
    const entries = await snapshot(t, "breadcrumb", {}, '<root><list><item><link href="/trips">Trips</link></item><item><page>Kyoto</page></item></list></root>')
    const breadcrumb = entries.find((entry) => entry.component === "breadcrumb")
    assert.ok(breadcrumb, "The visible breadcrumb is missing from the agent snapshot")
    assert.ok(breadcrumb.content.includes("Trips"))
    assert.ok(breadcrumb.content.includes("Kyoto"))
    assert.deepEqual(breadcrumb.actions, [])
  })

  test("an aspect ratio exposes its configured ratio", async (t) => {
    const entries = await snapshot(t, "aspectRatio", { ratio: 16 / 9 }, '<root aria-label="Trip video">Trip video</root>')
    const frame = entries.find((entry) => entry.component === "aspect-ratio")
    assert.ok(frame, "The visible media frame is missing from the agent snapshot")
    assert.equal(frame.ratio, 16 / 9)
    assert.deepEqual(frame.actions, [])
  })

  test("a card exposes its title and description", async (t) => {
    const entries = await snapshot(t, "card", {}, '<root><title>Weekend trip</title><description>Two nights in Kyoto</description></root>')
    const card = entries.find((entry) => entry.component === "card")
    assert.ok(card, "The visible card is missing from the agent snapshot")
    assert.ok(JSON.stringify(card).includes("Weekend trip"))
    assert.ok(JSON.stringify(card).includes("Two nights in Kyoto"))
    assert.deepEqual(card.actions, [])
  })

  for (const [name, component, text] of [
    ["card", "card", "Two nights in Kyoto"],
    ["item", "item", "Kyoto station pickup"],
    ["empty", "empty", "No bookings found"],
    ["trace", "trace", "Found three available trains"],
  ]) test(`${component} exposes its body without an explicit label or title part`, async (t) => {
    const entries = await snapshot(t, name, {}, `<root>${text}</root>`)
    const entry = entries.find((candidate) => candidate.component === component)
    assert.ok(entry, `The visible ${component} is missing from the agent snapshot`)
    assert.ok(entry.content.includes(text))
    assert.deepEqual(entry.actions, [])
  })

  test("a read-only message exposes its content", async (t) => {
    const entries = await snapshot(t, "message", {}, '<root aria-label="Message from Ana"><content>Your booking is confirmed</content></root>')
    const message = entries.find((entry) => entry.component === "message")
    assert.ok(message, "The visible message is missing from the agent snapshot")
    assert.ok(JSON.stringify(message).includes("Your booking is confirmed"))
    assert.deepEqual(message.actions, [])
  })

  test("a bubble exposes its displayed message", async (t) => {
    const entries = await snapshot(t, "bubble", {}, '<root aria-label="Reply from Ana"><content>Meet at the station at 10:00</content></root>')
    const bubble = entries.find((entry) => entry.component === "bubble")
    assert.ok(bubble, "The visible bubble is missing from the agent snapshot")
    assert.ok(bubble.content.includes("Meet at the station at 10:00"))
    assert.deepEqual(bubble.actions, [])
  })

  test("readable message content respects hidden and secret descendants", async (t) => {
    const entries = await snapshot(t, "message", {}, '<root aria-label="Message from Ana"><content>Public itinerary <span data-agent-hidden>hidden-recovery-7392</span><span data-agent-secret>secret-pass-9148</span><span aria-hidden="true">decorative-3719</span></content></root>')
    const message = entries.find((entry) => entry.component === "message")
    assert.ok(message, "The visible message is missing from the agent snapshot")
    assert.ok(message.content.includes("Public itinerary"))
    assert.ok(message.content.includes("[redacted]"))
    for (const privateText of ["hidden-recovery-7392", "secret-pass-9148", "decorative-3719"]) {
      assert.ok(!message.content.includes(privateText), `The snapshot leaked ${privateText}`)
    }
  })

  test("message summaries omit input, textarea and select values", async (t) => {
    const entries = await snapshot(t, "message", {}, '<root aria-label="Booking form"><content>Enter passenger details<input value="private-input-7392"><textarea>private-textarea-9148</textarea><select><option selected>private-selection-3719</option></select></content></root>')
    const message = entries.find((entry) => entry.component === "message")
    assert.ok(message, "The visible message is missing from the agent snapshot")
    assert.ok(message.content.includes("Enter passenger details"))
    for (const fieldValue of ["private-input-7392", "private-textarea-9148", "private-selection-3719"]) {
      assert.ok(!message.content.includes(fieldValue), `The parent summary copied ${fieldValue}`)
    }
  })

  test("message content follows CSS visibility changes", async (t) => {
    const page = await pageFor(t)
    await page.evaluate(() => {
      const fixture = window.agentFixture
      fixture.mounted = fixture.mount(fixture.primitives.message, {}, '<root aria-label="Itinerary"><content>Public details <span data-test-detail style="display:none">Hidden itinerary</span></content></root>')
    })
    const initial = await page.evaluate(() => window.agentFixture.agent.snapshot().find((entry) => entry.component === "message"))
    assert.ok(initial.content.includes("Public details"))
    assert.ok(!initial.content.includes("Hidden itinerary"))
    await page.evaluate(() => window.agentFixture.mounted.root.querySelector("[data-test-detail]").style.display = "inline")
    await page.waitForFunction(() => window.agentFixture.agent.snapshot().some((entry) => entry.component === "message" && entry.content?.includes("Hidden itinerary")))
  })

  test("an idle message scroller exposes its zero unread count", async (t) => {
    const entries = await snapshot(t, "messageScroller", {}, '<root aria-label="Conversation"></root>')
    const scroller = entries.find((entry) => entry.component === "message-scroller")
    assert.ok(scroller)
    assert.equal(scroller.unread, 0)
    assert.ok(scroller.actions.includes("scrollToEnd"))
  })

  test("an attachment exposes upload status and progress", async (t) => {
    const entries = await snapshot(t, "attachment", { status: "uploading", progress: 42 }, '<root aria-label="Itinerary PDF"></root>')
    const attachment = entries.find((entry) => entry.component === "attachment")
    assert.ok(attachment)
    assert.equal(attachment.status, "uploading")
    assert.equal(attachment.progress, 42)
    assert.ok(attachment.actions.includes("remove"))
  })

  test("a code block exposes its source and copy action", async (t) => {
    const entries = await snapshot(t, "codeBlock", { code: "const destination = 'Kyoto'", language: "javascript" }, '<root aria-label="Example code"></root>')
    const block = entries.find((entry) => entry.component === "code-block")
    assert.ok(block)
    assert.equal(block.code, "const destination = 'Kyoto'")
    assert.equal(block.language, "javascript")
    assert.ok(block.actions.includes("copy"))
  })

  test("a table exposes its displayed data", async (t) => {
    const entries = await snapshot(t, "table", {}, '<root aria-label="Bookings"><row><cell>Kyoto</cell><cell>Confirmed</cell></row></root>')
    const table = entries.find((entry) => entry.component === "table")
    assert.ok(table, "The visible table is missing from the agent snapshot")
    assert.ok(JSON.stringify(table).includes("Kyoto"))
    assert.ok(JSON.stringify(table).includes("Confirmed"))
    assert.deepEqual(table.actions, [])
  })

  test("a message snapshot follows content changes", async (t) => {
    const page = await pageFor(t)
    await page.evaluate(() => {
      const fixture = window.agentFixture
      fixture.mounted = fixture.mount(fixture.primitives.message, {}, '<root aria-label="Booking update"><content>Checking availability</content></root>')
      fixture.mounted.part("content").textContent = "Your booking is confirmed"
    })
    await page.waitForFunction(() => {
      const entry = window.agentFixture.agent.snapshot().find((component) => component.component === "message")
      return JSON.stringify(entry).includes("Your booking is confirmed")
    })
    const entry = await page.evaluate(() => window.agentFixture.agent.snapshot().find((component) => component.component === "message"))
    assert.ok(!JSON.stringify(entry).includes("Checking availability"))
  })

  test("message content updates when a descendant becomes secret", async (t) => {
    const page = await pageFor(t)
    await page.evaluate(() => {
      const fixture = window.agentFixture
      fixture.mounted = fixture.mount(fixture.primitives.message, {}, '<root aria-label="Booking update"><content>Shareable itinerary <span data-test-code>booking-code-5942</span></content></root>')
      fixture.mounted.root.querySelector("[data-test-code]").setAttribute("data-agent-secret", "")
    })
    await page.waitForFunction(() => {
      const entry = window.agentFixture.agent.snapshot().find((component) => component.component === "message")
      return entry?.content?.includes("[redacted]") && !entry.content.includes("booking-code-5942")
    })
  })

  test("table content follows updated cells and removed rows", async (t) => {
    const page = await pageFor(t)
    await page.evaluate(() => {
      const fixture = window.agentFixture
      fixture.mounted = fixture.mount(fixture.primitives.table, {}, '<root aria-label="Bookings"><row data-test-row="first"><cell>Kyoto</cell></row><row data-test-row="second"><cell>Osaka</cell></row></root>')
      fixture.mounted.root.querySelector('[data-test-row="first"]').textContent = "Nara"
      fixture.mounted.root.querySelector('[data-test-row="second"]').remove()
    })
    await page.waitForFunction(() => {
      const entry = window.agentFixture.agent.snapshot().find((component) => component.component === "table")
      return entry?.content?.includes("Nara") && !entry.content.includes("Kyoto") && !entry.content.includes("Osaka")
    })
  })

  test("React wrappers expose readable state and content after updates", async (t) => {
    const page = await pageFor(t)
    const errors = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.evaluate(() => {
      const fixture = window.agentFixture
      const { createElement: h, Fragment, reactParts: parts } = fixture
      const container = document.createElement("div")
      document.body.append(container)
      fixture.reactRoot = fixture.createRoot(container)
      fixture.renderReact = (updated) => fixture.reactRoot.render(h(Fragment, null,
        h(parts.Message, { "aria-label": "Message from Ana" }, h(parts.MessageContent, null, updated ? "Your booking is confirmed" : "Checking availability")),
        h(parts.Badge, { "aria-label": "Unread messages", count: updated ? 5 : 3 }),
        h(parts.Badge, null, h("span", null, "Confirmed")),
        h(parts.Table, { "aria-label": "Bookings" }, h(parts.TableBody, null, h(parts.TableRow, null, h(parts.TableCell, null, updated ? "Nara" : "Kyoto"))))))
      fixture.renderReact(false)
    })
    await page.waitForFunction(() => {
      const entries = window.agentFixture.agent.snapshot()
      return entries.some((entry) => entry.component === "message" && entry.content?.includes("Checking availability")) &&
        entries.some((entry) => entry.component === "badge" && entry.count === 3) &&
        entries.some((entry) => entry.component === "badge" && entry.value === "Confirmed") &&
        entries.some((entry) => entry.component === "table" && entry.content?.includes("Kyoto"))
    })
    await page.evaluate(() => window.agentFixture.renderReact(true))
    await page.waitForFunction(() => {
      const entries = window.agentFixture.agent.snapshot()
      return entries.some((entry) => entry.component === "message" && entry.content?.includes("Your booking is confirmed")) &&
        entries.some((entry) => entry.component === "badge" && entry.count === 5) &&
        entries.some((entry) => entry.component === "badge" && entry.value === "Confirmed") &&
        entries.some((entry) => entry.component === "table" && entry.content?.includes("Nara"))
    })
    await page.evaluate(() => window.agentFixture.reactRoot.unmount())
    assert.deepEqual(errors, [])
  })

  test("an agent can sort a sortable table header", async (t) => {
    const page = await pageFor(t)
    const result = await page.evaluate(async () => {
      const fixture = window.agentFixture
      fixture.mounted = fixture.mount(fixture.primitives.tableHead, { defaultSort: "none" }, '<head><sort aria-label="Sort by destination">Destination</sort></head>')
      const entry = fixture.agent.snapshot().find((component) => component.actions.includes("toggleSort"))
      if (!entry) throw new Error("The sortable header is missing its toggleSort action")
      const action = await fixture.agent.act({ steps: [{ ref: entry.ref, action: "toggleSort" }] })
      return { action, sort: fixture.mounted.state.sort, source: fixture.mounted.changes.at(-1)?.source }
    })
    assert.equal(result.action.ok, true, result.action.error?.message)
    assert.equal(result.sort, "ascending")
    assert.equal(result.source, "agent")
  })

  test("an app can explicitly hide a readable component from agents", async (t) => {
    const entries = await snapshot(t, "card", {}, '<root data-agent-hidden><title>Private notes</title></root>')
    assert.equal(entries.some((entry) => entry.component === "card"), false)
  })

  test("an app can redact a badge's exposed state", async (t) => {
    const entries = await snapshot(t, "badge", { text: "Private status", count: 3 }, '<root aria-label="Private badge" data-agent-secret>Private status</root>')
    const badge = entries.find((entry) => entry.component === "badge")
    assert.ok(badge, "The secret badge should remain discoverable")
    assert.equal(badge.value, "[redacted]")
    assert.equal(badge.count, "[redacted]")
  })

  test("decorative skeleton blocks remain hidden from agents", async (t) => {
    const entries = await snapshot(t, "skeleton", {}, '<root></root>')
    assert.equal(entries.some((entry) => entry.component === "skeleton"), false)
  })

  test("a read-only card refuses internal pointer methods", async (t) => {
    const page = await pageFor(t)
    const result = await page.evaluate(async () => {
      const fixture = window.agentFixture
      fixture.mounted = fixture.mount(fixture.primitives.card, { interactive: true }, '<root aria-label="Weekend trip">Weekend trip</root>')
      const entry = fixture.agent.snapshot().find((component) => component.component === "card")
      if (!entry) throw new Error("The visible card is missing from the agent snapshot")
      return fixture.agent.act({ steps: [{ ref: entry.ref, action: "hover", args: [true] }] })
    })
    assert.equal(result.ok, false)
    assert.ok(result.error?.message.includes("hover"))
  })
})
