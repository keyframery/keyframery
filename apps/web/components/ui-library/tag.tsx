import { cn } from "@/lib/utils"

/** "New" for a component you can play with now, "Soon" for one still being made. */
export function Tag({ status, className }: { status: "new" | "soon"; className?: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-1.5 py-px text-[10.5px] leading-4 font-medium",
        // The text leans toward the foreground, so it stays readable on a highlighted sidebar row in either theme.
        status === "new" ? "bg-[color-mix(in_oklab,var(--cut)_12%,transparent)] text-[color-mix(in_oklab,var(--cut)_72%,var(--foreground))]" : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {status === "new" ? "New" : "Soon"}
    </span>
  )
}
