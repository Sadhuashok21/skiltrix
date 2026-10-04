import api from "./client"

export const getMyProfile = async () => {
  const userId = localStorage.getItem("user_id")
  if (!userId) return null
  const response = await api.get("/profiles/", { params: { user_id: userId } })
  return Array.isArray(response.data) ? response.data[0] ?? null : response.data
}

export const updateProfile = async (data: { bio: string; name: string }) => {
  const userId = localStorage.getItem("user_id")
  if (!userId) throw new Error("Sign in before updating your profile.")
  const response = await api.patch(`/profiles/${encodeURIComponent(userId)}/`, data)
  return response.data
}
