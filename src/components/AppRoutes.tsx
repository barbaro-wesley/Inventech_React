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
import { DocumentosLayout } from "@/components/layouts/DocumentosLayout";
import { InventechLayout } from "@/components/layouts/InventechLayout";

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
        path="/app/dashboard" 
        element={
          <ProtectedRoute>
            <InventechLayout>
              <Dashboard />
            </InventechLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/computadores" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <InventechLayout>
              <Computadores />
            </InventechLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/equipamentos" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <InventechLayout>
              <Equipamentos />
            </InventechLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/condicionadores" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <InventechLayout>
              <Condicionados/>
            </InventechLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/impressoras" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <InventechLayout>
              <PrinterPage/>
            </InventechLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/calendario" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <InventechLayout>
              <Calendario />
            </InventechLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/app/relatorios" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'visualizador']}>
            <InventechLayout>
              <Relatorios />
            </InventechLayout>
          </ProtectedRoute>
        } 
      />

      {/* Gestão de Documentos Module Routes - /gestao */}
      <Route 
        path="/gestao/funcionarios" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <DocumentosLayout>
              <Funcionarios />
            </DocumentosLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gestao/tipos-documentos" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro']}>
            <DocumentosLayout>
              <TiposDocumentos />
            </DocumentosLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gestao/registros-capacitacao" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <DocumentosLayout>
              <RegistrosCapacitacao />
            </DocumentosLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gestao/pesquisar-documentos" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <DocumentosLayout>
              <PesquisarDocumentos />
            </DocumentosLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};