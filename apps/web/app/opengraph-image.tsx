import fs from "node:fs/promises"
import path from "node:path"

import { ImageResponse } from "next/og"

import { COLORS, MARK } from "@/lib/logo"

export const alt = "Keyframery: add one line, and your shadcn/ui app animates"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Schibsted Grotesk (SIL Open Font License), bundled so the image renders without a network fetch.
const font = (file: string) => fs.readFile(path.join(process.cwd(), "assets", file))

export default async function Image() {
  const [regular, bold] = await Promise.all([font("SchibstedGrotesk-Regular.ttf"), font("SchibstedGrotesk-Bold.ttf")])
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#FCFCFD", color: "#16181D", padding: 72, fontFamily: "Schibsted Grotesk" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
          <svg width="36" height="36" viewBox="0 0 32 32">
            <polygon points={MARK.ink} fill={COLORS.ink} stroke={COLORS.ink} strokeWidth="1.3" strokeLinejoin="round" />
            <polygon points={MARK.cut} fill={COLORS.cut} stroke={COLORS.cut} strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          Keyframery
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, letterSpacing: -2.9, lineHeight: 1.06 }}>
          <span>Add one line.</span>
          <span>Your shadcn/ui app animates.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", height: 56, padding: "0 24px", borderRadius: 10, border: "2px solid #E4E6EB", borderLeft: "6px solid #2447F5", background: "#FFFFFF", fontSize: 30, fontWeight: 700 }}>
            {"<Cuts />"}
          </div>
          <div style={{ fontSize: 28, color: "#5B6170" }}>Dialogs, tabs, lists, numbers and loading states, animated.</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Schibsted Grotesk", data: regular, weight: 400 }, { name: "Schibsted Grotesk", data: bold, weight: 700 }] },
  )
}
