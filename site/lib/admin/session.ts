import "server-only"

import { createHash, createHmac, timingSafeEqual } from "node:crypto"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

/**
 * /admin is guarded by one password, KEYFRAMERY_ADMIN_PASSWORD, set on Vercel: there are no accounts. Entering it
 * sets a signed, httpOnly cookie that expires; the signing key comes from the password itself, so changing the
 * password signs everyone out. A short or missing password keeps /admin closed rather than open.
 */

export const SESSION_COOKIE = "kf_admin"
export const SESSION_HOURS = 12
export const MIN_PASSWORD_LENGTH = 24

export function adminPassword(env: Record<string, string | undefined> = process.env): string | null {
  const password = env.KEYFRAMERY_ADMIN_PASSWORD ?? ""
  return password.length >= MIN_PASSWORD_LENGTH ? password : null
}

const digest = (text: string) => createHash("sha256").update(text, "utf8").digest()

/** Compares in constant time; hashing first makes the lengths equal. */
export function passwordMatches(input: string, password: string): boolean {
  return timingSafeEqual(digest(input), digest(password))
}

function sign(expires: number, password: string) {
  return createHmac("sha256", digest(`kf-admin:${password}`)).update(String(expires)).digest("base64url")
}

/** The cookie value: when it expires (ms since epoch) and a signature over that. */
export function createSession(password: string, now = Date.now()): { value: string; expires: Date } {
  const expires = now + SESSION_HOURS * 3_600_000
  return { value: `${expires}.${sign(expires, password)}`, expires: new Date(expires) }
}

export function sessionValid(value: string | undefined, password: string | null, now = Date.now()): boolean {
  if (!value || !password) return false
  const [expiresText, signature] = value.split(".")
  const expires = Number(expiresText)
  if (!Number.isFinite(expires) || expires <= now || !signature) return false
  const expected = Buffer.from(sign(expires, password))
  const given = Buffer.from(signature)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

export async function signedIn(): Promise<boolean> {
  return sessionValid((await cookies()).get(SESSION_COOKIE)?.value, adminPassword())
}

/** For every admin page and action: back to the sign-in page unless the cookie is valid. */
export async function requireAdmin(): Promise<void> {
  if (!(await signedIn())) redirect("/admin/sign-in")
}

/* Wrong guesses, per visitor network, kept in this server instance's memory. Serverless instances come and go, so
   this only slows guessing down; the password's length (24+ random characters) is what makes guessing hopeless. */
const attempts = new Map<string, { count: number; until: number }>()
const WINDOW = 15 * 60_000
const LIMIT = 8

export function lockedOut(key: string, now = Date.now()): boolean {
  const entry = attempts.get(key)
  return !!entry && entry.until > now && entry.count >= LIMIT
}

export function noteFailure(key: string, now = Date.now()) {
  const entry = attempts.get(key)
  if (!entry || entry.until <= now) attempts.set(key, { count: 1, until: now + WINDOW })
  else entry.count++
  if (attempts.size > 5000) attempts.clear()
}

export function clearFailures(key: string) {
  attempts.delete(key)
}
