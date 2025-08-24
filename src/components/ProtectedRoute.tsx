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
  noLayout?: boolean;
}

export const ProtectedRoute = ({ children, allowedRoles, noLayout }: ProtectedRouteProps) => {
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

  if (allowedRoles && !allowedRoles.includes(user.papel)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  // Se for a página de seleção de módulo, não aplica layout
  if (location.pathname === '/modules' || noLayout) {
    return <>{children}</>;
  }

  // Se for uma rota do módulo de gestão, usa o DocumentosLayout
  if (location.pathname.startsWith('/gestao') || location.pathname.startsWith('/tipos-documentos')) {
    return <DocumentosLayout>{children}</DocumentosLayout>;
  }

  // Escolhe o layout baseado no papel do usuário
  const getLayoutByRole = (role: UserRole, children: ReactNode) => {
    console.log('Papel do usuário:', role); // Debug para verificar o papel
    
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
        console.warn('Papel desconhecido:', role, 'usando AdminLayout como fallback');
        return <AdminLayout>{children}</AdminLayout>;
    }
  };

  return getLayoutByRole(user.papel, children);
};