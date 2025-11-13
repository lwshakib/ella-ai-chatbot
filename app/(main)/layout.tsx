import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { SearchDialog } from "@/components/search-dialog";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Github } from "lucide-react";

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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="hover:text-foreground"
              asChild
            >
              <a
                href="https://github.com/lwshakib/ella-ai-chatbot"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
              >
                <Github className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">GitHub repository</span>
              </a>
            </Button>
            <ModeToggle />
          </div>
        </div>
        <div className="flex-grow">{children}</div>
        <SearchDialog />
      </main>
    </SidebarProvider>
  );
}
