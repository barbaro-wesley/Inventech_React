import { ReactNode } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { TecnicoLayout } from '@/components/layouts/TecnicoLayout';
import { CadastroLayout } from '@/components/layouts/CadastroLayout';
import { VisualizadorLayout } from '@/components/layouts/VisualizadorLayout';
import { UsuarioComumLayout } from '@/components/layouts/UsuarioComumLayout';
import { DocumentosLayout } from '@/components/layouts/DocumentosLayout';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  allowedModules?: string[];
  noLayout?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  allowedModules = [],
  noLayout 
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Validação de roles (se especificado)
  if (allowedRoles && !allowedRoles.includes(user.papel)) {
    return <Navigate to="/sem-acesso" replace />;
  }

  // Validação de módulos (se especificado)
  if (allowedModules.length > 0) {
    if (!user.modulos || !Array.isArray(user.modulos)) {
      return <Navigate to="/sem-acesso" replace />;
    }

    // Função para extrair nome do módulo baseado na estrutura real
    const extractModuleName = (modulo: any): string => {
      if (typeof modulo === 'string') return modulo;
      if (typeof modulo === 'object' && modulo) {
        // Estrutura: { modulo: { nome: "InvenTech" } }
        if (modulo.modulo && modulo.modulo.nome) {
          return modulo.modulo.nome;
        }
        // Fallback para outras estruturas possíveis
        return modulo.nome || modulo.name || modulo.module || modulo.moduleName || modulo.title || String(modulo);
      }
      return String(modulo);
    };

    const userModuleNames = user.modulos.map(extractModuleName);
    
    // Verifica com case insensitive
    const hasValidModule = userModuleNames.some((userModule) => 
      allowedModules.some(allowedModule => 
        userModule.toLowerCase() === allowedModule.toLowerCase()
      )
    );
    
    if (!hasValidModule) {
      return <Navigate to="/sem-acesso" replace />;
    }
  }

  // Se for a página de seleção de módulo, não aplica layout
  if (location.pathname === '/modules' || noLayout) {
    return <>{children}</>;
  }

  // Se for uma rota do módulo de gestão(CEP), usa o DocumentosLayout
  if (location.pathname.startsWith('/gestao') || location.pathname.startsWith('/tipos-documentos')) {
    return <DocumentosLayout>{children}</DocumentosLayout>;
  }

  // Escolhe o layout baseado no papel do usuário
  const getLayoutByRole = (role: UserRole, children: ReactNode) => {
    switch (role) {
      case 'admin':
        return <AdminLayout>{children}</AdminLayout>;
      case 'tecnico':
        return <TecnicoLayout>{children}</TecnicoLayout>;
      case 'cadastro':
        return <CadastroLayout>{children}</CadastroLayout>;
      case 'visualizador':
        return <VisualizadorLayout>{children}</VisualizadorLayout>;
      case 'usuario_comum':
        return <UsuarioComumLayout>{children}</UsuarioComumLayout>;
      default:
        return <AdminLayout>{children}</AdminLayout>;
    }
  };

  return getLayoutByRole(user.papel, children);
};