import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetMyEmployerProfile, getGetMyEmployerProfileQueryKey, useUpdateEmployerProfile } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { GOVERNORATES } from "@/lib/constants";

const profileSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  ownerName: z.string().optional(),
  governorate: z.string().min(1, "المحافظة مطلوبة"),
  city: z.string().min(1, "المدينة مطلوبة"),
  address: z.string().optional(),
  nearbyLandmark: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  alternatePhone: z.string().optional(),
  description: z.string().optional(),
  mapsLink: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function EmployerProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: profile, isLoading } = useGetMyEmployerProfile({ query: { queryKey: getGetMyEmployerProfileQueryKey() } });
  const updateMutation = useUpdateEmployerProfile();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", ownerName: "", governorate: "", city: "", address: "", nearbyLandmark: "", phone: "", whatsapp: "", alternatePhone: "", description: "", mapsLink: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name ?? "",
        ownerName: profile.ownerName ?? "",
        governorate: profile.governorate ?? "",
        city: profile.city ?? "",
        address: profile.address ?? "",
        nearbyLandmark: profile.nearbyLandmark ?? "",
        phone: profile.phone ?? "",
        whatsapp: profile.whatsapp ?? "",
        alternatePhone: profile.alternatePhone ?? "",
        description: profile.description ?? "",
        mapsLink: profile.mapsLink ?? "",
      });
    }
  }, [profile, form]);

  function onSubmit(values: ProfileForm) {
    updateMutation.mutate({ data: values as any }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyEmployerProfileQueryKey() });
        toast({ title: "تم حفظ ملف الصيدلية" });
      },
      onError: () => toast({ title: "خطأ في الحفظ", variant: "destructive" }),
    });
  }

  if (isLoading) return (
    <ProtectedRoute role="employer">
      <AppLayout>
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </AppLayout>
    </ProtectedRoute>
  );

  return (
    <ProtectedRoute role="employer">
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold">ملف الصيدلية</h1>
            <p className="text-muted-foreground text-sm mt-0.5">اكتمال الملف: <span className="font-semibold text-primary">{profile?.profileCompletionPct ?? 0}%</span></p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-base">بيانات الصيدلية</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>اسم الصيدلية</FormLabel><FormControl><Input data-testid="input-name" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="ownerName" render={({ field }) => (
                    <FormItem><FormLabel>اسم المالك</FormLabel><FormControl><Input data-testid="input-ownerName" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>نبذة عن الصيدلية</FormLabel><FormControl><Textarea rows={3} data-testid="input-description" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">بيانات الاتصال والموقع</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="governorate" render={({ field }) => (
                      <FormItem><FormLabel>المحافظة</FormLabel>
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <FormControl><SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger></FormControl>
                          <SelectContent>{GOVERNORATES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem><FormLabel>المدينة / الحي</FormLabel><FormControl><Input data-testid="input-city" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>العنوان التفصيلي</FormLabel><FormControl><Input data-testid="input-address" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="nearbyLandmark" render={({ field }) => (
                    <FormItem><FormLabel>أقرب معلم</FormLabel><FormControl><Input data-testid="input-landmark" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>هاتف</FormLabel><FormControl><Input data-testid="input-phone" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="whatsapp" render={({ field }) => (
                      <FormItem><FormLabel>واتساب</FormLabel><FormControl><Input data-testid="input-whatsapp" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="mapsLink" render={({ field }) => (
                    <FormItem><FormLabel>رابط خرائط Google (اختياري)</FormLabel><FormControl><Input data-testid="input-mapsLink" placeholder="https://maps.google.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>
              <Button type="submit" className="w-full gap-2" disabled={updateMutation.isPending} data-testid="button-save">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                حفظ ملف الصيدلية
              </Button>
            </form>
          </Form>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
