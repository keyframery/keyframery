/* Read-only content for the agent bridge. Field values belong to their own SDK components;
   decorative, hidden and secret descendants must not leak through a parent's readable content. */
const omitted = 'script, style, template, input, textarea, select, [aria-hidden="true"], [hidden], [inert], [data-agent-hidden]'

function readAgentContent(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ""
  if (!(node instanceof Element) || node.matches(omitted)) return ""
  const style = node.ownerDocument.defaultView?.getComputedStyle(node)
  if (style?.display === "none" || style?.visibility === "hidden" || style?.visibility === "collapse") return ""
  if (node.hasAttribute("data-agent-secret")) return "[redacted]"
  return Array.from(node.childNodes, readAgentContent).filter(Boolean).join(" ")
}

/** Keep rendered content in primitive state without adding a writable agent action. */
function bindAgentContent(el: HTMLElement, write: (content: string) => void) {
  let previous: string | undefined
  const update = () => {
    const content = readAgentContent(el).replace(/\s+/g, " ").trim()
    if (content === previous) return
    previous = content
    write(content)
  }
  update()
  const observer = new MutationObserver(update)
  observer.observe(el, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["aria-hidden", "hidden", "inert", "data-agent-hidden", "data-agent-secret", "class", "style"],
  })
  return () => observer.disconnect()
}

export { bindAgentContent }
