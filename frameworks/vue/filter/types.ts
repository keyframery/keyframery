import type { Component } from "vue"

import type { FilterOption as FilterOptionData } from "@/components/keyframery/core/filter-core"

/** An option, with an icon if you like (a component, rendered at 14px). */
export type FilterItem = FilterOptionData & { icon?: Component }
