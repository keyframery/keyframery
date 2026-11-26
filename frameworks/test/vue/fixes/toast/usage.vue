<script setup lang="ts">
// Once, near the root of your app (App.vue): <ToastRegion />
import { toast } from "@/components/keyframery/toast"
</script>

<template>
  <!-- Anywhere: -->
  <button @click="toast('Saved')">Save</button>
</template>
