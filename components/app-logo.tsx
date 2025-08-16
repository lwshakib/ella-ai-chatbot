"use client";

import Image from "next/image";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function AppLogo({ name, logo, plan }: { name: string; logo: string; plan: string }) {
  return (
    <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Image
                  src={logo}
                  width={42}
                  height={42}
                  alt={name}
                  className="rounded"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs"> {plan}</span>
              </div>
           
            </SidebarMenuButton>
  );
}
