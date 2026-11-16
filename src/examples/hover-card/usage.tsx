import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

export default function Usage() {
  return (
    <HoverCard>
      <HoverCardTrigger href="/people/maya">@maya</HoverCardTrigger>
      <HoverCardContent>Maya Chen, product designer.</HoverCardContent>
    </HoverCard>
  )
}
