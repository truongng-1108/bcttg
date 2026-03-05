export interface AdminLoginCredentials {
  phone: string
  password: string
}

interface ApiErrorPayload {
  code?: string
  message?: string
  details?: unknown[]
}

interface ApiEnvelope<T> {
  success?: boolean
  data?: T | null
  meta?: unknown
  error?: ApiErrorPayload | null
}

interface LoginResponseData {
  accessToken: string
  tokenType?: string
  expiresInMinutes?: number
  roles?: string[]
}

export interface AuthSession {
  phone: string
  accessToken: string
  tokenType: string
  roles: string[]
  loggedInAt: string
  expiresAt: string
}

const DEFAULT_STORAGE_KEY = "bcttg_admin_session"
const LOGIN_PATH = "/api/v1/auth/login"

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim().replace(/\/+$/, "")
}

function getLoginPath(): string {
  return LOGIN_PATH
}

function getSessionStorageKey(): string {
  return (
    (process.env.NEXT_PUBLIC_AUTH_STORAGE_KEY ?? DEFAULT_STORAGE_KEY).trim() ||
    DEFAULT_STORAGE_KEY
  )
}

function buildApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    return path
  }

  return `${baseUrl}${path}`
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0
}

function toSafeRoles(rawRoles: unknown): string[] {
  if (!Array.isArray(rawRoles)) {
    return []
  }

  return rawRoles.filter((role): role is string => typeof role === "string")
}

function parseApiErrorMessage(payload: ApiEnvelope<LoginResponseData> | null): string | null {
  if (!payload?.error?.message || typeof payload.error.message !== "string") {
    return null
  }

  return payload.error.message
}

export async function loginAdmin(
  credentials: AdminLoginCredentials,
): Promise<AuthSession> {
  const phone = credentials.phone.trim()
  const password = credentials.password

  const response = await fetch(buildApiUrl(getLoginPath()), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ phone, password }),
  })

  let payload: ApiEnvelope<LoginResponseData> | null = null

  try {
    payload = (await response.json()) as ApiEnvelope<LoginResponseData>
  } catch {
    payload = null
  }

  const fallbackErrorMessage = response.status === 401
    ? "Sai thông tin đăng nhập."
    : "Đăng nhập thất bại, vui lòng thử lại."

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(parseApiErrorMessage(payload) ?? fallbackErrorMessage)
  }

  const { accessToken, tokenType, expiresInMinutes, roles } = payload.data
  if (!isNonEmptyString(accessToken)) {
    throw new Error("Không nhận được access token từ API.")
  }

  const safeExpiresInMinutes =
    typeof expiresInMinutes === "number" && Number.isFinite(expiresInMinutes) && expiresInMinutes > 0
      ? expiresInMinutes
      : 120

  const now = Date.now()
  const expiresAt = new Date(now + safeExpiresInMinutes * 60_000).toISOString()

  return {
    phone,
    accessToken,
    tokenType: tokenType?.trim() || "Bearer",
    roles: toSafeRoles(roles),
    loggedInAt: new Date(now).toISOString(),
    expiresAt,
  }
}

function isValidAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") {
    return false
  }

  const session = value as Partial<AuthSession>
  const hasRoles = Array.isArray(session.roles) && session.roles.every((role) => typeof role === "string")

  return (
    isNonEmptyString(session.phone) &&
    isNonEmptyString(session.accessToken) &&
    isNonEmptyString(session.tokenType) &&
    hasRoles &&
    isNonEmptyString(session.loggedInAt) &&
    isNonEmptyString(session.expiresAt)
  )
}

function isSessionExpired(expiresAt: string): boolean {
  const expiresAtMs = new Date(expiresAt).getTime()
  if (!Number.isFinite(expiresAtMs)) {
    return true
  }

  return expiresAtMs <= Date.now()
}

export function saveAuthSession(session: AuthSession): void {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(getSessionStorageKey(), JSON.stringify(session))
}

export function loadAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null
  }

  const rawSession = window.localStorage.getItem(getSessionStorageKey())
  if (!rawSession) {
    return null
  }

  try {
    const parsed = JSON.parse(rawSession) as unknown
    if (!isValidAuthSession(parsed) || isSessionExpired(parsed.expiresAt)) {
      window.localStorage.removeItem(getSessionStorageKey())
      return null
    }

    return parsed
  } catch {
    window.localStorage.removeItem(getSessionStorageKey())
    return null
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(getSessionStorageKey())
}
