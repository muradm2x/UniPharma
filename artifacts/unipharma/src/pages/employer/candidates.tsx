import { useState } from "react";
import { useListCandidates, getListCandidatesQueryKey, useAddToShortlist, useCreateOffer } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, MapPin, Bookmark, Send, ShieldCheck } from "lucide-react";
import { GOVERNORATES, SPECIALIZATIONS } from "@/lib/constants";

const offerSchema = z.object({ message: z.string().min(10, "الرسالة قصيرة جداً") });
type OfferForm = z.infer<typeof offerSchema>;

const EMPTY = "__all__";

export default function EmployerCandidates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [governorate, setGovernorate] = useState(EMPTY);
  const [specialization, setSpecialization] = useState(EMPTY);
  const [availableNow, setAvailableNow] = useState<boolean | undefined>();
  const [offerCandidate, setOfferCandidate] = useState<any>(null);

  const params: Record<string, any> = { page: 1, limit: 30 };
  if (governorate !== EMPTY) params.governorate = governorate;
  if (specialization !== EMPTY) params.specialization = specialization;
  if (availableNow) params.availableNow = true;

  const { data, isLoading } = useListCandidates(params, { query: { queryKey: getListCandidatesQueryKey(params) } });
  const shortlistMutation = useAddToShortlist();
  const offerMutation = useCreateOffer();

  const offerForm = useForm<OfferForm>({
    resolver: zodResolver(offerSchema),
    defaultValues: { message: "" },
  });

  function handleShortlist(candidateId: number) {
    shortlistMutation.mutate({ candidateId }, {
      onSuccess: () => toast({ title: "تمت إضافته إلى المفضلة" }),
      onError: () => toast({ title: "خطأ في الإضافة", variant: "destructive" }),
    });
  }

  function submitOffer(values: OfferForm) {
    if (!offerCandidate) return;
    offerMutation.mutate({ data: { candidateId: offerCandidate.id, message: values.message } }, {
      onSuccess: () => {
        toast({ title: "تم إرسال العرض" });
        setOfferCandidate(null);
        offerForm.reset();
      },
      onError: (err: any) => {
        const msg = err?.data?.error ?? "خطأ في إرسال العرض";
        toast({ title: msg, variant: "destructive" });
      },
    });
  }

  return (
    <ProtectedRoute role="employer">
      <AppLayout>
        <div className="max-w-5xl mx-auto space-y-4">
          <div>
            <h1 className="text-2xl font-bold">استعراض المرشحين</h1>
            <p className="text-muted-foreground text-sm mt-0.5">تصفح ملفات الصيادلة المتاحين</p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-card rounded-xl border border-border">
            <Select value={governorate} onValueChange={setGovernorate}>
              <SelectTrigger data-testid="filter-governorate"><SelectValue placeholder="المحافظة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={EMPTY}>كل المحافظات</SelectItem>
                {GOVERNORATES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={specialization} onValueChange={setSpecialization}>
              <SelectTrigger data-testid="filter-specialization"><SelectValue placeholder="التخصص" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={EMPTY}>كل التخصصات</SelectItem>
                {SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              variant={availableNow ? "default" : "outline"}
              onClick={() => setAvailableNow(v => v ? undefined : true)}
              data-testid="filter-available"
            >
              {availableNow ? "متاح للعمل فقط" : "الكل"}
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : !data?.items?.length ? (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">لا يوجد مرشحون</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.items.map((c: any) => (
                <Card key={c.id} className="hover:shadow-md transition-shadow" data-testid={`card-candidate-${c.id}`}>
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {c.fullName?.charAt(0) ?? "ص"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-sm">{c.fullName}</span>
                          {c.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-green-600" />}
                          {c.availableForWork && <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">متاح</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{c.governorate} - {c.city}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge variant="outline" className="text-xs">{c.specialization}</Badge>
                      <Badge variant="outline" className="text-xs">{c.yearsExperience} سنة خبرة</Badge>
                    </div>
                    {c.personalSummary && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.personalSummary}</p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => handleShortlist(c.id)} disabled={shortlistMutation.isPending} data-testid={`button-shortlist-${c.id}`}>
                        <Bookmark className="w-3.5 h-3.5" /> مفضلة
                      </Button>
                      <Button size="sm" className="flex-1 gap-1.5" onClick={() => { setOfferCandidate(c); offerForm.reset(); }} data-testid={`button-offer-${c.id}`}>
                        <Send className="w-3.5 h-3.5" /> إرسال عرض
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Offer dialog */}
        <Dialog open={!!offerCandidate} onOpenChange={(v) => { if (!v) setOfferCandidate(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إرسال عرض لـ {offerCandidate?.fullName}</DialogTitle>
            </DialogHeader>
            <Form {...offerForm}>
              <form onSubmit={offerForm.handleSubmit(submitOffer)} className="space-y-4 mt-2">
                <FormField control={offerForm.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel>رسالة العرض</FormLabel>
                    <FormControl><Textarea rows={5} placeholder="اكتب رسالتك لهذا المرشح..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={offerMutation.isPending} data-testid="button-submit-offer">
                  {offerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                  إرسال العرض
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </AppLayout>
    </ProtectedRoute>
  );
}
