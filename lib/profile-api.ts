import { apiRequest } from "@/lib/api-client"

export type DataProfileType = "THU_TRUONG" | "CHIEN_SI" | "ANH_HUNG"

export interface CreateDataProfilePayload {
  profileType: DataProfileType
  fullName: string
  position?: string
  unitName?: string
  rankName?: string
  heroTitle?: string
  contactPhone?: string
  birthDate?: string
  hometown?: string
  summary?: string
  biography?: string
  achievements?: string
  avatarMediaId?: number
  isVisible?: boolean
  sortOrder?: number
}

interface MediaResponse {
  id?: number
  url?: string
}

export interface DataProfileResponse {
  id: number
  profileType: DataProfileType
  fullName: string
  position: string
  unitName: string
  rankName: string
  heroTitle: string
  contactPhone: string
  birthDate: string
  hometown: string
  summary: string
  biography: string
  achievements: string
  avatarMedia: MediaResponse | null
  isVisible: boolean
  sortOrder: number
  createdByPhone: string
  createdAt: string
  updatedAt: string
}

export async function createDataProfile(
  payload: CreateDataProfilePayload,
): Promise<DataProfileResponse> {
  const { data } = await apiRequest<DataProfileResponse>("/api/v1/admin/data-profiles", {
    method: "POST",
    body: payload,
  })

  return data
}
