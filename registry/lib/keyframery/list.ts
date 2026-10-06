/** ListCut's pure part: which ids arrived, left, or stayed between two renders. */

export type ListKey = string | number

export function diffIds(before: ListKey[], after: ListKey[]) {
  const was = new Set(before)
  const is = new Set(after)
  return {
    entered: after.filter((k) => !was.has(k)),
    exited: before.filter((k) => !is.has(k)),
    kept: after.filter((k) => was.has(k)),
  }
}
