import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  useGetCandidateStats, getGetCandidateStatsQueryKey,
  useGetNearbyJobs, getGetNearbyJobsQueryKey,
  useListApplications, getListApplicationsQueryKey,
  useToggleCandidateAvailability,
  useGetMyCandidateProfile, getGetMyCandidateProfileQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Briefcase, FileText, CheckCircle, Clock, MapPin, Zap, TrendingUp, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { APP_STATUS_LABELS } from "@/lib/constants";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useGetCandidateStats({ query: { queryKey: getGetCandidateStatsQueryKey() } });
  const { data: profile } = useGetMyCandidateProfile({ query: { queryKey: getGetMyCandidateProfileQueryKey() } });
  const { data: nearbyJobs, isLoading: jobsLoading } = useGetNearbyJobs({ limit: 4 }, { query: { queryKey: getGetNearbyJobsQueryKey({ limit: 4 }) } });
  const { data: applications, isLoading: appsLoading } = useListApplications({ query: { queryKey: getListApplicationsQueryKey() } });

  const toggleMutation = useToggleCandidateAvailability();

  function handleToggle() {
    if (!profile) return;
    toggleMutation.mutate({ data: { availableForWork: !profile.availableForWork } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyCandidateProfileQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCandidateStatsQueryKey() });
        toast({ title: profile.availableForWork ? "تم إيقاف الإتاحة" : "أنت متاح للعمل الآن" });
      },
    });
  }

  const recentApps = Array.isArray(applications) ? applications.slice(0, 4) : [];

  return (
    <ProtectedRoute role="candidate">
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">مرحباً، {user?.fullName}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">لوحة تحكم الصيدلاني</p>
            </div>
            <Button
              variant={profile?.availableForWork ? "default" : "outline"}
              className="gap-2"
              onClick={handleToggle}
              disabled={toggleMutation.isPending}
              data-testid="button-toggle-availability"
            >
              {toggleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> :
                profile?.availableForWork ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {profile?.availableForWork ? "متاح للعمل" : "غير متاح"}
            </Button>
          </div>

          {/* Profile completion */}
          {stats && stats.profileCompletionPct < 100 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-sm">اكتمال الملف الشخصي</div>
                    <div className="text-xs text-muted-foreground">أكمل ملفك لتزيد فرص القبول</div>
                  </div>
                  <span className="text-xl font-bold text-primary" data-testid="text-completion-pct">{stats.profileCompletionPct}%</span>
                </div>
                <Progress value={stats.profileCompletionPct} className="h-2 mb-3" />
                {stats.profileCompletionPct < 80 && (
                  <p className="text-xs text-destructive mb-2">يجب إكمال 80% على الأقل للتقديم على الوظائف</p>
                )}
                <Button asChild size="sm" variant="outline">
                  <Link href="/candidate/profile">أكمل ملفك</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="text-muted-foreground text-xs mb-1">طلبات اليوم</div>
                {statsLoading ? <div className="h-7 bg-muted rounded animate-pulse" /> : (
                  <div className="text-2xl font-bold" data-testid="text-daily-apps">
                    {stats?.dailyApplicationsUsed ?? 0} / {stats?.dailyApplicationsLimit ?? 10}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">من حصتك اليومية</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="text-muted-foreground text-xs mb-1">إجمالي الطلبات</div>
                <div className="text-2xl font-bold" data-testid="text-total-apps">{stats?.totalApplications ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">منذ الانضمام</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="text-muted-foreground text-xs mb-1">مقبول</div>
                <div className="text-2xl font-bold text-green-600" data-testid="text-accepted-apps">{stats?.acceptedApplications ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">طلبات مقبولة</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="text-muted-foreground text-xs mb-1">عروض بانتظارك</div>
                <div className="text-2xl font-bold text-primary" data-testid="text-unread-offers">{stats?.unreadOffers ?? 0}</div>
                <Button asChild size="sm" variant="link" className="p-0 h-auto text-xs mt-1">
                  <Link href="/candidate/offers">استعرض العروض</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nearby jobs */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> وظائف قريبة منك
                  </CardTitle>
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/jobs">عرض الكل</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {jobsLoading ? (
                  <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
                ) : !Array.isArray(nearbyJobs) || nearbyJobs.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    لا توجد وظائف متاحة حالياً
                  </div>
                ) : nearbyJobs.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors" data-testid={`card-nearby-job-${job.id}`}>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{job.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />{job.governorate} - {job.city}
                        {job.isEmergency && <Badge variant="destructive" className="text-xs mr-1 gap-1 py-0"><Zap className="w-2.5 h-2.5" />طارئ</Badge>}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs mr-2 flex-shrink-0">{job.jobType}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent applications */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> آخر طلباتي
                  </CardTitle>
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/candidate/applications">عرض الكل</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {appsLoading ? (
                  <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
                ) : recentApps.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    لم تتقدم على أي وظيفة بعد
                    <div className="mt-2">
                      <Button asChild size="sm" variant="outline"><Link href="/jobs">ابحث عن وظيفة</Link></Button>
                    </div>
                  </div>
                ) : recentApps.map((app: any) => {
                  const statusColors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", reviewing: "bg-blue-100 text-blue-700", accepted: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40" data-testid={`card-app-${app.id}`}>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{app.jobTitle}</div>
                        {app.employerName && <div className="text-xs text-muted-foreground truncate">{app.employerName}</div>}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-2 flex-shrink-0 ${statusColors[app.status] ?? "bg-muted text-muted-foreground"}`}>
                        {APP_STATUS_LABELS[app.status] ?? app.status}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
