import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import test, { after, before, describe } from "node:test"
import ts from "typescript"

const root = path.resolve(import.meta.dirname, "../..")
const runtimeFile = path.join(root, "src/lib/agent-preview.ts")
const require = createRequire(import.meta.url)

test("the agent preview runtime can load without browser globals", () => {
  const { outputText } = ts.transpileModule(fs.readFileSync(runtimeFile, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: runtimeFile,
  })
  const module = { exports: {} }
  new Function("require", "module", "exports", outputText)(require, module, module.exports)
  assert.equal(typeof module.exports.createAgentPreviewSession, "function")
})

// These integration cases use the actual SDK and React wrappers in an isolated browser document.
// KEYFRAMERY_AGENT_BROWSER_TESTS=1 node --test scripts/tests/agent-preview.test.mjs
describe("scoped agent preview sessions", { skip: process.env.KEYFRAMERY_AGENT_BROWSER_TESTS !== "1" }, () => {
  let browser
  let script

  before(async () => {
    const [{ build }, { chromium }] = await Promise.all([import("vite"), import("playwright-core")])
    const fixture = [
      'import { createElement as h, Fragment } from "react"',
      'import { createRoot } from "react-dom/client"',
      'import { createAgent } from "@ui-sdk/react/agent"',
      'import { Input } from "@ui-sdk/react/input"',
      'import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@ui-sdk/react/select"',
      `import { AgentPreview } from ${JSON.stringify(path.join(root, "src/components/agent-preview.tsx"))}`,
      `import { Message, MessageContent } from ${JSON.stringify(path.join(root, "src/components/primitives/message.tsx"))}`,
      `import { createAgentPreviewSession } from ${JSON.stringify(runtimeFile)}`,
      `const fixture = window.agentPreviewFixture = { createAgentPreviewSession, agent: createAgent(), scopes: {}, reactRoots: {}, sessions: {}, renders: {}, events: [] }`,
      `fixture.createScope = (name, options = {}) => {
        const scope = document.createElement("section")
        scope.dataset.testScope = name
        document.body.append(scope)
        fixture.scopes[name] = scope
        fixture.reactRoots[name] = createRoot(scope)
        fixture.sessions[name] = createAgentPreviewSession(scope)
        fixture.renders[name] = { inputValue: name + "-value", inputLabel: "Shared setting", selectValue: "europe", content: name + " message", ...options }
        fixture.renderScope(name)
      }`,
      `fixture.renderScope = (name, patch = {}) => {
        const options = fixture.renders[name] = { ...fixture.renders[name], ...patch }
        const items = [{ value: "europe", label: "Europe" }, { value: "asia", label: "Asia Pacific" }]
        const content = h(Fragment, null,
          options.includeInput === false ? null : h(Input, { key: options.inputKey ?? "input", "aria-label": options.inputLabel, defaultValue: options.inputValue, disabled: options.inputDisabled }),
          options.includeSelect === false ? null : h(Select, { defaultValue: options.selectValue, items },
            h(SelectTrigger, { "aria-label": "Region" }, h(SelectValue)),
            h(SelectContent, null, ...items.map((item) => h(SelectItem, { key: item.value, value: item.value }, item.label)))),
          options.includeMessage === false ? null : h(Message, null, h(MessageContent, null, options.content)),
          options.inspector ? h("aside", { "data-agent-hidden": "" }, h(Input, { "aria-label": "Inspector argument", defaultValue: "panel-only" })) : null)
        fixture.reactRoots[name].render(options.contentMarker ? h(Fragment, null,
          h(Input, { "aria-label": "Outer resize control", defaultValue: "chrome-only" }),
          h("div", { "data-agent-preview-content": "" }, content)) : content)
      }`,
      `fixture.renderFiller = (count) => fixture.reactRoots.filler.render(h(Fragment, null,
        ...Array.from({ length: count }, (_, index) => h(Input, { key: index, "aria-label": "Page setting " + index, defaultValue: "outside-value-" + index }))))`,
      `fixture.renderWrapperPreviews = () => {
        const container = document.createElement("div")
        document.body.append(container)
        fixture.reactRoots.wrappers = createRoot(container)
        fixture.reactRoots.wrappers.render(h(Fragment, null,
          ...["First", "Second"].map((name) => h("section", { key: name, "data-test-wrapper": name.toLowerCase() },
            h(AgentPreview, { label: name + " example" },
              h(Input, { "aria-label": name + " demo input", defaultValue: name + " demo value" }),
              h(Message, null, h(MessageContent, null, name + " preview message")))))))
      }`,
    ].join("\n")
    const result = await build({
      configFile: false,
      logLevel: "silent",
      resolve: { alias: { "@": path.join(root, "src") } },
      plugins: [{
        name: "agent-preview-tests",
        resolveId(id) { if (id === "virtual:agent-preview-tests") return "\0agent-preview-tests" },
        load(id) { if (id === "\0agent-preview-tests") return fixture },
      }],
      build: {
        write: false,
        minify: false,
        rollupOptions: { input: "virtual:agent-preview-tests", output: { format: "iife", name: "AgentPreviewFixture", inlineDynamicImports: true } },
      },
    })
    script = result.output.find((item) => item.type === "chunk").code
    browser = await chromium.launch({ channel: "chrome", headless: true })
  })

  after(async () => { await browser?.close() })

  async function pageFor(t, first = {}) {
    const page = await browser.newPage()
    t.after(async () => {
      await page.evaluate(() => {
        const fixture = window.agentPreviewFixture
        for (const session of Object.values(fixture?.sessions ?? {})) session.destroy()
        for (const reactRoot of Object.values(fixture?.reactRoots ?? {})) reactRoot.unmount()
      }).catch(() => {})
      await page.close()
    })
    await page.route("https://agent-preview.test/**", (route) => route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html><head></head><body></body></html>",
    }))
    await page.goto("https://agent-preview.test/")
    await page.addScriptTag({ content: script })
    await page.evaluate((options) => {
      window.agentPreviewFixture.createScope("first", options)
      window.agentPreviewFixture.createScope("second")
    }, first)
    await page.waitForFunction(() => document.querySelectorAll("input").length >= 2)
    await page.evaluate(async () => {
      for (const session of Object.values(window.agentPreviewFixture.sessions)) await session.refresh()
    })
    return page
  }

  async function wrapperPageFor(t) {
    const page = await pageFor(t)
    await page.evaluate(() => window.agentPreviewFixture.renderWrapperPreviews())
    await page.getByRole("switch", { name: "Agent view for First example", exact: true }).waitFor()
    await page.getByRole("switch", { name: "Agent view for Second example", exact: true }).waitFor()
    return page
  }

  test("real preview wrappers start with their agent inspectors off", async (t) => {
    const page = await wrapperPageFor(t)
    for (const name of ["First", "Second"]) {
      const toggle = page.getByRole("switch", { name: `Agent view for ${name} example`, exact: true })
      assert.equal(await toggle.getAttribute("aria-checked"), "false")
      assert.equal(await page.getByRole("complementary", { name: `Agent view for ${name} example`, exact: true }).count(), 0)
      const precedesCanvas = await toggle.evaluate((element, name) => {
        const input = document.querySelector(`input[aria-label="${name} demo input"]`)
        return Boolean(input && (element.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING))
      }, name)
      assert.equal(precedesCanvas, true, "The Agent view switch should precede the preview in reading order")
    }
  })

  test("enabling one real wrapper reveals only that preview's snapshot", async (t) => {
    const page = await wrapperPageFor(t)
    await page.getByRole("switch", { name: "Agent view for First example", exact: true }).click()
    const inspector = page.getByRole("complementary", { name: "Agent view for First example", exact: true })
    await inspector.waitFor()
    await page.waitForFunction(() => {
      const inspector = document.querySelector('aside[aria-label="Agent view for First example"]')
      return inspector?.querySelector("[data-agent-parts]")?.textContent?.includes("First demo value")
    })
    await inspector.getByRole("radio", { name: "JSON", exact: true }).click()
    await inspector.getByLabel("Live agent snapshot", { exact: true }).waitFor()
    const snapshot = JSON.parse(await inspector.getByLabel("Live agent snapshot", { exact: true }).textContent())
    assert.ok(snapshot.some((entry) => entry.value === "First demo value"))
    assert.ok(!JSON.stringify(snapshot).includes("Second demo value"))
    assert.equal(await page.getByRole("switch", { name: "Agent view for Second example", exact: true }).getAttribute("aria-checked"), "false")
    assert.equal(await page.getByRole("complementary", { name: "Agent view for Second example", exact: true }).count(), 0)
  })

  test("disabling and re-enabling agent view preserves the mounted demo and edited value", async (t) => {
    const page = await wrapperPageFor(t)
    const toggle = page.getByRole("switch", { name: "Agent view for First example", exact: true })
    const input = page.getByRole("textbox", { name: "First demo input", exact: true })
    await input.fill("Edited while exploring")
    await page.evaluate(() => { window.agentPreviewFixture.originalDemoInput = document.querySelector('input[aria-label="First demo input"]') })
    await toggle.click()
    await page.getByRole("complementary", { name: "Agent view for First example", exact: true }).waitFor()
    await toggle.click()
    await page.getByRole("complementary", { name: "Agent view for First example", exact: true }).waitFor({ state: "detached" })
    assert.equal(await toggle.getAttribute("aria-checked"), "false")
    assert.equal(await input.inputValue(), "Edited while exploring")
    assert.equal(await page.evaluate(() => window.agentPreviewFixture.originalDemoInput === document.querySelector('input[aria-label="First demo input"]')), true)
    await toggle.click()
    await page.waitForFunction(() => {
      const inspector = document.querySelector('aside[aria-label="Agent view for First example"]')
      return inspector?.querySelector("[data-agent-parts]")?.textContent?.includes("Edited while exploring")
    })
    assert.equal(await input.inputValue(), "Edited while exploring")
    assert.equal(await page.evaluate(() => window.agentPreviewFixture.originalDemoInput === document.querySelector('input[aria-label="First demo input"]')), true)
  })

  test("the parts list reads in plain words and runs an action from a button", async (t) => {
    const page = await wrapperPageFor(t)
    await page.getByRole("switch", { name: "Agent view for First example", exact: true }).click()
    const inspector = page.getByRole("complementary", { name: "Agent view for First example", exact: true })
    const row = inspector.locator("[data-agent-part]").filter({ hasText: "First demo input" }).first()
    await row.waitFor()
    assert.match(await row.textContent(), /Value “First demo value”/)
    await row.getByRole("button", { name: "Set value", exact: true }).click()
    await row.locator("input").fill("Typed by the agent")
    await row.locator("input").press("Enter")
    await page.waitForFunction(() => document.querySelector('input[aria-label="First demo input"]')?.value === "Typed by the agent")
    await row.locator("[data-agent-run]").waitFor()
    assert.match(await row.locator("[data-agent-run]").textContent(), /setValue\("Typed by the agent"\)/)
    assert.equal(await row.locator("form").count(), 0, "the form closes after a successful run")
  })

  test("one click turns agent view on while a demo's select is open", async (t) => {
    const page = await wrapperPageFor(t)
    await page.getByRole("combobox", { name: "Region" }).first().click()
    await page.getByRole("listbox").first().waitFor()
    const toggle = page.getByRole("switch", { name: "Agent view for First example", exact: true })
    await toggle.click()
    assert.equal(await toggle.getAttribute("aria-checked"), "true")
  })

  test("each preview lists only its own mounted components", async (t) => {
    const page = await pageFor(t)
    const states = await page.evaluate(() => Object.fromEntries(Object.entries(window.agentPreviewFixture.sessions).map(([name, session]) => [name, session.getSnapshot()])))
    assert.equal(states.first.ready, true)
    assert.equal(states.second.ready, true)
    assert.equal(states.first.error, null)
    assert.ok(states.first.components.some((entry) => entry.value === "first-value"))
    assert.ok(states.second.components.some((entry) => entry.value === "second-value"))
    assert.ok(!states.first.components.some((entry) => entry.value === "second-value"))
    assert.ok(!states.second.components.some((entry) => entry.value === "first-value"))
    const firstRefs = new Set(states.first.components.map((entry) => entry.ref))
    assert.ok(states.second.components.every((entry) => !firstRefs.has(entry.ref)))
  })

  test("an action changes only the targeted preview despite duplicate labels", async (t) => {
    const page = await pageFor(t)
    const result = await page.evaluate(async () => {
      const fixture = window.agentPreviewFixture
      const target = fixture.sessions.first.getSnapshot().components.find((entry) => entry.component === "input")
      const result = await fixture.sessions.first.act({ ref: target.ref, action: "setValue", args: ["Atlas"] })
      return { result, values: [fixture.scopes.first.querySelector("input").value, fixture.scopes.second.querySelector("input").value] }
    })
    assert.equal(result.result.ok, true, result.result.error?.message)
    assert.deepEqual(result.values, ["Atlas", "second-value"])
  })

  test("a preview refuses actions targeting another preview", async (t) => {
    const page = await pageFor(t)
    const result = await page.evaluate(async () => {
      const fixture = window.agentPreviewFixture
      const foreign = fixture.sessions.second.getSnapshot().components.find((entry) => entry.component === "input")
      const result = await fixture.sessions.first.act({ ref: foreign.ref, action: "setValue", args: ["Leaked"] })
      return { result, second: fixture.scopes.second.querySelector("input").value }
    })
    assert.equal(result.result.ok, false)
    assert.ok(result.result.error?.message)
    assert.equal(result.second, "second-value")
  })

  test("an owned popup container cannot include another preview", async (t) => {
    const page = await pageFor(t)
    const result = await page.evaluate(async () => {
      const fixture = window.agentPreviewFixture
      const portal = document.createElement("div")
      portal.id = "shared-popup-region"
      document.body.append(portal)
      portal.append(fixture.scopes.second)
      fixture.scopes.first.querySelector("input").setAttribute("aria-controls", portal.id)
      await fixture.sessions.first.refresh()
      const foreign = fixture.sessions.second.getSnapshot().components.find((entry) => entry.component === "input")
      const state = fixture.sessions.first.getSnapshot()
      const action = await fixture.sessions.first.act({ ref: foreign.ref, action: "setValue", args: ["Foreign edit"] })
      return { state, action, foreignValue: fixture.scopes.second.querySelector("input").value }
    })
    assert.ok(!result.state.components.some((entry) => entry.value === "second-value"))
    assert.equal(result.action.ok, false)
    assert.equal(result.foreignValue, "second-value")
  })

  test("a popup cannot inspect a preview whose agent view is disabled", async (t) => {
    const page = await pageFor(t)
    const result = await page.evaluate(async () => {
      const fixture = window.agentPreviewFixture
      const foreign = fixture.sessions.second.getSnapshot().components.find((entry) => entry.component === "input")
      fixture.scopes.second.setAttribute("data-agent-preview-canvas", "")
      fixture.sessions.second.destroy()
      const portal = document.createElement("div")
      portal.id = "disabled-preview-popup-region"
      document.body.append(portal)
      portal.append(fixture.scopes.second)
      fixture.scopes.first.querySelector("input").setAttribute("aria-controls", portal.id)
      await fixture.sessions.first.refresh()
      return {
        state: fixture.sessions.first.getSnapshot(),
        action: await fixture.sessions.first.act({ ref: foreign.ref, action: "setValue", args: ["Foreign edit"] }),
        foreignValue: fixture.scopes.second.querySelector("input").value,
      }
    })
    assert.ok(!result.state.components.some((entry) => entry.value === "second-value"))
    assert.equal(result.action.ok, false)
    assert.equal(result.foreignValue, "second-value")
  })

  test("action results do not contain another preview's field values", async (t) => {
    const page = await pageFor(t)
    const result = await page.evaluate(async () => {
      const session = window.agentPreviewFixture.sessions.first
      const target = session.getSnapshot().components.find((entry) => entry.component === "input")
      return session.act({ ref: target.ref, action: "setValue", args: ["Atlas"] })
    })
    assert.equal(result.ok, true, result.error?.message)
    assert.ok(JSON.stringify(result).includes("Atlas"))
    assert.ok(!JSON.stringify(result).includes("second-value"))
  })

  test("concurrent actions retain each preview's authorization and result scope", async (t) => {
    const page = await pageFor(t)
    const result = await page.evaluate(async () => {
      const fixture = window.agentPreviewFixture
      const first = fixture.sessions.first.getSnapshot().components.find((entry) => entry.component === "input")
      const second = fixture.sessions.second.getSnapshot().components.find((entry) => entry.component === "input")
      const actions = await Promise.all([
        fixture.sessions.first.act({ ref: first.ref, action: "setValue", args: ["First edited"] }),
        fixture.sessions.second.act({ ref: second.ref, action: "setValue", args: ["Second edited"] }),
      ])
      return { actions, values: [fixture.scopes.first.querySelector("input").value, fixture.scopes.second.querySelector("input").value] }
    })
    assert.ok(result.actions.every((action) => action.ok))
    assert.deepEqual(result.values, ["First edited", "Second edited"])
    assert.ok(!JSON.stringify(result.actions[0]).includes("Second edited"))
    assert.ok(!JSON.stringify(result.actions[1]).includes("First edited"))
  })

  test("an action is refused if its target became disabled after inspection", async (t) => {
    const page = await pageFor(t)
    const ref = await page.evaluate(() => {
      const fixture = window.agentPreviewFixture
      const target = fixture.sessions.first.getSnapshot().components.find((entry) => entry.component === "input")
      fixture.renderScope("first", { inputDisabled: true })
      return target.ref
    })
    await page.waitForFunction(() => window.agentPreviewFixture.scopes.first.querySelector('input[aria-label="Shared setting"]')?.disabled)
    const result = await page.evaluate(async (ref) => {
      const fixture = window.agentPreviewFixture
      return { action: await fixture.sessions.first.act({ ref, action: "setValue", args: ["Disabled edit"] }), value: fixture.scopes.first.querySelector("input").value }
    }, ref)
    assert.equal(result.action.ok, false)
    assert.equal(result.value, "first-value")
  })

  test("choice queries return only the selected local component", async (t) => {
    const page = await pageFor(t)
    const result = await page.evaluate(async () => {
      const fixture = window.agentPreviewFixture
      const first = fixture.sessions.first.getSnapshot().components.find((entry) => entry.component === "select")
      const second = fixture.sessions.second.getSnapshot().components.find((entry) => entry.component === "select")
      return { found: await fixture.sessions.first.query(first.ref), foreignRef: second.ref }
    })
    assert.ok(Array.isArray(result.found))
    assert.equal(result.found.length, 1)
    assert.notEqual(result.found[0].ref, result.foreignRef)
    assert.ok(result.found[0].items.some((item) => item.value === "asia"))
  })

  test("choice queries refuse a component from another preview", async (t) => {
    const page = await pageFor(t)
    const result = await page.evaluate(async () => {
      const fixture = window.agentPreviewFixture
      const foreign = fixture.sessions.second.getSnapshot().components.find((entry) => entry.component === "select")
      return fixture.sessions.first.query(foreign.ref)
    })
    assert.equal(typeof result.error, "string")
  })

  test("the panel's hidden controls never appear in the preview snapshot", async (t) => {
    const page = await pageFor(t, { inspector: true })
    const state = await page.evaluate(() => window.agentPreviewFixture.sessions.first.getSnapshot())
    assert.ok(!JSON.stringify(state.components).includes("Inspector argument"))
    assert.ok(!JSON.stringify(state.components).includes("panel-only"))
  })

  test("a marked demo excludes surrounding preview controls", async (t) => {
    const page = await pageFor(t, { contentMarker: true })
    const state = await page.evaluate(() => window.agentPreviewFixture.sessions.first.getSnapshot())
    assert.ok(state.components.some((entry) => entry.value === "first-value"))
    assert.ok(!JSON.stringify(state.components).includes("Outer resize control"))
    assert.ok(!JSON.stringify(state.components).includes("chrome-only"))
  })

  test("an asynchronously mounted content marker narrows the session scope", async (t) => {
    const page = await pageFor(t)
    await page.evaluate(() => window.agentPreviewFixture.renderScope("first", { contentMarker: true, inputKey: "loaded-demo", inputValue: "Loaded demo" }))
    await page.waitForFunction(() => window.agentPreviewFixture.scopes.first.querySelector("[data-agent-preview-content] input")?.value === "Loaded demo")
    await page.evaluate(() => window.agentPreviewFixture.sessions.first.refresh())
    const state = await page.evaluate(() => window.agentPreviewFixture.sessions.first.getSnapshot())
    assert.ok(state.components.some((entry) => entry.value === "Loaded demo"))
    assert.ok(!JSON.stringify(state.components).includes("Outer resize control"))
    assert.ok(!JSON.stringify(state.components).includes("chrome-only"))
  })

  test("read-only content changes update the session and notify its subscriber", async (t) => {
    const page = await pageFor(t)
    await page.evaluate(() => {
      const fixture = window.agentPreviewFixture
      fixture.notifications = 0
      fixture.sessions.first.subscribe(() => fixture.notifications++)
      fixture.renderScope("first", { content: "Your booking is confirmed" })
    })
    await page.waitForFunction(() => window.agentPreviewFixture.sessions.first.getSnapshot().components.some((entry) => entry.component === "message" && entry.content?.includes("Your booking is confirmed")))
    assert.ok(await page.evaluate(() => window.agentPreviewFixture.notifications > 0))
  })

  test("a preview's change log excludes another preview's actions", async (t) => {
    const page = await pageFor(t)
    const state = await page.evaluate(async () => {
      const fixture = window.agentPreviewFixture
      const target = fixture.sessions.second.getSnapshot().components.find((entry) => entry.component === "input")
      await fixture.sessions.second.act({ ref: target.ref, action: "setValue", args: ["Outside edit"] })
      return fixture.sessions.first.getSnapshot()
    })
    assert.ok(!JSON.stringify(state.changes).includes("Outside edit"))
  })

  test("a stacked inspector stays live while its canvas is above the viewport", async (t) => {
    const page = await pageFor(t)
    await page.setViewportSize({ width: 390, height: 500 })
    await page.evaluate(async () => {
      const fixture = window.agentPreviewFixture
      const layout = document.createElement("div")
      layout.setAttribute("data-agent-preview-layout", "")
      document.body.prepend(layout)
      layout.append(fixture.scopes.first)
      fixture.scopes.first.style.height = "200px"
      const inspector = document.createElement("aside")
      inspector.style.height = "600px"
      inspector.textContent = "Agent view"
      layout.append(inspector)
      fixture.sessions.first.destroy()
      fixture.sessions.first = fixture.createAgentPreviewSession(fixture.scopes.first)
      window.scrollTo(0, 300)
      await new Promise(requestAnimationFrame)
      await new Promise(requestAnimationFrame)
      fixture.renderScope("first", { content: "Updated while the stacked inspector is visible" })
    })
    await page.waitForFunction(() => window.agentPreviewFixture.sessions.first.getSnapshot().components.some((entry) => entry.content?.includes("Updated while the stacked inspector is visible")), {}, { timeout: 3000 })
  })

  test("removed controls disappear and their stale refs cannot be acted on", async (t) => {
    const page = await pageFor(t)
    const staleRef = await page.evaluate(() => {
      const fixture = window.agentPreviewFixture
      const ref = fixture.sessions.first.getSnapshot().components.find((entry) => entry.component === "input").ref
      fixture.renderScope("first", { includeInput: false })
      return ref
    })
    await page.waitForFunction(() => !window.agentPreviewFixture.scopes.first.querySelector('input[aria-label="Shared setting"]'))
    const result = await page.evaluate(async (ref) => {
      const session = window.agentPreviewFixture.sessions.first
      await session.refresh()
      return { state: session.getSnapshot(), action: await session.act({ ref, action: "setValue", args: ["Stale"] }) }
    }, staleRef)
    assert.ok(!result.state.components.some((entry) => entry.ref === staleRef))
    assert.equal(result.action.ok, false)
  })

  test("resetting a demo refreshes its values without keeping stale results", async (t) => {
    const page = await pageFor(t)
    await page.evaluate(async () => {
      const fixture = window.agentPreviewFixture
      const target = fixture.sessions.first.getSnapshot().components.find((entry) => entry.component === "input")
      await fixture.sessions.first.act({ ref: target.ref, action: "setValue", args: ["Edited"] })
      fixture.renderScope("first", { inputKey: "reset-input", inputValue: "Reset value" })
    })
    await page.waitForFunction(() => window.agentPreviewFixture.scopes.first.querySelector("input")?.value === "Reset value")
    await page.evaluate(() => window.agentPreviewFixture.sessions.first.refresh())
    const state = await page.evaluate(() => window.agentPreviewFixture.sessions.first.getSnapshot())
    assert.ok(state.components.some((entry) => entry.component === "input" && entry.value === "Reset value"))
    assert.ok(!state.components.some((entry) => entry.component === "input" && entry.value === "Edited"))
  })

  test("destroyed sessions stop notifying subscribers", async (t) => {
    const page = await pageFor(t)
    const result = await page.evaluate(async () => {
      const fixture = window.agentPreviewFixture
      fixture.notifications = 0
      const session = fixture.sessions.first
      session.subscribe(() => fixture.notifications++)
      session.destroy()
      const before = fixture.notifications
      fixture.renderScope("first", { content: "Updated after disposal" })
      await new Promise(requestAnimationFrame)
      await new Promise(requestAnimationFrame)
      return { before, after: fixture.notifications }
    })
    assert.equal(result.after, result.before)
  })

  test("a local component beyond the global snapshot limit remains discoverable", async (t) => {
    const page = await pageFor(t)
    await page.evaluate(() => {
      const fixture = window.agentPreviewFixture
      fixture.createScope("filler", { includeInput: false, includeSelect: false, includeMessage: false })
      fixture.renderFiller(110)
    })
    await page.waitForFunction(() => window.agentPreviewFixture.scopes.filler.querySelectorAll("input").length === 110)
    await page.evaluate(() => window.agentPreviewFixture.createScope("late", {
      inputLabel: "Rare preview target", inputValue: "Late local value", includeSelect: false, includeMessage: false,
    }))
    await page.waitForFunction(() => window.agentPreviewFixture.scopes.late.querySelector("input"))
    const result = await page.evaluate(async () => {
      const fixture = window.agentPreviewFixture
      await fixture.sessions.late.refresh()
      return { global: fixture.agent.snapshot(), local: fixture.sessions.late.getSnapshot() }
    })
    assert.ok(result.global.some((entry) => entry.component === "more"), "The fixture must actually exceed the SDK page limit")
    assert.ok(result.local.components.some((entry) => entry.value === "Late local value"), JSON.stringify(result.local))
    assert.ok(!JSON.stringify(result.local.components).includes("outside-value-"))
    assert.ok(result.local.components.every((entry) => entry.component !== "more"), "A page-wide omitted count is not a local component")
  })

  test("a large preview reports truncation whenever local components are omitted", async (t) => {
    const page = await pageFor(t)
    await page.evaluate(() => {
      const fixture = window.agentPreviewFixture
      fixture.createScope("filler", { includeInput: false, includeSelect: false, includeMessage: false })
      fixture.renderFiller(110)
    })
    await page.waitForFunction(() => window.agentPreviewFixture.scopes.filler.querySelectorAll("input").length === 110)
    const state = await page.evaluate(async () => {
      const session = window.agentPreviewFixture.sessions.filler
      await session.refresh()
      return session.getSnapshot()
    })
    const exposedInputs = state.components.filter((entry) => entry.component === "input").length
    assert.ok(exposedInputs > 0)
    if (exposedInputs < 110) assert.equal(state.truncated, true, "Missing local entries must not be presented as a complete snapshot")
  })
})
