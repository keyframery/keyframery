import { DM_Sans, Figtree, Manrope } from "next/font/google"

import { CreatePage } from "@site/components/create/create-page"
import { JsonLd, pageMetadata } from "@site/lib/seo"
import { SITE } from "@site/lib/shared"

export const metadata = pageMetadata({
  title: "Create a theme preset for UI SDK components",
  description:
    "Pick a base colour, theme colour, radius, font and motion style, see them on live Keyframery components, then install the preset with one shadcn CLI command.",
  path: "/create",
})

/* The preview can show these fonts; Inter (fontsource) and Geist (the site's font) are already loaded.
   Only fetched when a visitor picks one. */
const figtree = Figtree({ subsets: ["latin"], variable: "--font-kf-figtree", display: "swap", preload: false })
const manrope = Manrope({ subsets: ["latin"], variable: "--font-kf-manrope", display: "swap", preload: false })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-kf-dm-sans", display: "swap", preload: false })

const data = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Keyframery Create",
  url: `${SITE}/create`,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description: "A theme builder for Keyframery's animated UI SDK components: colours, radius, font and motion as one preset code for the shadcn CLI.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  isPartOf: { "@id": `${SITE}/#website` },
}

export default function Page() {
  return (
    <div className={`${figtree.variable} ${manrope.variable} ${dmSans.variable} flex flex-1 flex-col`}>
      <JsonLd data={data} />
      <CreatePage />
    </div>
  )
}
