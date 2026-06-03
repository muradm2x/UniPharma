import { useListApplications, getListApplicationsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Briefcase } from "lucide-react";
import { APP_STATUS_LABELS } from "@/lib/constants";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  reviewing: "bg-blue-100 text-blue-800 border-blue-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function CandidateApplications() {
  const { data: applications, isLoading } = useListApplications({ query: { queryKey: getListApplicationsQueryKey() } });

  return (
    <ProtectedRoute role="candidate">
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <div>
            <h1 className="text-2xl font-bold">طلباتي</h1>
            <p className="text-muted-foreground text-sm mt-0.5">جميع طلبات التوظيف التي تقدمت إليها</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !Array.isArray(applications) || applications.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">لم تتقدم على أي وظيفة بعد</p>
              <p className="text-sm mt-1 mb-4">استعرض الوظائف المتاحة وابدأ رحلتك</p>
              <Button asChild><Link href="/jobs">استعرض الوظائف</Link></Button>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app: any) => (
                <Card key={app.id} data-testid={`card-application-${app.id}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-4 justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="font-semibold text-sm">{app.jobTitle ?? "وظيفة"}</span>
                        </div>
                        {app.employerName && (
                          <p className="text-xs text-muted-foreground mb-2">{app.employerName}</p>
                        )}
                        {app.coverLetter && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{app.coverLetter}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(app.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${STATUS_COLORS[app.status] ?? "bg-muted text-muted-foreground border-border"}`}>
                        {APP_STATUS_LABELS[app.status] ?? app.status}
                      </span>
                    </div>
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
