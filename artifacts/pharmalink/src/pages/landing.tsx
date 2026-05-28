import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useListPackages } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import {
  CheckCircle, Users, Briefcase, Zap, MapPin, ShieldCheck,
  Star, ArrowLeft, Search, UserCheck, Building2
} from "lucide-react";

const features = [
  { icon: <Search className="w-6 h-6" />, title: "البحث الذكي", desc: "ابحث عن وظائف أو مرشحين بفلترة دقيقة حسب المنطقة والتخصص" },
  { icon: <MapPin className="w-6 h-6" />, title: "قريب منك", desc: "اكتشف الفرص القريبة منك جغرافياً في محافظتك ومدينتك" },
  { icon: <Zap className="w-6 h-6" />, title: "التغطية الفورية", desc: "طلبات طوارئ لتغطية الورديات بسرعة وفاعلية" },
  { icon: <ShieldCheck className="w-6 h-6" />, title: "ملفات موثّقة", desc: "نظام توثيق وشارات التحقق لضمان مصداقية المرشحين" },
  { icon: <UserCheck className="w-6 h-6" />, title: "عروض مباشرة", desc: "أصحاب العمل يتواصلون مباشرة مع أفضل المرشحين" },
  { icon: <Star className="w-6 h-6" />, title: "قائمة المفضلة", desc: "احفظ أفضل المرشحين وارجع إليهم في أي وقت" },
];

const steps = [
  { num: "1", title: "سجّل حسابك", desc: "اختر نوع حسابك (صيدلاني أو صيدلية) واملأ بياناتك الأساسية" },
  { num: "2", title: "أكمل ملفك الشخصي", desc: "أضف تفاصيل خبرتك وتخصصك ومنطقتك الجغرافية" },
  { num: "3", title: "ابدأ التوصيل", desc: "ابحث عن وظائف أو أضف إعلانك وانتظر الطلبات" },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const { data: packages, isLoading: pkgsLoading } = useListPackages();

  const dashLink = user?.role === "candidate" ? "/candidate/dashboard"
    : user?.role === "employer" ? "/employer/dashboard"
    : user?.role === "admin" ? "/admin/dashboard"
    : "/register";

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">P</span>
            </div>
            <span className="font-black text-xl text-foreground">PharmLink</span>
            <span className="hidden sm:block text-muted-foreground text-sm">| وصلة الصيادلة</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">المميزات</a>
            <a href="#how" className="hover:text-foreground transition-colors">كيف يعمل</a>
            <a href="#packages" className="hover:text-foreground transition-colors">الباقات</a>
            <Link href="/jobs" className="hover:text-foreground transition-colors">الوظائف</Link>
          </nav>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button asChild size="sm">
                <Link href={dashLink}>لوحة التحكم</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login" data-testid="link-login">دخول</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register" data-testid="link-register">ابدأ الآن</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-primary/10 via-background to-background py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-6 text-sm px-4 py-1.5" variant="secondary">
            منصة التوظيف الصيدلي الأولى في مصر
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-foreground leading-tight mb-6">
            وصلة الصيادلة
            <span className="block text-primary">بأصحاب الصيدليات</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            PharmLink تجمع بين الصيادلة المحترفين وأصحاب الصيدليات في مصر. ابحث عن وظيفتك أو كوادرك المثالية بسهولة وسرعة.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="gap-2 text-base px-8">
              <Link href="/register" data-testid="button-hero-register">
                ابدأ مجاناً
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 text-base px-8">
              <Link href="/jobs" data-testid="button-hero-jobs">
                <Briefcase className="w-4 h-4" />
                استعرض الوظائف
              </Link>
            </Button>
          </div>
          <div className="mt-12 flex justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /><span>آلاف الصيادلة</span></div>
            <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-primary" /><span>مئات الصيدليات</span></div>
            <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-primary" /><span>توظيف آمن وموثوق</span></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">لماذا PharmLink؟</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">منصة متخصصة لقطاع الصيدليات، مصممة لتلبية احتياجاتك بدقة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">كيف يعمل؟</h2>
            <p className="text-muted-foreground">ثلاث خطوات بسيطة للبدء</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground font-black text-2xl flex items-center justify-center mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">الباقات والأسعار</h2>
            <p className="text-muted-foreground">ابدأ مجاناً وارقِّ عند الحاجة</p>
          </div>
          {pkgsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(packages) && packages.map((pkg: any) => (
                <Card key={pkg.id} className="relative hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="mb-1">
                      <Badge variant="outline" className="text-xs">{pkg.targetRole === "candidate" ? "للصيادلة" : "للصيدليات"}</Badge>
                    </div>
                    <h3 className="font-bold text-xl mt-2 mb-1">{pkg.nameAr}</h3>
                    <div className="text-3xl font-black text-primary mb-4">
                      {pkg.priceUsd === 0 ? "مجانية" : `$${pkg.priceUsd}`}
                      {pkg.priceUsd > 0 && <span className="text-base font-normal text-muted-foreground">/شهر</span>}
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />{pkg.dailyLimit} طلب يومياً</div>
                      <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />{pkg.monthlyLimit} طلب شهرياً</div>
                      {pkg.features && <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />{pkg.features}</div>}
                    </div>
                    <Button asChild className="w-full" variant={pkg.priceUsd === 0 ? "outline" : "default"}>
                      <Link href="/register">ابدأ الآن</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">جاهز تبدأ؟</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">انضم إلى آلاف الصيادلة وأصحاب الصيدليات على PharmLink</p>
          <Button asChild size="lg" variant="secondary" className="gap-2 text-base px-8">
            <Link href="/register" data-testid="button-cta-register">
              سجّل الآن مجاناً
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 bg-background">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>PharmLink &copy; {new Date().getFullYear()} — منصة التوظيف الصيدلي في مصر</p>
        </div>
      </footer>
    </div>
  );
}
