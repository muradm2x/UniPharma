import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetMyCandidateProfile, getGetMyCandidateProfileQueryKey, useUpdateCandidateProfile } from "@workspace/api-client-react";
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
import { GOVERNORATES, SPECIALIZATIONS, SHIFTS, JOB_TYPES, GENDERS } from "@/lib/constants";

const profileSchema = z.object({
  fullName: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  gender: z.string().optional(),
  governorate: z.string().min(1, "المحافظة مطلوبة"),
  city: z.string().min(1, "المدينة مطلوبة"),
  address: z.string().optional(),
  university: z.string().optional(),
  faculty: z.string().optional(),
  specialization: z.string().min(1, "التخصص مطلوب"),
  yearsExperience: z.coerce.number().min(0),
  previousWorkplaces: z.string().optional(),
  pharmacySkills: z.string().optional(),
  computerSkills: z.string().optional(),
  certifications: z.string().optional(),
  personalSummary: z.string().optional(),
  preferredShift: z.string().optional(),
  jobType: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function CandidateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: profile, isLoading } = useGetMyCandidateProfile({ query: { queryKey: getGetMyCandidateProfileQueryKey() } });
  const updateMutation = useUpdateCandidateProfile();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", phone: "", whatsapp: "", gender: "", governorate: "", city: "", address: "", university: "", faculty: "", specialization: "", yearsExperience: 0, previousWorkplaces: "", pharmacySkills: "", computerSkills: "", certifications: "", personalSummary: "", preferredShift: "", jobType: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName ?? "",
        phone: profile.phone ?? "",
        whatsapp: profile.whatsapp ?? "",
        gender: profile.gender ?? "",
        governorate: profile.governorate ?? "",
        city: profile.city ?? "",
        address: profile.address ?? "",
        university: profile.university ?? "",
        faculty: profile.faculty ?? "",
        specialization: profile.specialization ?? "",
        yearsExperience: profile.yearsExperience ?? 0,
        previousWorkplaces: profile.previousWorkplaces ?? "",
        pharmacySkills: profile.pharmacySkills ?? "",
        computerSkills: profile.computerSkills ?? "",
        certifications: profile.certifications ?? "",
        personalSummary: profile.personalSummary ?? "",
        preferredShift: profile.preferredShift ?? "",
        jobType: profile.jobType ?? "",
      });
    }
  }, [profile, form]);

  function onSubmit(values: ProfileForm) {
    updateMutation.mutate({ data: values as any }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyCandidateProfileQueryKey() });
        toast({ title: "تم حفظ الملف الشخصي" });
      },
      onError: () => toast({ title: "خطأ في الحفظ", variant: "destructive" }),
    });
  }

  if (isLoading) return (
    <ProtectedRoute role="candidate">
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );

  return (
    <ProtectedRoute role="candidate">
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold">ملفي الشخصي</h1>
            <p className="text-muted-foreground text-sm mt-0.5">اكتمال الملف: <span className="font-semibold text-primary">{profile?.profileCompletionPct ?? 0}%</span></p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-base">البيانات الشخصية</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>الاسم الكامل</FormLabel><FormControl><Input data-testid="input-fullName" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>الهاتف</FormLabel><FormControl><Input data-testid="input-phone" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="whatsapp" render={({ field }) => (
                      <FormItem><FormLabel>واتساب</FormLabel><FormControl><Input data-testid="input-whatsapp" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem><FormLabel>النوع</FormLabel>
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger data-testid="select-gender"><SelectValue placeholder="اختر" /></SelectTrigger></FormControl>
                        <SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="governorate" render={({ field }) => (
                      <FormItem><FormLabel>المحافظة</FormLabel>
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <FormControl><SelectTrigger data-testid="select-governorate"><SelectValue placeholder="اختر" /></SelectTrigger></FormControl>
                          <SelectContent>{GOVERNORATES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem><FormLabel>المدينة / الحي</FormLabel><FormControl><Input data-testid="input-city" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">المؤهل العلمي</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="university" render={({ field }) => (
                      <FormItem><FormLabel>الجامعة</FormLabel><FormControl><Input data-testid="input-university" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="faculty" render={({ field }) => (
                      <FormItem><FormLabel>الكلية</FormLabel><FormControl><Input data-testid="input-faculty" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">الخبرة المهنية</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="specialization" render={({ field }) => (
                      <FormItem><FormLabel>التخصص</FormLabel>
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <FormControl><SelectTrigger data-testid="select-specialization"><SelectValue placeholder="اختر" /></SelectTrigger></FormControl>
                          <SelectContent>{SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="yearsExperience" render={({ field }) => (
                      <FormItem><FormLabel>سنوات الخبرة</FormLabel><FormControl><Input type="number" min="0" data-testid="input-yearsExperience" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="previousWorkplaces" render={({ field }) => (
                    <FormItem><FormLabel>أماكن العمل السابقة</FormLabel><FormControl><Textarea data-testid="input-previousWorkplaces" placeholder="اسم الصيدلية، المدة..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="pharmacySkills" render={({ field }) => (
                    <FormItem><FormLabel>المهارات الصيدلانية</FormLabel><FormControl><Input data-testid="input-pharmacySkills" placeholder="e.g. تجهيز أدوية، تداول عملاء..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="certifications" render={({ field }) => (
                    <FormItem><FormLabel>الشهادات والدورات</FormLabel><FormControl><Input data-testid="input-certifications" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">تفضيلات العمل</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="preferredShift" render={({ field }) => (
                      <FormItem><FormLabel>الوردية المفضلة</FormLabel>
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <FormControl><SelectTrigger data-testid="select-shift"><SelectValue placeholder="اختر" /></SelectTrigger></FormControl>
                          <SelectContent>{SHIFTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="jobType" render={({ field }) => (
                      <FormItem><FormLabel>نوع العمل</FormLabel>
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <FormControl><SelectTrigger data-testid="select-jobType"><SelectValue placeholder="اختر" /></SelectTrigger></FormControl>
                          <SelectContent>{JOB_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="personalSummary" render={({ field }) => (
                    <FormItem><FormLabel>نبذة شخصية</FormLabel><FormControl><Textarea data-testid="input-summary" placeholder="اكتب نبذة مختصرة عنك..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Button type="submit" className="w-full gap-2" disabled={updateMutation.isPending} data-testid="button-save">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                حفظ الملف الشخصي
              </Button>
            </form>
          </Form>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
