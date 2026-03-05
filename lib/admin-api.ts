import { apiRequest } from "@/lib/api-client"

interface PaginationMeta {
  page?: number
  page_size?: number
  total_elements?: number
  total_pages?: number
}

interface DashboardPointDto {
  label?: string
  value?: number
}

interface DashboardSummaryDto {
  totalPosts?: number
  totalProfiles?: number
  totalSongs?: number
  totalAccounts?: number
  viewsToday?: number
  editsToday?: number
}

interface DashboardOverviewDto {
  summary?: DashboardSummaryDto
  monthlyContent?: DashboardPointDto[]
  contentDistribution?: DashboardPointDto[]
  weeklyVisits?: DashboardPointDto[]
  recentActivities?: unknown[]
  systemStatuses?: unknown[]
  pendingItems?: unknown[]
}

export interface DashboardPoint {
  label: string
  value: number
}

export interface DashboardSummary {
  totalPosts: number
  totalProfiles: number
  totalSongs: number
  totalAccounts: number
  viewsToday: number
  editsToday: number
}

export interface DashboardRecentActivity {
  id: string
  action: string
  target: string
  user: string
  timestamp: string
  type: "content" | "user" | "song" | "system" | "profile"
}

export interface DashboardSystemStatus {
  label: string
  status: "active" | "warning" | "error"
  detail: string
}

export interface DashboardPendingItem {
  id: string
  title: string
  type: string
  author: string
  date: string
  status: "pending" | "review"
}

export interface DashboardOverview {
  summary: DashboardSummary
  monthlyContent: DashboardPoint[]
  contentDistribution: DashboardPoint[]
  weeklyVisits: DashboardPoint[]
  recentActivities: DashboardRecentActivity[]
  systemStatuses: DashboardSystemStatus[]
  pendingItems: DashboardPendingItem[]
}

interface ContentItemDto {
  id?: number | string
  title?: string
  categoryName?: string
  category?: { id?: number | string; name?: string } | null
  createdByName?: string
  authorName?: string
  viewCount?: number
  views?: number
  isVisible?: boolean
  publishedAt?: string | null
  updatedAt?: string | null
  sortOrder?: number
}

interface SongItemDto {
  id?: number | string
  title?: string
  lyric?: string | null
  categoryName?: string
  category?: { id?: number | string; name?: string } | null
  durationSec?: number
  isVisible?: boolean
  audioUrl?: string | null
  audioMediaUrl?: string | null
  audioMediaId?: number | string | null
  viewCount?: number
  playCount?: number
  createdAt?: string | null
  updatedAt?: string | null
  composer?: string | null
  year?: number | string | null
}

interface PersonalNoteDto {
  id?: number | string
  title?: string
  content?: string
  colorCode?: string | null
  reminderAt?: string | null
  isPinned?: boolean
  isArchived?: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

export interface AdminContentItem {
  id: string
  title: string
  category: string
  author: string
  views: number
  isVisible: boolean
  updatedAt: string
  publishedAt: string
  order: number
}

export interface AdminContentListParams {
  page: number
  pageSize: number
  search?: string
  sort?: string
  order?: "asc" | "desc"
  isVisible?: boolean
}

export interface AdminContentListResult {
  items: AdminContentItem[]
  page: number
  pageSize: number
  totalElements: number
  totalPages: number
}

export interface AdminSongItem {
  id: string
  title: string
  category: string
  lyric: string
  durationSec: number
  isVisible: boolean
  audioUrl: string
  hasAudio: boolean
  plays: number
  composer: string
  year: number | null
  createdAt: string
  updatedAt: string
}

export interface AdminSongListParams {
  page: number
  pageSize: number
  search?: string
  sort?: string
  order?: "asc" | "desc"
  isVisible?: boolean
}

export interface AdminSongListResult {
  items: AdminSongItem[]
  page: number
  pageSize: number
  totalElements: number
  totalPages: number
}

export interface PersonalNoteItem {
  id: string
  title: string
  content: string
  colorCode: string
  reminderAt: string | null
  isPinned: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface PersonalNoteListParams {
  page: number
  pageSize: number
  search?: string
  isArchived?: boolean
}

export interface PersonalNoteListResult {
  items: PersonalNoteItem[]
  page: number
  pageSize: number
  totalElements: number
  totalPages: number
}

export interface CreatePersonalNotePayload {
  title: string
  content: string
  colorCode?: string
  reminderAt?: string | null
  isPinned?: boolean
}

export interface UpdatePersonalNotePayload {
  title: string
  content: string
  colorCode?: string
  reminderAt?: string | null
  isPinned?: boolean
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  const parsed = Number(value)
  if (Number.isFinite(parsed)) {
    return parsed
  }

  return fallback
}

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function toSafeDateLabel(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
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
  }).format(date)
}

function toSafeDateTimeLabel(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
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

function normalizeDashboardPoints(value: unknown): DashboardPoint[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      const point = item as DashboardPointDto
      return {
        label: toString(point.label, "N/A"),
        value: toNumber(point.value, 0),
      }
    })
    .filter((item) => item.label !== "")
}

function normalizeActivityType(value: string): DashboardRecentActivity["type"] {
  const raw = value.toLowerCase()
  if (raw.includes("song")) {
    return "song"
  }
  if (raw.includes("profile")) {
    return "profile"
  }
  if (raw.includes("user") || raw.includes("account")) {
    return "user"
  }
  if (raw.includes("system")) {
    return "system"
  }
  return "content"
}

function normalizeRecentActivities(value: unknown): DashboardRecentActivity[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item, index) => {
    const row = item as Record<string, unknown>
    const action = toString(row.action, toString(row.label, "Cập nhật"))
    const target = toString(row.target, toString(row.title, "-"))
    const user = toString(row.user, toString(row.actor, "Hệ thống"))
    const timestamp = toString(row.timestamp, toString(row.time, "-"))
    const typeValue = toString(row.type, action)

    return {
      id: toString(row.id, `activity-${index + 1}`),
      action,
      target,
      user,
      timestamp,
      type: normalizeActivityType(typeValue),
    }
  })
}

function normalizeSystemStatuses(value: unknown): DashboardSystemStatus[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item) => {
    const row = item as Record<string, unknown>
    const statusRaw = toString(row.status, "active").toLowerCase()
    const status: DashboardSystemStatus["status"] =
      statusRaw === "warning" ? "warning" : statusRaw === "error" ? "error" : "active"

    return {
      label: toString(row.label, toString(row.name, "Hệ thống")),
      status,
      detail: toString(row.detail, "-"),
    }
  })
}

function normalizePendingItems(value: unknown): DashboardPendingItem[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((item, index) => {
    const row = item as Record<string, unknown>
    const statusRaw = toString(row.status, "pending").toLowerCase()

    return {
      id: toString(row.id, `pending-${index + 1}`),
      title: toString(row.title, "-"),
      type: toString(row.type, "Nội dung"),
      author: toString(row.author, toString(row.user, "-")),
      date: toSafeDateLabel(row.date ?? row.createdAt),
      status: statusRaw === "review" ? "review" : "pending",
    }
  })
}

function normalizeContentItems(raw: unknown): ContentItemDto[] {
  if (Array.isArray(raw)) {
    return raw as ContentItemDto[]
  }

  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>
    if (Array.isArray(record.items)) {
      return record.items as ContentItemDto[]
    }
    if (Array.isArray(record.content)) {
      return record.content as ContentItemDto[]
    }
  }

  return []
}

function normalizeSongItems(raw: unknown): SongItemDto[] {
  if (Array.isArray(raw)) {
    return raw as SongItemDto[]
  }

  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>
    if (Array.isArray(record.items)) {
      return record.items as SongItemDto[]
    }
    if (Array.isArray(record.songs)) {
      return record.songs as SongItemDto[]
    }
    if (Array.isArray(record.content)) {
      return record.content as SongItemDto[]
    }
  }

  return []
}

function normalizeNoteItems(raw: unknown): PersonalNoteDto[] {
  if (Array.isArray(raw)) {
    return raw as PersonalNoteDto[]
  }

  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>
    if (Array.isArray(record.items)) {
      return record.items as PersonalNoteDto[]
    }
    if (Array.isArray(record.notes)) {
      return record.notes as PersonalNoteDto[]
    }
    if (Array.isArray(record.content)) {
      return record.content as PersonalNoteDto[]
    }
  }

  return []
}

function normalizePaginationMeta(meta: unknown, fallbackPage: number, fallbackPageSize: number, itemCount: number): {
  page: number
  pageSize: number
  totalElements: number
  totalPages: number
} {
  const m = (meta ?? {}) as PaginationMeta
  const page = toNumber(m.page, fallbackPage)
  const pageSize = toNumber(m.page_size, fallbackPageSize)
  const totalElements = toNumber(m.total_elements, itemCount)
  const totalPages = Math.max(1, toNumber(m.total_pages, Math.ceil(totalElements / Math.max(pageSize, 1))))

  return { page, pageSize, totalElements, totalPages }
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const { data } = await apiRequest<DashboardOverviewDto>("/api/v1/admin/dashboard/overview")

  const summary = data?.summary ?? {}

  return {
    summary: {
      totalPosts: toNumber(summary.totalPosts, 0),
      totalProfiles: toNumber(summary.totalProfiles, 0),
      totalSongs: toNumber(summary.totalSongs, 0),
      totalAccounts: toNumber(summary.totalAccounts, 0),
      viewsToday: toNumber(summary.viewsToday, 0),
      editsToday: toNumber(summary.editsToday, 0),
    },
    monthlyContent: normalizeDashboardPoints(data?.monthlyContent),
    contentDistribution: normalizeDashboardPoints(data?.contentDistribution),
    weeklyVisits: normalizeDashboardPoints(data?.weeklyVisits),
    recentActivities: normalizeRecentActivities(data?.recentActivities),
    systemStatuses: normalizeSystemStatuses(data?.systemStatuses),
    pendingItems: normalizePendingItems(data?.pendingItems),
  }
}

export async function getAdminContentItems(
  params: AdminContentListParams,
): Promise<AdminContentListResult> {
  const { data, meta } = await apiRequest<unknown>("/api/v1/admin/content-items", {
    query: {
      page: params.page,
      page_size: params.pageSize,
      q: params.search,
      sort: params.sort,
      order: params.order,
      is_visible: params.isVisible,
    },
  })

  const items = normalizeContentItems(data).map((item) => {
    const id = item.id !== undefined && item.id !== null ? String(item.id) : ""
    const category =
      toString(item.categoryName) ||
      toString(item.category?.name) ||
      "Không rõ"
    const author = toString(item.createdByName) || toString(item.authorName) || "N/A"

    return {
      id,
      title: toString(item.title, "(Không có tiêu đề)"),
      category,
      author,
      views: toNumber(item.viewCount ?? item.views, 0),
      isVisible: Boolean(item.isVisible),
      updatedAt: toSafeDateLabel(item.updatedAt),
      publishedAt: toSafeDateLabel(item.publishedAt),
      order: toNumber(item.sortOrder, 0),
    }
  })

  const pagination = normalizePaginationMeta(meta, params.page, params.pageSize, items.length)

  return {
    items,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalElements: pagination.totalElements,
    totalPages: pagination.totalPages,
  }
}

export async function patchContentVisibility(id: string, isVisible: boolean): Promise<void> {
  await apiRequest<unknown>(`/api/v1/admin/content-items/${id}/visibility`, {
    method: "PATCH",
    body: { isVisible },
  })
}

export async function deleteContentItem(id: string): Promise<void> {
  await apiRequest<unknown>(`/api/v1/admin/content-items/${id}`, {
    method: "DELETE",
  })
}

export async function getAdminSongs(
  params: AdminSongListParams,
): Promise<AdminSongListResult> {
  const { data, meta } = await apiRequest<unknown>("/api/v1/admin/songs", {
    query: {
      page: params.page,
      page_size: params.pageSize,
      q: params.search,
      sort: params.sort,
      order: params.order,
      is_visible: params.isVisible,
    },
  })

  const items = normalizeSongItems(data).map((item) => {
    const id = item.id !== undefined && item.id !== null ? String(item.id) : ""
    const category = toString(item.categoryName) || toString(item.category?.name) || "Chưa phân loại"
    const durationSec = Math.max(0, toNumber(item.durationSec, 0))
    const audioUrl = toString(item.audioUrl) || toString(item.audioMediaUrl)
    const composer = toString(item.composer, "-")
    const parsedYear = toNumber(item.year, 0)

    return {
      id,
      title: toString(item.title, "(Không có tiêu đề)"),
      category,
      lyric: toString(item.lyric, ""),
      durationSec,
      isVisible: Boolean(item.isVisible),
      audioUrl,
      hasAudio: Boolean(audioUrl || item.audioMediaId),
      plays: toNumber(item.playCount ?? item.viewCount, 0),
      composer,
      year: parsedYear > 0 ? parsedYear : null,
      createdAt: toSafeDateTimeLabel(item.createdAt),
      updatedAt: toSafeDateTimeLabel(item.updatedAt),
    }
  })

  const pagination = normalizePaginationMeta(meta, params.page, params.pageSize, items.length)

  return {
    items,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalElements: pagination.totalElements,
    totalPages: pagination.totalPages,
  }
}

export async function patchSongVisibility(id: string, isVisible: boolean): Promise<void> {
  await apiRequest<unknown>(`/api/v1/admin/songs/${id}/visibility`, {
    method: "PATCH",
    body: { isVisible },
  })
}

export async function deleteSong(id: string): Promise<void> {
  await apiRequest<unknown>(`/api/v1/admin/songs/${id}`, {
    method: "DELETE",
  })
}

function toNoteItem(raw: PersonalNoteDto): PersonalNoteItem {
  return {
    id: raw.id !== undefined && raw.id !== null ? String(raw.id) : "",
    title: toString(raw.title, "(Không có tiêu đề)"),
    content: toString(raw.content, ""),
    colorCode: toString(raw.colorCode, "#BFDBFE"),
    reminderAt: raw.reminderAt && typeof raw.reminderAt === "string" ? raw.reminderAt : null,
    isPinned: Boolean(raw.isPinned),
    isArchived: Boolean(raw.isArchived),
    createdAt: toSafeDateTimeLabel(raw.createdAt),
    updatedAt: toSafeDateTimeLabel(raw.updatedAt),
  }
}

export async function getPersonalNotes(
  params: PersonalNoteListParams,
): Promise<PersonalNoteListResult> {
  const { data, meta } = await apiRequest<unknown>("/api/v1/notes", {
    query: {
      page: params.page,
      page_size: params.pageSize,
      q: params.search,
      is_archived: params.isArchived,
    },
  })

  const items = normalizeNoteItems(data).map(toNoteItem)
  const pagination = normalizePaginationMeta(meta, params.page, params.pageSize, items.length)

  return {
    items,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalElements: pagination.totalElements,
    totalPages: pagination.totalPages,
  }
}

export async function createPersonalNote(
  payload: CreatePersonalNotePayload,
): Promise<PersonalNoteItem | null> {
  const { data } = await apiRequest<unknown>("/api/v1/notes", {
    method: "POST",
    body: payload,
  })

  if (!data || typeof data !== "object") {
    return null
  }

  return toNoteItem(data as PersonalNoteDto)
}

export async function updatePersonalNote(
  id: string,
  payload: UpdatePersonalNotePayload,
): Promise<PersonalNoteItem | null> {
  const { data } = await apiRequest<unknown>(`/api/v1/notes/${id}`, {
    method: "PUT",
    body: payload,
  })

  if (!data || typeof data !== "object") {
    return null
  }

  return toNoteItem(data as PersonalNoteDto)
}

export async function deletePersonalNote(id: string): Promise<void> {
  await apiRequest<unknown>(`/api/v1/notes/${id}`, {
    method: "DELETE",
  })
}

export async function patchPersonalNotePin(id: string, value: boolean): Promise<void> {
  await apiRequest<unknown>(`/api/v1/notes/${id}/pin`, {
    method: "PATCH",
    body: { value },
  })
}

export async function patchPersonalNoteArchive(id: string, value: boolean): Promise<void> {
  await apiRequest<unknown>(`/api/v1/notes/${id}/archive`, {
    method: "PATCH",
    body: { value },
  })
}
