import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useListNotifications } from "@workspace/api-client-react";
import {
  Bell, Briefcase, User, LayoutDashboard, FileText,
  LogOut, Menu, X, MessageSquare, Bookmark, Users, ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function getCandidateNav(): NavItem[] {
  return [
    { href: "/candidate/dashboard", label: "لوحة التحكم", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/candidate/profile", label: "ملفي الشخصي", icon: <User className="w-4 h-4" /> },
    { href: "/candidate/applications", label: "طلباتي", icon: <FileText className="w-4 h-4" /> },
    { href: "/candidate/offers", label: "العروض", icon: <MessageSquare className="w-4 h-4" /> },
    { href: "/candidate/notifications", label: "الإشعارات", icon: <Bell className="w-4 h-4" /> },
  ];
}

function getEmployerNav(): NavItem[] {
  return [
    { href: "/employer/dashboard", label: "لوحة التحكم", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/employer/profile", label: "ملف الصيدلية", icon: <User className="w-4 h-4" /> },
    { href: "/employer/jobs", label: "إعلاناتي", icon: <Briefcase className="w-4 h-4" /> },
    { href: "/employer/candidates", label: "استعراض المرشحين", icon: <Users className="w-4 h-4" /> },
    { href: "/employer/shortlist", label: "قائمة المفضلة", icon: <Bookmark className="w-4 h-4" /> },
    { href: "/employer/applications", label: "الطلبات الواردة", icon: <FileText className="w-4 h-4" /> },
    { href: "/employer/offers", label: "العروض المرسلة", icon: <MessageSquare className="w-4 h-4" /> },
  ];
}

function getAdminNav(): NavItem[] {
  return [
    { href: "/admin/dashboard", label: "لوحة التحكم", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/admin/users", label: "إدارة المستخدمين", icon: <Users className="w-4 h-4" /> },
    { href: "/admin/verification", label: "طلبات التحقق", icon: <ShieldCheck className="w-4 h-4" /> },
  ];
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: notifications } = useListNotifications();
  const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

  const navItems = user?.role === "candidate" ? getCandidateNav()
    : user?.role === "employer" ? getEmployerNav()
    : user?.role === "admin" ? getAdminNav()
    : [];

  return (
    <div className="min-h-screen flex bg-background" dir="rtl">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-sidebar border-l border-sidebar-border transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-lg text-sidebar-foreground">PharmLink</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-3 border-b border-sidebar-border">
            <div className="text-xs text-muted-foreground mb-1">مرحباً،</div>
            <div className="font-semibold text-sidebar-foreground text-sm truncate">{user?.fullName}</div>
            <div className="text-xs text-muted-foreground">
              {user?.role === "candidate" ? "صيدلاني" : user?.role === "employer" ? "صيدلية" : "مسؤول"}
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location === item.href || location.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={isActive ? "text-sidebar-primary" : ""}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.label === "الإشعارات" && unreadCount > 0 && (
                    <Badge className="mr-auto text-xs" variant="destructive">{unreadCount}</Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-sidebar-border">
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive" onClick={logout} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-30 flex items-center px-4 gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)} data-testid="button-menu">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1" />
          <Link href={user?.role === "candidate" ? "/candidate/notifications" : "#"}>
            <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 left-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </Link>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
