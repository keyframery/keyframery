import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"

export default function Usage() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>Right-click here</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem value="copy">Copy</ContextMenuItem>
        <ContextMenuItem value="paste">Paste</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
