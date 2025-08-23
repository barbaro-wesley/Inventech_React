import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UsuarioComumSidebar } from "./UsuarioComumSidebar";
import { GenericNavbar } from "../navbars/GenericNavbar";

interface UsuarioComumLayoutProps {
  children: ReactNode;
}

export const UsuarioComumLayout = ({ children }: UsuarioComumLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <UsuarioComumSidebar />
        
        <div className="flex-1 flex flex-col">
          <GenericNavbar title="Painel do Usuário" />
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};