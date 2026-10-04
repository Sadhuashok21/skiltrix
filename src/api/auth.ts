import axios from "axios"
import { API_ORIGIN } from "./client"

const authApi = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

export const getGlobalSignInUrl = (returnTo?: string) => {
  let target = returnTo || (window.location.pathname + window.location.search + window.location.hash)
  let safeReturnTo = "/"
  try {
    if (target.startsWith("/") && !target.startsWith("//") && !target.includes("\\")) {
      safeReturnTo = target
    } else {
      const parsed = new URL(target, window.location.origin)
      if (parsed.origin === window.location.origin) {
        safeReturnTo = parsed.pathname + parsed.search + parsed.hash
      }
    }
  } catch {
    safeReturnTo = "/"
  }
  const signInUrl = new URL("/login", window.location.origin)
  signInUrl.searchParams.set("returnTo", safeReturnTo)
  return signInUrl.toString()
}

export const logoutUser = () => {
  const csrfToken = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("csrftoken="))?.split("=").slice(1).join("=")
  const signout = authApi.post("/apps/skiltrix/api/actions/logout/", {}, {
    headers: csrfToken ? { "X-CSRFToken": decodeURIComponent(csrfToken) } : undefined,
  })
  localStorage.removeItem("user_id")
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("skiltrix_access_token")
  sessionStorage.removeItem("skiltrix_access_token")
  return signout.catch(() => undefined).finally(() => { window.location.href = "/" })
}
