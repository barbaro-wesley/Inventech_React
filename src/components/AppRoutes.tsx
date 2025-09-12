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
import SobreAvisoPage from "@/pages/SobreAvisoPage";
import OSViewer from "./OSViewer";
import CategoriasProdutos from "@/pages/CategoriasProdutos";
import Produtos from "@/pages/Produtos";
import MovimentacoesEstoque from "@/pages/MovimentacoesEstoque";
import GestaoSoftware from "@/pages/GestaoSoftware";
import TiposEPI from "@/pages/TiposEPI";
import CadastroEPI from "@/pages/CadastroEPI";
import RegistroEntregaEPI from "@/pages/RegistroEntregaEPI";
import Calendariotecnico from "@/pages/CalendarioTecnico";
import UserViewer from "./UserViewer";
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
        path="/userViewer"
        element={
          <ProtectedRoute>
            <UserViewer/>
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
        path="/calendario-tecnico"
        element={
          <ProtectedRoute allowedRoles={['tecnico','cadastro']}>
            <Calendariotecnico/>
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
          <ProtectedRoute allowedRoles={['admin', 'cadastro','visualizador']}>
            <Relatorios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tecnicos"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro']}>
            <Tecnicos/>
          </ProtectedRoute>
        }
      />
       <Route
        path="/tipos-equipamento"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro']}>
            <Categorias/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/setores"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro']}>
            <Setores/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/localizacoes"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro']}>
            <Localizacao/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/osviewer"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro']}>
            <OSViewer/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sobre-aviso"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SobreAvisoPage/>
          </ProtectedRoute>
        }
      />

      {/* Inventory Management Routes */}
      <Route
        path="/categorias-produtos"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro']}>
            <CategoriasProdutos/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/produtos"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <Produtos/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/movimentacoes-estoque"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro']}>
            <MovimentacoesEstoque/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/software"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <GestaoSoftware/>
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
      <Route
        path="/gestao/tipos-epi"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro']}>
            <TiposEPI />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestao/cadastro-epi"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro']}>
            <CadastroEPI />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestao/registro-entrega-epi"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cadastro', 'visualizador']}>
            <RegistroEntregaEPI />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};