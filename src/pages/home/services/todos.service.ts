import { apiClient } from "../../../shared/lib/axios"
import { getCsrfHeaders } from "../../../shared/lib/csrf"
import { type todoItem } from "../interfaces/home.interfaces"

export const getUsersTodos = async () => {
    const {data} = await apiClient.get<todoItem[]>("/api/v1/todos/")
    return data;
}

export type NewTodo = {
    title:string;
    due_at:string;
}

export const createTodo = async (todo:NewTodo):Promise<todoItem> => {
    const headers = await getCsrfHeaders()
    const {data} = await apiClient.post<todoItem>("/api/v1/todos/", todo, {headers})
    return data;
}

export const updateTodoCompletion = async (
    id:number,
    completed:boolean,
):Promise<todoItem> => {
    const headers = await getCsrfHeaders()
    const {data} = await apiClient.patch<todoItem>(`/api/v1/todos/${id}/`, {
        completed,
    }, {headers})
    return data;
}

export type TodoDetailsUpdate = {
    title:string;
    due_at:string;
}

export const updateTodoDetails = async (
    id:number,
    details:TodoDetailsUpdate,
):Promise<todoItem> => {
    const headers = await getCsrfHeaders()
    const {data} = await apiClient.patch<todoItem>(`/api/v1/todos/${id}/`, details, {headers})
    return data;
}

export const deleteTodo = async (id:number):Promise<void> => {
    const headers = await getCsrfHeaders()
    await apiClient.delete(`/api/v1/todos/${id}/`, {headers})
}