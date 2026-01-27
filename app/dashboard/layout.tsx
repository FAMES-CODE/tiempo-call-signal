import AppSidebar from "@/components/dashboard/app-sidebar";
import AppTopbar from "@/components/dashboard/app-topbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        <AppTopbar />
        <div>{children}</div>
      </main>
    </SidebarProvider>
  );
}
