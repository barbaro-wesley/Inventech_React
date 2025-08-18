import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  ClipboardList,
  User,
  HelpCircle,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Minhas Solicitações",
    url: "/minhas-solicitacoes",
    icon: ClipboardList,
  },
  {
    title: "Perfil",
    url: "/perfil",
    icon: User,
  },
  {
    title: "Ajuda",
    url: "/ajuda",
    icon: HelpCircle,
  },
];

export function UsuarioComumSidebar() {
  const { state } = useSidebar();
  const location = useLocation();

  const isActive = (url: string) => location.pathname === url;

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Usuário</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-muted text-primary font-medium flex items-center"
                          : "hover:bg-muted/50 flex items-center"
                      }
                    >
                      <item.icon className={`h-4 w-4 ${state === "collapsed" ? "" : "mr-2"}`} />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}