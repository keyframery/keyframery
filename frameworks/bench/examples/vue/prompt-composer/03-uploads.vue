<script setup lang="ts">
// Uploads
// Give `upload` and each file uploads as soon as it is attached, by the paperclip, a drop or a paste. Its card shows the progress, and Send waits until every file is up. `maxLength` makes the count read against the limit.

import { PromptComposer } from "@/components/keyframery/prompt-composer"

/* Stands in for your upload: reports progress, then resolves. */
function upload(_file: File, { onProgress, signal }: { onProgress: (percent: number) => void; signal: AbortSignal }) {
  return new Promise<void>((resolve, reject) => {
    let percent = 0
    const tick = setInterval(() => {
      percent += 20
      onProgress(percent)
      if (percent >= 100) {
        clearInterval(tick)
        resolve()
      }
    }, 300)
    signal.addEventListener("abort", () => {
      clearInterval(tick)
      reject(signal.reason)
    })
  })
}
</script>

<template>
  <PromptComposer
    class="max-w-[480px]"
    accept="image/*,.pdf"
    :max-files="4"
    :upload="upload"
    :max-length="2000"
    placeholder="Describe the problem and attach a photo"
  />
</template>
