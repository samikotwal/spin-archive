import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import SavedLists from "./pages/SavedLists";
import AnimeFinder from "./pages/AnimeFinder";
import AnimeDetail from "./pages/AnimeDetail";
import Favorites from "./pages/Favorites";
import GenrePage from "./pages/GenrePage";
import Auth from "./pages/Auth";
import AlphabetBrowse from "./pages/AlphabetBrowse";
import NotFound from "./pages/NotFound";
import MobileBottomNav from "./components/MobileBottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/explore" element={<AnimeFinder />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/genre" element={<GenrePage />} />
          <Route path="/wheel" element={<Index />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/saved" element={<SavedLists />} />
          <Route path="/browse/:letter" element={<AlphabetBrowse />} />
          <Route path="/auth" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <MobileBottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
