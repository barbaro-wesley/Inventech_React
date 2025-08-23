import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DocumentosSidebar } from "./DocumentosSidebar";
import { DocumentosNavbar } from "../navbars/DocumentosNavbar";

interface DocumentosLayoutProps {
  children: ReactNode;
}

export const DocumentosLayout = ({ children }: DocumentosLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <DocumentosSidebar />
        
        <div className="flex-1 flex flex-col">
          <DocumentosNavbar />
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};