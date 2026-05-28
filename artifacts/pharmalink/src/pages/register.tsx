import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useLocation, Link } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const step1Schema = z.object({
  role: z.enum(["candidate", "employer"]),
});

const step2Schema = z.object({
  fullName: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صحيح"),
  phone: z.string().optional(),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
  confirmPassword: z.string(),
}).refine((v) => v.password === v.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

type Step2Form = z.infer<typeof step2Schema>;

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const form = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  function onSubmit(values: Step2Form) {
    registerMutation.mutate({ data: { ...values, role } }, {
      onSuccess: (data: any) => {
        login(data.token, data.user);
        if (data.user.role === "candidate") setLocation("/candidate/dashboard");
        else setLocation("/employer/dashboard");
      },
      onError: (err: any) => {
        const msg = err?.data?.error ?? "حدث خطأ في التسجيل";
        toast({ title: "خطأ في التسجيل", description: msg, variant: "destructive" });
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <span className="text-primary-foreground font-black text-2xl">P</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">PharmLink</h1>
          <p className="text-muted-foreground mt-1">وصلة الصيادلة</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">إنشاء حساب جديد</CardTitle>
            <CardDescription>
              {step === 1 ? "اختر نوع حسابك" : "أدخل بياناتك الشخصية"}
            </CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <div className={cn("flex-1 h-1 rounded-full", step >= 1 ? "bg-primary" : "bg-muted")} />
              <div className={cn("flex-1 h-1 rounded-full", step >= 2 ? "bg-primary" : "bg-muted")} />
            </div>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setRole("candidate")}
                  data-testid="role-candidate"
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-colors text-right",
                    role === "candidate" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", role === "candidate" ? "bg-primary" : "bg-muted")}>
                    <User className={cn("w-6 h-6", role === "candidate" ? "text-primary-foreground" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <div className="font-semibold">أبحث عن عمل</div>
                    <div className="text-sm text-muted-foreground">صيدلاني أو مساعد صيدلاني أو موظف صيدلية</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("employer")}
                  data-testid="role-employer"
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-colors text-right",
                    role === "employer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", role === "employer" ? "bg-primary" : "bg-muted")}>
                    <Building2 className={cn("w-6 h-6", role === "employer" ? "text-primary-foreground" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <div className="font-semibold">أوظّف موظفين</div>
                    <div className="text-sm text-muted-foreground">صيدلية أو سلسلة صيدليات تبحث عن كوادر</div>
                  </div>
                </button>
                <Button className="w-full gap-2" onClick={() => setStep(2)} data-testid="button-next">
                  التالي
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل</FormLabel>
                      <FormControl><Input placeholder="محمد أحمد" data-testid="input-fullName" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl><Input type="email" placeholder="example@email.com" data-testid="input-email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهاتف (اختياري)</FormLabel>
                      <FormControl><Input type="tel" placeholder="010xxxxxxxx" data-testid="input-phone" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" data-testid="input-password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>تأكيد كلمة المرور</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" data-testid="input-confirmPassword" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      رجوع
                    </Button>
                    <Button type="submit" className="flex-1" disabled={registerMutation.isPending} data-testid="button-submit">
                      {registerMutation.isPending ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري التسجيل...</> : "إنشاء الحساب"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            <div className="mt-4 text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-primary font-medium hover:underline" data-testid="link-login">
                تسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
