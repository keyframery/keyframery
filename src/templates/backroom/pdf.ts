/* A small PDF writer for the printable documents (the invoice and the packing slip): A4 pages with
   text in the two fonts every PDF reader has (Helvetica and Helvetica-Bold), lines, filled boxes and
   JPEG photos. No library: a document like this is a few hundred bytes of plain PDF around the
   photos. Coordinates are in points from the top-left corner of the page; an A4 page is 595 × 842.

   const doc = new PdfDocument()
   const page = doc.addPage()
   page.text("Invoice", 48, 64, { size: 20, bold: true })
   const bytes = doc.save() // a Uint8Array to download */

/* Widths of Helvetica and Helvetica-Bold in WinAnsi encoding, codes 32 to 255, in thousandths of the font size.
   (Arial is drawn to the same widths; these were measured from it.) */
const REGULAR = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, 376,
  556, 0, 222, 556, 333, 1000, 556, 556, 333, 1000, 667, 333, 1000, 0, 611, 0, 0, 222, 222, 333, 333, 350, 556, 1000, 333, 1000, 500, 333, 944, 0, 500, 667,
  278, 333, 556, 556, 556, 556, 260, 556, 333, 737, 370, 556, 584, 0, 737, 552, 400, 549, 333, 333, 333, 576, 537, 333, 333, 333, 365, 556, 834, 834, 834, 611,
  667, 667, 667, 667, 667, 667, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611,
  556, 556, 556, 556, 556, 556, 889, 500, 556, 556, 556, 556, 278, 278, 278, 278, 556, 556, 556, 556, 556, 556, 556, 549, 611, 556, 556, 556, 556, 500, 556, 500,
]
const BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, 376,
  556, 0, 278, 556, 500, 1000, 556, 556, 333, 1000, 667, 333, 1000, 0, 611, 0, 0, 278, 278, 500, 500, 350, 556, 1000, 333, 1000, 556, 333, 944, 0, 500, 667,
  278, 333, 556, 556, 556, 556, 280, 556, 333, 737, 370, 556, 584, 0, 737, 552, 400, 549, 333, 333, 333, 576, 556, 333, 333, 333, 365, 556, 834, 834, 834, 611,
  722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611,
  556, 556, 556, 556, 556, 556, 889, 556, 556, 556, 556, 556, 278, 278, 278, 278, 611, 611, 611, 611, 611, 611, 611, 549, 611, 611, 611, 611, 611, 556, 611, 556,
]

/* WinAnsi's codes 128 to 159 hold these characters; 32 to 127 and 160 to 255 are the same as Unicode. */
const HIGH: Record<number, number> = {
  0x20ac: 128, 0x201a: 130, 0x192: 131, 0x201e: 132, 0x2026: 133, 0x2020: 134, 0x2021: 135, 0x2c6: 136, 0x2030: 137, 0x160: 138, 0x2039: 139, 0x152: 140, 0x17d: 142,
  0x2018: 145, 0x2019: 146, 0x201c: 147, 0x201d: 148, 0x2022: 149, 0x2013: 150, 0x2014: 151, 0x2dc: 152, 0x2122: 153, 0x161: 154, 0x203a: 155, 0x153: 156, 0x17e: 158, 0x178: 159,
}

/** A character's WinAnsi code; characters the fonts don't have become "?". A narrow no-break space becomes a space. */
function code(ch: string) {
  const u = ch.codePointAt(0) ?? 63
  if (u === 0x202f || u === 0xa0) return 32
  if ((u >= 32 && u < 127) || (u >= 160 && u < 256)) return u
  return HIGH[u] ?? 63
}

export const PAGE = { width: 595.28, height: 841.89 }

type TextOptions = { size?: number; bold?: boolean; gray?: number; align?: "left" | "right" | "center" }

/** How wide `text` is at `size` points. */
export function measure(text: string, size: number, bold = false) {
  const table = bold ? BOLD : REGULAR
  let width = 0
  for (const ch of text) width += table[code(ch) - 32] ?? 556
  return (width * size) / 1000
}

/** Breaks `text` into lines no wider than `width`. */
export function wrap(text: string, width: number, size: number, bold = false) {
  const lines: string[] = []
  let line = ""
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word
    if (line && measure(next, size, bold) > width) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

const num = (n: number) => (Math.round(n * 100) / 100).toString()

function literal(text: string) {
  let out = "("
  for (const ch of text) {
    const c = code(ch)
    if (c === 40 || c === 41 || c === 92) out += `\\${String.fromCharCode(c)}`
    else if (c > 126) out += `\\${c.toString(8).padStart(3, "0")}`
    else out += String.fromCharCode(c)
  }
  return `${out})`
}

export type PdfImage = { name: string; bytes: Uint8Array; width: number; height: number; components: number }

/** Reads a JPEG's size and colour channels from its frame header. Returns null for anything that isn't a JPEG. */
export function jpegInfo(bytes: Uint8Array): Omit<PdfImage, "name" | "bytes"> | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null
  let i = 2
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) return null
    const marker = bytes[i + 1]
    const length = (bytes[i + 2] << 8) | bytes[i + 3]
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc)
      return { height: (bytes[i + 5] << 8) | bytes[i + 6], width: (bytes[i + 7] << 8) | bytes[i + 8], components: bytes[i + 9] }
    i += 2 + length
  }
  return null
}

export class PdfPage {
  ops: string[] = []
  images = new Set<string>()

  private y(top: number) {
    return PAGE.height - top
  }

  /** Writes one line of text with its baseline at `top`. */
  text(text: string, x: number, top: number, { size = 10, bold = false, gray = 0, align = "left" }: TextOptions = {}) {
    const w = measure(text, size, bold)
    const left = align === "right" ? x - w : align === "center" ? x - w / 2 : x
    this.ops.push(`BT /${bold ? "F2" : "F1"} ${num(size)} Tf ${num(gray)} g ${num(left)} ${num(this.y(top))} Td ${literal(text)} Tj ET`)
    return w
  }

  line(x1: number, top1: number, x2: number, top2: number, { width = 0.5, gray = 0.85 } = {}) {
    this.ops.push(`${num(gray)} G ${num(width)} w ${num(x1)} ${num(this.y(top1))} m ${num(x2)} ${num(this.y(top2))} l S`)
  }

  rect(x: number, top: number, w: number, h: number, { fill, stroke, width = 0.75 }: { fill?: number; stroke?: number; width?: number } = {}) {
    const box = `${num(x)} ${num(this.y(top + h))} ${num(w)} ${num(h)} re`
    if (fill !== undefined) this.ops.push(`${num(fill)} g ${box} f`)
    if (stroke !== undefined) this.ops.push(`${num(stroke)} G ${num(width)} w ${box} S`)
  }

  /** Draws an image filling the box and cropped to it, like `object-fit: cover`. */
  image(img: PdfImage, x: number, top: number, w: number, h: number) {
    this.images.add(img.name)
    const scale = Math.max(w / img.width, h / img.height)
    const dw = img.width * scale
    const dh = img.height * scale
    const dx = x - (dw - w) / 2
    const dy = this.y(top + h) - (dh - h) / 2
    this.ops.push(`q ${num(x)} ${num(this.y(top + h))} ${num(w)} ${num(h)} re W n ${num(dw)} 0 0 ${num(dh)} ${num(dx)} ${num(dy)} cm /${img.name} Do Q`)
  }
}

export class PdfDocument {
  pages: PdfPage[] = []
  images = new Map<string, PdfImage>()

  title: string

  constructor(title = "") {
    this.title = title
  }

  addPage() {
    const page = new PdfPage()
    this.pages.push(page)
    return page
  }

  /** Adds a JPEG once and returns it for `page.image`. Null when the bytes aren't a JPEG. */
  addJpeg(key: string, bytes: Uint8Array): PdfImage | null {
    const known = this.images.get(key)
    if (known) return known
    const info = jpegInfo(bytes)
    if (!info) return null
    const img = { name: `Im${this.images.size + 1}`, bytes, ...info }
    this.images.set(key, img)
    return img
  }

  /** The finished file. */
  save(): Uint8Array {
    const chunks: Uint8Array[] = []
    const offsets: number[] = []
    let length = 0
    const push = (part: string | Uint8Array) => {
      const bytes = typeof part === "string" ? latin1(part) : part
      chunks.push(bytes)
      length += bytes.length
    }
    const object = (n: number, body: string | (string | Uint8Array)[]) => {
      offsets[n] = length
      push(`${n} 0 obj\n`)
      for (const part of Array.isArray(body) ? body : [body]) push(part)
      push("\nendobj\n")
    }

    const images = [...this.images.values()]
    const fontRegular = 3
    const fontBold = 4
    const firstImage = 5
    const firstPage = firstImage + images.length
    const pageIds = this.pages.map((_, i) => firstPage + i * 2)

    push("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    object(1, `<< /Type /Catalog /Pages 2 0 R >>`)
    object(2, `<< /Type /Pages /Count ${this.pages.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`)
    object(fontRegular, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
    object(fontBold, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
    images.forEach((img, i) => {
      const space = img.components === 1 ? "/DeviceGray" : img.components === 4 ? "/DeviceCMYK /Decode [1 0 1 0 1 0 1 0]" : "/DeviceRGB"
      object(firstImage + i, [`<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace ${space} /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.bytes.length} >>\nstream\n`, img.bytes, "\nendstream"])
    })
    this.pages.forEach((page, i) => {
      const id = pageIds[i]
      const xobjects = [...page.images].map((name) => `/${name} ${firstImage + images.findIndex((img) => img.name === name)} 0 R`).join(" ")
      object(id, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE.width} ${PAGE.height}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >>${xobjects ? ` /XObject << ${xobjects} >>` : ""} >> /Contents ${id + 1} 0 R >>`)
      const stream = page.ops.join("\n")
      object(id + 1, [`<< /Length ${latin1(stream).length} >>\nstream\n`, stream, "\nendstream"])
    })
    const info = firstPage + this.pages.length * 2
    object(info, `<< /Title ${literal(this.title)} /Producer (Backroom) >>`)

    const xref = length
    const count = info + 1
    let table = `xref\n0 ${count}\n0000000000 65535 f \n`
    for (let n = 1; n < count; n++) table += `${String(offsets[n]).padStart(10, "0")} 00000 n \n`
    push(table)
    push(`trailer\n<< /Size ${count} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`)

    const out = new Uint8Array(length)
    let at = 0
    for (const chunk of chunks) {
      out.set(chunk, at)
      at += chunk.length
    }
    return out
  }
}

/** Plain PDF syntax is bytes: one byte per character (the text inside is already WinAnsi or escaped). */
function latin1(text: string) {
  const out = new Uint8Array(text.length)
  for (let i = 0; i < text.length; i++) out[i] = text.charCodeAt(i) & 0xff
  return out
}
