import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";

import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import JobsPage from "@/pages/jobs";

import CandidateDashboard from "@/pages/candidate/dashboard";
import CandidateProfile from "@/pages/candidate/profile";
import CandidateApplications from "@/pages/candidate/applications";
import CandidateOffers from "@/pages/candidate/offers";
import CandidateNotifications from "@/pages/candidate/notifications";

import EmployerDashboard from "@/pages/employer/dashboard";
import EmployerProfile from "@/pages/employer/profile";
import EmployerJobs from "@/pages/employer/jobs";
import EmployerCandidates from "@/pages/employer/candidates";
import EmployerShortlist from "@/pages/employer/shortlist";
import EmployerApplications from "@/pages/employer/applications";
import EmployerOffers from "@/pages/employer/offers";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminVerification from "@/pages/admin/verification";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/jobs" component={JobsPage} />

      <Route path="/candidate/dashboard" component={CandidateDashboard} />
      <Route path="/candidate/profile" component={CandidateProfile} />
      <Route path="/candidate/applications" component={CandidateApplications} />
      <Route path="/candidate/offers" component={CandidateOffers} />
      <Route path="/candidate/notifications" component={CandidateNotifications} />

      <Route path="/employer/dashboard" component={EmployerDashboard} />
      <Route path="/employer/profile" component={EmployerProfile} />
      <Route path="/employer/jobs" component={EmployerJobs} />
      <Route path="/employer/candidates" component={EmployerCandidates} />
      <Route path="/employer/shortlist" component={EmployerShortlist} />
      <Route path="/employer/applications" component={EmployerApplications} />
      <Route path="/employer/offers" component={EmployerOffers} />

      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/verification" component={AdminVerification} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
