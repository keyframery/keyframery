/** Significant public-content edits, checked by the author. Unknown dates stay absent from the sitemap.
 * Update an entry when its answer, examples or supported behavior changes. Do not use build time,
 * filesystem mtime, a deployment date, or a metadata-only edit as the content's modification date.
 */
export const CONTENT_MODIFIED: Readonly<Record<string, string>> = {
  "/": "2026-10-19",
  "/theme": "2026-10-19",
  "/docs": "2026-10-19",
  "/docs/components/dialog": "2026-10-19",
  "/docs/components/tabs": "2026-10-19",
  "/docs/helpers/list-cut": "2026-10-19",
  "/docs/helpers/load-cut": "2026-10-19",
  "/docs/guides/animations-not-working": "2026-10-19",
  "/docs/guides/detail-routes": "2026-10-19",
  "/docs/compare": "2026-10-19",
  "/docs/ai-tools": "2026-10-19",
  "/privacy": "2026-10-19",
}
