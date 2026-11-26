#!/bin/zsh
# vue-tsc, errors in my files only (my overrides, demos, lib, App).
cd ${0:A:h}/..
mine="alert|approval|aspect-ratio|attachment|badge|breadcrumb|bubble|button-group|card|chart|code-block|data-table|description-list|diff-viewer|direction|empty|filter|form|input-group"
./node_modules/.bin/vue-tsc --noEmit 2>&1 | grep -E "^(src/components/keyframery/($mine)/|src/demos/|src/App|src/lib/|\.\./\.\./overrides/vue/($mine)/)" -A3 | grep -v "^--$"
echo "check done"
