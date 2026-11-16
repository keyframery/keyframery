// Swap to the content
// `SkeletonSwap` shows the `fallback` while `loading`, then crossfades to the real content.
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Skeleton, SkeletonSwap } from "@/components/ui/skeleton"

export default function SkeletonSwapExample() {
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => {
    if (!loading) return
    const t = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(t)
  }, [loading])
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-4">
      <SkeletonSwap
        loading={loading}
        fallback={
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-52" />
          </div>
        }
      >
        <div className="space-y-1">
          <div className="text-[14px] font-semibold">Maya Chen</div>
          <div className="text-[13px] text-muted-foreground">Product designer in Lisbon</div>
        </div>
      </SkeletonSwap>
      <Button size="sm" className="self-start" disabled={loading} onClick={() => setLoading(true)}>
        Reload
      </Button>
    </div>
  )
}
