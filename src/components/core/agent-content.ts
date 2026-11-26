/* Read-only content for the agent bridge. Field values belong to their own SDK components;
   decorative, hidden and secret descendants must not leak through a parent's readable content. */
const omitted = 'script, style, template, input, textarea, select, [aria-hidden="true"], [hidden], [inert], [data-agent-hidden]'

function readAgentContent(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ""
  if (!(node instanceof Element) || node.matches(omitted)) return ""
  const style = node.ownerDocument.defaultView?.getComputedStyle(node)
  if (style?.display === "none" || style?.visibility === "hidden" || style?.visibility === "collapse") return ""
  if (node.hasAttribute("data-agent-secret")) return "[redacted]"
  /* Inline pieces join as written ("€1,284, so"), block-level ones on their own, so a sentence with a
     <strong> or a link inside reads as one sentence and separate blocks don't run together. */
  let text = ""
  let previousBlock = false
  for (const child of Array.from(node.childNodes)) {
    const part = readAgentContent(child)
    if (!part) continue
    const block = child instanceof Element && !(child.ownerDocument.defaultView?.getComputedStyle(child).display ?? "inline").startsWith("inline")
    text += text && (block || previousBlock) ? ` ${part}` : part
    previousBlock = block
  }
  return text
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
