import { useAuth } from "../../../features/auth/context/AuthContext"
import { Link, useNavigate } from "react-router-dom"
import { Bell, MessageCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getNotifications } from "../../notifications/services/notifications.service"

export default function AppNav() {
    const {logout} = useAuth()
    const navigate = useNavigate()
    const { data: notifications = [] } = useQuery({
      queryKey: ["notifications"],
      queryFn: getNotifications,
    })
    const unreadCount = notifications.filter((notification) => !notification.isRead).length

    async function handleLogout() {
        await logout();
        navigate("/login",{replace:true})
    }
  return (
      <nav className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-8">
        <Link className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-100" to="/">
          <img
            alt=""
            aria-hidden="true"
            className="size-9 rounded-xl object-cover"
            src="/android-chrome-512x512.png"
          />
          Taskflow
        </Link>
        <div className="flex items-center gap-3">
          <Link
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
            className="relative flex size-10 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            title="Notifications"
            to="/notifications"
          >
            <Bell aria-hidden="true" className="size-5" />
            {unreadCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-rose-500 px-1 text-center text-xs font-semibold leading-5 text-white"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <Link
            aria-label="AI task planning chat"
            className="flex size-10 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            title="AI task planning chat"
            to="/chat"
          >
            <MessageCircle aria-hidden="true" className="size-5" />
          </Link>
          <button
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            type="button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </nav>
    )
}
