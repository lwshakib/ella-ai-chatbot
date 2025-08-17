import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { SearchDialog } from "@/components/search-dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider suppressHydrationWarning>
      <AppSidebar />
      <main className="relative h-screen w-full flex flex-col">
        {/* Sticky top bar for ModeToggle and SidebarTrigger */}
        <div className="sticky top-0 z-20 flex justify-between items-center gap-2 bg-background p-4">
          <SidebarTrigger className="m-0 p-2" />
          <ModeToggle />
        </div>
        <div className="flex-grow">{children}</div>
        <SearchDialog />
      </main>
    </SidebarProvider>
  );
}
