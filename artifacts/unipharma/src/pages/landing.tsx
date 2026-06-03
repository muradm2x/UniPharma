import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { useListPackages } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import {
  CheckCircle, Users, Briefcase, Zap, MapPin, ShieldCheck,
  Star, ArrowLeft, Search, UserCheck, Building2, Sparkles, BadgeCheck,
  BellRing, LockKeyhole, Radar, Clock, Crown, WandSparkles
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

const highlights = [
  {
    icon: <Radar className="w-5 h-5" />,
    title: "مطابقة ذكية + إشعارات",
    desc: "لما الصيدلية تنشر وظيفة، النظام يرّشح المناسبين ويبلغ الأقرب المتاحين فورًا.",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "شفتات طوارئ بضغطة",
    desc: "زر سريع لطلب تغطية وردية—يروح تنبيه فوري للمتاحين في نطاق 5–10 كم.",
  },
  {
    icon: <BadgeCheck className="w-5 h-5" />,
    title: "توثيق الشهادات (اختياري)",
    desc: "رفع كارنيه/شهادة للإدارة (سرّي) → علامة توثيق تزيد الثقة وسرعة القبول.",
  },
  {
    icon: <LockKeyhole className="w-5 h-5" />,
    title: "خصوصية ذكية",
    desc: "بيانات حساسة (التواصل/الهوية) لا تظهر للعامة—تظهر فقط للطرف المقبول.",
  },
];

const faqs = [
  {
    q: "هل ملفي الشخصي ظاهر للجميع؟",
    a: "نعم كملف مهني، لكن بيانات التواصل والهوية (رقم الهاتف/البطاقة/الكارنيه) لا تظهر للعامة وتظهر فقط للطرف المقبول.",
  },
  {
    q: "إمتى أقدر أقدم على وظائف؟",
    a: "بعد اكتمال ملفك الشخصي بنسبة 80% لضمان جودة الترشيح وزيادة فرص القبول.",
  },
  {
    q: "هل فيه حدود للتقديم/العروض في الباقة المجانية؟",
    a: "نعم. للباحث عن عمل: 10 يوميًا / 50 شهريًا. للصيدليات: 3 عروض يوميًا / 20 شهريًا (مجاني).",
  },
  {
    q: "هل يدعم تسجيل الدخول بجوجل؟",
    a: "نعم، ويمكن تفعيلها عبر ضبط VITE_GOOGLE_CLIENT_ID. (الهاتف/OTP ممكن إضافته لاحقًا حسب الخطة).",
  },
];

const reveal = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

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
      <motion.section
        className="relative overflow-hidden py-24 px-4"
        style={{
          background:
            "radial-gradient(1200px circle at 20% 10%, hsl(199,89%,35%) 0%, transparent 45%), radial-gradient(900px circle at 90% 30%, hsl(217,91%,45%) 0%, transparent 40%), linear-gradient(135deg, hsl(222,47%,8%) 0%, hsl(222,47%,11%) 40%, hsl(217,70%,18%) 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(circle at 40% 10%, black 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            variants={reveal}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
          <Badge className="mb-6 text-sm px-4 py-1.5 bg-white/10 text-white border-white/20 hover:bg-white/20">
            <Sparkles className="w-3.5 h-3.5 ml-1" />
            منصّة توظيف صيدلي “متخصصة” — بسرعة وخصوصية
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
            UniPharma
            <span className="block text-3xl md:text-4xl font-bold mt-3" style={{ color: "hsl(199,89%,70%)" }}>
              وصّلة الصيادلة بأصحاب الصيدليات… صح
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-12 leading-relaxed">
            منصة تربط **الأقرب جغرافيًا** + **الأفضل مهارةً** + **الأكثر توافقًا بالوقت** — وتخلي التوظيف يحصل في أيام بدل أسابيع.
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
          </motion.div>
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: <BellRing className="w-4 h-4" />, title: "تنبيهات ذكية", sub: "وظائف/عروض مطابقة" },
              { icon: <ShieldCheck className="w-4 h-4" />, title: "خصوصية", sub: "تواصل يظهر عند القبول" },
              { icon: <WandSparkles className="w-4 h-4" />, title: "سهل وسريع", sub: "تسجيل → ملف → ترشيح" },
            ].map((k, idx) => (
              <motion.div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-right text-white/80 backdrop-blur"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.25 + idx * 0.08, ease: "easeOut" }}
              >
                <div className="flex items-center gap-2 text-white">
                  <span className="inline-flex w-9 h-9 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                    {k.icon}
                  </span>
                  <div className="font-bold">{k.title}</div>
                </div>
                <div className="mt-1 text-sm text-white/65">{k.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Highlighted value props */}
      <motion.section
        className="py-20 px-4 bg-background relative overflow-hidden"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        variants={{ hidden: {}, show: {} }}
      >
        <div className="absolute inset-0 -z-10 opacity-70" style={{
          background:
            "radial-gradient(700px circle at 20% 20%, hsl(199 89% 92%) 0%, transparent 55%), radial-gradient(650px circle at 80% 40%, hsl(217 91% 92%) 0%, transparent 55%)",
        }} />
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <motion.div className="flex-1" variants={reveal} transition={{ duration: 0.55, ease: "easeOut" }}>
              <Badge variant="secondary" className="mb-4 text-primary font-semibold">الفرق الحقيقي</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                مش “موقع وظائف”… دي منظومة توظيف صيدلي
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
                UniPharma مصممة لقواعد السوق الحقيقي: شفتات طوارئ، خصوصية بيانات، توثيق، ومطابقة تعتمد على المكان والمهارات وساعات العمل.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {highlights.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
                  >
                    <Card className="border-border/60 hover:shadow-lg transition-all duration-300">
                    <CardContent className="pt-6 pb-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          {h.icon}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{h.title}</div>
                          <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{h.desc}</div>
                        </div>
                      </div>
                    </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div className="w-full lg:w-[420px]" variants={reveal} transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}>
              <Card className="overflow-hidden border-border/60">
                <div className="h-2 bg-gradient-to-l from-primary to-blue-400" />
                <CardContent className="pt-7 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="font-black text-xl">ابدأ في 60 ثانية</div>
                    <Badge variant="outline" className="text-xs">مجاني</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    سجّل وحدد نوع الحساب، كمّل البيانات الأساسية، وابدأ تستقبل فرص/مرشحين مطابقين.
                  </p>
                  <Separator className="my-5" />
                  <div className="space-y-3 text-sm">
                    {[
                      { icon: <Users className="w-4 h-4" />, t: "للكوادر: مؤشر اكتمال + عداد التقديمات" },
                      { icon: <Building2 className="w-4 h-4" />, t: "للصيدليات: فلترة ذكية + Shortlist" },
                      { icon: <Crown className="w-4 h-4" />, t: "للإدارة: توثيق + إحصائيات (KPIs)" },
                    ].map((x, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-primary">{x.icon}</span>
                        <span>{x.t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href="/register">سجّل الآن</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/jobs">شوف الوظائف</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        id="features"
        className="py-20 px-4 bg-muted/40 relative overflow-hidden"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, show: {} }}
      >
        <div className="absolute inset-0 -z-10 opacity-60" style={{
          background:
            "radial-gradient(800px circle at 10% 50%, hsl(217 91% 96%) 0%, transparent 55%), radial-gradient(800px circle at 90% 20%, hsl(199 89% 96%) 0%, transparent 55%)",
        }} />
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-14" variants={reveal} transition={{ duration: 0.55, ease: "easeOut" }}>
            <Badge variant="secondary" className="mb-4 text-primary font-semibold">مميزاتنا</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">لماذا UniPharma؟</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">منصة متخصصة لقطاع الصيدليات، مصممة لتلبية احتياجاتك بدقة وكفاءة</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/60">
                  <CardContent className="pt-7 pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                      {f.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-foreground">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* For each role */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-primary font-semibold">تجربة حسب دورك</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">كل طرف له لوحة… واحتياجاته</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              مصممين الداشبورد على أساس قواعد المنصة: Quotas، اكتمال الملف، العروض، والمطابقة.
            </p>
          </div>

          <Tabs defaultValue="candidate" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto">
              <TabsTrigger value="candidate">باحث عن عمل</TabsTrigger>
              <TabsTrigger value="employer">صيدلية</TabsTrigger>
              <TabsTrigger value="admin">إدارة</TabsTrigger>
            </TabsList>

            <TabsContent value="candidate" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                  { icon: <Sparkles className="w-5 h-5" />, t: "Profile Strength", d: "مؤشر اكتمال الملف ونواقصه للوصول لـ 80%." },
                  { icon: <Briefcase className="w-5 h-5" />, t: "Tracking", d: "متابعة الطلبات: تم التقديم/مراجعة/قبول/رفض." },
                  { icon: <BellRing className="w-5 h-5" />, t: "تنبيهات", d: "وظائف جديدة مطابقة بالقرب منك + عروض مباشرة." },
                ].map((c, i) => (
                  <Card key={i} className="border-border/60 hover:shadow-lg transition-all duration-300">
                    <CardContent className="pt-6 pb-5">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                        {c.icon}
                      </div>
                      <div className="font-bold">{c.t}</div>
                      <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{c.d}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="employer" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                  { icon: <Search className="w-5 h-5" />, t: "فلترة المتقدمين", d: "ترتيب حسب الأقرب/الخبرة/الملف الأقوى." },
                  { icon: <Star className="w-5 h-5" />, t: "Shortlist", d: "حفظ المرشحين المميزين للرجوع ليهم بسرعة." },
                  { icon: <Zap className="w-5 h-5" />, t: "Emergency Shift", d: "طلب تغطية وردية سريع داخل نطاق 5–10 كم." },
                ].map((c, i) => (
                  <Card key={i} className="border-border/60 hover:shadow-lg transition-all duration-300">
                    <CardContent className="pt-6 pb-5">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                        {c.icon}
                      </div>
                      <div className="font-bold">{c.t}</div>
                      <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{c.d}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="admin" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                  { icon: <BadgeCheck className="w-5 h-5" />, t: "Verification Queue", d: "مراجعة شهادات/كارنيهات وإضافة شارة توثيق." },
                  { icon: <Users className="w-5 h-5" />, t: "KPIs", d: "مؤشرات: مستخدمين جدد، Matches، مناطق نشطة." },
                  { icon: <ShieldCheck className="w-5 h-5" />, t: "رقابة المحتوى", d: "مراقبة الإعلانات الوهمية والمحتوى غير اللائق." },
                ].map((c, i) => (
                  <Card key={i} className="border-border/60 hover:shadow-lg transition-all duration-300">
                    <CardContent className="pt-6 pb-5">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                        {c.icon}
                      </div>
                      <div className="font-bold">{c.t}</div>
                      <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{c.d}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
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

      {/* FAQ */}
      <section className="py-20 px-4 bg-background relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-60" style={{
          background:
            "radial-gradient(700px circle at 20% 70%, hsl(199 89% 94%) 0%, transparent 55%), radial-gradient(650px circle at 85% 60%, hsl(217 91% 94%) 0%, transparent 55%)",
        }} />
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-primary font-semibold">أسئلة سريعة</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">قبل ما تبدأ</h2>
            <p className="text-muted-foreground">إجابات قصيرة لأكثر الأسئلة تكرارًا</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, idx) => (
              <AccordionItem key={idx} value={`item-${idx + 1}`}>
                <AccordionTrigger className="text-right">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
      <footer className="border-t border-border py-10 px-4 bg-background relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-80" style={{
          background:
            "radial-gradient(650px circle at 20% 120%, hsl(217 91% 92%) 0%, transparent 60%), radial-gradient(650px circle at 80% 120%, hsl(199 89% 92%) 0%, transparent 60%)",
        }} />
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">UniPharma</p>
          <p>© {new Date().getFullYear()} — منصة التوظيف الصيدلي الأولى في مصر</p>
        </div>
      </footer>
    </div>
  );
}
