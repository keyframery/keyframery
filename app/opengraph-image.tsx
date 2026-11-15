import { OG_SIZE, ogImage } from "@site/lib/og"

export const alt = "Keyframery: animated components for UI SDK"
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return ogImage({ title: "Swap one import. Your UI SDK components animate.", footer: "60 animated components · plain CSS · four motion styles" })
}
