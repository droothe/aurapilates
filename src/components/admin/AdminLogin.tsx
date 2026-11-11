import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";

const emailSchema = z.string().trim().email({ message: "Geçerli bir e-posta girin" }).max(255);
const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Şifre girin" }).max(72),
});
const signUpSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, { message: "Şifre en az 8 karakter olmalı" }).max(72),
});
const demoCredentials = { email: "admin@adrespilates.com", password: "123456" };

export function AdminLogin() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState(demoCredentials.email);
  const [password, setPassword] = useState(demoCredentials.password);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const parsed = (mode === "signin" ? signInSchema : signUpSchema).safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin");
      return;
    }
    setPending(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) setError(error.message === "Invalid login credentials" ? "E-posta veya şifre hatalı" : error.message);
      } else {
        const { data, error } = await supabase.auth.signUp({
          ...parsed.data,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) setError(error.message);
        else if (!data.session) setInfo("Hesabınız oluşturuldu. Giriş yapmadan önce e-postanıza gelen bağlantıyla adresinizi onaylayın.");
      }
    } catch {
      toast.error("Bir sorun oluştu, lütfen tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  async function onDemoLogin() {
    setError(null);
    setInfo(null);
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setPending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(demoCredentials);
      if (error) setError(error.message === "Invalid login credentials" ? "Demo hesabı bulunamadı veya bilgileri hatalı" : error.message);
    } catch {
      toast.error("Bir sorun oluştu, lütfen tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mx-auto mb-8 flex w-fit"><Logo /></Link>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <p className="eyebrow">Yönetim Paneli</p>
          <h1 className="mt-3 text-3xl text-foreground">{mode === "signin" ? "Giriş yapın" : "Yönetici hesabı oluşturun"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Başvuruları ve eğitim takvimini yönetmek için giriş yapın."
              : "Oluşturulan ilk hesap otomatik olarak yönetici olur."}
          </p>
          <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            {error && <p className="rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary">{error}</p>}
            {info && <p className="rounded-xl bg-sage-soft px-4 py-3 text-sm text-sage">{info}</p>}
            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              {mode === "signin" ? "Giriş Yap" : "Hesap Oluştur"}
            </Button>
          </form>
          {mode === "signin" && (
            <Button type="button" variant="soft" size="xl" className="mt-3 w-full" onClick={onDemoLogin} disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              Hızlı Demo Girişi
            </Button>
          )}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-primary"
          >
            {mode === "signin" ? "Henüz hesabınız yok mu? Hesap oluşturun" : "Zaten hesabınız var mı? Giriş yapın"}
          </button>
        </div>
      </div>
    </div>
  );
}
