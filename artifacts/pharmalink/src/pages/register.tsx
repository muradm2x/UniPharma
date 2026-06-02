import { useState, useEffect, useCallback } from "react";
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
import { Loader2, User, Building2, ChevronLeft, Phone, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import GoogleLoginButton from "@/components/GoogleLoginButton";

type AuthMethod = "phone" | "email";

const phoneSchema = z.object({
  fullName: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().min(10, "رقم الهاتف غير صحيح"),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
  confirmPassword: z.string(),
}).refine(v => v.password === v.confirmPassword, { message: "كلمتا المرور غير متطابقتين", path: ["confirmPassword"] });

const emailSchema = z.object({
  fullName: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صحيح"),
  phone: z.string().optional(),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
  confirmPassword: z.string(),
}).refine(v => v.password === v.confirmPassword, { message: "كلمتا المرور غير متطابقتين", path: ["confirmPassword"] });

type PhoneForm = z.infer<typeof phoneSchema>;
type EmailForm = z.infer<typeof emailSchema>;

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

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [method, setMethod] = useState<AuthMethod>("phone");
  const [loading, setLoading] = useState(false);
  const [googlePending, setGooglePending] = useState<{ credential: string; email?: string; fullName?: string } | null>(null);

  const { login } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (location.includes("google=1")) {
      const pending = sessionStorage.getItem("google_pending");
      if (pending) {
        try { setGooglePending(JSON.parse(pending)); } catch {}
      }
    }
  }, [location]);

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { fullName: "", phone: "", password: "", confirmPassword: "" },
  });
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  async function doRegister(body: Record<string, any>) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, role }),
      });
      const data = await readJsonOrThrow(res);
      if (!res.ok) throw new Error(data.error ?? "حدث خطأ في التسجيل");
      login(data.token, data.user);
      setLocation(data.user.role === "candidate" ? "/candidate/dashboard" : "/employer/dashboard");
    } catch (err: any) {
      toast({ title: "خطأ في التسجيل", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function finishGoogleRegister() {
    if (!googlePending) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: googlePending.credential, role }),
      });
      const data = await readJsonOrThrow(res);
      if (!res.ok) throw new Error(data.error ?? "حدث خطأ");
      sessionStorage.removeItem("google_pending");
      login(data.token, data.user);
      setLocation(data.user.role === "candidate" ? "/candidate/dashboard" : "/employer/dashboard");
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
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
        setGooglePending({ credential, email: data.email, fullName: data.fullName });
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "حدث خطأ");
      login(data.token, data.user);
      setLocation(data.user.role === "candidate" ? "/candidate/dashboard" : "/employer/dashboard");
    } catch (err: any) {
      toast({ title: "خطأ في التسجيل بجوجل", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [login, setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <h1 className="text-3xl font-black tracking-tight"
            style={{ background: "linear-gradient(135deg, hsl(217,91%,45%), hsl(199,89%,48%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            UniPharma
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">منصة التوظيف الصيدلي</p>
        </div>

        <Card className="shadow-lg border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold">إنشاء حساب جديد</CardTitle>
            <CardDescription>
              {step === 1 ? (googlePending ? "اختر نوع حسابك لإتمام التسجيل" : "اختر نوع حسابك") : "أدخل بياناتك للتسجيل"}
            </CardDescription>
            <div className="flex gap-1.5 mt-3">
              {[1, googlePending ? null : 2].filter(Boolean).map((s, i) => (
                <div key={i} className={cn("flex-1 h-1.5 rounded-full transition-all", step >= (s as number) ? "bg-primary" : "bg-muted")} />
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* ── Step 1: Role selection ── */}
            {step === 1 && (
              <div className="space-y-3">
                {googlePending && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700">
                    مرحباً <strong>{googlePending.fullName}</strong>! اختر نوع حسابك لإتمام التسجيل.
                  </div>
                )}

                {[
                  { value: "candidate", icon: <User className="w-6 h-6" />, title: "أبحث عن عمل", sub: "صيدلاني أو مساعد أو موظف صيدلية" },
                  { value: "employer", icon: <Building2 className="w-6 h-6" />, title: "أوظّف موظفين", sub: "صيدلية أو مجموعة صيدليات" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value as "candidate" | "employer")}
                    data-testid={`role-${opt.value}`}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-right",
                      role === opt.value ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      role === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      {opt.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{opt.title}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{opt.sub}</div>
                    </div>
                  </button>
                ))}

                {!googlePending && (
                  <>
                    <GoogleLoginButton onSuccess={handleGoogleSuccess} disabled={loading} label="سجّل بحساب Google" />
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">أو بكلمة مرور</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  </>
                )}

                <Button
                  className="w-full h-11 gap-2 font-semibold"
                  onClick={googlePending ? finishGoogleRegister : () => setStep(2)}
                  disabled={loading}
                  data-testid="button-next"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التسجيل...</>
                    : googlePending ? "إتمام التسجيل" : <> التالي <ChevronLeft className="w-4 h-4" /></>}
                </Button>
              </div>
            )}

            {/* ── Step 2: Personal data ── */}
            {step === 2 && !googlePending && (
              <div className="space-y-4">
                <div className="flex rounded-xl border border-border bg-muted/40 p-1 gap-1">
                  {([["phone", <Phone key="p" className="w-4 h-4" />, "بالتلفون"], ["email", <Mail key="m" className="w-4 h-4" />, "بالإيميل"]] as const).map(([m, icon, label]) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                        method === m ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground")}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>

                {method === "phone" && (
                  <Form {...phoneForm}>
                    <form onSubmit={phoneForm.handleSubmit(v => doRegister({ fullName: v.fullName, phone: v.phone, password: v.password }))} className="space-y-4">
                      <FormField control={phoneForm.control} name="fullName" render={({ field }) => (
                        <FormItem><FormLabel>الاسم الكامل</FormLabel>
                          <FormControl><Input placeholder="أحمد محمد علي" className="h-11" data-testid="input-fullName" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={phoneForm.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>رقم الهاتف</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                              <Input type="tel" placeholder="010xxxxxxxx" className="h-11 pr-9" data-testid="input-phone" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={phoneForm.control} name="password" render={({ field }) => (
                        <FormItem><FormLabel>كلمة المرور</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                              <Input type="password" placeholder="••••••••" className="h-11 pr-9" data-testid="input-password" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={phoneForm.control} name="confirmPassword" render={({ field }) => (
                        <FormItem><FormLabel>تأكيد كلمة المرور</FormLabel>
                          <FormControl><Input type="password" placeholder="••••••••" className="h-11" data-testid="input-confirmPassword" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="flex gap-2 pt-1">
                        <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setStep(1)}>رجوع</Button>
                        <Button type="submit" className="flex-1 h-11 font-semibold" disabled={loading} data-testid="button-submit">
                          {loading ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري...</> : "إنشاء الحساب"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}

                {method === "email" && (
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(v => doRegister({ fullName: v.fullName, email: v.email, phone: v.phone || undefined, password: v.password }))} className="space-y-4">
                      <FormField control={emailForm.control} name="fullName" render={({ field }) => (
                        <FormItem><FormLabel>الاسم الكامل</FormLabel>
                          <FormControl><Input placeholder="أحمد محمد علي" className="h-11" data-testid="input-fullName" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={emailForm.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                              <Input type="email" placeholder="example@email.com" className="h-11 pr-9" data-testid="input-email" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={emailForm.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>رقم الهاتف <span className="text-muted-foreground text-xs">(اختياري)</span></FormLabel>
                          <FormControl><Input type="tel" placeholder="010xxxxxxxx" className="h-11" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={emailForm.control} name="password" render={({ field }) => (
                        <FormItem><FormLabel>كلمة المرور</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                              <Input type="password" placeholder="••••••••" className="h-11 pr-9" data-testid="input-password" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={emailForm.control} name="confirmPassword" render={({ field }) => (
                        <FormItem><FormLabel>تأكيد كلمة المرور</FormLabel>
                          <FormControl><Input type="password" placeholder="••••••••" className="h-11" data-testid="input-confirmPassword" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="flex gap-2 pt-1">
                        <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setStep(1)}>رجوع</Button>
                        <Button type="submit" className="flex-1 h-11 font-semibold" disabled={loading} data-testid="button-submit">
                          {loading ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري...</> : "إنشاء الحساب"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground pt-1">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline" data-testid="link-login">
                تسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
