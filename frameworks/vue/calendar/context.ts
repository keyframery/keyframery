/* The month the first grid showed when it last rendered, so a month change can tell whether it went
   forward or back (React keeps it in a ref through ShownMonthContext). */
import type { InjectionKey } from "vue"

export const shownMonthKey: InjectionKey<{ current: string | null }> = Symbol("kf-calendar-shown-month")
