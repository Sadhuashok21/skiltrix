import api from "./client";

export const getVideos = async () => {
  const response = await api.get("/videos/");
  return response.data;
};

export const getVideo = async (id: number) => {
  const response = await api.get(`/videos/${id}/`);
  return response.data;
};

export const likeVideo = async (id: number) => {
  const response = await api.post(
    `/videos/${id}/like/`
  );

  return response.data;
};

export const commentVideo = async (
  id: number,
  text: string
) => {
  const response = await api.post(
    `/videos/${id}/comments/`,
    {
      text,
    }
  );

  return response.data;
};