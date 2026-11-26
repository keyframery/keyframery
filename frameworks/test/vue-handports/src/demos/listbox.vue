<script setup lang="ts">
/* Mirrors src/demos/listbox.tsx at its defaults. */
import { computed, ref } from "vue"
import { Listbox, ListboxItem, ListboxItemIndicator } from "@/components/keyframery/listbox"

const crusts = [
  { value: "thin", label: "Thin and crisp" },
  { value: "classic", label: "Classic" },
  { value: "sourdough", label: "Sourdough, 48h" },
]
const toppings = [
  { value: "basil", label: "Fresh basil", price: 0.5 },
  { value: "burrata", label: "Burrata", price: 3 },
  { value: "mushroom", label: "Wild mushrooms", price: 2 },
  { value: "olive", label: "Black olives", price: 1 },
  { value: "nduja", label: "’Nduja", price: 2.5 },
  { value: "anchovy", label: "Anchovies", price: 2, disabled: true },
]
const euro = (n: number) => `€${n.toFixed(2)}`
const picked = ref<string[]>(["basil", "burrata"])
const total = computed(() => 9 + toppings.filter((t) => picked.value.includes(t.value)).reduce((sum, t) => sum + t.price, 0))
const theme = { "--listbox-radius": "12px", "--listbox-item-radius": "8px", "--listbox-row-height": "32px" }
function onPick(value: unknown) {
  picked.value = Array.isArray(value) ? value : value ? [value as string] : []
}
</script>

<template>
  <div :style="{ ...theme, maxWidth: '460px' }" class="@container w-full max-w-[460px]">
    <div class="flex items-baseline justify-between">
      <h3 class="text-[15px] font-semibold tracking-tight">Build your pizza</h3>
      <span class="text-[13px] font-medium tabular-nums">{{ euro(total) }}</span>
    </div>
    <div style="gap: 12px" class="mt-4 grid grid-cols-[160px_1fr] gap-3 @max-[26rem]:grid-cols-1 @max-[26rem]:gap-4">
      <div>
        <div id="crust-label" class="mb-2 text-[12px] font-medium text-muted-foreground">Crust</div>
        <Listbox aria-labelledby="crust-label" default-value="sourdough" orientation="vertical" :disabled="false" :read-only="false" :required="false"
          :loop="true" :deselectable="false" :keep-in-view="true">
          <ListboxItem v-for="c in crusts" :key="c.value" :value="c.value">{{ c.label }}<ListboxItemIndicator /></ListboxItem>
        </Listbox>
      </div>
      <div>
        <div id="toppings-label" class="mb-2 flex justify-between text-[12px] font-medium text-muted-foreground">
          Toppings
          <span class="tabular-nums">{{ picked.length }} chosen</span>
        </div>
        <Listbox aria-labelledby="toppings-label" :multiple="true" orientation="vertical" :disabled="false" :read-only="false" :required="false" :loop="true"
          :keep-in-view="true" :value="picked" @value-change="onPick">
          <ListboxItem v-for="t in toppings" :key="t.value" :value="t.value" :label="t.label" :disabled="t.disabled">
            <span class="min-w-0 flex-1 truncate">{{ t.label }}</span>
            <span class="text-[12px] text-muted-foreground tabular-nums">{{ t.disabled ? "Out today" : `+${euro(t.price)}` }}</span>
            <ListboxItemIndicator class="ms-1" />
          </ListboxItem>
        </Listbox>
      </div>
    </div>
  </div>
</template>
