<script setup lang="ts">
// Your own icons
// Put an icon inside `TraceIcon` to name the action instead of showing the status. The title stays the line's name for screen readers.

import { Trace, TraceIcon, TraceLine, TraceTitle } from "@/components/keyframery/trace"
</script>

<template>
  <Trace class="max-w-[380px]">
    <a href="#receipt">
      <TraceLine>
        <TraceIcon>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 2.5h8v11l-2-1.25-2 1.25-2-1.25-2 1.25Z M6 6h4M6 8.5h4" />
          </svg>
        </TraceIcon>
        <TraceTitle>Opened receipt #40817</TraceTitle>
      </TraceLine>
    </a>
  </Trace>
</template>
