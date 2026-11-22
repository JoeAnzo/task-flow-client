import { apiClient } from "../../../shared/lib/axios"
import { getCsrfHeaders } from "../../../shared/lib/csrf"

export type ChatIntentName =
  | "create_todo"
  | "list_todos"
  | "complete_todo"
  | "update_todo"
  | "delete_todo"
  | "clarify"
  | "unknown"

export type ChatTodo = {
  id: number
  title: string
  completed: boolean
  due_at: string
}

export type ChatResponse = {
  intent: {
    intent: ChatIntentName
  }
  reply: string
  todos?: ChatTodo[]
  confirmation_required?: boolean
  confirmation_token?: string
}

export async function sendChatMessage(
  message: string,
  confirmationToken?: string,
): Promise<ChatResponse> {
  const headers = await getCsrfHeaders()
  const { data } = await apiClient.post<ChatResponse>(
    "/api/v1/chat/",
    {
      message,
      ...(confirmationToken ? { confirmation_token: confirmationToken } : {}),
    },
    { headers },
  )

  return data
}
