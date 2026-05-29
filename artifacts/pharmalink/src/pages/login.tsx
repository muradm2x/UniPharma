import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useLocation, Link } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginForm) {
    loginMutation.mutate({ data: values }, {
      onSuccess: (data: any) => {
        login(data.token, data.user);
        if (data.user.role === "candidate") setLocation("/candidate/dashboard");
        else if (data.user.role === "employer") setLocation("/employer/dashboard");
        else setLocation("/admin/dashboard");
      },
      onError: () => {
        toast({ title: "خطأ في تسجيل الدخول", description: "البريد الإلكتروني أو كلمة المرور غير صحيحة", variant: "destructive" });
      },
    });
  }

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(222,47%,11%) 0%, hsl(217,70%,22%) 50%, hsl(199,89%,30%) 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 70%, hsl(217,91%,70%) 0%, transparent 50%)" }} />
        <div className="relative text-center text-white">
          <h1 className="text-5xl font-black mb-4 tracking-tight">UniPharma</h1>
          <p className="text-xl text-white/70 font-medium">منصة التوظيف الصيدلي</p>
          <p className="text-white/50 mt-2">الأولى في مصر</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight" style={{ background: "linear-gradient(135deg, hsl(217,91%,45%), hsl(199,89%,48%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              UniPharma
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">منصة التوظيف الصيدلي</p>
          </div>

          <Card className="shadow-lg border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
              <CardDescription>أدخل بياناتك للوصول إلى حسابك</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@email.com" data-testid="input-email" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">كلمة المرور</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" data-testid="input-password" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md" disabled={loginMutation.isPending} data-testid="button-submit">
                    {loginMutation.isPending ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري الدخول...</> : "تسجيل الدخول"}
                  </Button>
                </form>
              </Form>
              <div className="mt-5 text-center text-sm text-muted-foreground">
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
