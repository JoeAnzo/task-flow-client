import { useState, type FormEvent } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import DatePicker from "react-datepicker"
import { Check, LoaderCircle, Pencil, Save, Trash2, X } from "lucide-react"
import { deleteTodo, updateTodoCompletion, updateTodoDetails } from "../services/todos.service"
import type { todoItem } from "../interfaces/home.interfaces"

type TodoItemProps = {
  todo:todoItem;
}

export default function TodoItem({todo}:TodoItemProps) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(todo.title)
  const [editedDueAt, setEditedDueAt] = useState<Date | null>(() => new Date(todo.due_at))

  const completionMutation = useMutation({
    mutationFn: ({id, completed}:{id:number; completed:boolean}) =>
      updateTodoCompletion(id, completed),
    onMutate: async ({id, completed}) => {
      await queryClient.cancelQueries({queryKey:["todos"]})

      const previousCompleted = queryClient
        .getQueryData<todoItem[]>(["todos"])
        ?.find((currentTodo) => currentTodo.id === id)?.completed

      queryClient.setQueryData<todoItem[]>(["todos"], (currentTodos) =>
        currentTodos?.map((currentTodo) =>
          currentTodo.id === id
            ? {...currentTodo, completed}
            : currentTodo,
        ),
      )

      return {previousCompleted}
    },
    onError: (_error, variables, context) => {
      const previousCompleted = context?.previousCompleted
      if (previousCompleted !== undefined) {
        queryClient.setQueryData<todoItem[]>(["todos"], (currentTodos) =>
          currentTodos?.map((currentTodo) =>
            currentTodo.id === variables.id
              ? {...currentTodo, completed:previousCompleted}
              : currentTodo,
          ),
        )
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({queryKey:["todos"]})
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: async () => {
      queryClient.setQueryData<todoItem[]>(["todos"], (currentTodos) =>
        currentTodos?.filter((currentTodo) => currentTodo.id !== todo.id),
      )
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({queryKey:["todos"]})
    },
  })

  const editMutation = useMutation({
    mutationFn: (details:{title:string; due_at:string}) =>
      updateTodoDetails(todo.id, details),
    onSuccess: (updatedTodo) => {
      queryClient.setQueryData<todoItem[]>(["todos"], (currentTodos) =>
        currentTodos?.map((currentTodo) =>
          currentTodo.id === updatedTodo.id ? updatedTodo : currentTodo,
        ),
      )
      setIsEditing(false)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({queryKey:["todos"]})
    },
  })

  const nextCompleted = !todo.completed
  const isUpdating = completionMutation.isPending || deleteMutation.isPending || editMutation.isPending
  const dueAt = new Date(todo.due_at)
  const formattedDueAt = Number.isNaN(dueAt.getTime())
    ? "Due date unavailable"
    : `Due ${new Intl.DateTimeFormat("en", {
      weekday:"short",
      month:"short",
      day:"numeric",
      hour:"numeric",
      minute:"2-digit",
    }).format(dueAt)}`

  return (
    <li className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-black/10 transition hover:border-slate-700 sm:px-5">
      <button
        aria-label={todo.completed ? `Mark ${todo.title} as not completed` : `Mark ${todo.title} as completed`}
        aria-pressed={todo.completed}
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-wait disabled:opacity-60 ${
          todo.completed
            ? "border-indigo-400 bg-indigo-500 text-white"
            : "border-slate-600 text-transparent hover:border-indigo-400"
        }`}
        disabled={isUpdating}
        onClick={() => completionMutation.mutate({
          id:todo.id,
          completed:nextCompleted,
        })}
        type="button"
      >
        <Check aria-hidden="true" className="size-4" strokeWidth={3} />
      </button>

      {isEditing ? (
        <form
          className="min-w-0 flex-1 space-y-3"
          onSubmit={(event:FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            const title = editedTitle.trim()
            if (!title || !editedDueAt) return

            editMutation.mutate({
              title,
              due_at:editedDueAt.toISOString(),
            })
          }}
        >
          <label className="sr-only" htmlFor={`todo-title-${todo.id}`}>Todo title</label>
          <input
            autoFocus
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
            id={`todo-title-${todo.id}`}
            maxLength={100}
            onChange={(event) => setEditedTitle(event.target.value)}
            required
            value={editedTitle}
          />
          <label className="sr-only" htmlFor={`todo-due-at-${todo.id}`}>Todo due date and time</label>
          <DatePicker
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
            dateFormat="MMM d, yyyy h:mm aa"
            id={`todo-due-at-${todo.id}`}
            onChange={(date:Date | null) => setEditedDueAt(date)}
            popperClassName="todo-datepicker-popper"
            selected={editedDueAt}
            showTimeSelect
            timeIntervals={15}
            required
          />
          {editMutation.isError && (
            <p className="text-xs text-rose-400" role="alert">
              Could not save your changes. Please try again.
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              aria-label={`Save changes to ${todo.title}`}
              className="flex size-9 items-center justify-center rounded-lg bg-indigo-500 text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:opacity-60"
              disabled={isUpdating || !editedTitle.trim() || !editedDueAt}
              type="submit"
            >
              {editMutation.isPending
                ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                : <Save aria-hidden="true" className="size-4" />}
            </button>
            <button
              aria-label={`Cancel editing ${todo.title}`}
              className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:opacity-60"
              disabled={editMutation.isPending}
              onClick={() => {
                setEditedTitle(todo.title)
                setEditedDueAt(new Date(todo.due_at))
                setIsEditing(false)
                editMutation.reset()
              }}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        </form>
      ) : (
      <div className="min-w-0 flex-1">
        <p className={`break-words font-medium ${todo.completed ? "text-slate-500 line-through" : "text-slate-100"}`}>
          {todo.title}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {todo.completed ? "Completed" : "To do"}
        </p>
        <p className="mt-2 text-xs font-medium text-rose-400">
          {formattedDueAt}
        </p>
        {editMutation.isError && (
          <p className="mt-2 text-xs text-rose-400" role="alert">
            Could not save your changes. Please try again.
          </p>
        )}
        {completionMutation.isError && (
          <p className="mt-2 text-xs text-rose-400" role="alert">
            Could not update this task. Please try again.
          </p>
        )}
      </div>
      )}

      {deleteMutation.isError && (
        <p className="text-xs text-rose-400" role="alert">
          Could not delete this task. Please try again.
        </p>
      )}

      {isUpdating && (
        <span className="flex items-center gap-2 text-xs text-indigo-300" role="status">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          <span className="sr-only">{deleteMutation.isPending ? "Deleting task…" : "Saving task…"}</span>
        </span>
      )}

      {!isEditing && (
        <button
          aria-label={`Edit ${todo.title}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-indigo-500/10 hover:text-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isUpdating}
          onClick={() => {
            setEditedTitle(todo.title)
            setEditedDueAt(new Date(todo.due_at))
            editMutation.reset()
            setIsEditing(true)
          }}
          type="button"
        >
          <Pencil aria-hidden="true" className="size-4" />
        </button>
      )}

      <button
        aria-label={`Delete ${todo.title}`}
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isUpdating}
        onClick={() => {
          if (window.confirm(`Delete "${todo.title}"?`)) {
            deleteMutation.mutate(todo.id)
          }
        }}
        type="button"
      >
        {deleteMutation.isPending
          ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          : <Trash2 aria-hidden="true" className="size-4" />}
      </button>
    </li>
  )
}
