"use client";

import {
  Folder,
  MessageSquare,
  MoreHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { GoogleGenAI } from "@google/genai";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
});

function ConversationsSkeleton() {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Conversations</SidebarGroupLabel>
      <div className="relative flex-1 min-h-0">
        <SidebarMenu>
          {Array.from({ length: 6 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <div className="flex items-center gap-3 px-3 py-2 w-full">
                {/* MessageSquare icon skeleton */}
                <Skeleton className="h-4 w-4 rounded" />
                {/* Conversation title skeleton */}
                <Skeleton
                  className="h-4 flex-1"
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                />
                {/* More button skeleton */}
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    </SidebarGroup>
  );
}

export function NavConversations() {
  const { isMobile } = useSidebar();
  const params = useParams();
  const conversations = useQuery(api.functions.getConversations);
  const deleteConversation = useMutation(api.functions.deleteConversation);
  const updateConversationTitle = useMutation(
    api.functions.updateConversationTitle
  );
  const router = useRouter();
  const [conversationToDelete, setConversationToDelete] = useState<any | null>(
    null
  );
  const [generatingTitleFor, setGeneratingTitleFor] = useState<string | null>(
    null
  );
  const { user } = useUser();
  const previousMessages = useMutation(api.functions.getPreviousMessages);

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      await deleteConversation({ conversationId: conversationToDelete._id });
      setConversationToDelete(null);

      // Redirect to home page if we're currently on the deleted conversation
      const currentPath = window.location.pathname;
      if (currentPath === `/c/${conversationToDelete._id}`) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      // You might want to show a toast notification here
    }
  };

  const generateTitle = async (conversationId: string) => {
    try {
      setGeneratingTitleFor(conversationId);

      const messages = await previousMessages({
        clerkId: user?.id as string,
        conversationId,
      });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: JSON.stringify(messages),
        config: {
          systemInstruction: `
          You are a title generator. Your task is to create a short, meaningful, and attention-grabbing title of 3–4 words based on the overall context and key topics of the conversation.

          Guidelines:

          The title must reflect the main theme or purpose of the conversation.

          Keep it concise, relevant, and professional.

          Avoid unnecessary words, punctuation, or filler terms.

          Use title case (capitalize major words).

          The title should feel like a headline, not a full sentence.

          No fluff, Just The title we needed

          `,
        },
      });
      // Generate a simple title based on current timestamp
      const newTitle = response.text as string;

      await updateConversationTitle({
        conversationId: conversationId as any,
        title: newTitle,
      });
    } catch (error) {
      console.error("Failed to generate title:", error);
    } finally {
      setGeneratingTitleFor(null);
    }
  };

  // Show skeleton while loading
  if (!conversations) {
    return <ConversationsSkeleton />;
  }

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Conversations</SidebarGroupLabel>
        <div className="relative flex-1 min-h-0">
          <SidebarMenu>
            {conversations?.map((conversation: any) => {
              const isActive = conversation._id === params.id;
              return (
                <SidebarMenuItem key={conversation._id}>
                  <SidebarMenuButton
                    asChild
                    className={isActive ? "bg-accent" : ""}
                  >
                    <Link href={`/c/${conversation._id}`}>
                      <MessageSquare />
                      {generatingTitleFor === conversation._id ? (
                        <Skeleton className="h-4 w-32" />
                      ) : (
                        <span>{conversation.title}</span>
                      )}
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
                      <DropdownMenuItem asChild>
                        <Link href={`/c/${conversation._id}`}>
                          <Folder className="text-muted-foreground" />
                          <span>View Conversation</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => generateTitle(conversation._id)}
                      >
                        <Sparkles className="text-muted-foreground" />
                        <span>Generate Title</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setConversationToDelete(conversation)}
                      >
                        <Trash2 className="text-muted-foreground" />
                        <span>Delete Conversation</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              );
            })}
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
              onClick={handleDeleteConversation}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
