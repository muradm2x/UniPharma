import { useState } from "react";
import { useListAdminUsers, getListAdminUsersQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  candidate: "صيدلاني",
  employer: "صيدلية",
  admin: "مسؤول",
};
const ROLE_COLORS: Record<string, string> = {
  candidate: "bg-blue-100 text-blue-800",
  employer: "bg-purple-100 text-purple-800",
  admin: "bg-rose-100 text-rose-800",
};

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const params = { page, limit: 20 };
  const { data, isLoading } = useListAdminUsers(params, { query: { queryKey: getListAdminUsersQueryKey(params) } });

  return (
    <ProtectedRoute role="admin">
      <AppLayout>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
            <p className="text-muted-foreground text-sm mt-0.5">جميع مستخدمي المنصة</p>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : !data?.items?.length ? (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>لا يوجد مستخدمون</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">{data.total} مستخدم</div>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">الاسم</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">البريد الإلكتروني</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">الدور</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">تاريخ التسجيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.items.map((user: any) => (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors" data-testid={`row-user-${user.id}`}>
                        <td className="px-4 py-3 font-medium">{user.fullName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[user.role] ?? "bg-muted text-muted-foreground"}`}>
                            {ROLE_LABELS[user.role] ?? user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("ar-EG")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.total > 20 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>السابق</Button>
                  <span className="px-4 py-2 text-sm text-muted-foreground">صفحة {page}</span>
                  <Button variant="outline" disabled={data.items.length < 20} onClick={() => setPage(p => p + 1)}>التالي</Button>
                </div>
              )}
            </>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
