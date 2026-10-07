/* When a staged hero dialog stops taking clicks and hides: only once it is closed AND its exit has ended. Every
   open or close starts over, so a late "ended" (from a timer or an earlier animation) can never hide an open
   dialog. No imports, so unit tests load it directly. */

export type Settle = { open: boolean; settled: boolean }
export type SettleEvent = "open" | "close" | "ended"

export const initialSettle = (open: boolean): Settle => ({ open, settled: !open })

export function nextSettle(s: Settle, e: SettleEvent): Settle {
  if (e === "open") return { open: true, settled: false }
  if (e === "close") return { open: false, settled: false }
  return { ...s, settled: true }
}

export const isHidden = (s: Settle) => s.settled && !s.open
