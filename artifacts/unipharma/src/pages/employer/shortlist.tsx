import { useGetShortlist, getGetShortlistQueryKey, useRemoveFromShortlist } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bookmark, MapPin, ShieldCheck, X } from "lucide-react";

export default function EmployerShortlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: shortlist, isLoading } = useGetShortlist({ query: { queryKey: getGetShortlistQueryKey() } });
  const removeMutation = useRemoveFromShortlist();

  function handleRemove(candidateId: number) {
    removeMutation.mutate({ candidateId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetShortlistQueryKey() });
        toast({ title: "تمت إزالته من المفضلة" });
      },
      onError: () => toast({ title: "خطأ في الإزالة", variant: "destructive" }),
    });
  }

  return (
    <ProtectedRoute role="employer">
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-4">
          <div>
            <h1 className="text-2xl font-bold">قائمة المفضلة</h1>
            <p className="text-muted-foreground text-sm mt-0.5">المرشحون المحفوظون</p>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2].map(i => <div key={i} className="h-36 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : !Array.isArray(shortlist) || shortlist.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">قائمة المفضلة فارغة</p>
              <p className="text-sm mt-1">أضف مرشحين من صفحة استعراض المرشحين</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shortlist.map((c: any) => (
                <Card key={c.id} data-testid={`card-shortlist-${c.id}`}>
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {c.fullName?.charAt(0) ?? "ص"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm">{c.fullName}</span>
                          {c.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-green-600" />}
                          {c.availableForWork && <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">متاح</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{c.governorate} - {c.city}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => handleRemove(c.id)} data-testid={`button-remove-shortlist-${c.id}`}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-xs">{c.specialization}</Badge>
                      <Badge variant="outline" className="text-xs">{c.yearsExperience} سنة خبرة</Badge>
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
