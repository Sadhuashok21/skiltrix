import api from "./client";

export const getCompanies = async () => {
  const response = await api.get("/internships/companies/");
  return response.data;
};

export const getCompany = async (slug: string) => {
  const response = await api.get(
    `/internships/companies/${slug}/`
  );

  return response.data;
};

export const getInternshipPrograms = async () => {
  const response = await api.get(
    "/internships/programs/"
  );

  return response.data;
};

export const getInternshipProgress = async () => {
  const response = await api.get(
    "/internships/progress/"
  );

  return response.data;
};