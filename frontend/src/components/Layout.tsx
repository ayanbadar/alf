import { Outlet } from "react-router-dom";
import { AppSidebar, MobileBottomNav } from "@/components/app-sidebar";
import { SidebarProvider } from "./ui/sidebar";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarProvider>
        <AppSidebar />
        <MobileBottomNav />
      </SidebarProvider>
      <main className="ml-auto w-[80%] p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
