import { useState } from "react";
import { useListJobs, getListJobsQueryKey, useCreateJob, useDeleteJob, useUpdateJob } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Briefcase, MapPin, Trash2 } from "lucide-react";
import { GOVERNORATES, SPECIALIZATIONS, JOB_TYPES, SHIFTS, JOB_STATUS_LABELS } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";

const jobSchema = z.object({
  title: z.string().min(3, "العنوان مطلوب"),
  specialization: z.string().min(1, "التخصص مطلوب"),
  description: z.string().optional(),
  governorate: z.string().min(1, "المحافظة مطلوبة"),
  city: z.string().min(1, "المدينة مطلوبة"),
  jobType: z.string().min(1, "نوع العمل مطلوب"),
  shift: z.string().optional(),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
});
type JobForm = z.infer<typeof jobSchema>;

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-700",
  filled: "bg-blue-100 text-blue-800",
};

export default function EmployerJobs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: jobsData, isLoading } = useListJobs({}, { query: { queryKey: getListJobsQueryKey({}) } });
  const createMutation = useCreateJob();
  const deleteMutation = useDeleteJob();

  const form = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: { title: "", specialization: "", description: "", governorate: "", city: "", jobType: "", shift: "" },
  });

  function onSubmit(values: JobForm) {
    createMutation.mutate({ data: values as any }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey({}) });
        toast({ title: "تم نشر الوظيفة" });
        setCreateOpen(false);
        form.reset();
      },
      onError: () => toast({ title: "خطأ في نشر الوظيفة", variant: "destructive" }),
    });
  }

  function handleDelete(id: number) {
    if (!confirm("هل تريد حذف هذه الوظيفة؟")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey({}) });
        toast({ title: "تم حذف الوظيفة" });
      },
    });
  }

  return (
    <ProtectedRoute role="employer">
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">إعلاناتي</h1>
              <p className="text-muted-foreground text-sm mt-0.5">إدارة إعلانات التوظيف</p>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-create-job">
                  <Plus className="w-4 h-4" /> نشر وظيفة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>نشر وظيفة جديدة</DialogTitle></DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem><FormLabel>عنوان الوظيفة</FormLabel><FormControl><Input placeholder="مثل: صيدلاني أول" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={form.control} name="specialization" render={({ field }) => (
                        <FormItem><FormLabel>التخصص</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl><SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger></FormControl>
                            <SelectContent>{SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        <FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="jobType" render={({ field }) => (
                        <FormItem><FormLabel>نوع العمل</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl><SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger></FormControl>
                            <SelectContent>{JOB_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>
                        <FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={form.control} name="governorate" render={({ field }) => (
                        <FormItem><FormLabel>المحافظة</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl><SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger></FormControl>
                            <SelectContent>{GOVERNORATES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                          </Select>
                        <FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>المدينة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="shift" render={({ field }) => (
                      <FormItem><FormLabel>الوردية (اختياري)</FormLabel>
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <FormControl><SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger></FormControl>
                          <SelectContent>{SHIFTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      <FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={form.control} name="salaryMin" render={({ field }) => (
                        <FormItem><FormLabel>الحد الأدنى للراتب</FormLabel><FormControl><Input type="number" placeholder="جنيه" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="salaryMax" render={({ field }) => (
                        <FormItem><FormLabel>الحد الأقصى</FormLabel><FormControl><Input type="number" placeholder="جنيه" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem><FormLabel>وصف الوظيفة</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-job">
                      {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                      نشر الوظيفة
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}</div>
          ) : !jobsData?.items?.length ? (
            <div className="text-center py-20 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">لا توجد وظائف منشورة بعد</p>
              <p className="text-sm mt-1 mb-4">انشر أول إعلان توظيف الآن</p>
              <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="w-4 h-4" />نشر وظيفة</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobsData.items.map((job: any) => (
                <Card key={job.id} data-testid={`card-job-${job.id}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold">{job.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.status] ?? "bg-muted"}`}>
                            {JOB_STATUS_LABELS[job.status] ?? job.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{job.governorate} - {job.city}
                          </span>
                          <Badge variant="outline" className="text-xs">{job.specialization}</Badge>
                          <Badge variant="outline" className="text-xs">{job.jobType}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {new Date(job.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0" onClick={() => handleDelete(job.id)} data-testid={`button-delete-job-${job.id}`}>
                        <Trash2 className="w-4 h-4" />
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
