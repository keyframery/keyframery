<script setup lang="ts">
// From a patch
// Give it the output of `git diff` instead of two texts. The file name comes from the patch; folds between hunks show how many lines they hide.

import { DiffViewer } from "@/components/keyframery/diff-viewer"

const patch = `diff --git a/styles/cart.css b/styles/cart.css
--- a/styles/cart.css
+++ b/styles/cart.css
@@ -12,6 +12,7 @@ .cart {
 .price {
   font-weight: 500;
-  color: #6b6b6b;
+  color: var(--muted-foreground);
+  font-variant-numeric: tabular-nums;
 }
 
 .total {
@@ -40,3 +41,3 @@ .checkout {
 .checkout button {
-  border-radius: 6px;
+  border-radius: 10px;
 }
`
</script>

<template>
  <DiffViewer :patch="patch" class="max-w-[560px]" />
</template>
