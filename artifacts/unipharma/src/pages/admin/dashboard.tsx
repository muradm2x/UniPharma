import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  useGetAdminStats, getGetAdminStatsQueryKey,
  useGetSubscriptionsBreakdown, getGetSubscriptionsBreakdownQueryKey,
  useGetActivityByRegion, getGetActivityByRegionQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Briefcase, FileText, CheckCircle, TrendingUp, CreditCard, Loader2 } from "lucide-react";

const COLORS = ["hsl(150, 60%, 35%)", "hsl(150, 40%, 50%)", "hsl(35, 85%, 55%)", "hsl(200, 70%, 45%)", "hsl(150, 30%, 65%)"];

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });
  const { data: breakdown, isLoading: breakdownLoading } = useGetSubscriptionsBreakdown({ query: { queryKey: getGetSubscriptionsBreakdownQueryKey() } });
  const { data: regional, isLoading: regionalLoading } = useGetActivityByRegion({ query: { queryKey: getGetActivityByRegionQueryKey() } });

  const kpis = stats ? [
    { label: "إجمالي المستخدمين", value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: "text-primary" },
    { label: "الصيادلة", value: stats.totalCandidates, icon: <Users className="w-5 h-5" />, color: "text-blue-600" },
    { label: "الصيدليات", value: stats.totalEmployers, icon: <Briefcase className="w-5 h-5" />, color: "text-purple-600" },
    { label: "الوظائف", value: stats.totalJobs, icon: <Briefcase className="w-5 h-5" />, color: "text-orange-600" },
    { label: "الطلبات", value: stats.totalApplications, icon: <FileText className="w-5 h-5" />, color: "text-cyan-600" },
    { label: "مطابقات ناجحة", value: stats.successfulMatches, icon: <CheckCircle className="w-5 h-5" />, color: "text-green-600" },
    { label: "اشتراكات نشطة", value: stats.activeSubscriptions, icon: <CreditCard className="w-5 h-5" />, color: "text-yellow-600" },
    { label: "مستخدمون جدد اليوم", value: stats.newUsersToday, icon: <TrendingUp className="w-5 h-5" />, color: "text-rose-600" },
  ] : [];

  const topRegions = Array.isArray(regional) ? regional.slice(0, 10) : [];

  return (
    <ProtectedRoute role="admin">
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">لوحة تحكم المسؤول</h1>
            <p className="text-muted-foreground text-sm mt-0.5">إحصائيات المنصة</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)
            ) : kpis.map((kpi, i) => (
              <Card key={i} data-testid={`kpi-${i}`}>
                <CardContent className="pt-4 pb-4">
                  <div className={`${kpi.color} mb-2`}>{kpi.icon}</div>
                  <div className="text-2xl font-bold">{kpi.value?.toLocaleString("ar-EG") ?? 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">{kpi.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscriptions breakdown */}
            <Card>
              <CardHeader><CardTitle className="text-base">توزيع الاشتراكات</CardTitle></CardHeader>
              <CardContent>
                {breakdownLoading ? (
                  <div className="h-48 bg-muted rounded animate-pulse" />
                ) : !Array.isArray(breakdown) || breakdown.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10 text-sm">لا توجد بيانات</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={breakdown} dataKey="count" nameKey="packageNameAr" cx="50%" cy="50%" outerRadius={80} label={(e) => `${e.packageNameAr}: ${e.count}`}>
                        {breakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`${v} مشترك`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Regional activity */}
            <Card>
              <CardHeader><CardTitle className="text-base">النشاط حسب المحافظة</CardTitle></CardHeader>
              <CardContent>
                {regionalLoading ? (
                  <div className="h-48 bg-muted rounded animate-pulse" />
                ) : topRegions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10 text-sm">لا توجد بيانات</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={topRegions} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="governorate" tick={{ fontSize: 11 }} width={55} />
                      <Tooltip formatter={(v: any, n: string) => [v, n === "candidateCount" ? "صيادلة" : n === "jobCount" ? "وظائف" : n]} />
                      <Bar dataKey="candidateCount" fill={COLORS[0]} name="صيادلة" radius={[0, 3, 3, 0]} />
                      <Bar dataKey="jobCount" fill={COLORS[1]} name="وظائف" radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
