<script lang="ts">
  /* The eight stage-1 components, rendered with the generated Svelte wrappers. #/<slug> shows one, like the React lab. */
  import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "./kf/tabs"
  import { Switch } from "./kf/switch"
  import { Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "./kf/popover"
  import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "./kf/accordion"
  import { Checkbox } from "./kf/checkbox"
  import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectItemText, SelectLabel, SelectTrigger, SelectValue } from "./kf/select"
  import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./kf/dialog"
  import { SegmentedControl, SegmentedControlItem } from "./kf/segmented-control"

  let slug = $state(location.hash.replace(/^#\/?/, ""))
  $effect(() => {
    const onHash = () => (slug = location.hash.replace(/^#\/?/, ""))
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  })
  const show = (s: string) => !slug || slug === s
</script>

<main class="flex min-h-screen flex-col items-center gap-16 bg-[oklch(0.975_0_0)] px-8 py-16 text-foreground dark:bg-[oklch(0.125_0_0)]">
  {#if show("tabs")}
    <section data-demo="tabs" class="w-[420px]">
      <Tabs defaultValue="overview">
        <TabsList aria-label="Summer fête">
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="activity">Activity</TabsTab>
          <TabsTab value="people">People</TabsTab>
          <TabsTab value="billing">Billing</TabsTab>
        </TabsList>
        <TabsPanels>
          <TabsPanel value="overview"><p class="text-[13px]">Saturday 12 July, on the village green.</p></TabsPanel>
          <TabsPanel value="activity"><p class="text-[13px]">Clare added the raffle prizes.</p></TabsPanel>
          <TabsPanel value="people"><p class="text-[13px]">Clare Dawson, Rob Fenwick, Nadia Haddad.</p></TabsPanel>
          <TabsPanel value="billing"><p class="text-[13px]">£240 of £300 raised.</p></TabsPanel>
        </TabsPanels>
      </Tabs>
    </section>
  {/if}

  {#if show("switch")}
    <section data-demo="switch" class="flex w-[360px] flex-col gap-4">
      <label class="flex items-center justify-between text-[13px] font-medium">Order updates <Switch defaultChecked /></label>
      <label class="flex items-center justify-between text-[13px] font-medium">Price drops <Switch /></label>
    </section>
  {/if}

  {#if show("popover")}
    <section data-demo="popover">
      <Popover>
        <PopoverTrigger>2 guests</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Who's coming?</PopoverTitle>
          <PopoverDescription>Up to 8 guests, infants stay free.</PopoverDescription>
          <div class="mt-3 flex justify-end"><PopoverClose variant="primary">Done</PopoverClose></div>
        </PopoverContent>
      </Popover>
    </section>
  {/if}

  {#if show("accordion")}
    <section data-demo="accordion" class="w-[440px]">
      <Accordion defaultValue={["baggage"]}>
        <AccordionItem value="baggage">
          <AccordionHeader><AccordionTrigger>How much baggage can I bring?</AccordionTrigger></AccordionHeader>
          <AccordionPanel><p>One cabin bag up to 8 kg and one checked bag up to 23 kg.</p><p>Sports gear counts as checked.</p></AccordionPanel>
        </AccordionItem>
        <AccordionItem value="changes">
          <AccordionHeader><AccordionTrigger>Can I change my flight?</AccordionTrigger></AccordionHeader>
          <AccordionPanel><p>Yes, up to 2 hours before departure.</p><p>Changes are free on this fare.</p></AccordionPanel>
        </AccordionItem>
        <AccordionItem value="refunds">
          <AccordionHeader><AccordionTrigger>How do refunds work?</AccordionTrigger></AccordionHeader>
          <AccordionPanel><p>Cancel 24 hours before for a full refund.</p></AccordionPanel>
        </AccordionItem>
      </Accordion>
    </section>
  {/if}

  {#if show("checkbox")}
    <section data-demo="checkbox" class="flex w-[340px] flex-col gap-3">
      <label class="flex items-center gap-3 text-[13px]"><Checkbox defaultChecked /> Passport</label>
      <label class="flex items-center gap-3 text-[13px]"><Checkbox /> Phone charger</label>
      <label class="flex items-center gap-3 text-[13px]"><Checkbox /> Sunscreen</label>
    </section>
  {/if}

  {#if show("select")}
    <section data-demo="select" class="w-[260px]">
      <Select placeholder="Choose a cabin">
        <SelectLabel>Cabin</SelectLabel>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="economy"><SelectItemText>Economy</SelectItemText><SelectItemIndicator /></SelectItem>
          <SelectItem value="premium"><SelectItemText>Premium economy</SelectItemText><SelectItemIndicator /></SelectItem>
          <SelectItem value="business"><SelectItemText>Business</SelectItemText><SelectItemIndicator /></SelectItem>
        </SelectContent>
      </Select>
    </section>
  {/if}

  {#if show("dialog")}
    <section data-demo="dialog">
      <Dialog>
        <DialogTrigger>Edit trip</DialogTrigger>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit trip</DialogTitle>
            <DialogDescription>Change the name and dates.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <DialogClose variant="primary">Save</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  {/if}

  {#if show("segmented-control")}
    <section data-demo="segmented-control">
      <SegmentedControl aria-label="Billing period" defaultValue="yearly">
        <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
        <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
        <SegmentedControlItem value="lifetime">Lifetime</SegmentedControlItem>
      </SegmentedControl>
    </section>
  {/if}
</main>
