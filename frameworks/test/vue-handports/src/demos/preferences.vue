<script setup lang="ts">
/* Mirrors src/demos/preferences.tsx at its defaults. */
import { createPreference } from "@ui-sdk/core"
import { createMotionStyle, MotionStyleSwitcher, Preferences, PreferenceSwitcher } from "@/components/keyframery/preferences"

const density = createPreference({ values: ["comfortable", "compact"], defaultValue: "comfortable", attribute: "data-density" })
const demoMotion = createMotionStyle({ global: false, storageKey: null })
density.set("comfortable")
const walks = [
  { name: "Seven Sisters cliff path", route: "Seaford to Eastbourne", km: 22, photo: "/demo/coast-1.jpg" },
  { name: "Regent's Canal towpath", route: "Little Venice to Limehouse", km: 14, photo: "/demo/canal.jpg" },
  { name: "Derwentwater loop", route: "From Keswick", km: 16, photo: "/demo/lake.jpg" },
  { name: "Durdle Door and back", route: "From Lulworth Cove", km: 5, photo: "/demo/coast-3.jpg" },
]
const eased = "duration-[calc(420ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none"
const theme = { "--preferences-height": "32px", "--preferences-radius": "12px", "--preferences-key-radius": "9px", "--preferences-gap": "2px" }
</script>

<template>
  <Preferences :preferences="[density, demoMotion]">
    <div :style="{ ...theme, maxWidth: '400px', padding: '20px' }" class="@container w-full max-w-[400px] rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div class="flex items-center justify-between gap-3">
        <div class="text-[15px] font-semibold tracking-tight">Saved walks</div>
        <PreferenceSwitcher :preference="density" :labels="{ comfortable: 'Comfortable', compact: 'Compact' }" aria-label="Density" orientation="horizontal"
          :disabled="false" :read-only="false" :required="false" :loop="true" />
      </div>
      <ul :class="`mt-4 flex flex-col gap-2.5 transition-[gap] in-data-[density=compact]:gap-0.5 ${eased}`">
        <li v-for="walk in walks" :key="walk.name" :class="`flex items-center gap-3 transition-[gap] in-data-[density=compact]:gap-2 ${eased}`">
          <img :src="`http://localhost:4610${walk.photo}`" alt="" :class="`size-11 shrink-0 rounded-[10px] bg-muted object-cover transition-[width,height,border-radius] in-data-[density=compact]:size-6 in-data-[density=compact]:rounded-[6px] ${eased}`" />
          <div class="min-w-0 flex-1">
            <div class="truncate text-[13.5px] font-medium">{{ walk.name }}</div>
            <div :class="`grid grid-rows-[1fr] transition-[grid-template-rows,opacity] in-data-[density=compact]:grid-rows-[0fr] in-data-[density=compact]:opacity-0 ${eased}`">
              <div class="min-h-0 overflow-hidden truncate text-[12px] text-muted-foreground">{{ walk.route }}</div>
            </div>
          </div>
          <div class="shrink-0 text-[12px] text-muted-foreground tabular-nums">{{ walk.km }} km</div>
        </li>
      </ul>
      <div class="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4 @max-[30rem]:flex-col @max-[30rem]:items-start">
        <div class="text-[12px] text-muted-foreground">Motion</div>
        <MotionStyleSwitcher :preference="demoMotion" class="@max-[24rem]:[--segmented-control-item-padding:0.5rem]" orientation="horizontal"
          :disabled="false" :read-only="false" :required="false" :loop="true" />
      </div>
    </div>
  </Preferences>
</template>
