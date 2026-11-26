/* Defines the <ui-*> elements. The look and motion come only from keyframery.css (linked in index.html). */
import "@ui-sdk/web/tabs"
import "@ui-sdk/web/switch"
import "@ui-sdk/web/popover"
import "@ui-sdk/web/accordion"
import "@ui-sdk/web/checkbox"
import "@ui-sdk/web/select"
import "@ui-sdk/web/dialog"
import "@ui-sdk/web/segmented-control"

const show = () => {
  const slug = location.hash.replace(/^#\/?/, "")
  for (const s of document.querySelectorAll<HTMLElement>("section[data-demo]")) s.hidden = !!slug && s.dataset.demo !== slug
}
window.addEventListener("hashchange", show)
show()
