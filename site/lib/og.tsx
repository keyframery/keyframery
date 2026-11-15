import fs from "node:fs/promises"
import path from "node:path"

import { ImageResponse } from "next/og"

import { COLORS, MARK } from "./logo"

export const OG_SIZE = { width: 1200, height: 630 }

// Geist (SIL Open Font License), bundled so the image renders without a network fetch.
const font = (file: string) => fs.readFile(path.join(process.cwd(), "assets", file))

/** The social card: the logo, a headline, and a line under it. Dark, like the landing page. */
export async function ogImage({ eyebrow, title, footer }: { eyebrow?: string; title: string; footer: string }) {
  const [regular, bold] = await Promise.all([font("Geist-Regular.ttf"), font("Geist-Bold.ttf")])
  const size = title.length > 34 ? 64 : 80
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          fontFamily: "Geist",
          color: "#F4F3F0",
          background: "radial-gradient(120% 80% at 50% 120%, #1b3c8f 0%, #071431 45%, #050608 75%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
          <svg width="36" height="36" viewBox="0 0 32 32">
            <polygon points={MARK.ink} fill="#F4F3F0" stroke="#F4F3F0" strokeWidth="1.3" strokeLinejoin="round" />
            <polygon points={MARK.cut} fill={COLORS.cutOnTile} stroke={COLORS.cutOnTile} strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          Keyframery
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {eyebrow ? <div style={{ fontSize: 28, color: "#a5b4ff" }}>{eyebrow}</div> : null}
          <div style={{ display: "flex", fontSize: size, fontWeight: 700, letterSpacing: -2.6, lineHeight: 1.05, maxWidth: 1000 }}>{title}</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#9A9890" }}>{footer}</div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "Geist", data: regular, weight: 400 }, { name: "Geist", data: bold, weight: 700 }] },
  )
}
