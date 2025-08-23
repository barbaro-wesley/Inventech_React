import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { VisualizadorSidebar } from "./VisualizadorSidebar";
import { GenericNavbar } from "../navbars/GenericNavbar";

interface VisualizadorLayoutProps {
  children: ReactNode;
}

export const VisualizadorLayout = ({ children }: VisualizadorLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <VisualizadorSidebar />
        
        <div className="flex-1 flex flex-col">
          <GenericNavbar title="Painel Visualizador" />
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};