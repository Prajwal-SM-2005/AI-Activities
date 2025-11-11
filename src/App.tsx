import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Activity1 from "./pages/Activity1";
import Activity2 from "./pages/Activity2";
import Activity3A from "./pages/Activity3A";
import Activity3B from "./pages/Activity3B";
import Activity4 from "./pages/Activity4";
import Activity5 from "./pages/Activity5";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/activity-1" element={<Activity1 />} />
          <Route path="/activity-2" element={<Activity2 />} />
          <Route path="/activity-3a" element={<Activity3A />} />
          <Route path="/activity-3b" element={<Activity3B />} />
          <Route path="/activity-4" element={<Activity4 />} />
          <Route path="/activity-5" element={<Activity5 />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
