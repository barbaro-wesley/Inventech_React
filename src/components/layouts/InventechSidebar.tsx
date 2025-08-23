import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Home,
  Monitor,
  Package,
  Wrench,
  Printer,
  Wind,
  Calendar,
  FileText,
  Settings,
  Users,
  Search
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
    url: "/app/dashboard",
    icon: Home,
  },
  {
    title: "Equipamentos",
    icon: Package,
    items: [
      { title: "Pesquisar", url: "/pesquisar-equipamento", icon: Search },
      { title: "Computadores", url: "/computadores", icon: Monitor },
      { title: "Equipamentos", url: "/equipamentos", icon: Package },
      { title: "Condicionadores", url: "/condicionadores", icon: Wind },
      { title: "Impressoras", url: "/impressoras", icon: Printer },
      { title: "Mobilias", url: "/mobilias", icon: Package },
    ],
  },
  {
    title: "Manutenção",
    icon: Wrench,
    items: [
      { title: "Ordens de Serviço", url: "/app/os", icon: Wrench },
      { title: "Calendário", url: "/app/calendario", icon: Calendar },
    ],
  },
  {
    title: "Relatórios",
    url: "/app/relatorios",
    icon: FileText,
  },
  {
    title: "Configurações",
    icon: Settings,
    items: [
      { title: "Usuários", url: "/app/usuarios", icon: Users },
      { title: "Grupos", url: "/app/grupos", icon: Settings },
    ],
  },
];

export function InventechSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupTitle)
        ? prev.filter(title => title !== groupTitle)
        : [...prev, groupTitle]
    );
  };

  const isActive = (url: string) => location.pathname === url;
  const isGroupActive = (items?: { url: string }[]) =>
    items?.some(item => isActive(item.url)) ?? false;

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Inventech</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <>
                      <SidebarMenuButton
                        onClick={() => toggleGroup(item.title)}
                        className={`
                          ${isGroupActive(item.items) ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}
                          ${state === "collapsed" ? "justify-center" : "justify-between"}
                        `}
                      >
                        <div className="flex items-center">
                          <item.icon className={`h-4 w-4 ${state === "collapsed" ? "" : "mr-2"}`} />
                          {state !== "collapsed" && <span>{item.title}</span>}
                        </div>
                        {state !== "collapsed" && (
                          expandedGroups.includes(item.title) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )
                        )}
                      </SidebarMenuButton>
                      {state !== "collapsed" && expandedGroups.includes(item.title) && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.items.map((subItem) => (
                            <SidebarMenuButton key={subItem.url} asChild>
                              <NavLink
                                to={subItem.url}
                                className={({ isActive }) =>
                                  isActive
                                    ? "bg-muted text-primary font-medium flex items-center"
                                    : "hover:bg-muted/50 flex items-center"
                                }
                              >
                                <subItem.icon className="mr-2 h-4 w-4" />
                                <span>{subItem.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
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