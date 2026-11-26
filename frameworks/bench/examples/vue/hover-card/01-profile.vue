<script setup lang="ts">
// Profile preview
// Shows after a short `delay` while the pointer rests on the link, or when it's focused. The link still works.

import { Avatar, AvatarFallback, AvatarImage } from "@/components/keyframery/avatar"
import { HoverCard, HoverCardArrow, HoverCardContent, HoverCardTrigger } from "@/components/keyframery/hover-card"
</script>

<template>
  <p class="text-[14px]">
    Designed by
    {{ ' ' }}
    <HoverCard>
      <HoverCardTrigger href="#maya">@maya</HoverCardTrigger>
      <HoverCardContent class="w-64">
        <HoverCardArrow />
        <div class="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src="/demo/face-1.jpg" alt="" />
            <AvatarFallback>MC</AvatarFallback>
          </Avatar>
          <div>
            <div class="text-[14px] font-semibold">Maya Chen</div>
            <div class="text-[12px] text-muted-foreground">Product designer, Lisbon</div>
          </div>
        </div>
        <p class="mt-3 text-[13px] text-muted-foreground">Works on onboarding and the design system.</p>
      </HoverCardContent>
    </HoverCard>
    {{ ' ' }}
    in Lisbon.
  </p>
</template>
