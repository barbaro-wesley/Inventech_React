import { Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import { ModuleSelection } from "@/pages/ModuleSelection";
import Computadores from "@/pages/Computadores";
import Equipamentos from "@/pages/Equipamentos";
import Condicionados from "@/pages/Air";
import Relatorios from "@/pages/Relatorios";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import PrinterPage from "@/pages/printer";
import Funcionarios from "@/pages/Funcionarios";
import TiposDocumentos from "@/pages/TiposDocumentos";
import RegistrosCapacitacao from "@/pages/RegistrosCapacitacao";
import PesquisarDocumentos from "@/pages/PesquisarDocumentos";
import Calendario from "@/pages/Calendario";
import MobiliasPage from "@/pages/Mobilia";
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route 
        path="/modules" 
        element={
          <ProtectedRoute>
            <ModuleSelection />
          </ProtectedRoute>
        } 
      />
      
      {/* Inventech Module Routes - /app */}
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
      <Route 
        path="/impressoras" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <PrinterPage/>
          </ProtectedRoute>
        } 
      />
       <Route 
        path="/mobilias" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <MobiliasPage/>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/calendario" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <Calendario/>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/relatorios" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'visualizador']}>
            <Relatorios />
          </ProtectedRoute>
        } 
      />

      {/* Gestão de Documentos Module Routes - /gestao */}
      <Route 
        path="/funcionarios" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <Funcionarios />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tipos-documentos" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro']}>
            <TiposDocumentos />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gestao/registros-capacitacao" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <RegistrosCapacitacao />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gestao/pesquisar-documentos" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <PesquisarDocumentos />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};