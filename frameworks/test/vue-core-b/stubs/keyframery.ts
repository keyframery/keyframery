/* STUB for the test app until frameworks/vue/_lib/keyframery.ts exists. */
import { inject, provide, type InjectionKey, type Ref, computed } from "vue"
export type Speed = "fast" | "normal" | "slow" | number
export type SpeedProps = { speed?: Speed }
export type MotionStyleName = "subtle" | "springy" | "calm" | "snappy" | "playful"
const presets = { fast: 0.6, normal: 1, slow: 1.4 } as const
export function speedValue(speed: Speed | undefined): number | undefined {
  if (speed === undefined) return undefined
  return typeof speed === "number" ? speed : presets[speed]
}
export const speedKey: InjectionKey<Ref<number | undefined>> = Symbol("kf-speed")
export function provideSpeed(speed: () => Speed | undefined) {
  const value = computed(() => speedValue(speed()) ?? inject(speedKey, undefined)?.value)
  provide(speedKey, value)
  return value
}
export function useSpeed() {
  return inject(speedKey, computed(() => undefined))
}
