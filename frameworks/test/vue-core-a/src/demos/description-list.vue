<script setup lang="ts">
/* Mirrors src/demos/description-list.tsx at its default controls (rows, copy, edit). */
import { Badge } from "@/components/keyframery/badge"
import { Button } from "@/components/keyframery/button"
import {
  DescriptionList,
  DescriptionListActions,
  DescriptionListCopy,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
  DescriptionListValue,
} from "@/components/keyframery/description-list"
</script>

<template>
  <div
    style="--description-list-label: 10rem; --description-list-gap: 12px; --description-list-font: 13px"
    class="w-full max-w-[560px] rounded-[16px] bg-background px-5 pt-4 pb-2 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]"
  >
    <div class="flex items-baseline justify-between gap-3 pb-2">
      <div class="text-[15px] font-semibold tracking-tight">Customer</div>
      <div class="text-[12px] text-muted-foreground">Since March 2021</div>
    </div>
    <DescriptionList aria-label="Customer" layout="rows" :columns="2" :truncate="false">
      <DescriptionListItem>
        <DescriptionListTerm>Name</DescriptionListTerm>
        <DescriptionListDetails><DescriptionListValue>Maya Okafor</DescriptionListValue></DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem data-item="email">
        <DescriptionListTerm>Email</DescriptionListTerm>
        <DescriptionListDetails>
          <DescriptionListValue>maya.okafor@northwind-studio.com</DescriptionListValue>
          <DescriptionListActions><DescriptionListCopy /></DescriptionListActions>
        </DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem data-item="phone">
        <DescriptionListTerm>Phone</DescriptionListTerm>
        <DescriptionListDetails>
          <DescriptionListValue>+44 20 7946 0321</DescriptionListValue>
          <DescriptionListActions><DescriptionListCopy /></DescriptionListActions>
        </DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Customer since</DescriptionListTerm>
        <DescriptionListDetails><DescriptionListValue>14 March 2021</DescriptionListValue></DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Lifetime spend</DescriptionListTerm>
        <DescriptionListDetails><DescriptionListValue class="font-medium">$4,812.60 · 23 orders</DescriptionListValue></DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Default address</DescriptionListTerm>
        <DescriptionListDetails>
          <DescriptionListValue>Flat 4, 18 Clerkenwell Close, London EC1R 0AA, United Kingdom</DescriptionListValue>
          <DescriptionListActions>
            <Button variant="ghost" size="sm" aria-label="Edit default address">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>
              Edit
            </Button>
          </DescriptionListActions>
        </DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Tags</DescriptionListTerm>
        <DescriptionListDetails>
          <DescriptionListValue class="flex flex-wrap gap-1.5">
            <Badge variant="secondary">Wholesale</Badge>
            <Badge variant="secondary">Newsletter</Badge>
            <Badge variant="success">Repeat buyer</Badge>
          </DescriptionListValue>
        </DescriptionListDetails>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Notes</DescriptionListTerm>
        <DescriptionListDetails>
          <DescriptionListValue class="text-muted-foreground">Prefers delivery after 2pm. Ask before substituting linen colours on wholesale orders.</DescriptionListValue>
        </DescriptionListDetails>
      </DescriptionListItem>
    </DescriptionList>
  </div>
</template>
