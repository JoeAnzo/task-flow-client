import { useState, type FormEvent } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import DatePicker from "react-datepicker"
import { LoaderCircle, Plus } from "lucide-react"
import { createTodo } from "../services/todos.service"

export default function AddTodoForm() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState("")
  const [dueAt, setDueAt] = useState<Date | null>(null)

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: async () => {
      setTitle("")
      setDueAt(null)
      await queryClient.invalidateQueries({queryKey:["todos"]})
    },
  })

  function handleSubmit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle || !dueAt) return

    createMutation.mutate({
      title:trimmedTitle,
      due_at:dueAt.toISOString(),
    })
  }

  return (
    <form
      className="mb-8 space-y-4 rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-xl shadow-black/10 sm:p-5"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="todo-title">
          New task
        </label>
        <input
          autoComplete="off"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
          id="todo-title"
          maxLength={100}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What do you need to do?"
          required
          value={title}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="todo-due-at">
          Due date and time
        </label>
        <DatePicker
          autoComplete="off"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
          dateFormat="MMM d, yyyy h:mm aa"
          id="todo-due-at"
          onChange={(date:Date | null) => setDueAt(date)}
          placeholderText="Choose a due date and time"
          popperClassName="todo-datepicker-popper"
          selected={dueAt}
          showTimeSelect
          timeIntervals={15}
          required
        />
      </div>

      {createMutation.isError && (
        <p className="text-sm text-rose-400" role="alert">
          Could not add this task. Please check the details and try again.
        </p>
      )}

      <button
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        disabled={createMutation.isPending || !title.trim() || !dueAt}
        type="submit"
      >
        {createMutation.isPending ? (
          <>
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Adding task…
          </>
        ) : (
          <>
            <Plus aria-hidden="true" className="size-4" />
            Add task
          </>
        )}
      </button>
    </form>
  )
}
