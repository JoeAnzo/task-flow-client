import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { Link, useSearchParams } from "react-router-dom"
import { verifyEmail } from "../services/auth.service"

type VerificationState = "verifying" | "verified" | "error"

function getVerificationError(error: unknown): string {
  if (axios.isAxiosError<unknown>(error)) {
    const data = error.response?.data
    if (data && typeof data === "object" && "detail" in data && typeof data.detail === "string") {
      return data.detail
    }
  }
  return "This confirmation link may be invalid or expired. Request a new link or contact support."
}

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [state, setState] = useState<VerificationState>("verifying")
  const [errorMessage, setErrorMessage] = useState("")
  const started = useRef(false)
  const key = searchParams.get("key")

  useEffect(() => {
    if (started.current) return
    started.current = true

    if (!key) {
      setErrorMessage("The confirmation link does not contain a verification key.")
      setState("error")
      return
    }

    void verifyEmail(key)
      .then(() => setState("verified"))
      .catch((error: unknown) => {
        setErrorMessage(getVerificationError(error))
        setState("error")
      })
  }, [key])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <section className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-slate-900 p-8 text-center shadow-2xl shadow-black/30">
        <Link className="mx-auto inline-flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-100" to="/">
          <img alt="" aria-hidden="true" className="size-10 rounded-xl object-cover" src="/android-chrome-512x512.png" />
          TaskFlow
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          {state === "verifying" ? "Verifying your email" : state === "verified" ? "Email confirmed" : "Confirmation failed"}
        </h1>
        {state === "verifying" ? (
          <p aria-live="polite" className="text-sm text-slate-300" role="status">Please wait while we confirm your email address…</p>
        ) : state === "verified" ? (
          <>
            <p className="text-sm text-slate-300">Your email is verified. You can now log in to TaskFlow.</p>
            <Link className="inline-block rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-400" to="/login">
              Log in
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-rose-300" role="alert">{errorMessage}</p>
            <Link className="inline-block font-medium text-indigo-400 hover:text-indigo-300" to="/signup">Return to sign up</Link>
          </>
        )}
      </section>
    </main>
  )
}
