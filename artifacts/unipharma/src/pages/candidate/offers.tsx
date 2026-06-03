import { useListOffers, getListOffersQueryKey, useRespondToOffer } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Building2, CheckCircle, XCircle } from "lucide-react";
import { OFFER_STATUS_LABELS } from "@/lib/constants";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function CandidateOffers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: offers, isLoading } = useListOffers({ query: { queryKey: getListOffersQueryKey() } });
  const respondMutation = useRespondToOffer();

  function respond(id: number, status: "accepted" | "rejected") {
    respondMutation.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOffersQueryKey() });
        toast({ title: status === "accepted" ? "تم قبول العرض" : "تم رفض العرض" });
      },
      onError: () => toast({ title: "خطأ في الرد", variant: "destructive" }),
    });
  }

  return (
    <ProtectedRoute role="candidate">
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <div>
            <h1 className="text-2xl font-bold">العروض الواردة</h1>
            <p className="text-muted-foreground text-sm mt-0.5">عروض التوظيف المباشرة من أصحاب العمل</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !Array.isArray(offers) || offers.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">لا توجد عروض بعد</p>
              <p className="text-sm mt-1">أكمل ملفك الشخصي لتزيد فرص تلقي عروض العمل</p>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer: any) => (
                <Card key={offer.id} data-testid={`card-offer-${offer.id}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="font-semibold text-sm">{offer.employerName ?? "صيدلية"}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{offer.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(offer.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[offer.status] ?? "bg-muted text-muted-foreground"}`}>
                        {OFFER_STATUS_LABELS[offer.status] ?? offer.status}
                      </span>
                    </div>
                    {offer.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-1.5 flex-1" onClick={() => respond(offer.id, "accepted")} disabled={respondMutation.isPending} data-testid={`button-accept-offer-${offer.id}`}>
                          <CheckCircle className="w-3.5 h-3.5" /> قبول
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5 flex-1 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => respond(offer.id, "rejected")} disabled={respondMutation.isPending} data-testid={`button-reject-offer-${offer.id}`}>
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
