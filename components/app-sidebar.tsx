"use client";

import * as React from "react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Eye, GalleryThumbnails, MessageSquare, Search, Images } from "lucide-react";
import { AppLogo } from "./app-logo";
import { NavMain } from "./nav-main";
import { NavConversations } from "./nav-conversations";
import { auth } from '@clerk/nextjs/server'
import { Protect } from "@clerk/nextjs";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Protect plan={'pro'} fallback={
          <AppLogo name="Ella AI" logo="/ella.png" plan="Free" />
        }>
          <AppLogo name="Ella AI" logo="/ella.png" plan="Pro" />
        </Protect>
      </SidebarHeader>
      <SidebarContent className="flex flex-col flex-1 min-h-0 hide-scrollbar">
        <NavMain
          items={[
            { title: "New Chat", url: "/", icon: MessageSquare },
            { title: "Search Chat", url: "/search", icon: Search },
            { title: "Library", url: "/library", icon: Images }
          ]}
        />
        <NavConversations />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
