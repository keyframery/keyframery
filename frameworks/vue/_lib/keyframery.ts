/* Keyframery for Vue: speed, motion style and the digit roll. The Vue twin of src/lib/keyframery.tsx.

   Every duration in the components is written as calc(Nms * var(--kf-speed, 1)). These helpers set
   that variable for you:

     <Tabs speed="fast">                      one component
     <KeyframeryProvider speed="slow">        the whole app

   Parts that render in a portal (popups, menus, dialogs) are not inside the component in the page,
   so they pick the speed up through provide/inject instead of the CSS cascade. */

import {
  Comment,
  Fragment,
  Text,
  type VNode,
  computed,
  defineComponent,
  type ComputedRef,
  type CSSProperties,
  h,
  inject,
  type InjectionKey,
  type IntrinsicElementAttributes,
  onBeforeUnmount,
  type PropType,
  provide,
  watchEffect,
} from "vue"

import { cn } from "./utils"

/* Props types for the parts. Each part passes its props to UI SDK's own Vue part as attrs (so
   behaviour is exactly UI SDK's), and declares them as types only, so vue-tsc and your editor check
   and complete them:

     PartProps<typeof TabsTab>   everything UI SDK's part takes in a template: its props, its events
                                 as on* props (onValueChange, "onUpdate:value" for v-model:value),
                                 and the attributes of the element it renders
     ElementProps<"div">         the attributes of a plain element, for parts that render one

   Every component's index.ts exports its parts' types (TabsTabProps, SelectProps…), built from these.
   `autocomplete` is typed as a string: Vue's own type for it is a union of every autofill token
   combination, too large for TypeScript once defineProps maps over it (TS2590 on <input> parts). */
type Tame<P> = "autocomplete" extends keyof P ? Omit<P, "autocomplete"> & { autocomplete?: string } : P

export type PartProps<C> = C extends abstract new (...args: any) => { $props: infer P } ? Tame<P> : never

export type ElementProps<Tag extends keyof IntrinsicElementAttributes> = Tame<IntrinsicElementAttributes[Tag]> & {
  [attribute: `data${Capitalize<string>}`]: unknown
}

/** `"fast"` (0.6×), `"normal"` (1×), `"slow"` (1.4×), or any multiplier: `0.8` is 20% quicker. */
export type Speed = "fast" | "normal" | "slow" | number

export type SpeedProps = {
  /** How fast the component moves. `"fast"` (0.6×), `"normal"` (1×), `"slow"` (1.4×), or a multiplier like `0.8`. Popups follow it too. */
  speed?: Speed
}

export type MotionStyleName = "subtle" | "springy" | "calm" | "snappy" | "playful"

const presets = { fast: 0.6, normal: 1, slow: 1.4 } as const

export function speedValue(speed: Speed | undefined): number | undefined {
  if (speed === undefined || speed === null) return undefined
  return typeof speed === "number" ? speed : presets[speed]
}

/** The speed of the component a part belongs to, for parts that render in a portal. */
export const speedKey: InjectionKey<ComputedRef<number | undefined>> = Symbol("kf-speed")

/** For a root that renders its own element: provides the speed to its parts and returns the style
    to put on that element (`--kf-speed`, or nothing without a speed). */
export function useSpeed(speed: () => Speed | undefined) {
  const value = computed(() => speedValue(speed()))
  provide(speedKey, value)
  return computed<CSSProperties | undefined>(() => (value.value === undefined ? undefined : ({ "--kf-speed": value.value } as CSSProperties)))
}

/** For parts that render in a portal: the speed of the component they belong to, as a style
    (bind it before the user's own style, so theirs wins), like React's useSpeedStyle. */
export function useSpeedStyle() {
  const value = inject(speedKey, undefined)
  return computed<CSSProperties | undefined>(() => (value?.value === undefined ? undefined : ({ "--kf-speed": value.value } as CSSProperties)))
}

/** Wraps a component's parts, like React's <Speed>. Without `speed` it adds nothing to the page. With
    it, a `display: contents` span carries the variable to the parts in place, and provide/inject
    carries it to the parts in a portal. */
export const Speed = defineComponent({
  name: "KeyframerySpeed",
  props: { speed: { type: [String, Number] as PropType<Speed>, default: undefined } },
  setup(props, { slots }) {
    const value = computed(() => speedValue(props.speed))
    provide(speedKey, value)
    return () => {
      /* One element, not a fragment, so a part that renders this component through #render (a
         Tooltip trigger's Button) binds to a real element. */
      if (value.value === undefined) {
        const nodes = (slots.default?.() ?? []).filter((n) => n.type !== Comment)
        return nodes.length === 1 ? nodes[0] : nodes
      }
      return h("span", { "data-slot": "speed", style: { display: "contents", "--kf-speed": value.value } }, slots.default?.())
    }
  },
})

/** Sets speed and motion style for the whole app, popups included. A component's own `speed` prop
    still wins inside that component. Server-rendered pages can put `data-motion` on <html> directly. */
export const KeyframeryProvider = defineComponent({
  name: "KeyframeryProvider",
  props: {
    speed: { type: [String, Number] as PropType<Speed>, default: undefined },
    /** The motion style for the whole app: `"subtle"` (the default), `"calm"`, `"springy"`, `"snappy"` or `"playful"`. */
    motion: { type: String as PropType<MotionStyleName>, default: undefined },
  },
  setup(props, { slots }) {
    let applied: { motion?: string; speed?: number } = {}
    const clear = () => {
      if (typeof document === "undefined") return
      const html = document.documentElement
      if (applied.motion) html.removeAttribute("data-motion")
      if (applied.speed !== undefined) html.style.removeProperty("--kf-speed")
      applied = {}
    }
    watchEffect(() => {
      if (typeof document === "undefined") return
      const value = speedValue(props.speed)
      clear()
      const html = document.documentElement
      if (props.motion) html.setAttribute("data-motion", props.motion)
      if (value !== undefined) html.style.setProperty("--kf-speed", String(value))
      applied = { motion: props.motion, speed: value }
    }, { flush: "pre" })
    onBeforeUnmount(clear)
    return () => slots.default?.()
  },
})

/* Roll: every digit is a column of 0 to 9 that slides to its value on a spring; other characters
   (%, spaces, units) stay put. Positions are keyed from the right, so 9% to 10% rolls the units digit
   and adds a tens digit instead of shifting everything. Screen readers get the plain text. The roll
   scales with --kf-flourish: at 0 the new value is simply there.

   Default look = meter and progress (src/components/primitives/progress.tsx). `centered` = the
   slider's (each digit keeps a 0's width and centres its column). The props carry the small
   differences the other React rolls have. */
const rollDigit =
  "flex flex-col transition-[translate] duration-[calc(500ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring [translate:0_calc(var(--d)*-1lh)] motion-reduce:transition-none!"
const rollCentered =
  "absolute inset-x-0 top-0 flex flex-col [translate:0_calc(var(--kf-d)*-1lh)] transition-[translate] duration-[calc(500ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring motion-reduce:transition-none!"

export const Roll = defineComponent({
  name: "KeyframeryRoll",
  props: {
    text: { type: String, required: true },
    /** Classes for the box, merged after the base. */
    class: { type: String, default: undefined },
    /** The slider's roll: each digit keeps a 0's width and its column centres in it. */
    centered: { type: Boolean, default: false },
    /** Classes for each digit column (replaces the default). */
    digitClass: { type: String, default: undefined },
    /** The marker on the box: `data-slot="roll"` (default), or another attribute name. */
    marker: { type: String, default: undefined },
    /** Whether the box carries tabular-nums (default true, the slider's does not). */
    tabular: { type: Boolean, default: undefined },
    /** Also set --k (the place from the right) on each column, for staggered rolls. */
    keyed: { type: Boolean, default: false },
  },
  setup(props) {
    return () => {
      const chars = props.text.split("")
      const tabular = props.tabular ?? !props.centered
      const box = cn("inline-flex h-[1lh] overflow-hidden whitespace-pre", tabular && "tabular-nums", props.class)
      const boxAttrs: Record<string, unknown> = { "aria-hidden": "true", class: box }
      if (props.marker) boxAttrs[props.marker] = ""
      else if (!props.centered) boxAttrs["data-slot"] = "roll"
      const digits = (cls: string) => Array.from({ length: 10 }, (_, d) => h("span", { key: d, class: cls }, String(d)))
      return [
        h("span", { class: "sr-only" }, props.text),
        h(
          "span",
          boxAttrs,
          chars.map((c, i) => {
            const key = chars.length - i
            if (!/\d/.test(c)) return h("span", { key: props.centered ? key + c : key }, c)
            if (props.centered)
              return h("span", { key, class: "relative inline-block" }, [
                h("span", { class: "invisible" }, "0"),
                h("span", { style: { "--kf-d": Number(c) }, class: props.digitClass ?? rollCentered }, digits("h-[1lh] text-center")),
              ])
            return h("span", { key, style: props.keyed ? { "--d": Number(c), "--k": key } : { "--d": Number(c) }, class: props.digitClass ?? rollDigit }, digits("h-[1lh]"))
          }),
        ),
      ]
    }
  },
})

/* Slot content as a flat list: fragments (v-for, <template>) opened, comments dropped. */
export function flattenNodes(nodes: unknown): VNode[] {
  const out: VNode[] = []
  const visit = (n: unknown) => {
    if (Array.isArray(n)) return n.forEach(visit)
    if (n === null || n === undefined || typeof n === "boolean") return
    if (typeof n === "string" || typeof n === "number") return out.push(h(Text, String(n)))
    const v = n as VNode
    if (v.type === Comment) return
    if (v.type === Fragment) return visit(v.children)
    out.push(v)
  }
  visit(nodes)
  return out
}

/* Plain text in slot content as paragraphs (React's Children.map(child => string ? <p> : child)),
   so it has an element to cascade. */
export const TextAsParagraphs = defineComponent({
  name: "KeyframeryTextAsParagraphs",
  props: { nodes: { type: [Array, Object] as PropType<unknown>, required: false } },
  setup(props) {
    return () =>
      flattenNodes(props.nodes).map((v) => (v.type === Text && String(v.children).trim() ? h("p", String(v.children).trim()) : v))
  },
})

/* A copy of each child's own content (its default slot), each in a box with the given class: the
   labels the tabs and segmented control draw again inside their moving key (React:
   Children.map(content, child => <span className={box}>{child.props.children}</span>)). */
export const LabelCopies = defineComponent({
  name: "KeyframeryLabelCopies",
  props: {
    nodes: { type: [Array, Object] as PropType<unknown>, required: false },
    boxClass: { type: String, default: undefined },
    /** A data-slot for each copy. */
    slotName: { type: String, default: undefined },
    /** Each copy also takes its child's own class (a string), so a stretched item has a stretched copy. */
    childClass: { type: Boolean, default: false },
  },
  setup(props) {
    return () =>
      flattenNodes(props.nodes).flatMap((v) => {
        if (typeof v.type === "symbol") return []
        const children = v.children as unknown
        let inner: unknown = null
        if (children && typeof children === "object" && !Array.isArray(children) && typeof (children as Record<string, unknown>).default === "function")
          inner = ((children as Record<string, (s: object) => unknown>).default)({ state: {} })
        else inner = children
        const own = props.childClass && typeof v.props?.class === "string" ? v.props.class : undefined
        return [h("span", { "data-slot": props.slotName, class: own ? cn(props.boxClass, own) : props.boxClass }, inner as never)]
      })
  },
})
