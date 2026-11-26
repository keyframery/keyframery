<script setup lang="ts">
// Fallback
// Without a photo, or when it fails to load, the fallback shows. `delay` waits before showing it, so fast photos don't flash initials first.

import { Avatar, AvatarFallback, AvatarImage } from "@/components/keyframery/avatar"
</script>

<template>
  <div class="flex items-center gap-3">
    <Avatar size="lg">
      <AvatarFallback>JK</AvatarFallback>
    </Avatar>
    <Avatar size="lg">
      <AvatarImage src="/missing.jpg" alt="Sam Price" />
      <AvatarFallback :delay="300">SP</AvatarFallback>
    </Avatar>
  </div>
</template>
