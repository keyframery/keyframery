import { Toolbar, ToolbarButton, ToolbarSeparator } from "@/components/ui/toolbar"

export default function Usage() {
  return (
    <Toolbar aria-label="Formatting">
      <ToolbarButton>Undo</ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton>Redo</ToolbarButton>
    </Toolbar>
  )
}
