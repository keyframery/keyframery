import { Button } from "@/components/ui/button"
import { createMotionStyle, MotionStyle, MotionStyleSwitcher } from "@/components/ui/motion-style"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs"

export const meta = { name: "Motion Style", group: "Motion" }

/* In the lab the style stays inside this demo: a scoped preference, not saved, so the rest of the
   page keeps the style picked in the header. In an app, use `motionStyle` (the default), which
   goes on <html>. */
const demoMotion = createMotionStyle({ global: false, storageKey: null })

const item = (n: number) => `[aria-label="Motion style"] [data-slot="segmented-control-item"]:nth-of-type(${n})`

/* Cycles through the four styles; after each, the switch flips and the tabs jump, so you feel it. */
export const play = [
  { click: item(1), wait: 700 },
  { click: '[data-slot="switch"]', wait: 900 },
  { click: '[role="tab"]:nth-of-type(3)', wait: 1300 },
  { click: item(3), wait: 700 },
  { click: '[data-slot="switch"]', wait: 700 },
  { click: '[role="tab"]:nth-of-type(1)', wait: 1100 },
  { click: item(4), wait: 700 },
  { click: '[data-slot="switch"]', wait: 900 },
  { click: '[role="tab"]:nth-of-type(3)', wait: 1300 },
  { click: item(2), wait: 700 },
  { click: '[data-slot="switch"]', wait: 900 },
  { click: '[role="tab"]:nth-of-type(1)', wait: 1500 },
]

export default function MotionStyleDemo() {
  return (
    <MotionStyle preference={demoMotion}>
      <div className="flex w-full max-w-[380px] flex-col items-center gap-5">
        <MotionStyleSwitcher preference={demoMotion} />
        <div className="w-full rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold tracking-tight">Focus hours</div>
              <div className="mt-0.5 text-[12px] text-muted-foreground">Silence notifications while you work</div>
            </div>
            <Switch aria-label="Focus hours" />
          </div>
          <Tabs defaultValue="today" className="mt-5">
            <TabsList aria-label="Schedule">
              <TabsTab value="today">Today</TabsTab>
              <TabsTab value="weekdays">Weekdays</TabsTab>
              <TabsTab value="always">Every day</TabsTab>
            </TabsList>
          </Tabs>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost">Cancel</Button>
            <Button variant="primary">Save</Button>
          </div>
        </div>
      </div>
    </MotionStyle>
  )
}
