/* Which host built this deployment. keyframery.com runs on Vercel or Netlify, so production checks
   read both: Vercel sets VERCEL_ENV, Netlify sets CONTEXT ("production" for the live site, "deploy-preview"
   or "branch-deploy" otherwise). Both are read at build time, which is when every page is rendered. */
export const isProductionDeploy = process.env.VERCEL_ENV === "production" || process.env.CONTEXT === "production"

/* True when Netlify built this deployment. Netlify's Open Source plan asks for "This site is powered by Netlify"
   on the site, so the footer shows it on Netlify builds only and it goes away on its own back on Vercel. */
export const builtOnNetlify = process.env.NETLIFY === "true" || Boolean(process.env.CONTEXT)
