import { Logo } from "./Logo";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface NavbarProps {
  onLogoClick?: () => void;
}

export const Navbar = ({ onLogoClick }: NavbarProps) => {
  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-8 w-8" />
          
          <button
            onClick={onLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo size="sm" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Sistema de Gestão de Equipamentos
          </div>
        </div>
      </div>
    </header>
  );
};