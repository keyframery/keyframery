// Typecheck stand-in for the project's own lib/utils.ts, which `shadcn add` installs through the "utils"
// registry dependency. Not shipped: no registry item lists this file.
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}
