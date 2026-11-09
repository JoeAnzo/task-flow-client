import { Navigate,Outlet,useLocation } from "react-router-dom"
import { LoaderCircle } from "lucide-react"
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoutes() {
    const {user, isLoading,error} = useAuth()
    const location = useLocation()

    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
                <div aria-live="polite" className="flex items-center gap-3" role="status">
                    <LoaderCircle aria-hidden="true" className="size-6 animate-spin text-indigo-400" />
                    <span className="text-base font-medium">Loading tasks</span>
                </div>
            </main>
        )
    }

    if (error) {
        return <p>Could not check your session</p>
    }
    if (!user) {
        return (
            <Navigate
             to="/login"
             replace
             state={{from:location}}
            />
        )
    }
  return <Outlet/>
}
