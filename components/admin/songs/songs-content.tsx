"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Clock,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileAudio,
  Music,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "../shared/confirm-dialog"
import { deleteSong, getAdminSongs, patchSongVisibility, type AdminSongItem } from "@/lib/admin-api"
import { toast } from "sonner"

const PAGE_SIZE = 100

function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const remain = safeSeconds % 60
  return `${minutes}:${remain.toString().padStart(2, "0")}`
}

export function SongsContent() {
  const [songs, setSongs] = useState<AdminSongItem[]>([])
  const [totalSongs, setTotalSongs] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSong, setSelectedSong] = useState<AdminSongItem | null>(null)

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
    }, 350)

    return () => window.clearTimeout(timerId)
  }, [searchQuery])

  const fetchSongs = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getAdminSongs({
        page: 1,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
        sort: "updatedAt",
        order: "desc",
        isVisible:
          statusFilter === "all" ? undefined : statusFilter === "active",
      })

      setSongs(response.items)
      setTotalSongs(response.totalElements)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không tải được danh sách ca khúc."
      toast.error(message)
      setSongs([])
      setTotalSongs(0)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    void fetchSongs()
  }, [fetchSongs])

  const filteredSongs = useMemo(() => {
    if (categoryFilter === "all") {
      return songs
    }

    return songs.filter((song) => song.category === categoryFilter)
  }, [songs, categoryFilter])

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(songs.map((song) => song.category).filter(Boolean)))
    return uniqueCategories
  }, [songs])

  const activeSongs = songs.filter((song) => song.isVisible).length
  const totalPlays = songs.reduce((sum, song) => sum + song.plays, 0)

  const togglePlay = (id: string) => {
    setPlayingId((prev) => (prev === id ? null : id))
  }

  const handleDelete = (song: AdminSongItem) => {
    setSelectedSong(song)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedSong) {
      return
    }

    try {
      await deleteSong(selectedSong.id)
      toast.success("Đã xóa ca khúc.")
      setDeleteDialogOpen(false)
      setSelectedSong(null)
      void fetchSongs()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không xóa được ca khúc."
      toast.error(message)
      setDeleteDialogOpen(false)
    }
  }

  const handleToggleVisibility = async (song: AdminSongItem) => {
    try {
      await patchSongVisibility(song.id, !song.isVisible)
      toast.success(song.isVisible ? "Đã ẩn ca khúc." : "Đã hiển thị ca khúc.")
      setSongs((prev) =>
        prev.map((item) =>
          item.id === song.id ? { ...item, isVisible: !item.isVisible } : item,
        ),
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không cập nhật được trạng thái ca khúc."
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-md border border-primary/20 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent bg-accent/10">
            <Music className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wide text-primary">
              Quản lý ca khúc truyền thống
            </h1>
            <p className="text-sm text-muted-foreground">
              Dữ liệu lấy từ API `/api/v1/admin/songs`.
            </p>
          </div>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm ca khúc
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FileAudio className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{totalSongs}</p>
              <p className="text-xs text-muted-foreground">Tổng số ca khúc</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-accent/20">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Eye className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{activeSongs}</p>
              <p className="text-xs text-muted-foreground">Đang hiển thị</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Play className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalPlays.toLocaleString("vi-VN")}</p>
              <p className="text-xs text-muted-foreground">Lượt nghe</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên ca khúc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Thể loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thể loại</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hiển thị</SelectItem>
              <SelectItem value="hidden">Đang ẩn</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="border-border">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Đang tải dữ liệu ca khúc...
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead>Tên ca khúc</TableHead>
                <TableHead>Tác giả</TableHead>
                <TableHead className="text-center">Năm</TableHead>
                <TableHead className="text-center">Thời lượng</TableHead>
                <TableHead className="text-center">Thể loại</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center">Lượt nghe</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSongs.map((song, index) => (
                <TableRow key={song.id} className="hover:bg-muted/30">
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePlay(song.id)}
                      disabled={!song.hasAudio}
                      className={song.hasAudio ? "text-primary hover:bg-primary/10" : "text-muted-foreground"}
                    >
                      {playingId === song.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{song.title}</p>
                      <div className="mt-1 flex gap-1">
                        {song.hasAudio ? (
                          <Badge variant="outline" className="px-1.5 py-0 text-xs">
                            <FileAudio className="mr-1 h-3 w-3" />
                            Audio
                          </Badge>
                        ) : null}
                        {song.lyric ? (
                          <Badge variant="outline" className="px-1.5 py-0 text-xs">
                            Lời bài hát
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{song.composer || "-"}</TableCell>
                  <TableCell className="text-center">{song.year ?? "-"}</TableCell>
                  <TableCell className="text-center">
                    <span className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDuration(song.durationSec)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-accent/10 text-accent">
                      {song.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={song.isVisible ? "default" : "secondary"}
                      className={song.isVisible ? "bg-[#2E7D32] text-white" : "bg-muted text-muted-foreground"}
                    >
                      {song.isVisible ? "Hiển thị" : "Đang ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {song.plays.toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/10 hover:text-accent">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => void handleToggleVisibility(song)}
                      >
                        {song.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(song)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSongs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                    Không có ca khúc phù hợp.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Hiển thị {filteredSongs.length} / {totalSongs} ca khúc
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Trang trước
          </Button>
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            Trang sau
          </Button>
        </div>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Thêm ca khúc mới</DialogTitle>
            <DialogDescription>
              Màn tạo ca khúc sẽ được nối API chi tiết ở bước tiếp theo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="song-title">
                Tên ca khúc <span className="text-destructive">*</span>
              </Label>
              <Input id="song-title" placeholder="Nhập tên ca khúc" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="song-lyrics">Lời bài hát</Label>
              <Textarea id="song-lyrics" placeholder="Nhập lời bài hát..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label>File âm thanh</Label>
              <div className="flex items-center gap-4 rounded-md border border-dashed border-border p-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Kéo thả file hoặc nhấn để chọn</p>
                  <p className="text-xs text-muted-foreground">Hỗ trợ: MP3, WAV (tối đa 20MB)</p>
                </div>
                <Button variant="outline" size="sm">
                  Chọn file
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={() => {
                toast.info("Tạm thời chưa hỗ trợ tạo ca khúc từ giao diện này.")
              }}
            >
              Thêm ca khúc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xác nhận xóa ca khúc"
        description={`Bạn có chắc chắn muốn xóa ca khúc "${selectedSong?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
