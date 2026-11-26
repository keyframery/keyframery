<script setup lang="ts">
/* Mirrors src/demos/pagination.tsx at its defaults. */
import { computed, ref } from "vue"
import { Pagination, PaginationEllipsis, PaginationItem, PaginationLink, PaginationList, PaginationNext, PaginationPrevious, PaginationRoll } from "@/components/keyframery/pagination"

const names = [
  "Casa Alfama", "Hotel Lumen", "The Tagus Rooms", "Pátio 32", "Bairro Loft", "Rua Nova Suites",
  "Miradouro House", "Hotel Ribeira", "Azulejo Inn", "Chiado Studios", "Belém Garden", "Casa do Largo",
]
const areas = ["Alfama", "Baixa", "Chiado", "Belém", "Príncipe Real", "Graça"]
function resultsFor(page: number, pageSize: number, total: number) {
  return Array.from({ length: Math.min(pageSize, total - (page - 1) * pageSize) }, (_, i) => {
    const n = (page - 1) * pageSize + i
    return { name: names[(n * 7) % names.length], area: areas[(n * 5) % areas.length], rating: (8 + ((n * 13) % 19) / 10).toFixed(1), price: 84 + ((n * 37) % 160) }
  })
}
const total = 186
const pageSize = 4
const page = ref(3)
const first = computed(() => (page.value - 1) * pageSize + 1)
const theme = { "--pagination-size": "32px", "--pagination-radius": "12px", "--pagination-key-radius": "9px", "--pagination-gap": "2px" }
</script>

<template>
  <div :style="{ ...theme, maxWidth: '420px' }" class="flex w-full max-w-[420px] flex-col">
    <div class="flex items-baseline justify-between">
      <h3 class="text-[15px] font-semibold tracking-tight">Stays in Lisbon</h3>
      <span class="text-[12px] text-muted-foreground tabular-nums"><PaginationRoll :value="first" /> to <PaginationRoll :value="Math.min(first + pageSize - 1, total)" /> of {{ total }}</span>
    </div>
    <ul :style="{ height: pageSize * 59 + 'px' }" class="mt-3 h-[236px] divide-y divide-border">
      <li v-for="stay in resultsFor(page, pageSize, total)" :key="`${page}-${stay.name}`" class="flex items-center gap-3 py-2.5 text-[13px]">
        <span class="grid size-9 shrink-0 place-items-center rounded-[9px] bg-muted text-[12px] font-semibold text-muted-foreground tabular-nums">{{ stay.rating }}</span>
        <span class="min-w-0 flex-1">
          <span class="block font-medium">{{ stay.name }}</span>
          <span class="block text-[12px] text-muted-foreground">{{ stay.area }}</span>
        </span>
        <span class="font-medium tabular-nums">€{{ stay.price }}</span>
      </li>
    </ul>
    <Pagination aria-label="Results pages" :total="total" :page-size="pageSize" :siblings="1" :boundaries="1" :page="page" @page-change="(p: number) => (page = p)" class="mt-4 self-center">
      <PaginationList v-slot="{ state }">
        <PaginationItem><PaginationPrevious /></PaginationItem>
        <PaginationItem v-for="item in state.items" :key="item">
          <PaginationLink v-if="typeof item === 'number'" :page="item" />
          <PaginationEllipsis v-else />
        </PaginationItem>
        <PaginationItem><PaginationNext /></PaginationItem>
      </PaginationList>
    </Pagination>
  </div>
</template>
