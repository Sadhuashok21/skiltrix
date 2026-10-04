import api from "./client"
import { asList, asRecord } from "./data"

export interface ApiCompany {
  company_id: string
  name: string
  image: string
  description: string
  roadmaps: { roadmap_id: string; step_number: number; title: string; description: string; category: string }[]
}

export interface ApiInternship {
  internship_id: string
  name: string
  company?: ApiCompany
  company_name?: string
  company_image?: string
  is_paid: boolean
  type: string
  location: string
  deadline: string
  price: number
  apply_link?: string
}

export const getCompanies = async () => {
  const { data } = await api.get("/companies/")
  return asList<ApiCompany>(data, "companies")
}

export const getCompany = async (id: string) => {
  const { data } = await api.get(`/companies/${encodeURIComponent(id)}/`)
  return asRecord<ApiCompany>(data, "company")
}

export const getInternshipPrograms = async () => {
  const { data } = await api.get("/internships/")
  return asList<ApiInternship>(data, "internships")
}

export const applyToInternship = async (data: {
  user_id: string
  internship_id: string
  resume_id?: string
  cover_letter?: string
  portfolio_url?: string
}) => {
  const response = await api.post("/actions/apply-internship/", data)
  return response.data
}
