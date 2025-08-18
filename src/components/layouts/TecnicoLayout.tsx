import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TecnicoSidebar } from "./TecnicoSidebar";
import { Navbar } from "../Navbar";

interface TecnicoLayoutProps {
  children: ReactNode;
}

export const TecnicoLayout = ({ children }: TecnicoLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <TecnicoSidebar />
        
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