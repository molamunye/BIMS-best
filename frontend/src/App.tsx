import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ClientDashboard from "./pages/ClientDashboard";
import BrokerDashboard from "./pages/BrokerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
// Footer pages
import AboutUs from "./pages/footer/AboutUs";
import ForBrokers from "./pages/footer/ForBrokers";
import HowItWorks from "./pages/footer/HowItWorks";
import Support from "./pages/footer/Support";
import HelpCenter from "./pages/footer/HelpCenter";
import TermsOfService from "./pages/footer/TermsOfService";
import PrivacyPolicy from "./pages/footer/PrivacyPolicy";
import ContactUs from "./pages/footer/ContactUs";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/client-dashboard" element={<ClientDashboard />} />
              <Route path="/broker-dashboard" element={<BrokerDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              {/* Footer pages */}
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/for-brokers" element={<ForBrokers />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/support" element={<Support />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/contact-us" element={<ContactUs />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
