"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import {
  AccountForm,
  type AccountFormInitialData,
  type AccountFormSubmitData,
} from "@/components/admin/accounts/account-form"
import { AccountsContent } from "@/components/admin/accounts/accounts-content"
import { AdminLoginForm } from "@/components/admin/auth/admin-login-form"
import { CMSContent } from "@/components/admin/cms/cms-content"
import { DashboardContent } from "@/components/admin/dashboard/dashboard-content"
import { HomeModulesContent } from "@/components/admin/home-modules/home-modules-content"
import { SystemLogsContent } from "@/components/admin/logs/system-logs-content"
import { NotesContent } from "@/components/admin/notes/notes-content"
import {
  ProfileForm,
  type ProfileFormData,
  type ProfileFormType,
} from "@/components/admin/profiles/profile-form"
import { ReportsContent } from "@/components/admin/reports/reports-content"
import { SettingsContent } from "@/components/admin/settings/settings-content"
import { SongsContent } from "@/components/admin/songs/songs-content"
import { toast } from "sonner"
import {
  clearAuthSession,
  loadAuthSession,
  loginAdmin,
  saveAuthSession,
  type AdminLoginCredentials,
  type AuthSession,
} from "@/lib/auth"
import {
  createAdminAccount,
  getAdminAccountById,
  updateAdminAccount,
  type AdminUserRole,
} from "@/lib/admin-account-api"
import { createDataProfile, type DataProfileType } from "@/lib/profile-api"

type ViewType =
  | "dashboard"
  | "accounts"
  | "account-create"
  | "account-edit"
  | "cms"
  | "profile-create"
  | "reports"
  | "home-modules"
  | "songs"
  | "notes"
  | "logs"
  | "settings"

function toDataProfileType(profileType: ProfileFormType): DataProfileType {
  if (profileType === "thu-truong") {
    return "THU_TRUONG"
  }
  if (profileType === "chien-si") {
    return "CHIEN_SI"
  }
  return "ANH_HUNG"
}

function toOptionalText(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function toIsoDateString(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) {
    return undefined
  }

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function toAccountRole(value: AdminUserRole): AdminUserRole {
  if (value === "ADMIN") {
    return "ADMIN"
  }
  if (value === "MANAGER") {
    return "MANAGER"
  }
  return "USER"
}

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const [authSession, setAuthSession] = useState<AuthSession | null>(null)
  const [isSessionReady, setIsSessionReady] = useState(false)
  const [accountEditData, setAccountEditData] = useState<AccountFormInitialData | null>(null)

  useEffect(() => {
    const session = loadAuthSession()
    setAuthSession(session)
    setIsSessionReady(true)
  }, [])

  const handleLogin = async (credentials: AdminLoginCredentials) => {
    try {
      const session = await loginAdmin(credentials)
      saveAuthSession(session)
      setAuthSession(session)
      setCurrentView("dashboard")
    } catch (error) {
      const message =
        error instanceof TypeError
          ? "Không thể kết nối API. Kiểm tra NEXT_PUBLIC_API_BASE_URL."
          : error instanceof Error
            ? error.message
            : "Đăng nhập thất bại. Vui lòng thử lại."
      toast.error(message)
    }
  }

  const handleLogout = () => {
    clearAuthSession()
    setAuthSession(null)
    setCurrentView("dashboard")
  }

  const handleOpenAccountCreate = () => {
    setAccountEditData(null)
    setCurrentView("account-create")
  }

  const handleOpenAccountEdit = async (accountId: string) => {
    try {
      const detail = await getAdminAccountById(accountId)
      setAccountEditData({
        id: detail.id,
        rank: detail.profile.rankName,
        fullName: detail.profile.fullName,
        username: detail.phone,
        email: detail.profile.email,
        phone: detail.phone,
        unit: detail.profile.unitName,
        role: detail.role,
        status: detail.isActive ? "active" : "inactive",
      })
      setCurrentView("account-edit")
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : "Không tải được chi tiết tài khoản."
      toast.error(message)
    }
  }

  const handleCreateAccount = async (data: AccountFormSubmitData) => {
    const password = data.password?.trim()
    if (!password) {
      throw new Error("Thiếu mật khẩu tạo tài khoản.")
    }

    await createAdminAccount({
      phone: data.phone.trim(),
      password,
      role: toAccountRole(data.role),
      isActive: data.status === "active",
      profile: {
        fullName: data.fullName.trim(),
        unitName: toOptionalText(data.unit),
        rankName: toOptionalText(data.rank),
        email: toOptionalText(data.email),
      },
    })

    toast.success("Đã tạo tài khoản thành công.")
    setCurrentView("accounts")
  }

  const handleUpdateAccount = async (data: AccountFormSubmitData) => {
    if (!data.id) {
      throw new Error("Thiếu ID tài khoản để cập nhật.")
    }

    await updateAdminAccount(data.id, {
      phone: data.phone.trim(),
      role: toAccountRole(data.role),
      isActive: data.status === "active",
      profile: {
        fullName: data.fullName.trim(),
        unitName: toOptionalText(data.unit),
        rankName: toOptionalText(data.rank),
        email: toOptionalText(data.email),
      },
    })

    toast.success("Đã cập nhật tài khoản thành công.")
    setCurrentView("accounts")
  }

  const handleSaveProfile = async (
    profileType: ProfileFormType,
    data: ProfileFormData,
  ) => {
    await createDataProfile({
      profileType: toDataProfileType(profileType),
      fullName: data.fullName.trim(),
      position: toOptionalText(data.position),
      unitName: toOptionalText(data.unit),
      rankName: toOptionalText(data.rank),
      birthDate: toIsoDateString(data.birthDate),
      hometown: toOptionalText(data.birthPlace),
      biography: toOptionalText(data.biography),
      achievements: toOptionalText(data.achievements),
      isVisible: data.status === "published",
    })

    toast.success("Đã tạo hồ sơ thành công.")
    setCurrentView("dashboard")
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardContent />

      case "accounts":
        return (
          <AccountsContent
            onCreate={handleOpenAccountCreate}
            onEdit={(accountId) => handleOpenAccountEdit(accountId)}
          />
        )

      case "account-create":
        return (
          <AccountForm
            mode="create"
            onBack={() => setCurrentView("accounts")}
            onSave={(data) => handleCreateAccount(data)}
          />
        )

      case "account-edit":
        return (
          <AccountForm
            mode="edit"
            initialData={accountEditData ?? undefined}
            onBack={() => setCurrentView("accounts")}
            onSave={(data) => handleUpdateAccount(data)}
          />
        )

      case "cms":
        return <CMSContent />

      case "profile-create":
        return (
          <ProfileForm
            mode="create"
            profileType="thu-truong"
            onBack={() => setCurrentView("dashboard")}
            onSave={(data) => handleSaveProfile("thu-truong", data)}
          />
        )

      case "reports":
        return <ReportsContent />

      case "home-modules":
        return <HomeModulesContent />

      case "songs":
        return <SongsContent />

      case "notes":
        return <NotesContent />

      case "logs":
        return <SystemLogsContent />

      case "settings":
        return <SettingsContent />

      default:
        return <DashboardContent />
    }
  }

  if (!isSessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Đang tải phiên đăng nhập...
      </div>
    )
  }

  if (!authSession) {
    return <AdminLoginForm onLogin={handleLogin} />
  }

  return (
    <AdminLayout
      onLogout={handleLogout}
      userPhone={authSession.phone}
      userRoles={authSession.roles}
    >
      <div className="mb-6 rounded-md border border-primary/20 bg-card p-4 shadow-sm">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">
          Điều hướng nhanh
        </p>
        <div className="flex flex-wrap gap-2">
          <NavButton
            label="Dashboard"
            active={currentView === "dashboard"}
            onClick={() => setCurrentView("dashboard")}
          />
          <NavButton
            label="Tài khoản"
            active={currentView === "accounts"}
            onClick={() => setCurrentView("accounts")}
          />
          <NavButton
            label="Tạo tài khoản"
            active={currentView === "account-create"}
            onClick={handleOpenAccountCreate}
          />
          <NavButton
            label="Sửa tài khoản"
            active={currentView === "account-edit"}
            onClick={() => {
              if (accountEditData?.id) {
                setCurrentView("account-edit")
                return
              }
              toast.info("Chọn tài khoản trong danh sách để sửa.")
            }}
          />
          <NavButton
            label="Module trang chủ"
            active={currentView === "home-modules"}
            onClick={() => setCurrentView("home-modules")}
          />
          <NavButton
            label="CMS"
            active={currentView === "cms"}
            onClick={() => setCurrentView("cms")}
          />
          <NavButton
            label="Hồ sơ"
            active={currentView === "profile-create"}
            onClick={() => setCurrentView("profile-create")}
          />
          <NavButton
            label="Ca khúc"
            active={currentView === "songs"}
            onClick={() => setCurrentView("songs")}
          />
          <NavButton
            label="Ghi chú"
            active={currentView === "notes"}
            onClick={() => setCurrentView("notes")}
          />
          <NavButton
            label="Nhật ký"
            active={currentView === "logs"}
            onClick={() => setCurrentView("logs")}
          />
          <NavButton
            label="Cấu hình"
            active={currentView === "settings"}
            onClick={() => setCurrentView("settings")}
          />
          <NavButton
            label="Báo cáo"
            active={currentView === "reports"}
            onClick={() => setCurrentView("reports")}
          />
        </div>
      </div>

      {renderContent()}
    </AdminLayout>
  )
}

function NavButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-all ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-secondary text-secondary-foreground hover:border-primary/50 hover:bg-primary/10"
      }`}
    >
      {label}
    </button>
  )
}
