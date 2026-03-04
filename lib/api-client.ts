import { loadAuthSession } from "@/lib/auth"

interface ApiErrorPayload {
  code?: string
  message?: string
  details?: unknown[]
}

interface ApiEnvelope<T> {
  success?: boolean
  data?: T
  meta?: unknown
  error?: ApiErrorPayload | null
}

export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown[]

  constructor(params: {
    message: string
    status: number
    code?: string
    details?: unknown[]
  }) {
    super(params.message)
    this.name = "ApiError"
    this.status = params.status
    this.code = params.code
    this.details = params.details
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  query?: Record<string, string | number | boolean | null | undefined>
  body?: unknown
  auth?: boolean
  headers?: Record<string, string>
}

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim().replace(/\/+$/, "")
}

function normalizePath(path: string): string {
  const trimmed = path.trim()
  if (!trimmed) {
    return "/"
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const normalizedPath = normalizePath(path)
  const baseUrl = getApiBaseUrl()
  const fallbackOrigin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost"
  const url = new URL(`${baseUrl}${normalizedPath}`, fallbackOrigin)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value))
      }
    })
  }

  if (!baseUrl) {
    return `${url.pathname}${url.search}`
  }

  return `${url.origin}${url.pathname}${url.search}`
}

function parseErrorMessage(status: number, payload: ApiEnvelope<unknown> | null): string {
  const message = payload?.error?.message
  if (message && typeof message === "string") {
    return message
  }

  if (status === 401) {
    return "Phien dang nhap het han hoac khong hop le."
  }
  if (status === 403) {
    return "Ban khong co quyen thuc hien thao tac nay."
  }
  if (status >= 500) {
    return "He thong tam thoi loi, vui long thu lai."
  }

  return "Khong the xu ly yeu cau."
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta: unknown }> {
  const method = options.method ?? "GET"
  const useAuth = options.auth ?? true
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ?? {}),
  }

  if (options.body !== undefined && options.body !== null) {
    headers["Content-Type"] = "application/json"
  }

  if (useAuth) {
    const session = loadAuthSession()
    if (!session) {
      throw new ApiError({
        message: "Ban chua dang nhap.",
        status: 401,
      })
    }

    headers.Authorization = `${session.tokenType} ${session.accessToken}`
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body: options.body !== undefined && options.body !== null ? JSON.stringify(options.body) : undefined,
    })
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError({
        message: "Khong ket noi duoc den API. Kiem tra lai route va server.",
        status: 0,
      })
    }

    throw new ApiError({
      message: "Khong ket noi duoc den API.",
      status: 0,
    })
  }

  let payload: ApiEnvelope<T> | null = null
  try {
    payload = (await response.json()) as ApiEnvelope<T>
  } catch {
    payload = null
  }

  if (!response.ok || !payload?.success) {
    throw new ApiError({
      message: parseErrorMessage(response.status, payload),
      status: response.status,
      code: payload?.error?.code,
      details: payload?.error?.details,
    })
  }

  return {
    data: (payload.data as T) ?? (null as T),
    meta: payload.meta ?? null,
  }
}
