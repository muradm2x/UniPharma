import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  useGetEmployerStats, getGetEmployerStatsQueryKey,
  useListJobs, getListJobsQueryKey,
  useCreateEmergencyShift,
  useGetMyEmployerProfile, getGetMyEmployerProfileQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Briefcase, Users, FileText, Bookmark, Zap, Loader2, MapPin, Plus } from "lucide-react";
import { JOB_STATUS_LABELS, SPECIALIZATIONS, GOVERNORATES } from "@/lib/constants";
import { useState } from "react";

const emergencySchema = z.object({
  specialization: z.string().min(1, "التخصص مطلوب"),
  governorate: z.string().min(1, "المحافظة مطلوبة"),
  city: z.string().min(1, "المدينة مطلوبة"),
  durationHours: z.coerce.number().min(1).max(24),
  notes: z.string().optional(),
});
type EmergencyForm = z.infer<typeof emergencySchema>;

export default function EmployerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useGetEmployerStats({ query: { queryKey: getGetEmployerStatsQueryKey() } });
  const { data: profile } = useGetMyEmployerProfile({ query: { queryKey: getGetMyEmployerProfileQueryKey() } });

  const emergencyForm = useForm<EmergencyForm>({
    resolver: zodResolver(emergencySchema),
    defaultValues: { specialization: "", governorate: "", city: "", durationHours: 8, notes: "" },
  });
  const emergencyMutation = useCreateEmergencyShift();

  function submitEmergency(values: EmergencyForm) {
    emergencyMutation.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey({}) });
        queryClient.invalidateQueries({ queryKey: getGetEmployerStatsQueryKey() });
        toast({ title: "تم إرسال طلب التغطية الفورية" });
        setEmergencyOpen(false);
        emergencyForm.reset();
      },
      onError: () => toast({ title: "خطأ في الإرسال", variant: "destructive" }),
    });
  }

  return (
    <ProtectedRoute role="employer">
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">{profile?.name ?? user?.fullName}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">لوحة تحكم صاحب العمل</p>
            </div>
            <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground" size="lg" data-testid="button-emergency-shift">
                  <Zap className="w-5 h-5" />
                  طلب تغطية فورية
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>طلب تغطية فورية</DialogTitle>
                </DialogHeader>
                <Form {...emergencyForm}>
                  <form onSubmit={emergencyForm.handleSubmit(submitEmergency)} className="space-y-4 mt-2">
                    <FormField control={emergencyForm.control} name="specialization" render={({ field }) => (
                      <FormItem><FormLabel>التخصص المطلوب</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl><SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger></FormControl>
                          <SelectContent>{SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={emergencyForm.control} name="governorate" render={({ field }) => (
                        <FormItem><FormLabel>المحافظة</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl><SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger></FormControl>
                            <SelectContent>{GOVERNORATES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                          </Select>
                        <FormMessage /></FormItem>
                      )} />
                      <FormField control={emergencyForm.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>المدينة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={emergencyForm.control} name="durationHours" render={({ field }) => (
                      <FormItem><FormLabel>مدة التغطية (ساعات)</FormLabel><FormControl><Input type="number" min={1} max={24} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={emergencyForm.control} name="notes" render={({ field }) => (
                      <FormItem><FormLabel>ملاحظات (اختياري)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" className="w-full gap-2 bg-destructive hover:bg-destructive/90" disabled={emergencyMutation.isPending} data-testid="button-submit-emergency">
                      {emergencyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      إرسال طلب التغطية
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">وظائف نشطة</span>
                </div>
                <div className="text-2xl font-bold" data-testid="text-active-jobs">{statsLoading ? "..." : (stats?.activeJobs ?? 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">طلبات واردة</span>
                </div>
                <div className="text-2xl font-bold" data-testid="text-total-apps">{statsLoading ? "..." : (stats?.totalApplicationsReceived ?? 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">عروض اليوم</span>
                </div>
                <div className="text-2xl font-bold" data-testid="text-daily-offers">
                  {statsLoading ? "..." : `${stats?.dailyOffersUsed ?? 0}/${stats?.dailyOffersLimit ?? 3}`}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bookmark className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">المفضلة</span>
                </div>
                <div className="text-2xl font-bold" data-testid="text-shortlist">{statsLoading ? "..." : (stats?.shortlistCount ?? 0)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-5 pb-4">
                <Button asChild variant="ghost" className="w-full h-auto flex-col gap-2 p-0">
                  <Link href="/employer/jobs">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">نشر وظيفة جديدة</span>
                    <span className="text-xs text-muted-foreground">أضف إعلان توظيف</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-5 pb-4">
                <Button asChild variant="ghost" className="w-full h-auto flex-col gap-2 p-0">
                  <Link href="/employer/candidates">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">استعراض المرشحين</span>
                    <span className="text-xs text-muted-foreground">تصفح ملفات الصيادلة</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-5 pb-4">
                <Button asChild variant="ghost" className="w-full h-auto flex-col gap-2 p-0">
                  <Link href="/employer/applications">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">الطلبات الواردة</span>
                    <span className="text-xs text-muted-foreground">{stats?.pendingApplications ?? 0} طلب قيد المراجعة</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
