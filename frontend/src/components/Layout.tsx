import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider } from "./ui/sidebar";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
      <ScrollArea className="flex-1">
        <main className="mx-auto max-w-7xl p-6 lg:p-8">
          <Outlet />
        </main>
      </ScrollArea>
    </div>
  );
}
