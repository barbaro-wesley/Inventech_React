import { Logo } from "./Logo";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

interface NavbarProps {
  onLogoClick?: () => void;
}

export const Navbar = ({ onLogoClick }: NavbarProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="h-14 md:h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-3 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <SidebarTrigger className="h-8 w-8" />
          
          <button
            onClick={onLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo size="sm" />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block text-xs md:text-sm text-muted-foreground">
            Sistema InvenTech11
          </div>
          
          {user && (
            <div className="flex items-center gap-2 md:gap-3">
              <span className="hidden md:block text-sm text-muted-foreground">
                {user.nome} ({user.papel})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1 md:gap-2 text-xs md:text-sm"
              >
                <LogOut className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};