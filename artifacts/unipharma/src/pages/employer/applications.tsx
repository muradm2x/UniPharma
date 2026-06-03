import { useListApplications, getListApplicationsQueryKey, useUpdateApplicationStatus } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, CheckCircle, XCircle, Eye } from "lucide-react";
import { APP_STATUS_LABELS } from "@/lib/constants";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  reviewing: "bg-blue-100 text-blue-800 border-blue-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function EmployerApplications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: applications, isLoading } = useListApplications({ query: { queryKey: getListApplicationsQueryKey() } });
  const updateMutation = useUpdateApplicationStatus();

  function updateStatus(id: number, status: "reviewing" | "accepted" | "rejected") {
    updateMutation.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
        toast({ title: status === "accepted" ? "تم قبول الطلب" : status === "rejected" ? "تم رفض الطلب" : "تم تحديث الحالة" });
      },
      onError: () => toast({ title: "خطأ في التحديث", variant: "destructive" }),
    });
  }

  return (
    <ProtectedRoute role="employer">
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-4">
          <div>
            <h1 className="text-2xl font-bold">الطلبات الواردة</h1>
            <p className="text-muted-foreground text-sm mt-0.5">مراجعة طلبات التوظيف</p>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />)}</div>
          ) : !Array.isArray(applications) || applications.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">لا توجد طلبات بعد</p>
              <p className="text-sm mt-1">انشر وظائف لتبدأ في استقبال الطلبات</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app: any) => (
                <Card key={app.id} data-testid={`card-application-${app.id}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{app.candidateName ?? "مرشح"}</p>
                        <p className="text-xs text-muted-foreground mb-1">{app.jobTitle ?? ""}</p>
                        {app.coverLetter && <p className="text-xs text-muted-foreground line-clamp-2">{app.coverLetter}</p>}
                        <p className="text-xs text-muted-foreground mt-1.5">{new Date(app.createdAt).toLocaleDateString("ar-EG")}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${STATUS_COLORS[app.status] ?? "bg-muted"}`}>
                        {APP_STATUS_LABELS[app.status] ?? app.status}
                      </span>
                    </div>
                    {(app.status === "pending" || app.status === "reviewing") && (
                      <div className="flex gap-2">
                        {app.status === "pending" && (
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => updateStatus(app.id, "reviewing")} disabled={updateMutation.isPending} data-testid={`button-review-${app.id}`}>
                            <Eye className="w-3.5 h-3.5" /> مراجعة
                          </Button>
                        )}
                        <Button size="sm" className="gap-1.5 flex-1" onClick={() => updateStatus(app.id, "accepted")} disabled={updateMutation.isPending} data-testid={`button-accept-${app.id}`}>
                          <CheckCircle className="w-3.5 h-3.5" /> قبول
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5 flex-1 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => updateStatus(app.id, "rejected")} disabled={updateMutation.isPending} data-testid={`button-reject-${app.id}`}>
                          <XCircle className="w-3.5 h-3.5" /> رفض
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
