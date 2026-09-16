import api from "./client";

export const getMyProgress = async () => {
  const response = await api.get("/progress/");
  return response.data;
};

export const getDailyContribution = async () => {
  const response = await api.get(
    "/progress/daily-contribution/"
  );

  return response.data;
};