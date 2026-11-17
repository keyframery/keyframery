import { ChevronRight } from "lucide-react"
import * as React from "react"

import { Direction, DirectionToggle, type Dir } from "@/components/ui/direction"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Progress, ProgressIndicator, ProgressLabel, ProgressTrack } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/components/ui/tabs"

export const meta = { name: "Direction", group: "Layout" }

/* Flips the trip into right to left and back. In between, the tab key stretches the other way and
   the switch thumb travels toward the left, because both read the direction from the page. */
export const play = [
  { wait: 900 },
  { click: '[data-play="flip"]', wait: 2000 },
  { click: '[data-tab="receipt"]', wait: 1300 },
  { click: '[data-play="share"]', wait: 1300 },
  { click: '[data-play="flip"]', wait: 2000 },
  { click: '[data-tab="ride"]', wait: 1200 },
  { click: '[data-play="share"]', wait: 1300 },
]

export const controls = {
  dir: { type: "select", label: "Start in", options: ["ltr", "rtl"], default: "ltr" },
  lang: { type: "select", label: "Right-to-left language", options: ["ar", "he"], default: "ar" },
  themeFace: { type: "color", label: "Toggle surface", default: "", group: "Colours" },
  themeInk: { type: "color", label: "Toggle text", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Toggle corners", min: 0, max: 20, step: 1, default: 9, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Toggle label size", min: 10, max: 18, step: 1, default: 13, unit: "px", group: "Layout" },
  themeGap: { type: "slider", label: "Toggle gap", min: 0, max: 16, step: 1, default: 6, unit: "px", group: "Layout" },
  themeHeight: { type: "slider", label: "Toggle height", min: 28, max: 48, step: 1, default: 32, unit: "px", group: "Layout" },
  themeInsetX: { type: "slider", label: "Toggle padding", min: 4, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
  themeIconSize: { type: "slider", label: "Toggle icon", min: 12, max: 24, step: 1, default: 16, unit: "px", group: "Layout" },
} as const

const copy = {
  en: {
    title: "Your ride to the airport",
    sub: "Terminal 3, departures",
    ride: "Ride",
    receipt: "Receipt",
    driver: "Driver",
    arriving: "Leila is on her way",
    eta: "4 min",
    total: "Total so far",
    rating: "4.9 from 2,140 trips",
    name: "Leila Haddad",
    car: "White Toyota Camry, K 48213",
    share: "Share trip status",
    shareHint: "With Lina and one other",
  },
  ar: {
    title: "رحلتك إلى المطار",
    sub: "المبنى 3، المغادرة",
    ride: "الرحلة",
    receipt: "الإيصال",
    driver: "السائق",
    arriving: "ليلى في الطريق إليك",
    eta: "4 دقائق",
    total: "المجموع حتى الآن",
    rating: "4.9 من 2,140 رحلة",
    name: "ليلى حداد",
    car: "تويوتا كامري بيضاء، K 48213",
    share: "مشاركة حالة الرحلة",
    shareHint: "مع لينا وشخص آخر",
  },
  he: {
    title: "הנסיעה שלך לשדה התעופה",
    sub: "טרמינל 3, יציאות",
    ride: "נסיעה",
    receipt: "קבלה",
    driver: "נהג",
    arriving: "לילה בדרך אליך",
    eta: "4 דק׳",
    total: "סה״כ עד עכשיו",
    rating: "4.9 מתוך 2,140 נסיעות",
    name: "לילה חדאד",
    car: "טויוטה קאמרי לבנה, K 48213",
    share: "שיתוף מצב הנסיעה",
    shareHint: "עם לינה ועוד אחד",
  },
}

const names = { ar: "العربية", he: "עברית" }

function Trip({ start, lang }: { start: Dir; lang: "ar" | "he" }) {
  const [dir, setDir] = React.useState<Dir>(start)
  const t = dir === "rtl" ? copy[lang] : copy.en

  return (
    <Direction
      dir={dir}
      onDirChange={setDir}
      lang={dir === "rtl" ? lang : "en"}
      className="flex flex-col gap-4 rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)] @max-[24rem]:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[15px] leading-tight font-semibold tracking-tight">{t.title}</div>
          <div className="mt-1 text-[12px] text-muted-foreground">{t.sub}</div>
        </div>
        <DirectionToggle data-play="flip" className="shrink-0">
          {dir === "rtl" ? "English" : names[lang]}
        </DirectionToggle>
      </div>

      <Tabs defaultValue="ride">
        <TabsList aria-label={t.title}>
          <TabsTab value="ride" data-tab="ride">
            {t.ride}
          </TabsTab>
          <TabsTab value="receipt" data-tab="receipt">
            {t.receipt}
          </TabsTab>
          <TabsTab value="driver" data-tab="driver">
            {t.driver}
          </TabsTab>
        </TabsList>
        <TabsPanels className="h-[52px]">
          <TabsPanel value="ride">
            <Progress value={64}>
              <ProgressLabel>{t.arriving}</ProgressLabel>
              <span className="col-start-2 text-[13px] leading-5 text-muted-foreground tabular-nums">{t.eta}</span>
              <ProgressTrack>
                <ProgressIndicator />
              </ProgressTrack>
            </Progress>
          </TabsPanel>
          <TabsPanel value="receipt" className="flex items-baseline justify-between gap-3 pt-1">
            <span className="text-[13px] text-muted-foreground">{t.total}</span>
            <span className="text-[20px] font-semibold tracking-tight tabular-nums" dir="ltr">
              AED 46.75
            </span>
          </TabsPanel>
          <TabsPanel value="driver" className="pt-1 text-[13px] text-muted-foreground">
            {t.rating}
          </TabsPanel>
        </TabsPanels>
      </Tabs>

      <Item variant="muted" size="sm" render={<button type="button" />}>
        <ItemMedia variant="image">
          <img src="/demo/face-3.jpg" alt="" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{t.name}</ItemTitle>
          <ItemDescription className="line-clamp-1">{t.car}</ItemDescription>
        </ItemContent>
        <ItemActions>
          {/* Icons that point along the line turn over in right to left. */}
          <ChevronRight className="rtl:-scale-x-100" />
        </ItemActions>
      </Item>

      <label className="flex cursor-pointer items-center justify-between gap-4">
        <span className="min-w-0">
          <span className="block text-[13px] leading-tight font-medium">{t.share}</span>
          <span className="mt-1 block text-[12px] text-muted-foreground">{t.shareHint}</span>
        </span>
        <Switch data-play="share" defaultChecked />
      </label>
    </Direction>
  )
}

export default function DirectionDemo({
  dir = "ltr", lang = "ar",
  themeFace = "",
  themeInk = "",
  themeRadius = 9,
  themeFont = 13,
  themeGap = 6,
  themeHeight = 32,
  themeInsetX = 12,
  themeIconSize = 16,
}: {
  dir?: Dir; lang?: "ar" | "he"
  themeFace?: string
  themeInk?: string
  themeRadius?: number
  themeFont?: number
  themeGap?: number
  themeHeight?: number
  themeInsetX?: number
  themeIconSize?: number
}) {
  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--direction-face": themeFace } : null),
    ...(themeInk ? { "--direction-ink": themeInk } : null),
    ...(themeRadius !== 9 ? { "--direction-radius": `${themeRadius}px` } : null),
    ...(themeFont !== 13 ? { "--direction-font": `${themeFont}px` } : null),
    ...(themeGap !== 6 ? { "--direction-gap": `${themeGap}px` } : null),
    ...(themeHeight !== 32 ? { "--direction-height": `${themeHeight}px` } : null),
    ...(themeInsetX !== 12 ? { "--direction-inset-x": `${themeInsetX}px` } : null),
    ...(themeIconSize !== 16 ? { "--direction-icon-size": `${themeIconSize}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[420px]">
      <Trip key={dir + lang} start={dir} lang={lang} />
    </div>
  )
}
