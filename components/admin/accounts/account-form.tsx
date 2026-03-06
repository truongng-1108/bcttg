"use client"

import { useState } from "react"
import { ArrowLeft, Save, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FormField } from "../shared/form-field"
import { ConfirmDialog } from "../shared/confirm-dialog"
import type { AdminUserRole } from "@/lib/admin-account-api"

export type AccountFormStatus = "active" | "inactive"

export interface AccountFormInitialData {
  id?: string
  rank: string
  fullName: string
  username: string
  email: string
  phone: string
  unit: string
  role: AdminUserRole
  status: AccountFormStatus
}

export interface AccountFormSubmitData {
  id?: string
  rank: string
  fullName: string
  username: string
  email: string
  phone: string
  unit: string
  role: AdminUserRole
  status: AccountFormStatus
  password?: string
}

interface AccountFormProps {
  mode: "create" | "edit"
  initialData?: AccountFormInitialData
  onBack: () => void
  onSave: (data: AccountFormSubmitData) => Promise<void> | void
}

const rankOptions = [
  { value: "Binh nhì", label: "Binh nhì" },
  { value: "Binh nhất", label: "Binh nhất" },
  { value: "Hạ sĩ", label: "Hạ sĩ" },
  { value: "Trung sĩ", label: "Trung sĩ" },
  { value: "Thượng sĩ", label: "Thượng sĩ" },
  { value: "Thiếu úy", label: "Thiếu úy" },
  { value: "Trung úy", label: "Trung úy" },
  { value: "Thượng úy", label: "Thượng úy" },
  { value: "Đại úy", label: "Đại úy" },
  { value: "Thiếu tá", label: "Thiếu tá" },
  { value: "Trung tá", label: "Trung tá" },
  { value: "Thượng tá", label: "Thượng tá" },
  { value: "Đại tá", label: "Đại tá" },
]

const unitOptions = [
  { value: "Phòng Chính trị", label: "Phòng Chính trị" },
  { value: "Phòng Kỹ thuật", label: "Phòng Kỹ thuật" },
  { value: "Phòng Hậu cần", label: "Phòng Hậu cần" },
  { value: "Ban Chỉ huy", label: "Ban Chỉ huy" },
  { value: "Tiểu đoàn 1", label: "Tiểu đoàn 1" },
  { value: "Tiểu đoàn 2", label: "Tiểu đoàn 2" },
  { value: "Tiểu đoàn 3", label: "Tiểu đoàn 3" },
]

const roleOptions: { value: AdminUserRole; label: string }[] = [
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "MANAGER", label: "Quản lý" },
  { value: "USER", label: "Người dùng" },
]

const statusOptions: { value: AccountFormStatus; label: string }[] = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
]

const phonePattern = /^[0-9]{8,15}$/

export function AccountForm({ mode, initialData, onBack, onSave }: AccountFormProps) {
  const [formData, setFormData] = useState({
    id: initialData?.id ?? "",
    rank: initialData?.rank ?? "",
    fullName: initialData?.fullName ?? "",
    username: initialData?.username ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    unit: initialData?.unit ?? "",
    role: initialData?.role ?? "USER",
    status: initialData?.status ?? "active",
    password: "",
    confirmPassword: "",
  })
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {}

    if (!formData.rank) {
      newErrors.rank = "Vui lòng chọn cấp bậc"
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại"
    } else if (!phonePattern.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại phải có 8-15 chữ số"
    }
    if (!formData.unit) {
      newErrors.unit = "Vui lòng chọn đơn vị"
    }
    if (!formData.role) {
      newErrors.role = "Vui lòng chọn vai trò"
    }

    if (mode === "create") {
      if (!formData.password) {
        newErrors.password = "Vui lòng nhập mật khẩu"
      } else if (formData.password.length < 8) {
        newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự"
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
      }
    }

    setErrors(newErrors)
    return newErrors
  }

  const handleSubmit = async () => {
    const validationErrors = validateForm()

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0]
      toast.error(firstError || "Vui lòng kiểm tra lại thông tin đã nhập.")
      return
    }

    setIsSubmitting(true)
    try {
      const submitData: AccountFormSubmitData = {
        id: formData.id || undefined,
        rank: formData.rank.trim(),
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        unit: formData.unit,
        role: formData.role,
        status: formData.status,
        password: mode === "create" ? formData.password : undefined,
      }

      await onSave(submitData)
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Không thể lưu tài khoản."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9" disabled={isSubmitting}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {mode === "create" ? "Thêm tài khoản mới" : "Chỉnh sửa tài khoản"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "create"
              ? "Tạo tài khoản người dùng mới trong hệ thống"
              : "Cập nhật thông tin tài khoản người dùng"}
          </p>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Thông tin cơ bản</h2>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label="Cấp bậc"
              name="rank"
              type="select"
              required
              value={formData.rank}
              onChange={(value) => handleChange("rank", value)}
              options={rankOptions}
              error={errors.rank}
              disabled={isSubmitting}
            />
            <FormField
              label="Họ và tên"
              name="fullName"
              required
              placeholder="Nhập họ và tên đầy đủ"
              value={formData.fullName}
              onChange={(value) => handleChange("fullName", value)}
              error={errors.fullName}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label="Mã người dùng"
              name="username"
              placeholder="Nhập mã người dùng (không bắt buộc)"
              value={formData.username}
              onChange={(value) => handleChange("username", value)}
              error={errors.username}
              disabled={isSubmitting}
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="Nhập địa chỉ email"
              value={formData.email}
              onChange={(value) => handleChange("email", value)}
              error={errors.email}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label="Số điện thoại đăng nhập"
              name="phone"
              type="tel"
              required
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onChange={(value) => handleChange("phone", value)}
              error={errors.phone}
              disabled={isSubmitting}
            />
            <FormField
              label="Đơn vị"
              name="unit"
              type="select"
              required
              value={formData.unit}
              onChange={(value) => handleChange("unit", value)}
              options={unitOptions}
              error={errors.unit}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label="Vai trò"
              name="role"
              type="select"
              required
              value={formData.role}
              onChange={(value) => handleChange("role", value)}
              options={roleOptions}
              error={errors.role}
              disabled={isSubmitting}
            />
            <FormField
              label="Trạng thái"
              name="status"
              type="select"
              required
              value={formData.status}
              onChange={(value) => handleChange("status", value)}
              options={statusOptions}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {mode === "create" && (
          <>
            <div className="border-t border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Mật khẩu đăng nhập</h2>
            </div>
            <div className="space-y-6 p-6 pt-0">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  label="Mật khẩu"
                  name="password"
                  type="password"
                  required
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(value) => handleChange("password", value)}
                  error={errors.password}
                  helpText="Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số"
                  disabled={isSubmitting}
                />
                <FormField
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={(value) => handleChange("confirmPassword", value)}
                  error={errors.confirmPassword}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-6 border-t border-border bg-card px-6 py-4 shadow-lg">
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setCancelDialogOpen(true)}
            className="gap-2 bg-transparent"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
            Hủy bỏ
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Đang lưu..." : mode === "create" ? "Tạo tài khoản" : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Xác nhận hủy bỏ"
        description="Bạn có chắc chắn muốn hủy bỏ? Mọi thay đổi chưa lưu sẽ bị mất."
        confirmText="Hủy bỏ"
        cancelText="Tiếp tục chỉnh sửa"
        variant="warning"
        icon="warning"
        onConfirm={onBack}
      />
    </div>
  )
}
