import api from "./client";

export const getMyProfile = async () => {
  const response = await api.get("/profile/me/");
  return response.data;
};

export const updateProfile = async (data: FormData) => {
  const response = await api.patch(
    "/profile/me/",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};