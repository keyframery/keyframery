"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

import { Cuts, type CutsProps } from "@/components/keyframery/cuts"
import { IconMoves } from "@/components/keyframery/icon-moves"

/** <Cuts /> driven by the URL, so tests can switch menus: /?dialog=punch-in&pace=2&off&double&responses=none&icons=hover|none */
export function KfCuts() {
  const q = useSearchParams()
  const get = (key: string) => q.get(key) ?? undefined
  const pace = q.get("pace")
  useEffect(() => document.documentElement.setAttribute("data-fixture-ready", ""), []) // tests wait for hydration
  return (
    <>
      <Cuts
        dialog={get("dialog") as CutsProps["dialog"]}
        sheet={get("sheet") as CutsProps["sheet"]}
        drawer={get("drawer") as CutsProps["drawer"]}
        tabs={get("tabs") as CutsProps["tabs"]}
        toast={get("toast") as CutsProps["toast"]}
        pace={pace ? Number(pace) : undefined}
        enabled={!q.has("off")}
        responses={get("responses") as CutsProps["responses"]}
      />
      {q.get("icons") !== "none" && <IconMoves on={q.get("icons") === "hover" ? "hover" : "press"} />}
      {q.has("double") && <Cuts />}
    </>
  )
}
