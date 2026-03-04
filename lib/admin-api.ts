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
    const action = toString(row.action, toString(row.label, "Cap nhat"))
    const target = toString(row.target, toString(row.title, "-"))
    const user = toString(row.user, toString(row.actor, "He thong"))
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
      label: toString(row.label, toString(row.name, "He thong")),
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
      type: toString(row.type, "Noi dung"),
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
      "Khong ro"
    const author = toString(item.createdByName) || toString(item.authorName) || "N/A"

    return {
      id,
      title: toString(item.title, "(Khong co tieu de)"),
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
