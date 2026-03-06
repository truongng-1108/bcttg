import { apiRequest } from "@/lib/api-client"

interface PaginationMeta {
  page?: number
  page_size?: number
  total_elements?: number
  total_pages?: number
}

interface AdminUserProfileDto {
  id?: number | string
  fullName?: string
  position?: string
  unitName?: string
  rankName?: string
  email?: string
  address?: string
  birthDate?: string
}

interface AdminUserDto {
  id?: number | string
  phone?: string
  role?: string
  isActive?: boolean
  profile?: AdminUserProfileDto | null
  createdAt?: string
  updatedAt?: string
}

interface AdminUserContainer {
  items?: AdminUserDto[]
  users?: AdminUserDto[]
  content?: AdminUserDto[]
}

type AdminUserData = AdminUserDto[] | AdminUserContainer | null

export type AdminUserRole = "ADMIN" | "MANAGER" | "USER"
export type AdminAccountStatus = "active" | "inactive"

export interface AdminAccountItem {
  id: string
  rank: string
  fullName: string
  username: string
  phone: string
  unit: string
  role: string
  roleValue: AdminUserRole
  status: AdminAccountStatus
  lastLogin: string
  createdAt: string
}

export interface AdminAccountListParams {
  page: number
  pageSize: number
  search?: string
  sort?: string
  order?: "asc" | "desc"
  role?: AdminUserRole
  isActive?: boolean
}

export interface AdminAccountListResult {
  items: AdminAccountItem[]
  page: number
  pageSize: number
  totalElements: number
  totalPages: number
}

export interface AdminUserProfilePayload {
  fullName: string
  position?: string
  unitName?: string
  rankName?: string
  email?: string
  address?: string
  birthDate?: string
}

export interface CreateAdminUserPayload {
  phone: string
  password: string
  role: AdminUserRole
  isActive: boolean
  profile: AdminUserProfilePayload
}

export interface UpdateAdminUserPayload {
  phone: string
  role: AdminUserRole
  isActive: boolean
  profile: AdminUserProfilePayload
}

export interface AdminUserDetail {
  id: string
  phone: string
  role: AdminUserRole
  isActive: boolean
  profile: {
    fullName: string
    position: string
    unitName: string
    rankName: string
    email: string
    address: string
    birthDate: string
  }
  createdAt: string
  updatedAt: string
}

const USERS_LIST_PATH = "/api/v1/admin/users"
const USERS_DETAIL_TEMPLATE = "/api/v1/admin/users/{id}"
const USERS_ACTIVE_TEMPLATE = "/api/v1/admin/users/{id}/active"
const USERS_ROLE_TEMPLATE = "/api/v1/admin/users/{id}/role"
const USERS_RESET_PASSWORD_TEMPLATE = "/api/v1/admin/users/{id}/reset-password"

const roleLabelMap: Record<AdminUserRole, string> = {
  ADMIN: "Quản trị viên",
  MANAGER: "Quản lý",
  USER: "Người dùng",
}

function resolvePathTemplate(template: string, id: string): string {
  return template.replace("{id}", id).replace(":id", id)
}

function toNumber(value: number | string | undefined, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  const parsed = Number(value)
  if (Number.isFinite(parsed)) {
    return parsed
  }

  return fallback
}

function toText(value: string | undefined, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function toDateTimeLabel(value: string | undefined): string {
  if (!value || !value.trim()) {
    return "-"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function normalizeRole(role: string | undefined): AdminUserRole {
  const raw = toText(role).toUpperCase()
  if (raw === "ADMIN") {
    return "ADMIN"
  }
  if (raw === "MANAGER") {
    return "MANAGER"
  }
  return "USER"
}

function normalizeAccountStatus(isActive: boolean): AdminAccountStatus {
  return isActive ? "active" : "inactive"
}

function readItems(data: AdminUserData): AdminUserDto[] {
  if (Array.isArray(data)) {
    return data
  }

  if (!data) {
    return []
  }

  if (Array.isArray(data.items)) {
    return data.items
  }
  if (Array.isArray(data.users)) {
    return data.users
  }
  if (Array.isArray(data.content)) {
    return data.content
  }

  return []
}

function normalizePagination(
  meta: PaginationMeta | null,
  fallbackPage: number,
  fallbackPageSize: number,
  itemCount: number,
): {
  page: number
  pageSize: number
  totalElements: number
  totalPages: number
} {
  const page = toNumber(meta?.page, fallbackPage)
  const pageSize = toNumber(meta?.page_size, fallbackPageSize)
  const totalElements = toNumber(meta?.total_elements, itemCount)
  const totalPages = Math.max(
    1,
    toNumber(meta?.total_pages, Math.ceil(totalElements / Math.max(pageSize, 1))),
  )

  return {
    page,
    pageSize,
    totalElements,
    totalPages,
  }
}

function normalizeDetail(data: AdminUserDto): AdminUserDetail {
  const role = normalizeRole(data.role)
  const profile = data.profile

  return {
    id: data.id !== undefined ? String(data.id) : "",
    phone: toText(data.phone),
    role,
    isActive: Boolean(data.isActive),
    profile: {
      fullName: toText(profile?.fullName),
      position: toText(profile?.position),
      unitName: toText(profile?.unitName),
      rankName: toText(profile?.rankName),
      email: toText(profile?.email),
      address: toText(profile?.address),
      birthDate: toText(profile?.birthDate),
    },
    createdAt: toDateTimeLabel(data.createdAt),
    updatedAt: toDateTimeLabel(data.updatedAt),
  }
}

export async function getAdminAccounts(
  params: AdminAccountListParams,
): Promise<AdminAccountListResult> {
  const { data, meta } = await apiRequest<AdminUserData>(USERS_LIST_PATH, {
    query: {
      page: params.page,
      page_size: params.pageSize,
      q: params.search,
      sort: params.sort,
      order: params.order,
      role: params.role,
      is_active: params.isActive,
    },
  })

  const items = readItems(data).map((item) => {
    const roleValue = normalizeRole(item.role)
    const profile = item.profile
    const phone = toText(item.phone, "-")
    const isActive = Boolean(item.isActive)

    return {
      id: item.id !== undefined ? String(item.id) : "",
      rank: toText(profile?.rankName, "-"),
      fullName: toText(profile?.fullName, "(Chưa có họ tên)"),
      username: phone,
      phone,
      unit: toText(profile?.unitName, "-"),
      role: roleLabelMap[roleValue],
      roleValue,
      status: normalizeAccountStatus(isActive),
      lastLogin: "-",
      createdAt: toDateTimeLabel(item.createdAt),
    }
  })

  const paginationMeta = meta && typeof meta === "object" ? (meta as PaginationMeta) : null
  const pagination = normalizePagination(paginationMeta, params.page, params.pageSize, items.length)

  return {
    items,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalElements: pagination.totalElements,
    totalPages: pagination.totalPages,
  }
}

export async function getAdminAccountById(id: string): Promise<AdminUserDetail> {
  const path = resolvePathTemplate(USERS_DETAIL_TEMPLATE, id)
  const { data } = await apiRequest<AdminUserDto>(path)

  return normalizeDetail(data)
}

export async function createAdminAccount(payload: CreateAdminUserPayload): Promise<AdminUserDetail> {
  const { data } = await apiRequest<AdminUserDto>(USERS_LIST_PATH, {
    method: "POST",
    body: payload,
  })

  return normalizeDetail(data)
}

export async function updateAdminAccount(
  id: string,
  payload: UpdateAdminUserPayload,
): Promise<AdminUserDetail> {
  const path = resolvePathTemplate(USERS_DETAIL_TEMPLATE, id)
  const { data } = await apiRequest<AdminUserDto>(path, {
    method: "PUT",
    body: payload,
  })

  return normalizeDetail(data)
}

export async function patchAdminAccountActive(id: string, value: boolean): Promise<AdminUserDetail> {
  const path = resolvePathTemplate(USERS_ACTIVE_TEMPLATE, id)
  const { data } = await apiRequest<AdminUserDto>(path, {
    method: "PATCH",
    body: { value },
  })

  return normalizeDetail(data)
}

export async function patchAdminAccountRole(
  id: string,
  role: AdminUserRole,
): Promise<AdminUserDetail> {
  const path = resolvePathTemplate(USERS_ROLE_TEMPLATE, id)
  const { data } = await apiRequest<AdminUserDto>(path, {
    method: "PATCH",
    body: { role },
  })

  return normalizeDetail(data)
}

export async function resetAdminAccountPassword(id: string, newPassword: string): Promise<void> {
  const path = resolvePathTemplate(USERS_RESET_PASSWORD_TEMPLATE, id)
  await apiRequest<null>(path, {
    method: "PATCH",
    body: { newPassword },
  })
}

export async function deleteAdminAccount(id: string): Promise<void> {
  const path = resolvePathTemplate(USERS_DETAIL_TEMPLATE, id)
  await apiRequest<null>(path, {
    method: "DELETE",
  })
}
