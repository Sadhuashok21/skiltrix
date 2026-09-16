import api from "./client";

export const getDiscussions = async () => {
  const response = await api.get("/community/posts/");
  return response.data;
};

export const getDiscussion = async (id: number) => {
  const response = await api.get(
    `/community/posts/${id}/`
  );

  return response.data;
};

export const createDiscussion = async (data: {
  title: string;
  content: string;
  code?: string;
  code_language?: number;
  tags?: number[];
}) => {
  const response = await api.post(
    "/community/posts/",
    data
  );

  return response.data;
};

export const likeDiscussion = async (id: number) => {
  const response = await api.post(
    `/community/posts/${id}/like/`
  );

  return response.data;
};