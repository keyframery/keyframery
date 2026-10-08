/**
 * Pro (ready-made screens, with an email waitlist) is hidden until we know what it will be. While this is false, the
 * header, footer, home page, FAQ, sitemap, privacy and terms leave it out, and /pro is a 404. Set it to true to bring
 * it all back; the waitlist then needs DATABASE_URL on Vercel (see docs/deploy.md).
 */
export const PRO_ENABLED = false
