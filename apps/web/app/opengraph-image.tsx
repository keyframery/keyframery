import fs from "node:fs/promises"
import path from "node:path"

import { ImageResponse } from "next/og"

export const alt = "Keyframery: your UI is full of jump cuts"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Schibsted Grotesk (SIL Open Font License), bundled so the image renders without a network fetch.
const font = (file: string) => fs.readFile(path.join(process.cwd(), "assets", file))

export default async function Image() {
  const [regular, bold] = await Promise.all([font("SchibstedGrotesk-Regular.ttf"), font("SchibstedGrotesk-Bold.ttf")])
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#FCFCFD", color: "#16181D", padding: 72, fontFamily: "Schibsted Grotesk" }}>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>Keyframery</div>
        <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -3.5, lineHeight: 1, maxWidth: 1000 }}>Your UI is full of jump cuts.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", height: 44, flex: 1, borderRadius: 8, border: "2px solid #E4E6EB", position: "relative" }}>
            <div style={{ position: "absolute", left: 120, top: 10, width: 220, height: 20, borderRadius: 4, background: "#16181D" }} />
            <div style={{ position: "absolute", left: 420, top: 10, width: 140, height: 20, borderRadius: 4, background: "#16181D" }} />
            <div style={{ position: "absolute", right: 0, top: -10, width: 3, height: 60, background: "#E5484D" }} />
          </div>
          <div style={{ fontSize: 28, color: "#5B6170" }}>Film cuts for shadcn/ui</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Schibsted Grotesk", data: regular, weight: 400 }, { name: "Schibsted Grotesk", data: bold, weight: 700 }] },
  )
}
