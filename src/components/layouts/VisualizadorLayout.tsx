import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { VisualizadorSidebar } from "./VisualizadorSidebar";
import { Navbar } from "../Navbar";

interface VisualizadorLayoutProps {
  children: ReactNode;
}

export const VisualizadorLayout = ({ children }: VisualizadorLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <VisualizadorSidebar />
        
        <div className="flex-1 flex flex-col">
          <Navbar />
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};