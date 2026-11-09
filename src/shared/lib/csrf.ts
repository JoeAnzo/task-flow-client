import { apiClient } from "./axios"

type CsrfResponse = {
  csrfToken:string;
}

export async function getCsrfToken():Promise<string> {
  const {data} = await apiClient.get<CsrfResponse>("/api/v1/auth/csrf/")
  if (typeof data.csrfToken !== "string" || data.csrfToken.length === 0) {
    throw new Error("The server did not return a CSRF token.")
  }
  return data.csrfToken
}

export async function getCsrfHeaders():Promise<Record<string, string>> {
  return {"X-CSRFToken":await getCsrfToken()}
}
