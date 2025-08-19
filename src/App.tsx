import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Computadores from "./pages/Computadores";
import Equipamentos from "./pages/Equipamentos";
import Condicionados from "./pages/Air";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/computadores" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
                  <Computadores />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/equipamentos" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
                  <Equipamentos />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/condicionadores" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
                  <Condicionados/>
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
