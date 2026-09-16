import api from "./client";

export const getQuizzes = async () => {
  const response = await api.get("/quizzes/");
  return response.data;
};

export const getQuiz = async (id: number) => {
  const response = await api.get(
    `/quizzes/${id}/`
  );

  return response.data;
};

export const submitQuiz = async (
  quizId: number,
  answers: {
    question: number;
    selected_option: number;
  }[]
) => {
  const response = await api.post(
    `/quizzes/${quizId}/submit/`,
    {
      answers,
    }
  );

  return response.data;
};