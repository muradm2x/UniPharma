import { useGetVerificationQueue, getGetVerificationQueueQueryKey, useVerifyCandidateCredentials } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, ShieldX, MapPin } from "lucide-react";

export default function AdminVerification() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: queue, isLoading } = useGetVerificationQueue({ query: { queryKey: getGetVerificationQueueQueryKey() } });
  const verifyMutation = useVerifyCandidateCredentials();

  function handleVerify(id: number, verified: boolean) {
    verifyMutation.mutate({ candidateId: id, data: { verified, badge: verified ? "verified" : undefined } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetVerificationQueueQueryKey() });
        toast({ title: verified ? "تم قبول التحقق" : "تم رفض التحقق" });
      },
      onError: () => toast({ title: "خطأ في التحديث", variant: "destructive" }),
    });
  }

  return (
    <ProtectedRoute role="admin">
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-4">
          <div>
            <h1 className="text-2xl font-bold">طلبات التحقق</h1>
            <p className="text-muted-foreground text-sm mt-0.5">مراجعة وتحقق من بيانات الصيادلة</p>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : !Array.isArray(queue) || queue.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-30 text-green-600" />
              <p className="text-lg font-medium">لا توجد طلبات تحقق معلقة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((c: any) => (
                <Card key={c.id} data-testid={`card-verification-${c.id}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{c.fullName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <MapPin className="w-3 h-3" />{c.governorate} - {c.city}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="outline" className="text-xs">{c.specialization}</Badge>
                          <Badge variant="outline" className="text-xs">{c.yearsExperience} سنة خبرة</Badge>
                          <Badge variant="outline" className="text-xs">اكتمال: {c.profileCompletionPct}%</Badge>
                        </div>
                        {c.university && <p className="text-xs text-muted-foreground mt-1">{c.university} - {c.faculty}</p>}
                        {c.certifications && <p className="text-xs text-muted-foreground mt-0.5">شهادات: {c.certifications}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1.5 flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleVerify(c.id, true)} disabled={verifyMutation.isPending} data-testid={`button-approve-${c.id}`}>
                        <ShieldCheck className="w-3.5 h-3.5" /> قبول التحقق
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 flex-1 text-destructive border-destructive/30" onClick={() => handleVerify(c.id, false)} disabled={verifyMutation.isPending} data-testid={`button-reject-${c.id}`}>
                        <ShieldX className="w-3.5 h-3.5" /> رفض
                      </Button>
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
