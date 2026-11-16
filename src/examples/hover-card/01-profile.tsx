// Profile preview
// Shows after a short `delay` while the pointer rests on the link, or when it's focused. The link still works.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HoverCard, HoverCardArrow, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

export default function HoverCardProfile() {
  return (
    <p className="text-[14px]">
      Designed by{" "}
      <HoverCard>
        <HoverCardTrigger href="#maya">@maya</HoverCardTrigger>
        <HoverCardContent className="w-64">
          <HoverCardArrow />
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage src="/demo/face-1.jpg" alt="" />
              <AvatarFallback>MC</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-[14px] font-semibold">Maya Chen</div>
              <div className="text-[12px] text-muted-foreground">Product designer, Lisbon</div>
            </div>
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">Works on onboarding and the design system.</p>
        </HoverCardContent>
      </HoverCard>{" "}
      in Lisbon.
    </p>
  )
}
