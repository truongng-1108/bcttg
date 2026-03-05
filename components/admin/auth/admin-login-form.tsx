"use client"

import { useState } from "react"
import { Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AdminLoginCredentials } from "@/lib/auth"
import { toast } from "sonner"

interface AdminLoginFormProps {
  onLogin: (credentials: AdminLoginCredentials) => Promise<void>
}

export function AdminLoginForm({ onLogin }: AdminLoginFormProps) {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!phone.trim() || !password) {
      toast.error("Vui lòng nhập đầy đủ số điện thoại và mật khẩu.")
      return
    }

    setIsSubmitting(true)
    try {
      await onLogin({
        phone: phone.trim(),
        password,
      })
    } catch (loginError) {
      const errorMessage = loginError instanceof Error
        ? loginError.message
        : "Đăng nhập thất bại, vui lòng thử lại."
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Đăng nhập quản trị</CardTitle>
          <CardDescription>
            Sử dụng tài khoản admin để truy cập trang quản lý.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="0900000001"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            Tài khoản seed: 0900000001 / Admin@2026
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
