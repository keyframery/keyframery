/* Writes the brand icons from lib/logo.ts: app/icon.svg, app/apple-icon.png, app/favicon.ico and the plugin's
   logo.png. Run after changing the logo: pnpm -C apps/web icons */

import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { Resvg } from "@resvg/resvg-js"

import { tileSvg } from "../lib/logo.ts"

const web = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const png = (size) => new Resvg(tileSvg(), { fitTo: { mode: "width", value: size } }).render().asPng()

/** An .ico that holds PNG images: a 6-byte header, a 16-byte entry per image, then the PNGs. */
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length)
  head.writeUInt16LE(0, 0)
  head.writeUInt16LE(1, 2)
  head.writeUInt16LE(images.length, 4)
  let offset = head.length
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i
    head.writeUInt8(size >= 256 ? 0 : size, e)
    head.writeUInt8(size >= 256 ? 0 : size, e + 1)
    head.writeUInt16LE(1, e + 4) // colour planes
    head.writeUInt16LE(32, e + 6) // bits per pixel
    head.writeUInt32LE(data.length, e + 8)
    head.writeUInt32LE(offset, e + 12)
    offset += data.length
  })
  return Buffer.concat([head, ...images.map((i) => i.data)])
}

await fs.writeFile(path.join(web, "app/icon.svg"), tileSvg() + "\n")
await fs.writeFile(path.join(web, "app/apple-icon.png"), png(180))
await fs.writeFile(path.join(web, "app/favicon.ico"), ico([16, 32].map((size) => ({ size, data: png(size) }))))
const plugin = path.join(web, "../../plugins/keyframery")
await fs.mkdir(plugin, { recursive: true })
await fs.writeFile(path.join(plugin, "logo.png"), png(512))
console.log("Wrote app/icon.svg, app/apple-icon.png, app/favicon.ico and plugins/keyframery/logo.png")
