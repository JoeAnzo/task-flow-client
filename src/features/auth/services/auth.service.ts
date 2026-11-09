import axios from "axios";
import { type signUpInput } from "../schemas/auth.schema";
import { type loginInput } from "../schemas/auth.schema";
import { apiClient } from "../../../shared/lib/axios";
import { getCsrfToken } from "../../../shared/lib/csrf";

export type User = {
    id:number;
    username:string;
    email:string;
}

export async function getCurrentUser():Promise<User | null>{
    try {
        const {data} = await apiClient.get<User>('/api/v1/auth/user/')
        return data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status == 401){
            return null;
        }
        throw error
}
}


async function postWithCsrf(
    url:string,
    payload:unknown = {}
):Promise<void>{
    const csrfToken = await getCsrfToken();

    await apiClient.post(url,payload,{
        headers:{
            "X-CSRFToken":csrfToken
        }
    })
}




export async function loginUser(credentials:loginInput):Promise<void>{
    await postWithCsrf("/api/v1/auth/login/",{
        email:credentials.email,
        password:credentials.password,
    })
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