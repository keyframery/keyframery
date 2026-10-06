export type LoadPhase = "content" | "waiting" | "skeleton" | "settling"
export type LoadEvent = "loading" | "loaded" | "held" | "shown" | "settled"

/**
 * content  --loading--> waiting   the skeleton's space is reserved, invisible, for --kf-hold
 * waiting  --loaded-->  content   the data was fast: the skeleton is never seen
 * waiting  --held-->    skeleton  still loading: show it
 * skeleton --shown-->   settling  loaded, and the skeleton has been up long enough: dissolve
 * settling --settled--> content
 * any      --loading--> waiting   (a skeleton already on screen stays)
 */
export function nextLoadPhase(phase: LoadPhase, event: LoadEvent): LoadPhase {
  switch (event) {
    case "loading":
      return phase === "skeleton" ? "skeleton" : "waiting"
    case "loaded":
      return phase === "waiting" ? "content" : phase
    case "held":
      return phase === "waiting" ? "skeleton" : phase
    case "shown":
      return phase === "skeleton" ? "settling" : phase
    case "settled":
      return phase === "settling" ? "content" : phase
  }
}

/** --kf-hold as milliseconds ("300ms", "0.3s"); 300 when missing or unreadable. */
export function parseHold(raw: string | null | undefined): number {
  const m = (raw ?? "").trim().match(/^(\d*\.?\d+)(ms|s)$/)
  if (!m) return 300
  return m[2] === "s" ? Number(m[1]) * 1000 : Number(m[1])
}
