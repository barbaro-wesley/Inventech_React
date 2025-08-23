import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  FileText,
  GraduationCap,
  Search,
  UserPlus,
  ClipboardList,
  FolderOpen
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
    title: "Gestão de Pessoas",
    icon: Users,
    items: [
      { title: "Funcionários", url: "/gestao/funcionarios", icon: Users },
      { title: "Cadastro de Usuário", url: "/gestao/cadastro-usuario", icon: UserPlus },
    ],
  },
  {
    title: "Documentos",
    icon: FileText,
    items: [
      { title: "Tipos de Documentos", url: "/gestao/tipos-documentos", icon: FolderOpen },
      { title: "Registros de Capacitação", url: "/gestao/registros-capacitacao", icon: GraduationCap },
    ],
  },
  {
    title: "Consultas",
    icon: Search,
    items: [
      { title: "Pesquisar Documentos", url: "/gestao/pesquisar-documentos", icon: Search },
      { title: "Relatórios", url: "/gestao/relatorios", icon: ClipboardList },
    ],
  },
];

export function DocumentosSidebar() {
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
          <SidebarGroupLabel>Gestão de Documentos</SidebarGroupLabel>
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
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}