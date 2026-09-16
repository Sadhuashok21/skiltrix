import api from "./client";

export const getProblems = async () => {
  const response = await api.get("/practice/problems/");
  return response.data;
};

export const getProblem = async (slug: string) => {
  const response = await api.get(
    `/practice/problems/${slug}/`
  );

  return response.data;
};

export const submitProblem = async (data: {
  problem: number;
  language: number;
  code: string;
}) => {
  const response = await api.post(
    "/practice/submissions/",
    data
  );

  return response.data;
};