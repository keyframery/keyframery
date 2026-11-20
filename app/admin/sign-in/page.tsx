import { redirect } from "next/navigation"

import { SignInForm } from "@site/components/admin/sign-in-form"
import { adminPassword, signedIn } from "@site/lib/admin/session"

import { signIn } from "../actions"

export const metadata = { title: "Sign in" }

export default async function Page() {
  if (await signedIn()) redirect("/admin")
  return <SignInForm action={signIn} ready={adminPassword() !== null} />
}
