import axios from "axios"

const frontendHostname = window.location.hostname || "127.0.0.1"
const isLocal =
  ["localhost", "127.0.0.1", "::1", ""].includes(frontendHostname) ||
  frontendHostname.startsWith("192.168.") ||
  frontendHostname.startsWith("10.") ||
  frontendHostname.endsWith(".local")

const rawEnvApi = (import.meta.env.VITE_API_BASE_URL || "").trim()

let configuredApiBase: URL
try {
  // If UI is running locally but the env points to a remote domain (e.g. unresolvable or prod API),
  // route to the local Django server on port 8000 so developers/testers don't get network failures.
  if (isLocal && (!rawEnvApi || (!rawEnvApi.includes("localhost") && !rawEnvApi.includes("127.0.0.1") && !rawEnvApi.includes("192.168.")))) {
    configuredApiBase = new URL(`${window.location.protocol}//${frontendHostname}:8000/apps/skiltrix/api`)
  } else {
    configuredApiBase = new URL(
      rawEnvApi || `${window.location.protocol}//${frontendHostname}:8000/apps/skiltrix/api`,
    )
  }
} catch {
  configuredApiBase = new URL(`${window.location.protocol}//${frontendHostname}:8000/apps/skiltrix/api`)
}

// localhost and 127.0.0.1 are different sites to the browser. Keep local API
// requests on the same host as the UI so Django's session cookie is included.
if (
  ["localhost", "127.0.0.1"].includes(frontendHostname) &&
  ["localhost", "127.0.0.1"].includes(configuredApiBase.hostname)
) {
  configuredApiBase.hostname = frontendHostname
}

export const API_BASE_URL = configuredApiBase.toString().replace(/\/$/, "")
export const API_ORIGIN = new URL(API_BASE_URL).origin

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
})

// The user ID is display state only. API access always requires the signed token.
// Keep it in localStorage so a signed-in session works in every app tab; migrate
// tokens created by earlier builds from their per-tab sessionStorage location.
const ACCESS_TOKEN_KEY = "skiltrix_access_token"

const getAccessToken = () => {
  const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (storedToken) return storedToken

  const legacyToken = sessionStorage.getItem(ACCESS_TOKEN_KEY)
  if (legacyToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, legacyToken)
    return legacyToken
  }
  return null
}

api.interceptors.request.use(
  async (config) => {
    const method = (config.method || "get").toLowerCase()
    const accessToken = getAccessToken()
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
    if (!["get", "head", "options", "trace"].includes(method)) {
      // Fetch a fresh token for each write. Login rotates Django's CSRF secret,
      // and the browser may not expose the API host's cookie to the UI origin.
      const response = await axios.get(`${API_BASE_URL}/csrf/`, { withCredentials: true })
      config.headers["X-CSRFToken"] = response.data.csrfToken
    }
    return config
  },

  (error) => {
    return Promise.reject(error)
  },
)

// Handle expired JWT

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

export function getApiErrorMessage(err: any, fallbackMessage = "An unexpected error occurred"): string {
  if (!err) return fallbackMessage
  const data = err.response?.data
  if (typeof data === "string" && data.trim()) {
    if (data.startsWith("<")) {
      return err.message || fallbackMessage
    }
    return data.trim()
  }
  if (data && typeof data === "object") {
    if (typeof data.detail === "string" && data.detail.trim()) {
      return data.detail.trim()
    }
    if (typeof data.error === "string" && data.error.trim()) {
      return data.error.trim()
    }
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message.trim()
    }
    for (const key of Object.keys(data)) {
      const val = data[key]
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
        return val[0]
      }
      if (typeof val === "string" && val.trim()) {
        return val.trim()
      }
    }
  }
  if (err.message && typeof err.message === "string" && err.message.trim()) {
    return err.message.trim()
  }
  return fallbackMessage
}

export default api

