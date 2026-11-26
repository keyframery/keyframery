<script setup lang="ts">
// A grid that truncates
// `layout="grid"` with `columns={3}` lays items side by side, fewer columns when there is less room. `truncate` keeps long values on one line with the full text as a title.

import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
  DescriptionListValue,
} from "@/components/keyframery/description-list"

const facts = [
  ["Plan", "Team, billed yearly"],
  ["Seats", "14 of 20"],
  ["Renews", "2 February 2027"],
  ["Billing email", "accounts-payable@harbour-and-finch.co.uk"],
  ["VAT number", "GB 123 4567 89"],
  ["Region", "Europe (Frankfurt)"],
]
</script>

<template>
  <DescriptionList aria-label="Subscription" layout="grid" :columns="3" truncate class="max-w-2xl">
    <DescriptionListItem v-for="[label, value] in facts" :key="label">
      <DescriptionListTerm>{{ label }}</DescriptionListTerm>
      <DescriptionListDetails>
        <DescriptionListValue>{{ value }}</DescriptionListValue>
      </DescriptionListDetails>
    </DescriptionListItem>
  </DescriptionList>
</template>
