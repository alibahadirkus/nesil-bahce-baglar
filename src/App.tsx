import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import Layout from "./components/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import Trees from "./pages/admin/Trees";
import Volunteers from "./pages/admin/Volunteers";
import Activities from "./pages/admin/Activities";
import ProcessSteps from "./pages/admin/ProcessSteps";
import SMS from "./pages/admin/SMS";
import WhatsApp from "./pages/admin/WhatsApp";
import Images from "./pages/admin/Images";
import Preview from "./pages/Preview";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import ActivityGallery from "./pages/ActivityGallery";
import ProcessStepGallery from "./pages/ProcessStepGallery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/preview/:id" element={<Preview />} />
          <Route path="/volunteer/:id" element={<VolunteerDashboard />} />
          <Route path="/gallery" element={<ActivityGallery />} />
          <Route path="/process-step/:stepNumber" element={<ProcessStepGallery />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="trees" element={<Trees />} />
            <Route path="volunteers" element={<Volunteers />} />
            <Route path="activities" element={<Activities />} />
            <Route path="process-steps" element={<ProcessSteps />} />
            <Route path="sms" element={<SMS />} />
            <Route path="whatsapp" element={<WhatsApp />} />
            <Route path="images" element={<Images />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
