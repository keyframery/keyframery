<script setup lang="ts">
// A bar of filters, controlled
// The value is always a list of strings. Reset slides in while any filter in the bar is active and clears them all.

import { computed, ref } from "vue"

import { Filter, FilterBar, FilterBarReset } from "@/components/keyframery/filter"

const tasks = [
  { title: "Renew SSL certificate", status: "todo", owner: "ana" },
  { title: "Ship invoice export", status: "done", owner: "leo" },
  { title: "Fix checkout tax", status: "doing", owner: "ana" },
  { title: "Draft holiday email", status: "todo", owner: "sam" },
]

const status = ref<string[]>([])
const owner = ref<string[]>([])
const count = (key: "status" | "owner", value: string) =>
    tasks.filter((task) => task[key] === value && (key === "status" ? !owner.value.length || owner.value.includes(task.owner) : !status.value.length || status.value.includes(task.status))).length
const shown = computed(() => tasks.filter((task) => (!status.value.length || status.value.includes(task.status)) && (!owner.value.length || owner.value.includes(task.owner))))
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-3 text-[13px]">
    <FilterBar>
      <Filter
        v-model:value="status"
        label="Status"
        :options="['todo', 'doing', 'done'].map((value) => ({ value, label: { todo: 'To do', doing: 'In progress', done: 'Done' }[value]!, count: count('status', value) }))"
      />
      <Filter
        v-model:value="owner"
        label="Owner"
        :options="['ana', 'leo', 'sam'].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1), count: count('owner', value) }))"
      />
      <FilterBarReset />
    </FilterBar>
    <ul class="text-muted-foreground">
      <li v-for="task in shown" :key="task.title">{{ task.title }}</li>
    </ul>
  </div>
</template>
