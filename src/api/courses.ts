import api from "./client";

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export const loginUser = async (
  data: LoginData
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login/",
    data
  );

  localStorage.setItem(
    "access_token",
    response.data.access
  );

  localStorage.setItem(
    "refresh_token",
    response.data.refresh
  );

  return response.data;
};

export const registerUser = async (
  data: RegisterData
) => {
  const response = await api.post(
    "/auth/register/",
    data
  );

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  window.location.href = "/login";
};