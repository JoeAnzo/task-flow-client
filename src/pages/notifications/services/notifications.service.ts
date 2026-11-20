import { apiClient } from "../../../shared/lib/axios"
import { getCsrfHeaders } from "../../../shared/lib/csrf"

type ApiNotification = {
  id: number
  todo: number | null
  nortification_type: string
  message: string
  is_read: boolean
  created_at: string
}

export type NotificationItem = {
  id: number
  title: string
  message: string
  createdAt: string
  isRead: boolean
}

const notificationTitles: Record<string, string> = {
  CREATED: "Task created",
  PENDING: "Task pending",
  MISSED: "Task missed",
  ACCOMPLISHED: "Task accomplished",
  UPDATED: "Task updated",
  DELETED: "Task deleted",
}

function mapNotification(notification: ApiNotification): NotificationItem {
  return {
    id: notification.id,
    title: notificationTitles[notification.nortification_type] ?? "Task notification",
    message: notification.message,
    createdAt: notification.created_at,
    isRead: notification.is_read,
  }
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const { data } = await apiClient.get<ApiNotification[]>("/api/v1/nortifications/")
  return data.map(mapNotification)
}

async function markNotificationReadWithHeaders(
  id: number,
  headers: Record<string, string>,
): Promise<NotificationItem> {
  const { data } = await apiClient.patch<ApiNotification>(
    `/api/v1/nortifications/${id}/read/`,
    {},
    { headers },
  )
  return mapNotification(data)
}

export async function markNotificationsRead(ids: number[]): Promise<NotificationItem[]> {
  const headers = await getCsrfHeaders()
  return Promise.all(ids.map((id) => markNotificationReadWithHeaders(id, headers)))
}
