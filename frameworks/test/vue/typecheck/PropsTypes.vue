<script setup lang="ts">
/* Props-typing fixture: vue-tsc only (nothing imports it, so it is not in the app build).
   The first half uses the parts the way a user would and must type-check. Every line under
   `@vue-expect-error` must be an error; if a part's props stop being typed, that directive is
   unused and vue-tsc fails. Run: pnpm exec vue-tsc --noEmit (after scripts/frameworks/sync-test.mjs). */
import { ref } from "vue"
import { Button, type ButtonProps } from "@/components/keyframery/button"
import { Checkbox, CheckboxIndicator } from "@/components/keyframery/checkbox"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/keyframery/dialog"
import { Popover, PopoverContent, PopoverTrigger, type PopoverProps } from "@/components/keyframery/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/keyframery/select"
import { Slider, SliderControl, SliderThumb } from "@/components/keyframery/slider"
import { Tabs, TabsList, TabsPanel, TabsTab, type TabsProps, type TabsTabProps } from "@/components/keyframery/tabs"

const tab = ref<"one" | "two">("one")
const open = ref(false)
const checked = ref(false)
const fruit = ref("apple")
const volume = ref(40)
const onTab = (value: "one" | "two" | null) => value

/* The exported types work as plain object types too (for override authors and wrappers). */
const tabsProps: TabsProps = { speed: "fast", orientation: "vertical", defaultValue: "one" }
const tabProps: TabsTabProps = { value: "one", disabled: true }
const buttonProps: ButtonProps = { variant: "primary", size: "sm", type: "submit", pendingIndicator: null }
const popoverProps: PopoverProps = { open: true, speed: 0.8 }
// @ts-expect-error orientation is "horizontal" | "vertical"
const badTabs: TabsProps = { orientation: "diagonal" }
// @ts-expect-error TabsTab needs a value
const badTab: TabsTabProps = { disabled: true }
// @ts-expect-error Button's variant comes from React's list
const badButton: ButtonProps = { variant: "outline" }
void [tabsProps, tabProps, buttonProps, popoverProps, badTabs, badTab, badButton]
</script>

<template>
  <!-- Correct use: v-model on the main value, events, our extras, element attributes. -->
  <Tabs v-model:value="tab" speed="fast" orientation="horizontal" class="w-80" @update:value="onTab">
    <TabsList aria-label="Sections">
      <TabsTab value="one">One</TabsTab>
      <TabsTab value="two" disabled>Two</TabsTab>
    </TabsList>
    <TabsPanel value="one">First</TabsPanel>
  </Tabs>
  <Select v-model:value="fruit" speed="slow" @open-change="(o: boolean) => o">
    <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
    <SelectContent>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem :value="3">A number value, inferred per item</SelectItem>
    </SelectContent>
  </Select>
  <Popover v-model:open="open" presentation="auto" modal>
    <PopoverTrigger>Open</PopoverTrigger>
    <PopoverContent side="bottom" align="start" :side-offset="8">Hello</PopoverContent>
  </Popover>
  <Dialog :default-open="false" presentation="sheet" speed="normal">
    <DialogTrigger>Open</DialogTrigger>
    <DialogContent>
      <DialogTitle>Title</DialogTitle>
      <DialogClose variant="icon" />
    </DialogContent>
  </Dialog>
  <Button variant="primary" size="icon-sm" type="button" :disabled="false" @click="() => {}">Save</Button>
  <Slider v-model:value="volume" :min="0" :max="100" :step="5" speed="fast">
    <SliderControl><SliderThumb /></SliderControl>
  </Slider>
  <Checkbox v-model:checked="checked" name="terms" required><CheckboxIndicator /></Checkbox>

  <!-- Wrong use: each of these must be a type error. -->
  <!-- @vue-expect-error orientation -->
  <Tabs orientation="diagonal" />
  <!-- @vue-expect-error speed -->
  <Tabs speed="warp" />
  <!-- @vue-expect-error TabsTab without its value -->
  <TabsTab>Missing value</TabsTab>
  <!-- @vue-expect-error TabsTab value is a string -->
  <TabsTab :value="1">Number</TabsTab>
  <!-- @vue-expect-error Select multiple is a boolean -->
  <Select multiple="yes" />
  <!-- @vue-expect-error Select speed -->
  <Select speed="warp" />
  <!-- @vue-expect-error SelectItem without its value -->
  <SelectItem>Missing value</SelectItem>
  <!-- @vue-expect-error Popover presentation -->
  <Popover presentation="drawer" />
  <!-- @vue-expect-error PopoverContent side -->
  <PopoverContent side="middle" />
  <!-- @vue-expect-error Dialog open is a boolean -->
  <Dialog :open="'yes'" />
  <!-- @vue-expect-error DialogClose variant -->
  <DialogClose variant="ghost" />
  <!-- @vue-expect-error Button variant -->
  <Button variant="outline" />
  <!-- @vue-expect-error Button size -->
  <Button size="xl" />
  <!-- @vue-expect-error Button type -->
  <Button type="link" />
  <!-- @vue-expect-error Slider min is a number -->
  <Slider min="zero" />
  <!-- @vue-expect-error Slider speed -->
  <Slider :speed="true" />
  <!-- @vue-expect-error Checkbox checked -->
  <Checkbox :checked="'maybe'" />
  <!-- @vue-expect-error Checkbox click handler takes an event, not a string -->
  <Checkbox @click="(e: string) => e" />
</template>
