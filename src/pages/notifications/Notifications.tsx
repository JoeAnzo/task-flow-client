import { useEffect, useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, Check } from "lucide-react"
import AppNav from "../home/components/AppNav"
import { getNotifications, markNotificationsRead, type NotificationItem } from "./services/notifications.service"

export default function Notifications() {
  const queryClient = useQueryClient()
  const attemptedIds = useRef(new Set<number>())
  const {
    data: notifications = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  })
  const {
    mutate: markRead,
    isPending: isMarkingRead,
    isError: markReadFailed,
  } = useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: (updatedNotifications) => {
      queryClient.setQueryData<NotificationItem[]>(["notifications"], (currentNotifications) =>
        currentNotifications?.map((notification) =>
          updatedNotifications.find((updated) => updated.id === notification.id) ?? notification,
        ),
      )
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
  const unreadNotifications = notifications.filter((notification) => !notification.isRead)
  const unreadCount = unreadNotifications.length

  useEffect(() => {
    if (isPending || error || isMarkingRead) {
      return
    }

    const unreadIds = unreadNotifications
      .map((notification) => notification.id)
      .filter((id) => !attemptedIds.current.has(id))

    if (unreadIds.length > 0) {
      unreadIds.forEach((id) => attemptedIds.current.add(id))
      markRead(unreadIds)
    }
  }, [error, isMarkingRead, isPending, markRead, unreadNotifications])

  function retryMarkingRead() {
    const ids = unreadNotifications.map((notification) => notification.id)
    ids.forEach((id) => attemptedIds.current.add(id))
    markRead(ids)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppNav />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold tracking-wide text-indigo-400">YOUR WORKSPACE</p>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Notifications</h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-sm font-medium text-indigo-300">
                {unreadCount} unread
              </span>
            )}
          </div>
        </header>

        {isPending ? (
          <p aria-live="polite" className="text-sm text-slate-400" role="status">Loading notifications…</p>
        ) : error ? (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300" role="alert">
            Could not load notifications. Please refresh and try again.
          </p>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-12 text-center">
            <Bell aria-hidden="true" className="mx-auto size-8 text-slate-500" />
            <p className="mt-4 font-medium text-slate-200">You’re all caught up</p>
            <p className="mt-2 text-sm text-slate-500">New notifications will appear here.</p>
          </div>
        ) : (
          <>
            {markReadFailed && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300" role="alert">
                <span>Could not mark notifications as read.</span>
                <button
                  className="font-medium underline underline-offset-2 hover:text-rose-200"
                  onClick={retryMarkingRead}
                  type="button"
                >
                  Try again
                </button>
              </div>
            )}
            <ul aria-label="Notifications" className="space-y-3">
              {notifications.map((notification) => (
                <li
                  className={`flex items-start gap-4 rounded-xl border p-4 sm:px-5 ${
                    notification.isRead
                      ? "border-white/10 bg-slate-900/80"
                      : "border-indigo-400/30 bg-indigo-500/5"
                  }`}
                  key={notification.id}
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-800">
                    {notification.isRead
                      ? <Check aria-hidden="true" className="size-4 text-slate-400" />
                      : <Bell aria-hidden="true" className="size-4 text-indigo-300" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-slate-100">{notification.title}</span>
                    <span className="mt-1 block text-sm text-slate-400">{notification.message}</span>
                    <time className="mt-2 block text-xs text-slate-500" dateTime={notification.createdAt}>
                      {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(notification.createdAt))}
                    </time>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}
