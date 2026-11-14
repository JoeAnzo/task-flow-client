import axios from "axios";
import { type signUpInput } from "../schemas/auth.schema";
import { type loginInput } from "../schemas/auth.schema";
import { apiClient } from "../../../shared/lib/axios";
import { getCsrfToken } from "../../../shared/lib/csrf";

export type User = {
    id:number;
    username:string;
    email:string;
    google_display_name:string | null;
}

function normalizeUser(value:unknown):User | null {
    if (!value || typeof value !== "object") {
        return null;
    }

    const user = value as Record<string, unknown>;
    const id = typeof user.id === "number" ? user.id : user.pk;
    if (
        typeof id !== "number"
        || typeof user.username !== "string"
        || typeof user.email !== "string"
    ) {
        return null;
    }

    return {
        id,
        username:user.username,
        email:user.email,
        google_display_name:typeof user.google_display_name === "string"
            ? user.google_display_name
            : null,
    };
}

export async function getCurrentUser():Promise<User | null>{
    try {
        const {data} = await apiClient.get<unknown>('/api/v1/auth/user/')
        return normalizeUser(data);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status == 401){
            return null;
        }
        throw error
}
}


async function postWithCsrf(
    url:string,
    payload:unknown = {},
):Promise<unknown>{
    const csrfToken = await getCsrfToken();

    const {data} = await apiClient.post<unknown>(url,payload,{
        headers:{
            "X-CSRFToken":csrfToken
        }
    })
    return data
}




export async function loginUser(credentials:loginInput):Promise<void>{
    await postWithCsrf("/api/v1/auth/login/",{
        email:credentials.email,
        password:credentials.password,
    })
}

export async function loginWithGoogle(code:string):Promise<User>{
    const response = await postWithCsrf("/api/v1/auth/google/",{code})
    const responseUser = normalizeUser(response)
        ?? (
            response && typeof response === "object"
                ? normalizeUser((response as Record<string, unknown>).user)
                : null
        )
    if (responseUser) {
        return responseUser
    }

    const currentUser = await getCurrentUser()
    if (!currentUser) {
        throw new Error("Google login succeeded, but the server returned no user.")
    }
    return currentUser
}

export async function registerUser(credentials:signUpInput):Promise<void> {
    await postWithCsrf("/api/v1/auth/registration/",{
        username:credentials.username,
        email:credentials.email,
        password1:credentials.password,
        password2:credentials.confirmPassword,
    })
}

export async function refreshToken():Promise<void>{
    await postWithCsrf("/api/v1/auth/token/refresh/");
}

export async function logoutUser():Promise<void> {
  await postWithCsrf("/api/v1/auth/logout/");  
}