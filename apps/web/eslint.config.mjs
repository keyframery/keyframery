import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  ...nextVitals,
  // shadcn's own component files, copied as the CLI writes them; we don't rewrite vendored code to suit a lint rule.
  { files: ['components/ui/**', 'hooks/**'], rules: { 'react-hooks/set-state-in-effect': 'off' } },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.source/**',
  ]),
]);

export default eslintConfig;
