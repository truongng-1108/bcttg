"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Download, Eye, EyeOff, GripVertical, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type Column } from "../shared/data-table"
import { ConfirmDialog } from "../shared/confirm-dialog"
import { StatusBadge, type StatusType } from "../shared/status-badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  deleteContentItem,
  getAdminContentItems,
  patchContentVisibility,
} from "@/lib/admin-api"
import { toast } from "sonner"

interface CMSItem {
  id: string
  title: string
  category: string
  author: string
  status: StatusType
  views: number
  updatedAt: string
  order: number
  isVisible: boolean
}

type VisibilityFilter = "all" | "visible" | "hidden"

const PAGE_SIZE = 10

const sortKeyMap: Record<string, string> = {
  order: "sortOrder",
  title: "title",
  category: "categoryName",
  author: "createdByName",
  views: "viewCount",
  updatedAt: "updatedAt",
}

export function CMSContent() {
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [hideDialogOpen, setHideDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CMSItem | null>(null)
  const [contentData, setContentData] = useState<CMSItem[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sortKey, setSortKey] = useState("updatedAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all")

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
    }, 300)

    return () => window.clearTimeout(timerId)
  }, [searchQuery])

  const fetchContentItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await getAdminContentItems({
        page: currentPage,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
        sort: sortKey,
        order: sortOrder,
        isVisible:
          visibilityFilter === "all" ? undefined : visibilityFilter === "visible",
      })

      setContentData(
        response.items.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          author: item.author,
          status: item.isVisible ? "active" : "hidden",
          views: item.views,
          updatedAt: item.updatedAt,
          order: item.order,
          isVisible: item.isVisible,
        })),
      )
      setTotalItems(response.totalElements)
    } catch (apiError) {
      const message =
        apiError instanceof Error ? apiError.message : "Không tải được danh sách bài viết."
      setError(message)
      toast.error(message)
      setContentData([])
      setTotalItems(0)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, debouncedSearch, sortKey, sortOrder, visibilityFilter])

  useEffect(() => {
    void fetchContentItems()
  }, [fetchContentItems])

  const handleToggleVisibility = async (item: CMSItem) => {
    try {
      await patchContentVisibility(item.id, !item.isVisible)
      setContentData((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? { ...row, isVisible: !item.isVisible, status: !item.isVisible ? "active" : "hidden" }
            : row,
        ),
      )
    } catch (apiError) {
      const message =
        apiError instanceof Error ? apiError.message : "Không cập nhật được trạng thái hiển thị."
      setError(message)
      toast.error(message)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedItem) {
      return
    }

    try {
      await deleteContentItem(selectedItem.id)
      setDeleteDialogOpen(false)
      setSelectedItem(null)
      void fetchContentItems()
    } catch (apiError) {
      const message =
        apiError instanceof Error ? apiError.message : "Không xóa được bài viết."
      setError(message)
      toast.error(message)
      setDeleteDialogOpen(false)
    }
  }

  const columns: Column<CMSItem>[] = [
    {
      key: "order",
      title: "",
      width: "w-10",
      render: () => <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />,
    },
    {
      key: "title",
      title: "Tiêu đề",
      sortable: true,
      render: (_, row) => (
        <div className="max-w-md">
          <span className="line-clamp-2 font-medium">{row.title}</span>
        </div>
      ),
    },
    {
      key: "category",
      title: "Danh mục",
      sortable: true,
      render: (value) => (
        <span className="rounded bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
          {String(value)}
        </span>
      ),
    },
    {
      key: "author",
      title: "Tác giả",
      sortable: true,
    },
    {
      key: "views",
      title: "Lượt xem",
      sortable: true,
      render: (value) => <span className="text-muted-foreground">{Number(value).toLocaleString("vi-VN")}</span>,
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (value) => <StatusBadge status={value as StatusType} />,
    },
    {
      key: "visibility",
      title: "Hiển thị",
      render: (_, row) => (
        <Switch checked={row.isVisible} onCheckedChange={() => void handleToggleVisibility(row)} />
      ),
    },
    {
      key: "updatedAt",
      title: "Cập nhật",
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Xem trước"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Chỉnh sửa"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-[#F57C00]"
            title={row.isVisible ? "Ẩn" : "Hiện"}
            onClick={() => {
              setSelectedItem(row)
              setHideDialogOpen(true)
            }}
          >
            {row.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Xóa"
            onClick={() => {
              setSelectedItem(row)
              setDeleteDialogOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const activeCountInPage = useMemo(
    () => contentData.filter((item) => item.status === "active").length,
    [contentData],
  )
  const hiddenCountInPage = useMemo(
    () => contentData.filter((item) => item.status === "hidden").length,
    [contentData],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Quản lý nội dung CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dữ liệu đang lấy từ API admin/content-items.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Xuất Excel
          </Button>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Thêm bài viết
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Tổng bài viết</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{totalItems.toLocaleString("vi-VN")}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Đang hiển thị (trang này)</p>
          <p className="mt-1 text-2xl font-bold text-[#2E7D32]">{activeCountInPage}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Đang ẩn (trang này)</p>
          <p className="mt-1 text-2xl font-bold text-muted-foreground">{hiddenCountInPage}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Đang tải trang</p>
          <p className="mt-1 text-2xl font-bold text-[#F57C00]">{contentData.length}</p>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Select
          value={visibilityFilter}
          onValueChange={(value) => {
            setVisibilityFilter(value as VisibilityFilter)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Lọc hiển thị" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="visible">Chỉ hiển thị</SelectItem>
            <SelectItem value="hidden">Chỉ đang ẩn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="rounded-md border border-border bg-card p-6 text-sm text-muted-foreground">
          Đang tải dữ liệu...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={contentData}
          searchPlaceholder="Tìm theo tiêu đề, tác giả..."
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          onSearch={(value) => {
            setSearchQuery(value)
            setCurrentPage(1)
          }}
          onSort={(columnKey, direction) => {
            setSortKey(sortKeyMap[columnKey] ?? columnKey)
            setSortOrder(direction)
            setCurrentPage(1)
          }}
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xác nhận xóa bài viết"
        description={`Bạn có chắc chắn muốn xóa bài viết "${selectedItem?.title}"?`}
        confirmText="Xóa bài viết"
        variant="danger"
        icon="delete"
        onConfirm={() => void handleConfirmDelete()}
      />

      <ConfirmDialog
        open={hideDialogOpen}
        onOpenChange={setHideDialogOpen}
        title={selectedItem?.isVisible ? "Xác nhận ẩn bài viết" : "Xác nhận hiện bài viết"}
        description={
          selectedItem?.isVisible
            ? `Bạn có chắc chắn muốn ẩn bài viết "${selectedItem?.title}"?`
            : `Bạn có chắc chắn muốn hiện lại bài viết "${selectedItem?.title}"?`
        }
        confirmText={selectedItem?.isVisible ? "Ẩn bài viết" : "Hiện bài viết"}
        variant="warning"
        icon="hide"
        onConfirm={() => {
          if (selectedItem) {
            void handleToggleVisibility(selectedItem)
          }
          setHideDialogOpen(false)
        }}
      />
    </div>
  )
}
