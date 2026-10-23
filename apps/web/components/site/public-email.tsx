/** Cloudflare's documented opt-out keeps public/demo addresses from adding its blocking decoder. */
export function PublicEmail({ address, link = false, className }: { address: string; link?: boolean; className?: string }) {
  const escaped = address.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!)
  const content = link ? `<a href="mailto:${escaped}">${escaped}</a>` : escaped
  return <span className={className} dangerouslySetInnerHTML={{ __html: `<!--email_off-->${content}<!--/email_off-->` }} />
}
