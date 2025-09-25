import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GedSidebar } from "./GedSidebar";
import { GedNavbar } from "../navbars/GedNavbar";
interface DocumentosLayoutProps {
  children: ReactNode;
}

export const DocumentosLayout = ({ children }: DocumentosLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <GedSidebar/>
        
        <div className="flex-1 flex flex-col">
          <GedNavbar/>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};