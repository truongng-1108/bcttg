"use client"

import type React from "react"
import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { BronzeDrumPattern } from "./decorations/bronze-drum-pattern"
import { LotusDecoration } from "./decorations/lotus-decoration"

interface AdminLayoutProps {
  children: React.ReactNode
  userPhone: string
  userRoles: string[]
  onLogout: () => void
}

export function AdminLayout({ children, userPhone, userRoles, onLogout }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar cố định bên trái */}
      <AdminSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Khu vực nội dung chính */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Hoa văn trống đồng - watermark nền */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <BronzeDrumPattern className="h-[600px] w-[600px] text-primary opacity-[0.04]" />
        </div>
        
        {/* Hoa sen trang trí góc dưới */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex justify-center">
          <LotusDecoration className="h-24 w-48 text-primary opacity-[0.06]" />
        </div>
        
        {/* Header cố định trên cùng */}
        <AdminHeader 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          userPhone={userPhone}
          userRoles={userRoles}
          onLogout={onLogout}
        />
        
        {/* Nội dung cuộn độc lập */}
        <main className="relative z-10 flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
