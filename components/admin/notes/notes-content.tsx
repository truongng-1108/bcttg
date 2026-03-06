"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Clock,
  Edit,
  Filter,
  Plus,
  Search,
  Star,
  StarOff,
  StickyNote,
  Tag,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "../shared/confirm-dialog"
import {
  createPersonalNote,
  deletePersonalNote,
  getPersonalNotes,
  patchPersonalNotePin,
  updatePersonalNote,
  type PersonalNoteItem,
} from "@/lib/admin-api"
import { toast } from "sonner"

const categoryColorMap: Record<string, string> = {
  "Công việc": "#BFDBFE",
  "Duyệt nội dung": "#FDE68A",
  "Hệ thống": "#DDD6FE",
  "Liên hệ": "#BBF7D0",
  "Phản hồi": "#FED7AA",
}

const categoryStyles: Record<string, string> = {
  "Công việc": "bg-primary/10 text-primary border-primary/20",
  "Duyệt nội dung": "bg-accent/10 text-accent border-accent/20",
  "Hệ thống": "bg-[#1565C0]/10 text-[#1565C0] border-[#1565C0]/20",
  "Liên hệ": "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20",
  "Phản hồi": "bg-[#F57C00]/10 text-[#F57C00] border-[#F57C00]/20",
}

interface NoteViewModel {
  id: string
  title: string
  content: string
  category: string
  colorCode: string
  starred: boolean
  createdAt: string
  updatedAt: string
}

function getCategoryFromColor(colorCode: string): string {
  const normalized = colorCode.trim().toUpperCase()
  const entry = Object.entries(categoryColorMap).find(
    ([, value]) => value.trim().toUpperCase() === normalized,
  )
  return entry ? entry[0] : "Công việc"
}

function toViewModel(note: PersonalNoteItem): NoteViewModel {
  const category = getCategoryFromColor(note.colorCode)
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    category,
    colorCode: note.colorCode,
    starred: note.isPinned,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }
}

const defaultCategory = "Công việc"

export function NotesContent() {
  const [notes, setNotes] = useState<NoteViewModel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [starredFilter, setStarredFilter] = useState("all")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<NoteViewModel | null>(null)
  const [newNote, setNewNote] = useState({ title: "", content: "", category: defaultCategory })
  const [editNote, setEditNote] = useState({ title: "", content: "", category: defaultCategory })

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
    }, 350)

    return () => window.clearTimeout(timerId)
  }, [searchQuery])

  const fetchNotes = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getPersonalNotes({
        page: 1,
        pageSize: 100,
        search: debouncedSearch || undefined,
        isArchived: false,
      })

      setNotes(response.items.map(toViewModel))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không tải được danh sách ghi chú."
      toast.error(message)
      setNotes([])
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    void fetchNotes()
  }, [fetchNotes])

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || note.category === categoryFilter
      const matchesStarred =
        starredFilter === "all" ||
        (starredFilter === "starred" && note.starred) ||
        (starredFilter === "unstarred" && !note.starred)
      return matchesSearch && matchesCategory && matchesStarred
    })
  }, [notes, searchQuery, categoryFilter, starredFilter])

  const toggleStar = async (note: NoteViewModel) => {
    const nextValue = !note.starred
    setNotes((prev) => prev.map((item) => (item.id === note.id ? { ...item, starred: nextValue } : item)))
    try {
      await patchPersonalNotePin(note.id, nextValue)
    } catch (error) {
      setNotes((prev) => prev.map((item) => (item.id === note.id ? { ...item, starred: note.starred } : item)))
      const message = error instanceof Error ? error.message : "Không cập nhật được trạng thái ghim."
      toast.error(message)
    }
  }

  const handleEdit = (note: NoteViewModel) => {
    setSelectedNote(note)
    setEditNote({
      title: note.title,
      content: note.content,
      category: note.category,
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (note: NoteViewModel) => {
    setSelectedNote(note)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedNote) {
      return
    }

    try {
      await deletePersonalNote(selectedNote.id)
      toast.success("Đã xóa ghi chú.")
      setDeleteDialogOpen(false)
      setSelectedNote(null)
      void fetchNotes()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không xóa được ghi chú."
      toast.error(message)
      setDeleteDialogOpen(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung ghi chú.")
      return
    }

    try {
      await createPersonalNote({
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        colorCode: categoryColorMap[newNote.category] ?? categoryColorMap[defaultCategory],
        isPinned: false,
      })

      toast.success("Đã thêm ghi chú mới.")
      setNewNote({ title: "", content: "", category: defaultCategory })
      setAddDialogOpen(false)
      void fetchNotes()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không tạo được ghi chú."
      toast.error(message)
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedNote) {
      return
    }

    if (!editNote.title.trim() || !editNote.content.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung ghi chú.")
      return
    }

    try {
      await updatePersonalNote(selectedNote.id, {
        title: editNote.title.trim(),
        content: editNote.content.trim(),
        colorCode: categoryColorMap[editNote.category] ?? categoryColorMap[defaultCategory],
        isPinned: selectedNote.starred,
      })

      toast.success("Đã cập nhật ghi chú.")
      setEditDialogOpen(false)
      setSelectedNote(null)
      void fetchNotes()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không cập nhật được ghi chú."
      toast.error(message)
    }
  }

  const starredCount = notes.filter((note) => note.starred).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-md border border-primary/20 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent bg-accent/10">
            <StickyNote className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wide text-primary">Ghi chú cá nhân</h1>
            <p className="text-sm text-muted-foreground">
              Dữ liệu lấy từ API `/api/v1/notes`.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-accent" fill="currentColor" />
            <span className="font-medium">{starredCount} ghi chú quan trọng</span>
          </div>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm ghi chú
          </Button>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm ghi chú..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44">
              <Tag className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {Object.keys(categoryColorMap).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={starredFilter} onValueChange={setStarredFilter}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Lọc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="starred">Quan trọng</SelectItem>
              <SelectItem value="unstarred">Thông thường</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="border-border">
          <CardContent className="p-6 text-sm text-muted-foreground">Đang tải ghi chú...</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className={`transition-all hover:shadow-md ${note.starred ? "border-accent/50 bg-accent/5" : "border-border"}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge
                      variant="outline"
                      className={`mb-2 text-xs ${categoryStyles[note.category] || ""}`}
                    >
                      {note.category}
                    </Badge>
                    <CardTitle className="line-clamp-2 text-base font-semibold text-foreground">
                      {note.title}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void toggleStar(note)}
                    className="h-8 w-8 shrink-0"
                  >
                    {note.starred ? (
                      <Star className="h-4 w-4 text-accent" fill="currentColor" />
                    ) : (
                      <StarOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">
                  {note.content}
                </p>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {note.updatedAt}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-accent/10 hover:text-accent"
                      onClick={() => handleEdit(note)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(note)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredNotes.length === 0 && !isLoading ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <StickyNote className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">Không tìm thấy ghi chú nào</p>
            <p className="text-sm text-muted-foreground">
              Thử thay đổi bộ lọc hoặc tạo ghi chú mới
            </p>
            <Button
              className="mt-4 bg-primary text-primary-foreground"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo ghi chú mới
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Thêm ghi chú mới</DialogTitle>
            <DialogDescription>Tạo ghi chú công việc cá nhân</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">
                Tiêu đề <span className="text-destructive">*</span>
              </Label>
              <Input
                id="note-title"
                placeholder="Nhập tiêu đề ghi chú"
                value={newNote.title}
                onChange={(e) => setNewNote((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-category">Danh mục</Label>
              <Select
                value={newNote.category}
                onValueChange={(value) => setNewNote((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="note-category">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(categoryColorMap).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-content">
                Nội dung <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="note-content"
                placeholder="Nhập nội dung ghi chú..."
                rows={6}
                value={newNote.content}
                onChange={(e) => setNewNote((prev) => ({ ...prev, content: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button className="bg-primary text-primary-foreground" onClick={() => void handleAddNote()}>
              Thêm ghi chú
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Chỉnh sửa ghi chú</DialogTitle>
            <DialogDescription>Cập nhật nội dung ghi chú</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-note-title">Tiêu đề</Label>
              <Input
                id="edit-note-title"
                value={editNote.title}
                onChange={(e) => setEditNote((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-note-category">Danh mục</Label>
              <Select
                value={editNote.category}
                onValueChange={(value) => setEditNote((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="edit-note-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(categoryColorMap).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-note-content">Nội dung</Label>
              <Textarea
                id="edit-note-content"
                value={editNote.content}
                rows={6}
                onChange={(e) => setEditNote((prev) => ({ ...prev, content: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button className="bg-primary text-primary-foreground" onClick={() => void handleSaveEdit()}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xác nhận xóa ghi chú"
        description={`Bạn có chắc chắn muốn xóa ghi chú "${selectedNote?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
