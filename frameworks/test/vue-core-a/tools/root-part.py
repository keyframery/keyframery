"""Writes a root SFC: python3 root-part.py <dir> <FileName> <PartKey> '<classes>' '<comment>' ['<style css>'] ['<extra props ts>' '<extra bindings>']
   Wraps parts.<PartKey> in <Speed :speed>, forwards attrs and the scoped default slot."""
import sys, json
d, name, key, cls, comment = sys.argv[1:6]
style = sys.argv[6] if len(sys.argv) > 6 else ""
extra_props = sys.argv[7] if len(sys.argv) > 7 else ""
extra_bind = sys.argv[8] if len(sys.argv) > 8 else ""
style_block = f"\n<style>\n{style}\n</style>\n" if style else ""
body = f'''<script setup lang="ts">
/* {comment} */
import {{ computed, useAttrs }} from "vue"

import {{ Speed, type Speed as SpeedValue }} from "@/lib/keyframery"
import {{ cn }} from "@/lib/utils"

import {{ parts }} from "./parts"

defineOptions({{ inheritAttrs: false }})
const props = defineProps<{{ speed?: SpeedValue{extra_props} }}>()
const attrs = useAttrs()
const forwarded = computed(() => {{
  const {{ class: _class, ...rest }} = attrs
  return rest
}})
const base = {json.dumps(cls)}
</script>

<template>
  <Speed :speed="props.speed">
    <parts.{key}{extra_bind} v-bind="forwarded" :class="cn(base, attrs.class as any)">
      <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {{}}" /></template>
    </parts.{key}>
  </Speed>
</template>
{style_block}'''
open(f"{d}/{name}.vue", "w").write(body)
