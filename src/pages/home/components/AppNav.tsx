import { useAuth } from "../../../features/auth/context/AuthContext"
import { Link, useNavigate } from "react-router-dom"
import { Bell, MessageCircle } from "lucide-react"

export default function AppNav() {
    const {logout} = useAuth()
    const navigate = useNavigate()

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
          <button
            aria-label="Notifications (coming soon)"
            className="flex size-10 cursor-not-allowed items-center justify-center rounded-lg border border-slate-800 text-slate-600"
            disabled
            title="Notifications coming soon"
            type="button"
          >
            <Bell aria-hidden="true" className="size-5" />
          </button>
          <button
            aria-label="AI chat (coming soon)"
            className="flex size-10 cursor-not-allowed items-center justify-center rounded-lg border border-slate-800 text-slate-600"
            disabled
            title="AI chat coming soon"
            type="button"
          >
            <MessageCircle aria-hidden="true" className="size-5" />
          </button>
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
