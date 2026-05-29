import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useListPackages } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import {
  CheckCircle, Users, Briefcase, Zap, MapPin, ShieldCheck,
  Star, ArrowLeft, Search, UserCheck, Building2, Sparkles
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
  { num: "01", title: "سجّل حسابك", desc: "اختر نوع حسابك واملأ ملفك الكامل بكل تفاصيلك المهنية" },
  { num: "02", title: "أكمل ملفك الشخصي", desc: "أضف خبراتك وشهاداتك وتفضيلاتك للحصول على أفضل الفرص" },
  { num: "03", title: "ابدأ الرحلة", desc: "ابحث عن وظائف أو أضف إعلانك وتواصل مع الكوادر المثالية" },
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
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-2xl tracking-tight" style={{ background: "linear-gradient(135deg, hsl(217,91%,45%), hsl(199,89%,48%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              UniPharma
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">المميزات</a>
            <a href="#how" className="hover:text-primary transition-colors">كيف يعمل</a>
            <a href="#packages" className="hover:text-primary transition-colors">الباقات</a>
            <Link href="/jobs" className="hover:text-primary transition-colors">الوظائف</Link>
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
                <Button asChild size="sm" className="shadow-md">
                  <Link href="/register" data-testid="link-register">ابدأ الآن</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4" style={{ background: "linear-gradient(135deg, hsl(222,47%,11%) 0%, hsl(217,70%,22%) 50%, hsl(199,89%,30%) 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(217,91%,70%) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(199,89%,60%) 0%, transparent 40%)" }} />
        <div className="relative max-w-5xl mx-auto text-center">
          <Badge className="mb-6 text-sm px-4 py-1.5 bg-white/10 text-white border-white/20 hover:bg-white/20">
            <Sparkles className="w-3.5 h-3.5 ml-1" />
            منصة التوظيف الصيدلي الأولى في مصر
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
            UniPharma
            <span className="block text-3xl md:text-4xl font-bold mt-3" style={{ color: "hsl(199,89%,70%)" }}>
              وصّلة الصيادلة بأصحاب الصيدليات
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-12 leading-relaxed">
            منصة متخصصة تجمع بين الصيادلة المحترفين وأصحاب الصيدليات في مصر. ابحث عن وظيفتك أو كوادرك المثالية بسهولة وسرعة.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="gap-2 text-base px-8 bg-white text-primary hover:bg-white/90 shadow-xl font-bold">
              <Link href="/register" data-testid="button-hero-register">
                ابدأ مجاناً
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 text-base px-8 border-white/30 text-white hover:bg-white/10 bg-transparent">
              <Link href="/jobs" data-testid="button-hero-jobs">
                <Briefcase className="w-4 h-4" />
                استعرض الوظائف
              </Link>
            </Button>
          </div>
          <div className="mt-14 flex justify-center gap-10 text-sm text-white/70">
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-300" /><span>آلاف الصيادلة</span></div>
            <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-blue-300" /><span>مئات الصيدليات</span></div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-300" /><span>توظيف آمن وموثوق</span></div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-primary py-6 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 text-center text-primary-foreground">
          <div>
            <div className="text-3xl font-black">+5000</div>
            <div className="text-sm opacity-80 mt-1">صيدلاني مسجل</div>
          </div>
          <div>
            <div className="text-3xl font-black">+800</div>
            <div className="text-sm opacity-80 mt-1">صيدلية موثّقة</div>
          </div>
          <div>
            <div className="text-3xl font-black">+1200</div>
            <div className="text-sm opacity-80 mt-1">وظيفة مُوظَّفة</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 text-primary font-semibold">مميزاتنا</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">لماذا UniPharma؟</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">منصة متخصصة لقطاع الصيدليات، مصممة لتلبية احتياجاتك بدقة وكفاءة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/60">
                <CardContent className="pt-7 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 text-primary font-semibold">الخطوات</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">كيف يعمل؟</h2>
            <p className="text-muted-foreground">ثلاث خطوات بسيطة للبدء في رحلتك المهنية</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-0 w-full h-px bg-gradient-to-l from-primary/30 to-transparent" />
                )}
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 font-black text-2xl shadow-lg text-white" style={{ background: "linear-gradient(135deg, hsl(217,91%,50%), hsl(199,89%,48%))" }}>
                  {s.num}
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-20 px-4 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 text-primary font-semibold">الأسعار</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">الباقات والأسعار</h2>
            <p className="text-muted-foreground">ابدأ مجاناً وارقِّ عند الحاجة</p>
          </div>
          {pkgsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(packages) && packages.map((pkg: any, idx: number) => (
                <Card key={pkg.id} className={`relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${idx === 1 || idx === 4 ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-border/60"}`}>
                  {(idx === 1 || idx === 4) && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary to-blue-400" />
                  )}
                  <CardContent className="pt-7">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">{pkg.targetRole === "candidate" ? "للصيادلة" : "للصيدليات"}</Badge>
                    </div>
                    <h3 className="font-bold text-xl mt-3 mb-2">{pkg.nameAr}</h3>
                    <div className="text-4xl font-black text-primary mb-5">
                      {pkg.priceUsd === 0 ? <span>مجانية</span> : <span>${pkg.priceUsd}<span className="text-base font-normal text-muted-foreground">/شهر</span></span>}
                    </div>
                    <div className="space-y-2.5 text-sm text-muted-foreground mb-7">
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
      <section className="py-20 px-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(222,47%,11%) 0%, hsl(217,70%,22%) 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, hsl(217,91%,70%) 0%, transparent 60%)" }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">جاهز تبدأ رحلتك؟</h2>
          <p className="text-white/70 mb-10 text-lg">انضم إلى آلاف الصيادلة وأصحاب الصيدليات على UniPharma</p>
          <Button asChild size="lg" className="gap-2 text-base px-10 bg-white text-primary hover:bg-white/90 shadow-2xl font-bold">
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
          <p className="font-semibold text-foreground mb-1">UniPharma</p>
          <p>© {new Date().getFullYear()} — منصة التوظيف الصيدلي الأولى في مصر</p>
        </div>
      </footer>
    </div>
  );
}
