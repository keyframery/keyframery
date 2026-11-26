"""Writes a simple pass-through part SFC: python3 simple-part.py <dir> <FileName> <PartKey> '<classes>' [comment]
   The part renders parts.<PartKey> with cn(classes, attrs.class) and forwards the scoped default slot."""
import sys, json
d, name, key, cls = sys.argv[1:5]
comment = sys.argv[5] if len(sys.argv) > 5 else ""
head = f"/* {comment} */\n" if comment else ""
body = f'''<script setup lang="ts">
{head}import {{ computed, useAttrs }} from "vue"

import {{ cn }} from "@/lib/utils"

import {{ parts }} from "./parts"

defineOptions({{ inheritAttrs: false }})
const attrs = useAttrs()
const forwarded = computed(() => {{
  const {{ class: _class, ...rest }} = attrs
  return rest
}})
const base = {json.dumps(cls)}
</script>

<template>
  <parts.{key} v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {{}}" /></template>
  </parts.{key}>
</template>
'''
open(f"{d}/{name}.vue", "w").write(body)
