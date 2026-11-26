<script setup lang="ts">
/* Mirrors src/demos/motion-style.tsx at its defaults. */
import { Button } from "@/components/keyframery/button"
import { createMotionStyle, MotionStyle, MotionStyleSwitcher } from "@/components/keyframery/motion-style"
import { Switch } from "@/components/keyframery/switch"
import { Tabs, TabsList, TabsTab } from "@/components/keyframery/tabs"

const demoMotion = createMotionStyle({ global: false, storageKey: null })
const theme = { "--motion-style-height": "32px", "--motion-style-radius": "12px", "--motion-style-key-radius": "9px" }
</script>

<template>
  <MotionStyle :preference="demoMotion">
    <div :style="{ ...theme, maxWidth: '380px', gap: '20px' }" class="flex w-full max-w-[380px] flex-col items-center gap-5">
      <MotionStyleSwitcher :preference="demoMotion" orientation="horizontal" :disabled="false" :read-only="false" :loop="true" :required="false" />
      <div class="w-full rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[15px] font-semibold tracking-tight">Focus hours</div>
            <div class="mt-0.5 text-[12px] text-muted-foreground">Silence notifications while you work</div>
          </div>
          <Switch aria-label="Focus hours" />
        </div>
        <Tabs default-value="today" class="mt-5">
          <TabsList aria-label="Schedule">
            <TabsTab value="today">Today</TabsTab>
            <TabsTab value="weekdays">Weekdays</TabsTab>
            <TabsTab value="always">Every day</TabsTab>
          </TabsList>
        </Tabs>
        <div class="mt-5 flex justify-end gap-2">
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Save</Button>
        </div>
      </div>
    </div>
  </MotionStyle>
</template>
