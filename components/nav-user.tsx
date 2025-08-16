"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Protect, SignOutButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [billingOpen, setBillingOpen] = useState(false);

  return (
    <SidebarMenu>
      {isLoaded && user && (
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user?.imageUrl}
                    alt={user?.fullName as string}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.fullName}
                  </span>
                  <span className="truncate text-xs">
                    {user.emailAddresses[0].emailAddress}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user.imageUrl}
                      alt={user.fullName as string}
                    />
                    <AvatarFallback className="rounded-lg">E</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user.fullName}
                    </span>
                    <span className="truncate text-xs">
                      {user.emailAddresses[0].emailAddress}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Protect
                  plan="pro"
                  fallback={
                    <DropdownMenuItem onClick={() => router.push("/billing")}>
                      <Sparkles />
                      Upgrade to Pro
                    </DropdownMenuItem>
                  }
                >
                  {/* fallback: only show if NOT on pro plan */}
                </Protect>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/account")}>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/billing")}>
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/notifications")}>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <SignOutButton>
                <DropdownMenuItem>
                  <LogOut color="red" />
                  <span className="text-destructive font-semibold">Logout</span>
                </DropdownMenuItem>
              </SignOutButton>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}
