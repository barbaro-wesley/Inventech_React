import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { publicRoutes, inventechRoutes, GedRoutes } from "../components/routes";
import SemAcesso from "@/components/SemAcesso"; // Criar este componente

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas públicas (sem proteção de módulo) */}
      {publicRoutes.map((route) => (
        <Route 
          key={route.path}
          path={route.path} 
          element={
            route.roles.length > 0 ? (
              <ProtectedRoute allowedRoles={route.roles}>
                {route.element}
              </ProtectedRoute>
            ) : (
              route.element
            )
          } 
        />
      ))}

      {/* Rotas do módulo InvenTech */}
      {inventechRoutes.map((route) => (
        <Route 
          key={route.path}
          path={route.path} 
          element={
            <ProtectedRoute 
              allowedRoles={route.roles}
              allowedModules={["InvenTech"]}
            >
              {route.element}
            </ProtectedRoute>
          } 
        />
      ))}

      {/* Rotas do módulo CEP */}
      {GedRoutes.map((route) => (
        <Route 
          key={route.path}
          path={route.path} 
          element={
            <ProtectedRoute 
              allowedRoles={route.roles}
              allowedModules={["GED"]}
            >
              {route.element}
            </ProtectedRoute>
          } 
        />
      ))}

      {/* Rota para acesso negado */}
      <Route path="/sem-acesso" element={<SemAcesso />} />
    </Routes>
  );
};