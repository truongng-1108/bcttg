"use client"

import { useState } from "react"
import type { ChangeEvent } from "react"
import { ArrowLeft, ImageIcon, Save, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FormField } from "../shared/form-field"
import { ConfirmDialog } from "../shared/confirm-dialog"

export type ProfileFormType = "thu-truong" | "chien-si" | "anh-hung"
export type ProfilePublishStatus = "draft" | "pending" | "published" | "hidden"

export interface ProfileFormData {
  rank: string
  fullName: string
  birthDate: string
  birthPlace: string
  joinDate: string
  position: string
  unit: string
  achievements: string
  biography: string
  status: ProfilePublishStatus
}

interface ProfileFormProps {
  mode: "create" | "edit"
  profileType: ProfileFormType
  initialData?: ProfileFormData
  onBack: () => void
  onSave: (data: ProfileFormData) => Promise<void> | void
}

const profileTypeLabels: Record<ProfileFormType, string> = {
  "thu-truong": "Thủ trưởng",
  "chien-si": "Chiến sĩ",
  "anh-hung": "Anh hùng",
}

const rankOptions = [
  { value: "binh-nhi", label: "Binh nhì" },
  { value: "binh-nhat", label: "Binh nhất" },
  { value: "ha-si", label: "Hạ sĩ" },
  { value: "trung-si", label: "Trung sĩ" },
  { value: "thuong-si", label: "Thượng sĩ" },
  { value: "thieu-uy", label: "Thiếu úy" },
  { value: "trung-uy", label: "Trung úy" },
  { value: "thuong-uy", label: "Thượng úy" },
  { value: "dai-uy", label: "Đại úy" },
  { value: "thieu-ta", label: "Thiếu tá" },
  { value: "trung-ta", label: "Trung tá" },
  { value: "thuong-ta", label: "Thượng tá" },
  { value: "dai-ta", label: "Đại tá" },
  { value: "thieu-tuong", label: "Thiếu tướng" },
  { value: "trung-tuong", label: "Trung tướng" },
  { value: "thuong-tuong", label: "Thượng tướng" },
  { value: "dai-tuong", label: "Đại tướng" },
]

const unitOptions = [
  { value: "phong-chinh-tri", label: "Phòng Chính trị" },
  { value: "phong-ky-thuat", label: "Phòng Kỹ thuật" },
  { value: "phong-hau-can", label: "Phòng Hậu cần" },
  { value: "ban-chi-huy", label: "Ban Chỉ huy" },
  { value: "tieu-doan-1", label: "Tiểu đoàn 1" },
  { value: "tieu-doan-2", label: "Tiểu đoàn 2" },
  { value: "tieu-doan-3", label: "Tiểu đoàn 3" },
  { value: "lien-doan-1", label: "Liên đoàn 1" },
  { value: "lien-doan-2", label: "Liên đoàn 2" },
]

const publishStatusOptions: { value: ProfilePublishStatus; label: string }[] = [
  { value: "draft", label: "Bản nháp" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "published", label: "Đã xuất bản" },
  { value: "hidden", label: "Đã ẩn" },
]

export function ProfileForm({
  mode,
  profileType,
  initialData,
  onBack,
  onSave,
}: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    rank: initialData?.rank ?? "",
    fullName: initialData?.fullName ?? "",
    birthDate: initialData?.birthDate ?? "",
    birthPlace: initialData?.birthPlace ?? "",
    joinDate: initialData?.joinDate ?? "",
    position: initialData?.position ?? "",
    unit: initialData?.unit ?? "",
    achievements: initialData?.achievements ?? "",
    biography: initialData?.biography ?? "",
    status: initialData?.status ?? "draft",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: keyof ProfileFormData, value: string) => {
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
    if (!formData.birthDate.trim()) {
      newErrors.birthDate = "Vui lòng nhập ngày sinh"
    }
    if (!formData.unit) {
      newErrors.unit = "Vui lòng chọn đơn vị"
    }

    setErrors(newErrors)
    return newErrors
  }

  const handleSubmit = async () => {
    const validationErrors = validateForm()

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0]
      toast.error(firstError || "Vui lòng kiểm tra lại thông tin hồ sơ.")
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(formData)
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Không thể lưu hồ sơ."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      const image = loadEvent.target?.result
      if (typeof image === "string") {
        setPreviewImage(image)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {mode === "create"
              ? `Thêm hồ sơ ${profileTypeLabels[profileType]}`
              : `Chỉnh sửa hồ sơ ${profileTypeLabels[profileType]}`}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "create"
              ? "Tạo hồ sơ mới trong danh mục dữ liệu"
              : "Cập nhật thông tin hồ sơ"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
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
                />
                <FormField
                  label="Họ và tên"
                  name="fullName"
                  required
                  placeholder="Nhập họ và tên đầy đủ"
                  value={formData.fullName}
                  onChange={(value) => handleChange("fullName", value)}
                  error={errors.fullName}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  label="Ngày sinh"
                  name="birthDate"
                  required
                  placeholder="DD/MM/YYYY"
                  value={formData.birthDate}
                  onChange={(value) => handleChange("birthDate", value)}
                  error={errors.birthDate}
                />
                <FormField
                  label="Quê quán"
                  name="birthPlace"
                  placeholder="Nhập quê quán"
                  value={formData.birthPlace}
                  onChange={(value) => handleChange("birthPlace", value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  label="Ngày nhập ngũ"
                  name="joinDate"
                  placeholder="DD/MM/YYYY"
                  value={formData.joinDate}
                  onChange={(value) => handleChange("joinDate", value)}
                />
                <FormField
                  label="Chức vụ"
                  name="position"
                  placeholder="Nhập chức vụ"
                  value={formData.position}
                  onChange={(value) => handleChange("position", value)}
                />
              </div>

              <FormField
                label="Đơn vị"
                name="unit"
                type="select"
                required
                value={formData.unit}
                onChange={(value) => handleChange("unit", value)}
                options={unitOptions}
                error={errors.unit}
              />
            </div>
          </div>

          <div className="rounded-md border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Tiểu sử và thành tích</h2>
            </div>

            <div className="space-y-6 p-6">
              <FormField
                label="Thành tích nổi bật"
                name="achievements"
                type="textarea"
                placeholder="Nhập các thành tích nổi bật..."
                value={formData.achievements}
                onChange={(value) => handleChange("achievements", value)}
                rows={4}
              />
              <FormField
                label="Tiểu sử"
                name="biography"
                type="textarea"
                placeholder="Nhập tiểu sử chi tiết..."
                value={formData.biography}
                onChange={(value) => handleChange("biography", value)}
                rows={8}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-md border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Ảnh chân dung</h2>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-48 w-36 items-center justify-center overflow-hidden rounded border border-border bg-muted">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Ảnh xem trước"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <span className="inline-flex items-center gap-2 rounded border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                    <Upload className="h-4 w-4" />
                    Tải ảnh lên
                  </span>
                </label>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Định dạng: JPG, PNG
                  <br />
                  Kích thước tối đa: 2MB
                  <br />
                  Tỷ lệ: 3:4
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Trạng thái xuất bản</h2>
            </div>

            <div className="p-6">
              <FormField
                label="Trạng thái"
                name="status"
                type="select"
                value={formData.status}
                onChange={(value) =>
                  handleChange("status", value as ProfilePublishStatus)
                }
                options={publishStatusOptions}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-6 border-t border-border bg-card px-6 py-4 shadow-lg">
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setCancelDialogOpen(true)}
            className="gap-2"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
            Hủy bỏ
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent" disabled={isSubmitting}>
            Lưu bản nháp
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4" />
            {isSubmitting
              ? "Đang lưu..."
              : mode === "create"
                ? "Tạo hồ sơ"
                : "Lưu thay đổi"}
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
