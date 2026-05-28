import { useListNotifications, getListNotificationsQueryKey, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CandidateNotifications() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useListNotifications({ query: { queryKey: getListNotificationsQueryKey() } });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  function handleMarkRead(id: number) {
    markRead.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() }),
    });
  }

  function handleMarkAll() {
    markAll.mutate(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() }),
    });
  }

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

  return (
    <ProtectedRoute role="candidate">
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">الإشعارات</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{unreadCount} غير مقروء</p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" className="gap-2" onClick={handleMarkAll} disabled={markAll.isPending} data-testid="button-mark-all-read">
                <CheckCheck className="w-4 h-4" /> قراءة الكل
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !Array.isArray(notifications) || notifications.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif: any) => (
                <Card key={notif.id} className={cn(!notif.isRead && "border-primary/40 bg-primary/5")} data-testid={`card-notif-${notif.id}`}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                          <p className="font-semibold text-sm">{notif.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{notif.body}</p>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {new Date(notif.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => handleMarkRead(notif.id)} data-testid={`button-mark-read-${notif.id}`}>
                          قراءة
                        </Button>
                      )}
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
