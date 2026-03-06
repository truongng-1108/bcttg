"use client"

import { useCallback, useEffect, useState } from "react"
import { Download, Eye, Lock, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  deleteAdminAccount,
  getAdminAccounts,
  patchAdminAccountActive,
  type AdminAccountItem,
  type AdminUserRole,
} from "@/lib/admin-account-api"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable, type Column } from "../shared/data-table"
import { ConfirmDialog } from "../shared/confirm-dialog"
import { StatusBadge } from "../shared/status-badge"

interface AccountsContentProps {
  onCreate?: () => void
  onEdit?: (accountId: string) => Promise<void> | void
}

type RoleFilter = "all" | AdminUserRole
type StatusFilter = "all" | "active" | "inactive"

const PAGE_SIZE = 10

const sortKeyMap: Record<string, string> = {
  rank: "rankName",
  fullName: "fullName",
  username: "phone",
  unit: "unitName",
  role: "role",
  status: "isActive",
  createdAt: "createdAt",
}

export function AccountsContent({ onCreate, onEdit }: AccountsContentProps) {
  const [accounts, setAccounts] = useState<AdminAccountItem[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [sortKey, setSortKey] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<AdminAccountItem | null>(null)

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
    }, 300)

    return () => window.clearTimeout(timerId)
  }, [searchQuery])

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await getAdminAccounts({
        page: currentPage,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
        sort: sortKey,
        order: sortOrder,
        role: roleFilter === "all" ? undefined : roleFilter,
        isActive:
          statusFilter === "all" ? undefined : statusFilter === "active",
      })

      setAccounts(response.items)
      setTotalItems(response.totalElements)
    } catch (apiError) {
      const message =
        apiError instanceof Error ? apiError.message : "Không tải được danh sách tài khoản."
      setError(message)
      setAccounts([])
      setTotalItems(0)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, debouncedSearch, roleFilter, sortKey, sortOrder, statusFilter])

  useEffect(() => {
    void fetchAccounts()
  }, [fetchAccounts])

  const handleConfirmDelete = async () => {
    if (!selectedAccount) {
      return
    }

    try {
      await deleteAdminAccount(selectedAccount.id)
      toast.success("Đã xóa tài khoản.")
      setDeleteDialogOpen(false)
      setSelectedAccount(null)
      void fetchAccounts()
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : "Không xóa được tài khoản."
      setDeleteDialogOpen(false)
      toast.error(message)
    }
  }

  const handleConfirmLock = async () => {
    if (!selectedAccount) {
      return
    }

    const nextIsActive = selectedAccount.status !== "active"

    try {
      await patchAdminAccountActive(selectedAccount.id, nextIsActive)
      toast.success(nextIsActive ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.")
      setLockDialogOpen(false)
      setSelectedAccount(null)
      void fetchAccounts()
    } catch (apiError) {
      const message =
        apiError instanceof Error ? apiError.message : "Không cập nhật được trạng thái tài khoản."
      setLockDialogOpen(false)
      toast.error(message)
    }
  }

  const columns: Column<AdminAccountItem>[] = [
    {
      key: "rank",
      title: "Cấp bậc",
      sortable: true,
      width: "w-28",
    },
    {
      key: "fullName",
      title: "Họ và tên",
      sortable: true,
      render: (_, row) => <span className="font-medium">{row.fullName}</span>,
    },
    {
      key: "username",
      title: "Số điện thoại",
      sortable: true,
      render: (value) => <span className="font-mono text-xs">{String(value)}</span>,
    },
    {
      key: "unit",
      title: "Đơn vị",
      sortable: true,
    },
    {
      key: "role",
      title: "Vai trò",
      sortable: true,
      render: (value) => (
        <span className="rounded bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
          {String(value)}
        </span>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      sortable: true,
      render: (_, row) => <StatusBadge status={row.status} />,
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
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
            title="Xem chi tiết"
            onClick={() => toast.info("Chức năng xem chi tiết đang được hoàn thiện.")}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Chỉnh sửa"
            onClick={() => {
              if (!onEdit) {
                toast.info("Chức năng chỉnh sửa đang được hoàn thiện.")
                return
              }
              void onEdit(row.id)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-[#F57C00]"
            title={row.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
            onClick={() => {
              setSelectedAccount(row)
              setLockDialogOpen(true)
            }}
          >
            <Lock className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Xóa"
            onClick={() => {
              setSelectedAccount(row)
              setDeleteDialogOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Quản lý tài khoản</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dữ liệu đang lấy từ API `/api/v1/admin/users`.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => toast.info("Chức năng xuất Excel đang được hoàn thiện.")}
          >
            <Download className="h-4 w-4" />
            Xuất Excel
          </Button>
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              if (onCreate) {
                onCreate()
                return
              }
              toast.info("Chức năng thêm tài khoản đang được hoàn thiện.")
            }}
          >
            <Plus className="h-4 w-4" />
            Thêm tài khoản
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value as RoleFilter)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="ADMIN">Quản trị viên</SelectItem>
            <SelectItem value="MANAGER">Quản lý</SelectItem>
            <SelectItem value="USER">Người dùng</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as StatusFilter)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="inactive">Không hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="rounded-md border border-border bg-card p-6 text-sm text-muted-foreground">
          Đang tải dữ liệu tài khoản...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={accounts}
          searchPlaceholder="Tìm theo họ tên, số điện thoại..."
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
        title="Xác nhận xóa tài khoản"
        description={`Bạn có chắc chắn muốn xóa tài khoản của "${selectedAccount?.rank} ${selectedAccount?.fullName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa tài khoản"
        variant="danger"
        icon="delete"
        onConfirm={() => void handleConfirmDelete()}
      />

      <ConfirmDialog
        open={lockDialogOpen}
        onOpenChange={setLockDialogOpen}
        title={
          selectedAccount?.status === "active"
            ? "Xác nhận khóa tài khoản"
            : "Xác nhận mở khóa tài khoản"
        }
        description={
          selectedAccount?.status === "active"
            ? `Bạn có chắc chắn muốn khóa tài khoản của "${selectedAccount?.rank} ${selectedAccount?.fullName}"?`
            : `Bạn có chắc chắn muốn mở khóa tài khoản của "${selectedAccount?.rank} ${selectedAccount?.fullName}"?`
        }
        confirmText={selectedAccount?.status === "active" ? "Khóa tài khoản" : "Mở khóa"}
        variant="warning"
        icon="lock"
        onConfirm={() => void handleConfirmLock()}
      />
    </div>
  )
}
