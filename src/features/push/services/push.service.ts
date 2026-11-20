import { apiClient } from "../../../shared/lib/axios"
import { getCsrfHeaders } from "../../../shared/lib/csrf"

type VapidKeyResponse = {
  publicKey: string
}

function decodeVapidPublicKey(publicKey: string): ArrayBuffer {
  const padding = "=".repeat((4 - publicKey.length % 4) % 4)
  const base64 = (publicKey + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const key = new Uint8Array(rawData.length)

  for (let index = 0; index < rawData.length; index += 1) {
    key[index] = rawData.charCodeAt(index)
  }

  return key.buffer
}

export async function getVapidPublicKey(): Promise<string> {
  const { data } = await apiClient.get<VapidKeyResponse>("/api/v1/push/public-key/")
  return data.publicKey
}

export async function savePushSubscription(subscription: PushSubscription): Promise<void> {
  const browser = navigator.userAgent.match(/(firefox|msie|chrome|safari|trident)/i)?.[0]?.toLowerCase()
    ?? "unknown"

  const headers = await getCsrfHeaders()
  await apiClient.post("/api/v1/push/subscriptions/", {
    subscription: subscription.toJSON(),
    browser,
    user_agent: navigator.userAgent,
  }, { headers })
}

export async function createPushSubscription(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription> {
  const existingSubscription = await registration.pushManager.getSubscription()
  if (existingSubscription) {
    await savePushSubscription(existingSubscription)
    return existingSubscription
  }

  const publicKey = await getVapidPublicKey()
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeVapidPublicKey(publicKey),
  })

  try {
    await savePushSubscription(subscription)
  } catch (error) {
    await subscription.unsubscribe()
    throw error
  }

  return subscription
}
