<script setup lang="ts">
/* Mirrors src/demos/direction.tsx at its default controls (ltr, Arabic). */
import { computed, ref } from "vue"

import { Direction, DirectionToggle, type Dir } from "@/components/keyframery/direction"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/keyframery/item"
import { Progress, ProgressIndicator, ProgressLabel, ProgressTrack } from "@/components/keyframery/progress"
import { Switch } from "@/components/keyframery/switch"
import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/components/keyframery/tabs"

const copy = {
  en: { title: "Your ride to the airport", sub: "Terminal 3, departures", ride: "Ride", receipt: "Receipt", driver: "Driver", arriving: "Leila is on her way", eta: "4 min", total: "Total so far", rating: "4.9 from 2,140 trips", name: "Leila Haddad", car: "White Toyota Camry, K 48213", share: "Share trip status", shareHint: "With Lina and one other" },
  ar: { title: "رحلتك إلى المطار", sub: "المبنى 3، المغادرة", ride: "الرحلة", receipt: "الإيصال", driver: "السائق", arriving: "ليلى في الطريق إليك", eta: "4 دقائق", total: "المجموع حتى الآن", rating: "4.9 من 2,140 رحلة", name: "ليلى حداد", car: "تويوتا كامري بيضاء، K 48213", share: "مشاركة حالة الرحلة", shareHint: "مع لينا وشخص آخر" },
}
const dir = ref<Dir>("ltr")
const t = computed(() => (dir.value === "rtl" ? copy.ar : copy.en))
</script>

<template>
  <div class="@container w-full max-w-[420px]">
    <Direction
      v-model:dir="dir"
      :lang="dir === 'rtl' ? 'ar' : 'en'"
      class="flex flex-col gap-4 rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)] @max-[24rem]:p-4"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-[15px] leading-tight font-semibold tracking-tight">{{ t.title }}</div>
          <div class="mt-1 text-[12px] text-muted-foreground">{{ t.sub }}</div>
        </div>
        <DirectionToggle data-play="flip" class="shrink-0">{{ dir === "rtl" ? "English" : "العربية" }}</DirectionToggle>
      </div>

      <Tabs default-value="ride">
        <TabsList :aria-label="t.title">
          <TabsTab value="ride" data-tab="ride">{{ t.ride }}</TabsTab>
          <TabsTab value="receipt" data-tab="receipt">{{ t.receipt }}</TabsTab>
          <TabsTab value="driver" data-tab="driver">{{ t.driver }}</TabsTab>
        </TabsList>
        <TabsPanels class="h-[52px]">
          <TabsPanel value="ride">
            <Progress :value="64">
              <ProgressLabel>{{ t.arriving }}</ProgressLabel>
              <span class="col-start-2 text-[13px] leading-5 text-muted-foreground tabular-nums">{{ t.eta }}</span>
              <ProgressTrack><ProgressIndicator /></ProgressTrack>
            </Progress>
          </TabsPanel>
          <TabsPanel value="receipt" class="flex items-baseline justify-between gap-3 pt-1">
            <span class="text-[13px] text-muted-foreground">{{ t.total }}</span>
            <span class="text-[20px] font-semibold tracking-tight tabular-nums" dir="ltr">AED 46.75</span>
          </TabsPanel>
          <TabsPanel value="driver" class="pt-1 text-[13px] text-muted-foreground">{{ t.rating }}</TabsPanel>
        </TabsPanels>
      </Tabs>

      <Item variant="muted" size="sm">
        <template #render="{ props: p, children }"><button v-bind="p" type="button"><component :is="children" /></button></template>
        <ItemMedia variant="image"><img src="/demo/face-3.jpg" alt="" /></ItemMedia>
        <ItemContent>
          <ItemTitle>{{ t.name }}</ItemTitle>
          <ItemDescription class="line-clamp-1">{{ t.car }}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right rtl:-scale-x-100" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
        </ItemActions>
      </Item>

      <label class="flex cursor-pointer items-center justify-between gap-4">
        <span class="min-w-0">
          <span class="block text-[13px] leading-tight font-medium">{{ t.share }}</span>
          <span class="mt-1 block text-[12px] text-muted-foreground">{{ t.shareHint }}</span>
        </span>
        <Switch data-play="share" :default-checked="true" />
      </label>
    </Direction>
  </div>
</template>
