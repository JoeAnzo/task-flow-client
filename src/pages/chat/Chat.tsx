import { useEffect, useRef, useState, type FormEvent } from "react"
import axios from "axios"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowUp, Bot, CalendarClock, ListChecks, Sparkles } from "lucide-react"
import { useAuth } from "../../features/auth/context/AuthContext"
import AppNav from "../home/components/AppNav"
import { sendChatMessage } from "./services/chat.service"

type ChatMessage = {
  id: number
  role: "assistant" | "user"
  content: string
  confirmationToken?: string
  confirmationRequest?: string
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data
    if (data && typeof data === "object" && "detail" in data && typeof data.detail === "string") {
      return data.detail
    }
    if (data && typeof data === "object") {
      return Object.values(data)
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .filter((value): value is string => typeof value === "string")
        .join(" ")
    }
  }
  return "I couldn't reach the chat service. Please try again."
}

function getResponseText(
  reply: string,
  todos?: { title: string; completed: boolean; due_at: string }[],
): string {
  if (!todos?.length) return reply
  const taskLines = todos.map((todo) => {
    const dueAt = new Date(todo.due_at).toLocaleString()
    return `• ${todo.completed ? "Completed" : "Pending"}: ${todo.title} (due ${dueAt})`
  })
  return `${reply}\n${taskLines.join("\n")}`
}

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  if (hour < 21) return "Good evening"
  return "Good night"
}

export default function Chat() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sending, setSending] = useState(false)
  const messageId = useRef(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const displayName = user?.google_display_name?.trim() || user?.username || "there"
  const greeting = getGreeting(new Date().getHours())

  useEffect(() => {
    setMessages([
      {
        id: 0,
        role: "assistant",
        content: `${greeting}, ${displayName}! Plan your tasks here. What would you like to organize today?`,
      },
    ])
  }, [displayName, greeting])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(
    content: string,
    confirmationToken?: string,
    requestMessage = content,
  ) {
    const text = content.trim()
    if (!text || sending) return

    setMessages((current) => [
      ...current,
      { id: messageId.current++, role: "user", content: text },
    ])
    setSending(true)

    try {
      const response = await sendChatMessage(requestMessage, confirmationToken)
      setMessages((current) => [
        ...current,
        {
          id: messageId.current++,
          role: "assistant",
          content: getResponseText(response.reply, response.todos),
          confirmationToken: response.confirmation_required
            ? response.confirmation_token
            : undefined,
          confirmationRequest: response.confirmation_required ? requestMessage : undefined,
        },
      ])
      if (["create_todo", "complete_todo", "update_todo", "delete_todo"].includes(response.intent.intent)) {
        await queryClient.invalidateQueries({ queryKey: ["todos"] })
      }
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: messageId.current++,
          role: "assistant",
          content: getErrorMessage(error),
        },
      ])
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(draft)
    setDraft("")
  }

  const quickPrompts = ["Plan my day", "What should I prioritize?", "Show my task summary"]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppNav />
      <main className="mx-auto flex h-[calc(100vh-73px)] w-full max-w-4xl flex-col px-4 py-6 sm:px-8 sm:py-8">
        <header className="mb-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
              <Sparkles aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Task planning assistant</h1>
              <p className="mt-1 text-sm text-slate-400">{greeting}, {displayName} — Plan your tasks here</p>
            </div>
          </div>
        </header>

        <section
          aria-label="Chat conversation"
          aria-live="polite"
          className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-slate-900/60"
        >
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  key={message.id}
                >
                  {message.role === "assistant" && (
                    <span className="mr-2 mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300">
                      <Bot aria-hidden="true" className="size-4" />
                    </span>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "rounded-br-md bg-indigo-500 text-white"
                        : "rounded-bl-md border border-white/10 bg-slate-950 text-slate-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.confirmationToken && message.confirmationRequest && (
                      <button
                        className="mt-3 rounded-lg bg-rose-500/15 px-3 py-2 font-medium text-rose-200 transition hover:bg-rose-500/25 disabled:opacity-50"
                        disabled={sending}
                        onClick={() => void sendMessage(
                          "Yes, confirm deletion",
                          message.confirmationToken,
                          message.confirmationRequest,
                        )}
                        type="button"
                      >
                        Confirm deletion
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <p className="text-sm text-slate-400" role="status">Thinking…</p>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {messages.length === 1 && (
            <div className="grid gap-2 px-4 pb-3 sm:grid-cols-3 sm:px-6">
              {quickPrompts.map((prompt) => (
                <button
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-left text-xs text-slate-300 transition hover:border-indigo-400/50 hover:text-indigo-200 disabled:opacity-50"
                  disabled={sending}
                  key={prompt}
                  onClick={() => void sendMessage(prompt)}
                  type="button"
                >
                  {prompt.includes("prioritize")
                    ? <ListChecks aria-hidden="true" className="size-4 shrink-0 text-indigo-400" />
                    : prompt.includes("day")
                      ? <CalendarClock aria-hidden="true" className="size-4 shrink-0 text-indigo-400" />
                      : <Bot aria-hidden="true" className="size-4 shrink-0 text-indigo-400" />}
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form className="border-t border-white/10 p-3 sm:p-4" onSubmit={handleSubmit}>
            <div className="flex items-end gap-2 rounded-xl border border-slate-700 bg-slate-950 p-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/20">
              <textarea
                aria-label="Message"
                className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                disabled={sending}
                maxLength={1000}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    void sendMessage(draft)
                    setDraft("")
                  }
                }}
                placeholder="Ask about your tasks…"
                rows={1}
                value={draft}
              />
              <button
                aria-label="Send message"
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!draft.trim() || sending}
                type="submit"
              >
                <ArrowUp aria-hidden="true" className="size-5" />
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
