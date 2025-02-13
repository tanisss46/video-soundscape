import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Explore from "./pages/Explore";
import CreateSoundEffect from "./pages/CreateSoundEffect";
import MyVideos from "./pages/MyVideos";
import AuthPage from "./pages/Auth";
import { AppSidebar } from "./components/AppSidebar";
import { Navbar } from "./components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full bg-[#0f111a]">
        <AppSidebar />
        <main className="flex-1 overflow-auto pt-16">
          <Navbar />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<Navigate to="/explore" replace />} />
      <Route path="/explore" element={
        <AppLayout>
          <Explore />
        </AppLayout>
      } />
      <Route path="/create-sound-effect" element={
        <ProtectedRoute>
          <AppLayout>
            <CreateSoundEffect />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/my-videos" element={
        <ProtectedRoute>
          <AppLayout>
            <MyVideos />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/explore" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AppRoutes />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;