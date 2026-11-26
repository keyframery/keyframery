<script setup lang="ts">
// Sizes
// `sm`, `md` and `lg`. The initials show while the photo loads, or if it never does.

import { Avatar, AvatarFallback, AvatarImage } from "@/components/keyframery/avatar"
</script>

<template>
  <div class="flex items-center gap-3">
    <Avatar size="sm">
      <AvatarImage src="/demo/face-1.jpg" alt="Maya Chen" />
      <AvatarFallback>MC</AvatarFallback>
    </Avatar>
    <Avatar size="md">
      <AvatarImage src="/demo/face-2.jpg" alt="Tom Okafor" />
      <AvatarFallback>TO</AvatarFallback>
    </Avatar>
    <Avatar size="lg">
      <AvatarImage src="/demo/face-3.jpg" alt="Ines Duarte" />
      <AvatarFallback>ID</AvatarFallback>
    </Avatar>
  </div>
</template>
