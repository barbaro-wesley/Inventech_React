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
import PesquisarEquipamento from "@/components/PesquisarEquipamento";
import Usuarios from "@/pages/Usuario";
import Tecnicos from "@/pages/tecnico";
import Categorias from "@/pages/Categorias";
import Setores from "@/pages/Setores";
import Localizacao from "@/pages/Localizacao";
import ChamadosTecnico from "./ChamadosTecnico";
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
        path="/usuarios"
        element={
          <ProtectedRoute>
            <Usuarios/>
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
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador', 'tecnico']}>
            <Equipamentos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/condicionadores"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador', 'tecnico']}>
            <Condicionados />
          </ProtectedRoute>
        }
      />
      <Route
        path="/impressoras"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <PrinterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mobilias"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador', 'tecnico']}>
            <MobiliasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pesquisar-equipamento"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'tecnico', 'visualizador']}>
            <PesquisarEquipamento />
          </ProtectedRoute>
        }
      />

      <Route
        path="/calendario"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador','tecnico']}>
            <Calendario />
          </ProtectedRoute>
        }
      />
       <Route
        path="/minhas-os"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'tecnico']}>
            <ChamadosTecnico/>
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
      <Route
        path="/tecnicos"
        element={
          <ProtectedRoute allowedRoles={['admin', 'visualizador']}>
            <Tecnicos/>
          </ProtectedRoute>
        }
      />
       <Route
        path="/tipos-equipamento"
        element={
          <ProtectedRoute allowedRoles={['admin', 'visualizador']}>
            <Categorias/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/setores"
        element={
          <ProtectedRoute allowedRoles={['admin', 'visualizador']}>
            <Setores/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/localizacoes"
        element={
          <ProtectedRoute allowedRoles={['admin', 'visualizador']}>
            <Localizacao/>
          </ProtectedRoute>
        }
      />
     
      

      {/* Gestão de Documentos Module Routes - /gestao */}
      <Route
        path="/gestao/funcionarios"
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