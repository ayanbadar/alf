import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  MessageCircle,
  Users,
  Calendar,
  BookOpen,
  Sparkles,
  Zap,
  Globe,
  Plug,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const mainNav: NavItem[] = [
  { title: "Overview", url: "/", icon: LayoutGrid },
  { title: "Chats", url: "/chats", icon: MessageCircle, badge: "3" },
  { title: "Leads", url: "/leads", icon: Users },
  { title: "Appointments", url: "/appointments", icon: Calendar },
];

const configureNav: NavItem[] = [
  { title: "Knowledge Base", url: "/knowledge", icon: BookOpen },
  { title: "AI Persona", url: "/persona", icon: Sparkles },
  { title: "Quick Replies", url: "/quick-replies", icon: Zap },
  { title: "Widget", url: "/widget", icon: Globe },
];

const accountNav: NavItem[] = [
  { title: "Connection", url: "/connection", icon: Plug },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

function NavGroup({ label, items, currentPath }: { label: string; items: NavItem[]; currentPath: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="section-label px-3">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = currentPath === item.url;
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  className={
                    active
                      ? "bg-brand-muted text-brand hover:bg-brand-muted hover:text-brand"
                      : "text-foreground/80 hover:bg-white/4 hover:text-foreground"
                  }
                >
                  <Link to={item.url} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="text-[13px] leading-normal font-normal">{item.title}</span>
                    {item.badge && (
                      <Badge variant="brand" className="ml-auto h-5 px-1.5 text-[10px]">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const currentPath = useLocation().pathname;

  return (
    <Sidebar collapsible="icon" className="border-r border-white/[0.07] bg-sidebar">
      <SidebarHeader className="border-b border-white/[0.07] p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand text-white">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-[14px] font-semibold leading-tight">ALF</p>
            <p className="truncate text-[11px] text-muted-foreground">WhatsApp AI Employee</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        <NavGroup label="Main" items={mainNav} currentPath={currentPath} />
        <NavGroup label="Configure" items={configureNav} currentPath={currentPath} />
        <NavGroup label="Account" items={accountNav} currentPath={currentPath} />
      </SidebarContent>

      <SidebarFooter className="border-t border-white/[0.07] p-3">
        <div className="flex items-center gap-3 px-1 py-2 group-data-[collapsible=icon]:hidden">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-brand text-white text-[11px] font-medium">AR</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">Abdul Rehman S.</p>
            <p className="truncate text-[11px] text-muted-foreground">Cartiqq</p>
          </div>
        </div>
        <Separator className="my-1 bg-white/[0.07] group-data-[collapsible=icon]:hidden" />
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2 text-[13px] py-4 text-muted-foreground hover:text-foreground hover:bg-white/4"
          asChild
        >
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export function MobileBottomNav() {
  const currentPath = useLocation().pathname;
  const items = mainNav.concat([accountNav[2]]);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.07] bg-sidebar md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = currentPath === item.url;
          return (
            <li key={item.url}>
              <Link
                to={item.url}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] ${active ? "text-brand" : "text-muted-foreground"
                  }`}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}