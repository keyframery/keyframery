// Placeholder shapes
// Size each `Skeleton` like the content that's coming, so nothing jumps when it arrives.
import { Skeleton } from "@/components/ui/skeleton"

export default function SkeletonBasic() {
  return (
    <div className="flex w-full max-w-[300px] items-center gap-3">
      <Skeleton className="size-11 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  )
}
