import api from "./client"

export const getMyProgress = async () => {
  const userId = localStorage.getItem("user_id")
  if (!userId) return null
  const response = await api.get("/actions/progress/", { params: { user_id: userId } })
  return response.data
}

export const getDailyContribution = async () => {
  const userId = localStorage.getItem("user_id")
  if (!userId) return []
  const response = await api.get("/activity/", { params: { user_id: userId } })
  return response.data
}
