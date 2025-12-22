import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import DocPage from "./pages/DocPage";
import Admin from "./pages/Admin";
import AdminSectionForm from "./pages/AdminSectionForm";
import AdminPageForm from "./pages/AdminPageForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/docs/:sectionSlug/:pageSlug" element={<DocPage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/sections/new" element={<AdminSectionForm />} />
              <Route path="/admin/sections/:id" element={<AdminSectionForm />} />
              <Route path="/admin/pages/new" element={<AdminPageForm />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
