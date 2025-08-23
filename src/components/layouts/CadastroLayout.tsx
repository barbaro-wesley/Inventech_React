import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CadastroSidebar } from "./CadastroSidebar";
import { GenericNavbar } from "../navbars/GenericNavbar";

interface CadastroLayoutProps {
  children: ReactNode;
}

export const CadastroLayout = ({ children }: CadastroLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <CadastroSidebar />
        
        <div className="flex-1 flex flex-col">
          <GenericNavbar title="Sistema de Cadastro" />
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};