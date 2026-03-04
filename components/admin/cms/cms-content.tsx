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
        apiError instanceof Error ? apiError.message : "Khong tai duoc danh sach bai viet."
      setError(message)
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
        apiError instanceof Error ? apiError.message : "Khong cap nhat duoc trang thai hien thi."
      setError(message)
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
        apiError instanceof Error ? apiError.message : "Khong xoa duoc bai viet."
      setError(message)
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
      title: "Tieu de",
      sortable: true,
      render: (_, row) => (
        <div className="max-w-md">
          <span className="line-clamp-2 font-medium">{row.title}</span>
        </div>
      ),
    },
    {
      key: "category",
      title: "Danh muc",
      sortable: true,
      render: (value) => (
        <span className="rounded bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
          {String(value)}
        </span>
      ),
    },
    {
      key: "author",
      title: "Tac gia",
      sortable: true,
    },
    {
      key: "views",
      title: "Luot xem",
      sortable: true,
      render: (value) => <span className="text-muted-foreground">{Number(value).toLocaleString("vi-VN")}</span>,
    },
    {
      key: "status",
      title: "Trang thai",
      render: (value) => <StatusBadge status={value as StatusType} />,
    },
    {
      key: "visibility",
      title: "Hien thi",
      render: (_, row) => (
        <Switch checked={row.isVisible} onCheckedChange={() => void handleToggleVisibility(row)} />
      ),
    },
    {
      key: "updatedAt",
      title: "Cap nhat",
      sortable: true,
    },
    {
      key: "actions",
      title: "Thao tac",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Xem truoc"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Chinh sua"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-[#F57C00]"
            title={row.isVisible ? "An" : "Hien"}
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
            title="Xoa"
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
          <h1 className="text-xl font-bold text-foreground">Quan ly noi dung CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Du lieu dang lay tu API admin/content-items.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Xuat Excel
          </Button>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Them bai viet
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
          <p className="text-sm text-muted-foreground">Tong bai viet</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{totalItems.toLocaleString("vi-VN")}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Dang hien thi (trang nay)</p>
          <p className="mt-1 text-2xl font-bold text-[#2E7D32]">{activeCountInPage}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Dang an (trang nay)</p>
          <p className="mt-1 text-2xl font-bold text-muted-foreground">{hiddenCountInPage}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Dang tai trang</p>
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
            <SelectValue placeholder="Loc hien thi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tat ca trang thai</SelectItem>
            <SelectItem value="visible">Chi hien thi</SelectItem>
            <SelectItem value="hidden">Chi dang an</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="rounded-md border border-border bg-card p-6 text-sm text-muted-foreground">
          Dang tai du lieu...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={contentData}
          searchPlaceholder="Tim theo tieu de, tac gia..."
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
        title="Xac nhan xoa bai viet"
        description={`Ban co chac chan muon xoa bai viet "${selectedItem?.title}"?`}
        confirmText="Xoa bai viet"
        variant="danger"
        icon="delete"
        onConfirm={() => void handleConfirmDelete()}
      />

      <ConfirmDialog
        open={hideDialogOpen}
        onOpenChange={setHideDialogOpen}
        title={selectedItem?.isVisible ? "Xac nhan an bai viet" : "Xac nhan hien bai viet"}
        description={
          selectedItem?.isVisible
            ? `Ban co chac chan muon an bai viet "${selectedItem?.title}"?`
            : `Ban co chac chan muon hien lai bai viet "${selectedItem?.title}"?`
        }
        confirmText={selectedItem?.isVisible ? "An bai viet" : "Hien bai viet"}
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
