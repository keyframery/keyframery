import { SITE_IMAGE } from "@site/lib/seo"
import { SITE } from "@site/lib/shared"

export const dynamic = "force-static"

// Keep previously shared image URLs working without file-based metadata overriding page cards.
export function GET() {
  return Response.redirect(new URL(SITE_IMAGE.url, SITE), 308)
}
