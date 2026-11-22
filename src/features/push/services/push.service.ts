import axios from "axios"
import { apiClient } from "../../../shared/lib/axios"
import { getCsrfHeaders } from "../../../shared/lib/csrf"

type VapidKeyResponse = {
  publicKey: string
}

function invalidVapidPublicKey(): Error {
  return new Error(
    "The server's VAPID public key is invalid. Configure VAPID_PUBLIC_KEY with a base64url-encoded P-256 public key.",
  )
}

function decodeVapidPublicKey(publicKey: string): ArrayBuffer {
  if (!/^[A-Za-z0-9_-]+={0,2}$/.test(publicKey) || publicKey.length % 4 === 1) {
    throw invalidVapidPublicKey()
  }

  const padding = "=".repeat((4 - publicKey.length % 4) % 4)
  const base64 = (publicKey + padding).replace(/-/g, "+").replace(/_/g, "/")
  let rawData: string
  try {
    rawData = window.atob(base64)
  } catch {
    throw invalidVapidPublicKey()
  }

  if (rawData.length !== 65 || rawData.charCodeAt(0) !== 4) {
    throw invalidVapidPublicKey()
  }

  const key = new Uint8Array(rawData.length)

  for (let index = 0; index < rawData.length; index += 1) {
    key[index] = rawData.charCodeAt(index)
  }

  return key.buffer
}

export async function getVapidPublicKey(): Promise<string> {
  const { data } = await apiClient.get<VapidKeyResponse>("/api/v1/push/public-key/")
  const publicKey = data.publicKey?.trim()
  if (!publicKey) {
    throw new Error("Push reminders are not configured on the server.")
  }
  return publicKey
}

export async function savePushSubscription(subscription: PushSubscription): Promise<void> {
  const browser = navigator.userAgent.match(/(firefox|msie|chrome|safari|trident)/i)?.[0]?.toLowerCase()
    ?? "unknown"

  const headers = await getCsrfHeaders()
  try {
    await apiClient.post("/api/v1/push/subscriptions/", {
      subscription: subscription.toJSON(),
      browser,
      user_agent: navigator.userAgent,
    }, { headers })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data
      const detail = responseData && typeof responseData === "object" && "detail" in responseData
        ? String(responseData.detail)
        : ""
      throw new Error(detail || `The server rejected the reminder subscription (${error.response?.status ?? "network error"}).`)
    }
    throw error
  }
}

export async function createPushSubscription(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription> {
  const publicKey = await getVapidPublicKey()
  const keyStorageName = "todo-app-vapid-public-key"
  const existingSubscription = await registration.pushManager.getSubscription()
  const storedPublicKey = window.localStorage.getItem(keyStorageName)

  if (existingSubscription && storedPublicKey === publicKey) {
    await savePushSubscription(existingSubscription)
    return existingSubscription
  }

  if (existingSubscription) {
    await existingSubscription.unsubscribe()
  }

  let subscription: PushSubscription
  try {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeVapidPublicKey(publicKey),
    })
  } catch (error) {
    if (error instanceof TypeError || (error instanceof DOMException && error.name === "InvalidAccessError")) {
      throw invalidVapidPublicKey()
    }
    throw error
  }

  try {
    await savePushSubscription(subscription)
  } catch (error) {
    await subscription.unsubscribe()
    throw error
  }

  window.localStorage.setItem("todo-app-vapid-public-key", publicKey)
  return subscription
}
