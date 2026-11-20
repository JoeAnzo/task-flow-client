import { useEffect, useState } from "react"
import { BellRing, X } from "lucide-react"
import { createPushSubscription } from "../services/push.service"

type PromptStatus = "checking" | "ready" | "subscribing" | "subscribed" | "denied" | "unsupported" | "error"

export default function PushReminderPrompt() {
  const [status, setStatus] = useState<PromptStatus>("checking")
  const [dismissed, setDismissed] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    let active = true

    async function checkPushSupport() {
      if (
        !window.isSecureContext
        || !("Notification" in window)
        || !("serviceWorker" in navigator)
        || !("PushManager" in window)
      ) {
        setStatus("unsupported")
        return
      }

      try {
        const serviceWorker = await navigator.serviceWorker.register("/service-worker.js")
        const existingSubscription = await serviceWorker.pushManager.getSubscription()

        if (!active) {
          return
        }

        setRegistration(serviceWorker)

        if (existingSubscription) {
          await createPushSubscription(serviceWorker)
          if (active) {
            setStatus("subscribed")
          }
        } else if (Notification.permission === "denied") {
          setStatus("denied")
        } else {
          setStatus("ready")
        }
      } catch {
        if (active) {
          setStatus("error")
        }
      }
    }

    void checkPushSupport()
    return () => {
      active = false
    }
  }, [])

  async function handleSubscribe() {
    setStatus("subscribing")

    try {
      const permission = Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission()
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "ready")
        return
      }

      const serviceWorker = registration
        ?? await navigator.serviceWorker.register("/service-worker.js")
      setRegistration(serviceWorker)
      await createPushSubscription(serviceWorker)
      setStatus("subscribed")
    } catch {
      setStatus("error")
    }
  }

  if (dismissed || status === "checking" || status === "subscribed" || status === "unsupported") {
    return null
  }

  return (
    <aside
      aria-label="Task reminders"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-xl items-start gap-4 rounded-2xl border border-indigo-400/30 bg-slate-900 p-4 shadow-2xl shadow-black/40 sm:p-5"
    >
      <BellRing aria-hidden="true" className="mt-1 size-5 shrink-0 text-indigo-300" />
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-slate-100">Get task reminders</h2>
        <p className="mt-1 text-sm text-slate-400">
          Allow browser notifications to receive reminders when your tasks are due.
        </p>
        {status === "denied" && (
          <p className="mt-2 text-sm text-amber-300" role="status">
            Notifications are blocked in your browser. Change the site permission in browser settings to enable reminders.
          </p>
        )}
        {status === "error" && (
          <p className="mt-2 text-sm text-rose-300" role="alert">
            Could not set up reminders. Please try again.
          </p>
        )}
        {status !== "denied" && (
          <button
            className="mt-3 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 disabled:cursor-wait disabled:opacity-60"
            disabled={status === "subscribing"}
            onClick={handleSubscribe}
            type="button"
          >
            {status === "subscribing" ? "Enabling reminders…" : status === "error" ? "Try again" : "Enable reminders"}
          </button>
        )}
      </div>
      <button
        aria-label="Dismiss reminder prompt"
        className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        onClick={() => setDismissed(true)}
        type="button"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </aside>
  )
}
