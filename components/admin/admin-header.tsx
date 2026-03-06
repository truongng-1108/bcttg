"use client"

import { Bell, LogOut, Menu, Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AdminHeaderProps {
  onToggleSidebar: () => void
  userPhone: string
  userRoles: string[]
  onLogout: () => void
}

function formatPrimaryRole(roles: string[]): string {
  const normalizedRoles = roles.map((role) => role.replace(/^ROLE_/, "").toUpperCase())
  const primaryRole = normalizedRoles[0]

  switch (primaryRole) {
    case "ADMIN":
      return "Quản trị viên"
    case "MANAGER":
      return "Quản lý"
    case "USER":
      return "Người dùng"
    default:
      return "Tài khoản"
  }
}

export function AdminHeader({
  onToggleSidebar,
  userPhone,
  userRoles,
  onLogout,
}: AdminHeaderProps) {
  const primaryRoleLabel = formatPrimaryRole(userRoles)

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-border bg-card px-4 shadow-sm">
      <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-primary hover:bg-primary/10"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Mở menu</span>
        </Button>

        <div className="flex items-center gap-3">
          <Star className="h-5 w-5 text-accent" fill="currentColor" />
          <div className="flex flex-col">
            <h1 className="text-base font-bold uppercase leading-tight tracking-wide text-primary">
              SỔ TAY ĐIỆN TỬ GIÁO DỤC TRUYỀN THỐNG
            </h1>
            <p className="text-xs font-medium text-muted-foreground">
              Hệ thống quản trị nội bộ - Binh chủng Tăng Thiết Giáp
            </p>
          </div>
          <Star className="h-5 w-5 text-accent" fill="currentColor" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:bg-primary/10 hover:text-primary"
          aria-label="Thông báo"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-3 text-foreground hover:bg-primary/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-semibold text-foreground">{userPhone}</span>
                <span className="text-xs text-muted-foreground">{primaryRoleLabel}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-semibold text-foreground">{userPhone}</p>
              <p className="text-xs text-muted-foreground">
                Quyền: {userRoles.length > 0 ? userRoles.join(", ") : "N/A"}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Thông tin cá nhân
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
