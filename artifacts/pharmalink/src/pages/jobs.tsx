import { useState } from "react";
import { useListJobs, getListJobsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GOVERNORATES, SPECIALIZATIONS, JOB_TYPES } from "@/lib/constants";
import { MapPin, Briefcase, Clock, Search, Filter, Building2, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const EMPTY_FILTER = "__all__";

export default function JobsPage() {
  const { isAuthenticated } = useAuth();
  const [governorate, setGovernorate] = useState(EMPTY_FILTER);
  const [specialization, setSpecialization] = useState(EMPTY_FILTER);
  const [jobType, setJobType] = useState(EMPTY_FILTER);
  const [page, setPage] = useState(1);

  const params: Record<string, any> = { page, limit: 20 };
  if (governorate !== EMPTY_FILTER) params.governorate = governorate;
  if (specialization !== EMPTY_FILTER) params.specialization = specialization;
  if (jobType !== EMPTY_FILTER) params.jobType = jobType;

  const { data, isLoading } = useListJobs(params, { query: { queryKey: getListJobsQueryKey(params) } });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">P</span>
            </div>
            <span className="font-black text-xl">PharmLink</span>
          </Link>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button asChild size="sm"><Link href="/candidate/dashboard">لوحة التحكم</Link></Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link href="/login">دخول</Link></Button>
                <Button asChild size="sm"><Link href="/register">سجّل الآن</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">الوظائف المتاحة</h1>
          <p className="text-muted-foreground text-sm">استعرض جميع الوظائف الصيدلية المتاحة في مصر</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 p-4 bg-card rounded-xl border border-border">
          <Select value={governorate} onValueChange={setGovernorate}>
            <SelectTrigger data-testid="filter-governorate">
              <SelectValue placeholder="المحافظة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_FILTER}>كل المحافظات</SelectItem>
              {GOVERNORATES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={specialization} onValueChange={setSpecialization}>
            <SelectTrigger data-testid="filter-specialization">
              <SelectValue placeholder="التخصص" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_FILTER}>كل التخصصات</SelectItem>
              {SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger data-testid="filter-jobType">
              <SelectValue placeholder="نوع العمل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_FILTER}>كل الأنواع</SelectItem>
              {JOB_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : !data?.items?.length ? (
          <div className="text-center py-20 text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">لا توجد وظائف متاحة</p>
            <p className="text-sm mt-1">حاول تغيير فلاتر البحث</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4">{data.total} وظيفة متاحة</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.items.map((job: any) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow" data-testid={`card-job-${job.id}`}>
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-foreground text-base">{job.title}</h3>
                          {job.isEmergency && (
                            <Badge variant="destructive" className="text-xs gap-1">
                              <Zap className="w-3 h-3" /> طارئ
                            </Badge>
                          )}
                        </div>
                        {job.employerName && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{job.employerName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs gap-1">
                        <MapPin className="w-3 h-3" />{job.governorate} - {job.city}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{job.specialization}</Badge>
                      <Badge variant="outline" className="text-xs">{job.jobType}</Badge>
                      {job.shift && <Badge variant="outline" className="text-xs">{job.shift}</Badge>}
                    </div>
                    {job.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{job.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                      {isAuthenticated ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/candidate/dashboard`}>تقدّم الآن</Link>
                        </Button>
                      ) : (
                        <Button asChild size="sm">
                          <Link href="/register">تقدّم الآن</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {data.total > 20 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>السابق</Button>
                <span className="px-4 py-2 text-sm text-muted-foreground">صفحة {page}</span>
                <Button variant="outline" disabled={data.items.length < 20} onClick={() => setPage(p => p + 1)}>التالي</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
