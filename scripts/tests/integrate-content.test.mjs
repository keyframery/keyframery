import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { integrateContent } from "../integrate-content.mjs"

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "keyframery-content-"))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  fs.mkdirSync(path.join(root, "content/pending"), { recursive: true })
  fs.mkdirSync(path.join(root, "src/components/ui"), { recursive: true })
  const write = (file, value) => fs.writeFileSync(path.join(root, file), JSON.stringify(value))
  const read = (file) => JSON.parse(fs.readFileSync(path.join(root, "content", file), "utf8"))
  return { root, write, read }
}

test("integrates a builder's metadata without losing established content and is idempotent", (t) => {
  const { root, write, read } = fixture(t)
  fs.writeFileSync(path.join(root, "src/components/ui/alert.tsx"), "")
  write("content/components.json", { button: "Existing button" })
  write("content/moves.json", { moves: { Unfold: "Shared definition" }, components: { button: [["Press", "Existing move"]] } })
  write("content/prop-docs.json", { "Button.speed": "Existing speed" })
  write("content/pending/alert.json", {
    description: "New alert", moves: [["Unfold", "Arrives"]], keyboard: [["Enter", "Dismiss"]],
    propDocs: { "Alert.open": "Controlled state" }, cssVars: [["--alert-face", "Surface", "--background"]],
  })
  assert.equal(integrateContent(root), 1)
  assert.deepEqual(read("components.json"), { button: "Existing button", alert: "New alert" })
  assert.deepEqual(read("moves.json").moves, { Unfold: "Shared definition" })
  assert.deepEqual(read("moves.json").components.button, [["Press", "Existing move"]])
  assert.equal(read("prop-docs.json")["Button.speed"], "Existing speed")
  assert.deepEqual(read("theming.json").alert, [["--alert-face", "Surface", "--background"]])
  const before = fs.readFileSync(path.join(root, "content/prop-docs.json"), "utf8")
  integrateContent(root)
  assert.equal(fs.readFileSync(path.join(root, "content/prop-docs.json"), "utf8"), before)
})

test("rejects orphan metadata and malformed CSS variable rows before publishing manifests", (t) => {
  const { root, write } = fixture(t)
  write("content/pending/missing.json", { description: "Orphan" })
  assert.throws(() => integrateContent(root), /no matching component/)
  fs.rmSync(path.join(root, "content/pending/missing.json"))
  fs.writeFileSync(path.join(root, "src/components/ui/alert.tsx"), "")
  write("content/pending/alert.json", { cssVars: [["--alert-face", "missing fallback"]] })
  assert.throws(() => integrateContent(root), /Invalid cssVars/)
  assert.equal(fs.existsSync(path.join(root, "content/components.json")), false)
})
