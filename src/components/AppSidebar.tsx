import { useState } from "react";
import { 
  Monitor, 
  Wrench, 
  FileText, 
  UserPlus, 
  Computer,
  Printer,
  AirVent,
  Sofa,
  Settings,
  Phone,
  Shield,
  Zap,
  Calendar,
  Users,
  UsersRound,
  Group
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

const menuItems = [
  {
    title: "Gestão de Equipamentos",
    icon: Monitor,
    items: [
      { title: "Computadores", url: "/computadores", icon: Computer },
      { title: "Equipamentos", url: "/equipamentos", icon: Settings },
      { title: "Ar-Condicionado", url: "/ar-condicionado", icon: AirVent },
      { title: "Mobilias", url: "/mobilias", icon: Sofa },
      { title: "Impressoras", url: "/impressoras", icon: Printer },
    ]
  },
  {
    title: "Manutenção",
    icon: Wrench,
    items: [
      { title: "Chamados", url: "/chamados", icon: Phone },
      { title: "Preventiva", url: "/preventiva", icon: Shield },
      { title: "Corretiva", url: "/corretiva", icon: Zap },
      { title: "Calendário de Manutenção", url: "/calendario", icon: Calendar },
    ]
  },
  {
    title: "Registros T.I",
    icon: FileText,
    url: "/registros-ti"
  },
  {
    title: "Cadastro",
    icon: UserPlus,
    items: [
      { title: "Usuários", url: "/usuarios", icon: Users },
      { title: "Técnicos", url: "/tecnicos", icon: UsersRound },
      { title: "Grupos de Manutenção", url: "/grupos", icon: Group },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  
  const isGroupActive = (items?: { url: string }[]) => {
    return items?.some(item => isActive(item.url)) || false;
  };

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => 
      prev.includes(title) 
        ? prev.filter(g => g !== title)
        : [...prev, title]
    );
  };

  const getNavClassName = (isActive: boolean) => 
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-accent hover:text-accent-foreground";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-semibold">
            Menu Principal
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible
                      open={openGroups.includes(item.title) || isGroupActive(item.items)}
                      onOpenChange={() => toggleGroup(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton 
                          className={`w-full justify-between ${
                            isGroupActive(item.items) ? "bg-accent text-accent-foreground" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            {!collapsed && <span>{item.title}</span>}
                          </div>
                          {!collapsed && (
                            <ChevronRight 
                              className={`h-4 w-4 transition-transform ${
                                (openGroups.includes(item.title) || isGroupActive(item.items)) ? "rotate-90" : ""
                              }`} 
                            />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      
                      {!collapsed && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <NavLink 
                                    to={subItem.url} 
                                    className={({ isActive }) => getNavClassName(isActive)}
                                  >
                                    <subItem.icon className="h-4 w-4" />
                                    <span>{subItem.title}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url!} 
                        className={({ isActive }) => getNavClassName(isActive)}
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}