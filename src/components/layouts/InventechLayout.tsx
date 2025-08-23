import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { InventechSidebar } from "./InventechSidebar";
import { Navbar } from "../Navbar";

interface InventechLayoutProps {
  children: ReactNode;
}

export const InventechLayout = ({ children }: InventechLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <InventechSidebar />
        
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