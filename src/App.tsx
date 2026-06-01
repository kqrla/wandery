import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/wandery/pages/Landing";
import Atlas from "@/wandery/pages/Atlas";
import About from "@/wandery/pages/About";
import Philosophy from "@/wandery/pages/Philosophy";
import Features from "@/wandery/pages/Features";
import Roadmap from "@/wandery/pages/Roadmap";
import Conflict from "@/wandery/pages/Conflict";
import Conflicts from "@/wandery/pages/Conflicts";
import { useParams } from "react-router-dom";

const ConflictRoute = () => {
  const { id } = useParams<{ id: string }>();
  return <Conflict id={id ?? "kashmir"} />;
};
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/world" element={<Atlas region="world" />} />
          <Route path="/europe" element={<Atlas region="europe" />} />
          <Route path="/america" element={<Atlas region="america" />} />
          <Route path="/northamerica" element={<Atlas region="northamerica" />} />
          <Route path="/southamerica" element={<Atlas region="southamerica" />} />
          <Route path="/mena" element={<Atlas region="mena" />} />
          <Route path="/asia" element={<Atlas region="asia" />} />
          <Route path="/africa" element={<Atlas region="africa" />} />
          <Route path="/oceania" element={<Atlas region="oceania" />} />
          <Route path="/country/canada" element={<Atlas region="canada" />} />
          <Route path="/country/unitedstates" element={<Atlas region="unitedstates" />} />
          <Route path="/country/unitedkingdom" element={<Atlas region="unitedkingdom" />} />
          <Route path="/country/australia" element={<Atlas region="australia" />} />
          <Route path="/country/newzealand" element={<Atlas region="newzealand" />} />
          <Route path="/conflicts" element={<Conflicts />} />
          <Route path="/conflict/:id" element={<ConflictRoute />} />
          <Route path="/about" element={<About />} />
          <Route path="/philosophy" element={<Philosophy />} />
          <Route path="/features" element={<Features />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
