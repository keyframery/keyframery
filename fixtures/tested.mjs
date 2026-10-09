// What the fixture apps are built and tested with: the shadcn CLI pin in tested.json, and the package versions
// the fixtures' lockfiles installed. The fixture scripts, the drift check and the site's "Tested with" line read it,
// so the site can only name versions the tests really ran.
import fs from "node:fs"
import path from "node:path"

const HERE = path.dirname(new URL(import.meta.url).pathname)
const config = JSON.parse(fs.readFileSync(path.join(HERE, "tested.json"), "utf8"))

/** The shadcn CLI the fixtures install with. SHADCN_VERSION overrides it (for example `latest`, to re-test). */
export const SHADCN_CLI = process.env.SHADCN_VERSION ?? config.shadcnCli

/** Fixture app directory and shadcn style, per base. */
export const FIXTURES = Object.entries(config.styles).map(([base, style]) => ({ base, style, dir: path.join(HERE, `next-${base}`) }))

/** The pinned CLI and each tested package's installed version. Throws if the two fixtures installed different versions. */
export function tested() {
  const packages = config.packages.map((name) => {
    const versions = new Set()
    for (const { dir } of FIXTURES) {
      const lock = JSON.parse(fs.readFileSync(path.join(dir, "package-lock.json"), "utf8"))
      const version = lock.packages[`node_modules/${name}`]?.version
      if (version) versions.add(version)
    }
    if (versions.size !== 1) throw new Error(`${name}: the fixtures installed ${versions.size ? [...versions].join(" and ") : "no version"}`)
    return { name, version: [...versions][0] }
  })
  return { shadcnCli: config.shadcnCli, packages }
}
