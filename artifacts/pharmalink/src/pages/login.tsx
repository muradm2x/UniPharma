import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { useLocation, Link } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import GoogleLoginButton from "@/components/GoogleLoginButton";

const loginSchema = z.object({
  identifier: z.string().min(3, "أدخل إيميل أو رقم هاتف"),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
});
type LoginForm = z.infer<typeof loginSchema>;

async function readJsonOrThrow(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    const hint = res.status === 404
      ? "الـ API غير متاح. تأكد إن السيرفر شغال على 8080 أو اضبط API_URL."
      : "رد غير متوقع من السيرفر.";
    throw new Error(`${hint} (HTTP ${res.status})`);
  }
}

export default function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState<"phone" | "email">("phone");

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await readJsonOrThrow(res);
      if (!res.ok) throw new Error(data.error ?? "حدث خطأ");
      login(data.token, data.user);
      if (data.user.role === "candidate") setLocation("/candidate/dashboard");
      else if (data.user.role === "employer") setLocation("/employer/dashboard");
      else setLocation("/admin/dashboard");
    } catch (err: any) {
      toast({ title: "خطأ في تسجيل الدخول", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSuccess = useCallback(async (credential: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await readJsonOrThrow(res);
      if (res.status === 422 && data.error === "ROLE_REQUIRED") {
        // New google user — redirect to register with pre-filled data
        sessionStorage.setItem("google_pending", JSON.stringify({ credential, ...data }));
        setLocation("/register?google=1");
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "حدث خطأ");
      login(data.token, data.user);
      if (data.user.role === "candidate") setLocation("/candidate/dashboard");
      else if (data.user.role === "employer") setLocation("/employer/dashboard");
      else setLocation("/admin/dashboard");
    } catch (err: any) {
      toast({ title: "خطأ في الدخول بجوجل", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [login, setLocation, toast]);

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Branding panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(222,47%,11%) 0%, hsl(217,70%,22%) 50%, hsl(199,89%,30%) 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 70%, hsl(217,91%,70%) 0%, transparent 50%)" }} />
        <div className="relative text-center text-white">
          <h1 className="text-5xl font-black mb-4 tracking-tight">UniPharma</h1>
          <p className="text-xl text-white/70 font-medium">منصة التوظيف الصيدلي</p>
          <p className="text-white/50 mt-2">الأولى في مصر</p>
          <div className="mt-10 space-y-3 text-right">
            {["آلاف الصيادلة والكوادر الصيدلية", "مئات الصيدليات الموثّقة", "توظيف سريع وآمن"].map((t, i) => (
              <div key={i} className="flex items-center gap-3 text-white/70">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight"
              style={{ background: "linear-gradient(135deg, hsl(217,91%,45%), hsl(199,89%,48%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              UniPharma
            </h1>
          </div>

          <Card className="shadow-lg border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
              <CardDescription>أدخل بياناتك للوصول إلى حسابك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Google login */}
              <GoogleLoginButton onSuccess={handleGoogleSuccess} disabled={loading} />

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">أو</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Phone / Email toggle */}
              <div className="flex rounded-xl border border-border bg-muted/40 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => { setInputMode("phone"); form.setValue("identifier", ""); }}
                  className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                    inputMode === "phone" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  <Phone className="w-4 h-4" /> رقم التلفون
                </button>
                <button
                  type="button"
                  onClick={() => { setInputMode("email"); form.setValue("identifier", ""); }}
                  className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                    inputMode === "email" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  <Mail className="w-4 h-4" /> الإيميل
                </button>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="identifier" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        {inputMode === "phone" ? "رقم الهاتف" : "البريد الإلكتروني"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={inputMode === "phone" ? "tel" : "email"}
                          placeholder={inputMode === "phone" ? "010xxxxxxxx" : "example@email.com"}
                          className="h-11"
                          data-testid="input-identifier"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input type="password" placeholder="••••••••" className="h-11 pr-9" data-testid="input-password" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md" disabled={loading} data-testid="button-submit">
                    {loading ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري الدخول...</> : "تسجيل الدخول"}
                  </Button>
                </form>
              </Form>

              <div className="text-center text-sm text-muted-foreground">
                ليس لديك حساب؟{" "}
                <Link href="/register" className="text-primary font-semibold hover:underline" data-testid="link-register">
                  سجّل الآن
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
