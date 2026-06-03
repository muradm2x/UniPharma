import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "candidate" | "employer" | "admin";
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (role && user?.role !== role && user?.role !== "admin") {
      if (user?.role === "candidate") setLocation("/candidate/dashboard");
      else if (user?.role === "employer") setLocation("/employer/dashboard");
      else setLocation("/admin/dashboard");
    }
  }, [isAuthenticated, user, role, setLocation]);

  if (!isAuthenticated) return null;
  if (role && user?.role !== role && user?.role !== "admin") return null;

  return <>{children}</>;
}
