import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Home,
  Monitor,
  Wind,
  Plus,
  Package,
  Wrench,
  Shield,
  AlertTriangle,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Building,
  MapPin,
  Printer,
  ClipboardList
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
    title: "Minhas OS",
    url: "/minhas-os",
    icon: ClipboardList,
  },
  {
    title: "Cadastros",
    icon: Plus,
    items: [
      { title: "Computadores", url: "/computadores", icon: Monitor },
      { title: "Impressoras", url: "/impressoras", icon: Printer },
      { title: "Equipamentos", url: "/equipamentos", icon: Monitor },
      { title: "Ar Condicionado", url: "/condicionadores", icon: Wind },
      { title: "Mobílias", url: "/mobilias", icon: Package },
    ],
  },
  {
    title: "Manutenção",
    icon: Wrench,
    items: [
      { title: "Calendário", url: "/calendario", icon: Calendar },
    ],
  },
  {
    title: "Configurações",
    icon: Settings,
    items: [
      { title: "Setores", url: "/setores", icon: Building },
      { title: "Localizações", url: "/localizacoes", icon: MapPin },
      { title: "Tipos de Equipamento", url: "/tipos-equipamento", icon: Settings },
      { title: "Técnicos", url: "/tecnicos", icon: Wrench },
    ],
  },
  {
    title: "Relatórios",
    icon: FileText,
    items: [
      { title: "Relatórios", icon: BarChart3, url: "/relatorios" },
      { title: "Pesquisar Equipamentos", icon: BarChart3, url: "/pesquisar-equipamento" },

    ],
  },

];

export function CadastroSidebar() {
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
          <SidebarGroupLabel>Cadastro</SidebarGroupLabel>
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