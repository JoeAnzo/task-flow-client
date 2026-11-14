import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Clock3 } from "lucide-react"
import { getUsersTodos } from "./services/todos.service"
import { useAuth } from "../../features/auth/context/AuthContext"
import AppNav from "./components/AppNav"
import TodoItem from "./components/TodoItem"
import AddTodoForm from "./components/AddTodoForm"

export default function Home() {
  const { user } = useAuth()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timerId)
  }, [])

  const {
    data:todos,
    isPending,
    error,
  } = useQuery({
    queryKey:["todos"],
    queryFn:getUsersTodos
  })

  const completedCount = todos?.filter((todo) => todo.completed).length ?? 0
  const remainingCount = (todos?.length ?? 0) - completedCount
  const day = now.getDate()
  const daySuffix = day % 100 >= 11 && day % 100 <= 13
    ? "th"
    : ({1:"st", 2:"nd", 3:"rd"} as Record<number, string>)[day % 10] ?? "th"
  const today = `${new Intl.DateTimeFormat("en", {weekday:"long"}).format(now)}, ${day}${daySuffix}`
  const currentTime = new Intl.DateTimeFormat("en", {
    hour:"numeric",
    minute:"2-digit",
    second:"2-digit",
    hour12:true,
  }).format(now)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppNav/>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="mb-3 text-sm text-slate-400">
              Welcome back, <span className="font-medium text-slate-100">{user?.username ?? "there"}</span>
            </p>
            <p className="mb-3 text-sm font-semibold tracking-wide text-indigo-400">YOUR WORKSPACE</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{today}</h1>
            <p className="mt-2 text-slate-400">One step at a time. You’ve got this.</p>
          </div>
          <div aria-label={`Current time ${currentTime}`} className="mt-1 flex shrink-0 items-center gap-2 text-sm font-medium tabular-nums text-slate-300 sm:text-base">
            <Clock3 aria-hidden="true" className="size-5 text-indigo-400" />
            <time>{currentTime}</time>
          </div>
        </header>

        <section aria-label="Todo summary" className="mb-8 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-slate-900 p-4 sm:p-5">
            <p className="text-sm text-slate-400">To do</p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {isPending
                ? <span aria-hidden="true" className="mt-2 block h-7 w-10 animate-pulse rounded bg-slate-800" />
                : remainingCount}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900 p-4 sm:p-5">
            <p className="text-sm text-slate-400">Completed</p>
            <p className="mt-1 text-2xl font-semibold text-indigo-300">
              {isPending
                ? <span aria-hidden="true" className="mt-2 block h-7 w-10 animate-pulse rounded bg-slate-800" />
                : completedCount}
            </p>
          </div>
        </section>

        <AddTodoForm />

        <section aria-labelledby="tasks-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold" id="tasks-heading">Tasks</h2>
            {!isPending && !error && (
              <span className="text-sm text-slate-500">{todos?.length ?? 0} total</span>
            )}
          </div>

          {isPending && (
            <ul aria-label="Loading todos" aria-busy="true" className="space-y-3" role="status">
              {[0, 1, 2].map((skeleton) => (
                <li
                  aria-hidden="true"
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-900/80 p-4 sm:px-5"
                  key={skeleton}
                >
                  <span className="size-6 shrink-0 animate-pulse rounded-full bg-slate-800" />
                  <span className="min-w-0 flex-1">
                    <span className="block h-4 w-2/3 animate-pulse rounded bg-slate-800" />
                    <span className="mt-2 block h-3 w-1/4 animate-pulse rounded bg-slate-800/80" />
                  </span>
                </li>
              ))}
              <li className="sr-only">Loading your todos…</li>
            </ul>
          )}

          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300" role="alert">
              Could not load your todos. Please refresh and try again.
            </p>
          )}

          {!isPending && !error && todos?.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-12 text-center">
              <p className="font-medium text-slate-200">Nothing on your list yet</p>
              <p className="mt-2 text-sm text-slate-500">When you have todos, they’ll show up here.</p>
            </div>
          )}

          {!isPending && !error && !!todos?.length && (
            <ul className="space-y-3">
              {todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
