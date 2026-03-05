"use client"

import { useEffect, useMemo, useState } from "react"
import { Edit3, Eye, FileText, FolderOpen, Music, RefreshCcw, Star, Users } from "lucide-react"
import { StatsCard } from "./stats-card"
import { RecentActivity } from "./recent-activity"
import { AccessChart, CategoryChart, ContentChart } from "./quick-stats"
import {
  getDashboardOverview,
  type DashboardOverview,
  type DashboardPendingItem,
  type DashboardSystemStatus,
} from "@/lib/admin-api"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const fallbackSystemStatuses: DashboardSystemStatus[] = [
  { label: "Cơ sở dữ liệu", status: "active", detail: "Hoạt động ổn định" },
  { label: "Bộ nhớ đệm", status: "active", detail: "Đang theo dõi" },
  { label: "Sao lưu tự động", status: "warning", detail: "Cần kiểm tra lịch backup" },
]

const fallbackPendingItems: DashboardPendingItem[] = [
  {
    id: "1",
    title: "Trận đánh Đường 9 - Nam Lào",
    type: "Truyền thống",
    author: "N/A",
    date: "-",
    status: "pending",
  },
]

function formatNumber(value: number): string {
  return value.toLocaleString("vi-VN")
}

function formatLastUpdated(date: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function DashboardContent() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)

  const fetchOverview = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getDashboardOverview()
      setOverview(response)
      setLastUpdatedAt(new Date())
    } catch (apiError) {
      const message =
        apiError instanceof Error ? apiError.message : "Không tải được dữ liệu dashboard."
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchOverview()
  }, [])

  const summary = overview?.summary ?? {
    totalPosts: 0,
    totalProfiles: 0,
    totalSongs: 0,
    totalAccounts: 0,
    viewsToday: 0,
    editsToday: 0,
  }

  const contentChartData = useMemo(
    () => (overview?.monthlyContent ?? []).map((item) => ({ name: item.label, value: item.value })),
    [overview],
  )
  const categoryChartData = useMemo(
    () => (overview?.contentDistribution ?? []).map((item) => ({ name: item.label, value: item.value })),
    [overview],
  )
  const accessChartData = useMemo(
    () => (overview?.weeklyVisits ?? []).map((item) => ({ name: item.label, value: item.value })),
    [overview],
  )

  const systemStatuses = overview?.systemStatuses?.length
    ? overview.systemStatuses
    : fallbackSystemStatuses
  const pendingItems = overview?.pendingItems?.length ? overview.pendingItems : fallbackPendingItems

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent bg-accent/10">
            <Star className="h-5 w-5 text-accent" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wide text-primary">
              Dashboard - Báo cáo và thống kê
            </h1>
            <p className="text-sm text-muted-foreground">
              Tổng quan hoạt động hệ thống quản trị.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Cập nhật lần cuối</p>
          <p className="text-sm font-semibold text-foreground">
            {lastUpdatedAt ? formatLastUpdated(lastUpdatedAt) : "--"}
          </p>
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void fetchOverview()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Tổng bài viết"
          value={formatNumber(summary.totalPosts)}
          icon={FileText}
          variant="primary"
        />
        <StatsCard
          title="Hồ sơ dữ liệu"
          value={formatNumber(summary.totalProfiles)}
          icon={FolderOpen}
          variant="secondary"
        />
        <StatsCard title="Ca khúc" value={formatNumber(summary.totalSongs)} icon={Music} variant="accent" />
        <StatsCard title="Tài khoản" value={formatNumber(summary.totalAccounts)} icon={Users} />
        <StatsCard title="Lượt xem hôm nay" value={formatNumber(summary.viewsToday)} icon={Eye} />
        <StatsCard title="Chỉnh sửa hôm nay" value={formatNumber(summary.editsToday)} icon={Edit3} />
      </div>

      {isLoading ? (
        <div className="rounded-md border border-border bg-card p-6 text-sm text-muted-foreground">
          Đang tải dữ liệu dashboard...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ContentChart data={contentChartData} />
            <CategoryChart data={categoryChartData} />
            <AccessChart data={accessChartData} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RecentActivity activities={overview?.recentActivities ?? []} />

            <div className="rounded-md border border-border bg-card shadow-sm">
              <div className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">Trạng thái hệ thống</h3>
              </div>
              <div className="divide-y divide-border">
                {systemStatuses.map((item, index) => (
                  <StatusItem
                    key={`${item.label}-${index}`}
                    label={item.label}
                    status={item.status}
                    detail={item.detail}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-card shadow-sm">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Nội dung chờ duyệt</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">
                      Tiêu đề
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">
                      Loại
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">
                      Người tạo
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pendingItems.map((item) => (
                    <PendingRow
                      key={item.id}
                      title={item.title}
                      type={item.type}
                      author={item.author}
                      date={item.date}
                      status={item.status}
                    />
                  ))}
                  {pendingItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-4 text-sm text-muted-foreground"
                      >
                        Không có dữ liệu.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatusItem({
  label,
  status,
  detail,
}: {
  label: string
  status: "active" | "warning" | "error"
  detail: string
}) {
  const statusColors = {
    active: "bg-[#2E7D32]",
    warning: "bg-[#F57C00]",
    error: "bg-destructive",
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <span className="text-sm text-muted-foreground">{detail}</span>
    </div>
  )
}

function PendingRow({
  title,
  type,
  author,
  date,
  status,
}: {
  title: string
  type: string
  author: string
  date: string
  status: "pending" | "review"
}) {
  const statusLabels = {
    pending: { label: "Chờ duyệt", className: "bg-[#F57C00]/10 text-[#F57C00]" },
    review: { label: "Đang xem xét", className: "bg-info/10 text-info" },
  }

  const s = statusLabels[status]

  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="px-4 py-3 text-sm font-medium text-foreground">{title}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{type}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{author}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{date}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${s.className}`}>{s.label}</span>
      </td>
    </tr>
  )
}
