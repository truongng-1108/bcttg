"use client"

import React from "react"

import { useState } from "react"
import {
  Download,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Eye,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"

const monthlyData = [
  { month: "T1", views: 4500, edits: 120, logins: 850 },
  { month: "T2", views: 5200, edits: 145, logins: 920 },
  { month: "T3", views: 4800, edits: 132, logins: 880 },
  { month: "T4", views: 6100, edits: 167, logins: 1050 },
  { month: "T5", views: 5500, edits: 156, logins: 980 },
  { month: "T6", views: 6700, edits: 189, logins: 1120 },
  { month: "T7", views: 7200, edits: 201, logins: 1200 },
  { month: "T8", views: 5800, edits: 145, logins: 950 },
  { month: "T9", views: 6400, edits: 178, logins: 1080 },
  { month: "T10", views: 7800, edits: 212, logins: 1350 },
  { month: "T11", views: 8200, edits: 234, logins: 1420 },
  { month: "T12", views: 9100, edits: 256, logins: 1580 },
]

const userActivityData = [
  { name: "Quản trị viên", value: 5, activity: 89 },
  { name: "Chỉ huy", value: 8, activity: 76 },
  { name: "Cán bộ CT", value: 12, activity: 82 },
  { name: "Biên tập viên", value: 15, activity: 95 },
  { name: "Người dùng", value: 25, activity: 45 },
]

const topContentData = [
  { title: "Lịch sử hình thành Binh chủng", views: 2156, trend: 15 },
  { title: "Chiến dịch Hồ Chí Minh", views: 1892, trend: 8 },
  { title: "60 năm xây dựng (1965-2025)", views: 1547, trend: 23 },
  { title: "Trận Đường 9 - Nam Lào", views: 1234, trend: -5 },
  { title: "Tinh thần đoàn kết", views: 987, trend: 12 },
]

export function ReportsContent() {
  const [timePeriod, setTimePeriod] = useState("year")
  const [reportType, setReportType] = useState("all")

  const handleExportExcel = (type: string) => {
    if (!type.trim()) {
      toast.error("Không xác định được loại báo cáo để xuất.")
      return
    }

    toast.info(`Đang xuất báo cáo ${type} ra file Excel...`)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Báo cáo & Thống kê
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Thống kê hoạt động và báo cáo tổng hợp hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm 2026</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            onClick={() => handleExportExcel("tong-hop")}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Xuất báo cáo Excel
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Tổng lượt xem"
          value="77,400"
          change={18.5}
          icon={Eye}
          period="so với năm trước"
        />
        <SummaryCard
          title="Tổng thao tác"
          value="2,135"
          change={12.3}
          icon={FileText}
          period="so với năm trước"
        />
        <SummaryCard
          title="Người dùng hoạt động"
          value="65"
          change={8.7}
          icon={Users}
          period="so với năm trước"
        />
        <SummaryCard
          title="Thời gian trung bình"
          value="4:32"
          change={-2.1}
          icon={Clock}
          period="phút/phiên"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Views Over Time */}
        <div className="rounded-md border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">
              Lượt xem theo tháng
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => handleExportExcel("luot-xem")}
            >
              <Download className="h-3 w-3" />
              Xuất Excel
            </Button>
          </div>
          <div className="p-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D5D0C4" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#5C5C5C" }}
                    axisLine={{ stroke: "#D5D0C4" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#5C5C5C" }}
                    axisLine={{ stroke: "#D5D0C4" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #D5D0C4",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#C62828"
                    fill="#C62828"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* User Activity */}
        <div className="rounded-md border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">
              Hoạt động theo vai trò
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => handleExportExcel("hoat-dong")}
            >
              <Download className="h-3 w-3" />
              Xuất Excel
            </Button>
          </div>
          <div className="p-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userActivityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#D5D0C4" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#5C5C5C" }}
                    axisLine={{ stroke: "#D5D0C4" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#5C5C5C" }}
                    axisLine={{ stroke: "#D5D0C4" }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #D5D0C4",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="activity" fill="#2E4A32" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Login Trends */}
        <div className="rounded-md border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">
              Lượt đăng nhập theo tháng
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => handleExportExcel("dang-nhap")}
            >
              <Download className="h-3 w-3" />
              Xuất Excel
            </Button>
          </div>
          <div className="p-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D5D0C4" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#5C5C5C" }}
                    axisLine={{ stroke: "#D5D0C4" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#5C5C5C" }}
                    axisLine={{ stroke: "#D5D0C4" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #D5D0C4",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="logins"
                    stroke="#C9A227"
                    strokeWidth={2}
                    dot={{ fill: "#C9A227", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Content */}
        <div className="rounded-md border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">
              Nội dung được xem nhiều nhất
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => handleExportExcel("noi-dung")}
            >
              <Download className="h-3 w-3" />
              Xuất Excel
            </Button>
          </div>
          <div className="divide-y divide-border">
            {topContentData.map((item, index) => (
              <div
                key={item.title}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {item.views.toLocaleString()} lượt
                  </span>
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${
                      item.trend >= 0 ? "text-[#2E7D32]" : "text-destructive"
                    }`}
                  >
                    {item.trend >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(item.trend)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="rounded-md border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">
            Xuất báo cáo tùy chọn
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <ExportOption
            title="Báo cáo tổng hợp"
            description="Tất cả dữ liệu thống kê"
            onClick={() => handleExportExcel("tong-hop")}
          />
          <ExportOption
            title="Báo cáo người dùng"
            description="Danh sách và hoạt động"
            onClick={() => handleExportExcel("nguoi-dung")}
          />
          <ExportOption
            title="Báo cáo nội dung"
            description="Bài viết và lượt xem"
            onClick={() => handleExportExcel("noi-dung-chi-tiet")}
          />
          <ExportOption
            title="Nhật ký hệ thống"
            description="Log đăng nhập và thao tác"
            onClick={() => handleExportExcel("nhat-ky")}
          />
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  change,
  icon: Icon,
  period,
}: {
  title: string
  value: string
  change: number
  icon: React.ElementType
  period: string
}) {
  const isPositive = change >= 0

  return (
    <div className="rounded-md border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? "text-[#2E7D32]" : "text-destructive"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {isPositive ? "+" : ""}
          {change}%
        </span>
        <span className="text-xs text-muted-foreground">{period}</span>
      </div>
    </div>
  )
}

function ExportOption({
  title,
  description,
  onClick,
}: {
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-md border border-border bg-background p-4 text-left transition-colors hover:bg-muted"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded bg-secondary/10">
        <FileSpreadsheet className="h-5 w-5 text-secondary" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}
