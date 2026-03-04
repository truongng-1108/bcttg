"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DashboardContent } from "@/components/admin/dashboard/dashboard-content"
import { AccountsContent } from "@/components/admin/accounts/accounts-content"
import { AccountForm } from "@/components/admin/accounts/account-form"
import { ProfileForm } from "@/components/admin/profiles/profile-form"
import { CMSContent } from "@/components/admin/cms/cms-content"
import { ReportsContent } from "@/components/admin/reports/reports-content"
import { HomeModulesContent } from "@/components/admin/home-modules/home-modules-content"
import { SongsContent } from "@/components/admin/songs/songs-content"
import { NotesContent } from "@/components/admin/notes/notes-content"
import { SystemLogsContent } from "@/components/admin/logs/system-logs-content"
import { SettingsContent } from "@/components/admin/settings/settings-content"
import { AdminLoginForm } from "@/components/admin/auth/admin-login-form"
import {
  clearAuthSession,
  loadAuthSession,
  loginAdmin,
  saveAuthSession,
  type AdminLoginCredentials,
  type AuthSession,
} from "@/lib/auth"

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

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const [authSession, setAuthSession] = useState<AuthSession | null>(null)
  const [isSessionReady, setIsSessionReady] = useState(false)

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
      if (error instanceof TypeError) {
        throw new Error("Khong the ket noi API. Kiem tra NEXT_PUBLIC_API_BASE_URL.")
      }
      throw error
    }
  }

  const handleLogout = () => {
    clearAuthSession()
    setAuthSession(null)
    setCurrentView("dashboard")
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardContent />

      case "accounts":
        return <AccountsContent />

      case "account-create":
        return (
          <AccountForm
            mode="create"
            onBack={() => setCurrentView("accounts")}
            onSave={(data) => {
              console.log("Saving account:", data)
              setCurrentView("accounts")
            }}
          />
        )

      case "account-edit":
        return (
          <AccountForm
            mode="edit"
            initialData={{
              rank: "dai-uy",
              fullName: "Nguyen Van A",
              username: "nguyenvana",
              email: "nguyenvana@qtdl.vn",
              phone: "0912345678",
              unit: "phong-chinh-tri",
              role: "admin",
              status: "active",
            }}
            onBack={() => setCurrentView("accounts")}
            onSave={(data) => {
              console.log("Updating account:", data)
              setCurrentView("accounts")
            }}
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
            onSave={(data) => {
              console.log("Saving profile:", data)
              setCurrentView("dashboard")
            }}
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
        Dang tai phien dang nhap...
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
          Dieu huong nhanh (Demo)
        </p>
        <div className="flex flex-wrap gap-2">
          <NavButton
            label="Dashboard"
            active={currentView === "dashboard"}
            onClick={() => setCurrentView("dashboard")}
          />
          <NavButton
            label="Tai khoan"
            active={currentView === "accounts"}
            onClick={() => setCurrentView("accounts")}
          />
          <NavButton
            label="Tao tai khoan"
            active={currentView === "account-create"}
            onClick={() => setCurrentView("account-create")}
          />
          <NavButton
            label="Sua tai khoan"
            active={currentView === "account-edit"}
            onClick={() => setCurrentView("account-edit")}
          />
          <NavButton
            label="Module trang chu"
            active={currentView === "home-modules"}
            onClick={() => setCurrentView("home-modules")}
          />
          <NavButton
            label="CMS"
            active={currentView === "cms"}
            onClick={() => setCurrentView("cms")}
          />
          <NavButton
            label="Ho so"
            active={currentView === "profile-create"}
            onClick={() => setCurrentView("profile-create")}
          />
          <NavButton
            label="Ca khuc"
            active={currentView === "songs"}
            onClick={() => setCurrentView("songs")}
          />
          <NavButton
            label="Ghi chu"
            active={currentView === "notes"}
            onClick={() => setCurrentView("notes")}
          />
          <NavButton
            label="Nhat ky"
            active={currentView === "logs"}
            onClick={() => setCurrentView("logs")}
          />
          <NavButton
            label="Cau hinh"
            active={currentView === "settings"}
            onClick={() => setCurrentView("settings")}
          />
          <NavButton
            label="Bao cao"
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
