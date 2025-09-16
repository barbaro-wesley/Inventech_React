import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import { ModuleSelection } from "@/pages/ModuleSelection";
import Computadores from "@/pages/Computadores";
import Equipamentos from "@/pages/Equipamentos";
import Condicionados from "@/pages/Air";
import Relatorios from "@/pages/Relatorios";
import NotFound from "@/pages/NotFound";
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
import GrupoManutencao from "@/pages/GrupoManutencao";
import EquipamentosTecnico from "@/pages/EquipamentosTecnico";
import { TecnicoReportPage } from "./reports/TecnicoReportPage";

import { UserRole } from '@/contexts/AuthContext';

export interface RouteConfig {
  path: string;
  element: JSX.Element;
  roles: UserRole[];
}

// Rotas públicas (sem módulo específico)
export const publicRoutes: RouteConfig[] = [
  {
    path: "/",
    element: <Login />,
    roles: []
  },
  {
    path: "/modules",
    element: <ModuleSelection />,
    roles: []
  },
  {
    path: "*",
    element: <NotFound />,
    roles: []
  }
];

// Rotas do módulo InvenTech
export const inventechRoutes: RouteConfig[] = [
  {
    path: "/dashboard",
    element: <Dashboard />,
    roles: ['admin', 'cadastro', 'visualizador', 'tecnico']
  },
  {
    path: "/usuarios",
    element: <Usuarios />,
    roles: ['admin']
  },
  {
    path: "/userViewer",
    element: <UserViewer />,
    roles: ['admin', 'cadastro', 'visualizador', 'tecnico']
  },
  {
    path: "/computadores",
    element: <Computadores />,
    roles: ['admin', 'cadastro', 'visualizador']
  },
  {
    path: "/equipamentos",
    element: <Equipamentos />,
    roles: ['admin', 'cadastro', 'visualizador', 'tecnico']
  },
  {
    path: "/equipamentos-tecnicos",
    element: <EquipamentosTecnico />,
    roles: ['tecnico']
  },
  {
    path: "/condicionadores",
    element: <Condicionados />,
    roles: ['admin', 'cadastro', 'visualizador', 'tecnico']
  },
  {
    path: "/impressoras",
    element: <PrinterPage />,
    roles: ['admin', 'cadastro', 'visualizador']
  },
  {
    path: "/mobilias",
    element: <MobiliasPage />,
    roles: ['admin', 'cadastro', 'visualizador', 'tecnico']
  },
  {
    path: "/grupo-manutencao",
    element: <GrupoManutencao />,
    roles: ['admin']
  },
  {
    path: "/pesquisar-equipamento",
    element: <PesquisarEquipamento />,
    roles: ['admin', 'cadastro', 'tecnico']
  },
  {
    path: "/calendario",
    element: <Calendario />,
    roles: ['admin', 'cadastro', 'tecnico']
  },
  {
    path: "/calendario-tecnico",
    element: <Calendariotecnico />,
    roles: ['tecnico', 'cadastro']
  },
  {
    path: "/minhas-os",
    element: <ChamadosTecnico />,
    roles: ['admin', 'cadastro', 'tecnico']
  },
  {
    path: "/relatorios",
    element: <Relatorios />,
    roles: ['admin', 'cadastro']
  },
  {
    path: "/relatoriosTecnicos",
    element: <TecnicoReportPage />,
    roles: ['tecnico']
  },
  {
    path: "/tecnicos",
    element: <Tecnicos />,
    roles: ['admin', 'cadastro']
  },
  {
    path: "/tipos-equipamento",
    element: <Categorias />,
    roles: ['admin', 'cadastro']
  },
  {
    path: "/setores",
    element: <Setores />,
    roles: ['admin', 'cadastro']
  },
  {
    path: "/localizacoes",
    element: <Localizacao />,
    roles: ['admin', 'cadastro']
  },
  {
    path: "/osviewer",
    element: <OSViewer />,
    roles: ['admin', 'cadastro']
  },
  {
    path: "/sobre-aviso",
    element: <SobreAvisoPage />,
    roles: ['admin']
  },
  {
    path: "/categorias-produtos",
    element: <CategoriasProdutos />,
    roles: ['admin', 'cadastro']
  },
  {
    path: "/produtos",
    element: <Produtos />,
    roles: ['admin', 'cadastro', 'visualizador']
  },
  {
    path: "/movimentacoes-estoque",
    element: <MovimentacoesEstoque />,
    roles: ['admin', 'cadastro']
  },
  {
    path: "/software",
    element: <GestaoSoftware />,
    roles: ['admin']
  }
];

// Rotas do módulo CEP
export const cepRoutes: RouteConfig[] = [
  {
    path: "/gestao/funcionarios",
    element: <Funcionarios />,
    roles: ['CEP','admin']
  },
  {
    path: "/tipos-documentos",
    element: <TiposDocumentos />,
    roles: ['CEP','admin']
  },
  {
    path: "/gestao/registros-capacitacao",
    element: <RegistrosCapacitacao />,
    roles: ['CEP','admin']
  },
  {
    path: "/gestao/pesquisar-documentos",
    element: <PesquisarDocumentos />,
    roles: ['CEP','admin']
  },
  {
    path: "/gestao/tipos-epi",
    element: <TiposEPI />,
    roles: ['CEP','admin']
  },
  {
    path: "/gestao/cadastro-epi",
    element: <CadastroEPI />,
    roles: ['CEP','admin']
  },
  {
    path: "/gestao/registro-entrega-epi",
    element: <RegistroEntregaEPI />,
    roles: ['CEP','admin']
  }
];