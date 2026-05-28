import { useListOffers, getListOffersQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare, User } from "lucide-react";
import { OFFER_STATUS_LABELS } from "@/lib/constants";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function EmployerOffers() {
  const { data: offers, isLoading } = useListOffers({ query: { queryKey: getListOffersQueryKey() } });

  return (
    <ProtectedRoute role="employer">
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <div>
            <h1 className="text-2xl font-bold">العروض المرسلة</h1>
            <p className="text-muted-foreground text-sm mt-0.5">تتبع العروض التي أرسلتها وردود المرشحين</p>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : !Array.isArray(offers) || offers.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">لم ترسل أي عروض بعد</p>
              <p className="text-sm mt-1">استعرض المرشحين وأرسل عروض العمل</p>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer: any) => (
                <Card key={offer.id} data-testid={`card-offer-${offer.id}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-semibold text-sm">{offer.candidateName ?? "مرشح"}</span>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[offer.status] ?? "bg-muted text-muted-foreground"}`}>
                        {OFFER_STATUS_LABELS[offer.status] ?? offer.status}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{offer.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(offer.createdAt).toLocaleDateString("ar-EG")}</p>
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
