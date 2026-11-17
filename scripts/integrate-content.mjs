// Merge component-builder handoffs before generating the registry and docs.
// Kept idempotent so a standalone docs/registry build sees the same metadata.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

export function integrateContent(root) {
  const content = path.join(root, "content")
  const pending = path.join(content, "pending")
  if (!fs.existsSync(pending)) return 0
  const read = (name, fallback) => {
    const file = path.join(content, name)
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback
  }
  const descriptions = read("components.json", {})
  const moves = read("moves.json", { moves: {}, components: {} })
  const keyboard = read("keyboard.json", {})
  const propDocs = read("prop-docs.json", {})
  const theming = read("theming.json", {})
  const files = fs.readdirSync(pending).filter((file) => file.endsWith(".json")).sort()
  for (const file of files) {
    const slug = file.slice(0, -5)
    if (!/^[a-z][a-z-]*$/.test(slug) || !fs.existsSync(path.join(root, "src/components/ui", `${slug}.tsx`)))
      throw new Error(`Component metadata has no matching component: ${file}`)
    const data = JSON.parse(fs.readFileSync(path.join(pending, file), "utf8"))
    if (data.description !== undefined) descriptions[slug] = data.description
    if (data.moves !== undefined) moves.components[slug] = data.moves
    if (data.keyboard !== undefined) keyboard[slug] = data.keyboard
    if (data.propDocs !== undefined) Object.assign(propDocs, data.propDocs)
    if (data.cssVars !== undefined) {
      if (!Array.isArray(data.cssVars) || data.cssVars.some((row) => !Array.isArray(row) || row.length !== 3 || row.some((cell) => typeof cell !== "string")))
        throw new Error(`Invalid cssVars in ${file}: expected [name, description, default] rows`)
      theming[slug] = data.cssVars
    }
  }
  for (const [name, data] of Object.entries({ "components.json": descriptions, "moves.json": moves, "keyboard.json": keyboard, "prop-docs.json": propDocs, "theming.json": theming })) {
    const file = path.join(content, name)
    const next = JSON.stringify(data, null, 2) + "\n"
    if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== next) fs.writeFileSync(file, next)
  }
  return files.length
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const count = integrateContent(path.resolve(import.meta.dirname, ".."))
  console.log(`content: integrated ${count} component handoffs`)
}
