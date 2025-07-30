"use client";

import { useAIStore } from "@/lib/zustand";
import {
  Folder,
  Forward,
  MessageSquare,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";


export function NavConversation() {
  const { isMobile } = useSidebar();
  const conversations = useQuery(api.functions.getConversations);
  const [conversationToDelete, setConversationToDelete] =
    useState< any | null>(null);



  // if (isPending) {
  //   return (
  //     <SidebarGroup className="group-data-[collapsible=icon]:hidden">
  //       <SidebarGroupLabel>Conversations</SidebarGroupLabel>
  //       <div className="relative flex-1 min-h-0">
  //         <SidebarMenu>
  //           <SidebarMenuItem>
  //             <SidebarMenuButton className="text-sidebar-foreground/70">
  //               <span>Loading...</span>
  //             </SidebarMenuButton>
  //           </SidebarMenuItem>
  //         </SidebarMenu>
  //       </div>
  //     </SidebarGroup>
  //   );
  // }

  // if (error) {
  //   return (
  //     <SidebarGroup className="group-data-[collapsible=icon]:hidden">
  //       <SidebarGroupLabel>Conversations</SidebarGroupLabel>
  //       <div className="relative flex-1 min-h-0">
  //         <SidebarMenu>
  //           <SidebarMenuItem>
  //             <SidebarMenuButton className="text-sidebar-foreground/70">
  //               <span>Error loading conversations</span>
  //             </SidebarMenuButton>
  //           </SidebarMenuItem>
  //         </SidebarMenu>
  //       </div>
  //     </SidebarGroup>
  //   );
  // }

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Conversations</SidebarGroupLabel>
        <div className="relative flex-1 min-h-0">
          <SidebarMenu>
            {conversations && conversations?.map((conversation: any) => (
              <SidebarMenuItem key={conversation._id}>
                <SidebarMenuButton asChild>
                  <Link href={`/c/${conversation._id}`}>
                    <MessageSquare />
                    <span>{conversation.title}</span>
                  </Link>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                      <MoreHorizontal />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem>
                      <Folder className="text-muted-foreground" />
                      <span>View Conversation</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Forward className="text-muted-foreground" />
                      <span>Share Conversation</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="text-muted-foreground" />
                      <span>Delete Conversation</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))}
         
          </SidebarMenu>
        </div>
      </SidebarGroup>

      <AlertDialog
        open={!!conversationToDelete}
        onOpenChange={() => setConversationToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{conversationToDelete?.title}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
