"use client";

import * as React from "react";
import { IconListDetails, IconMessageCircle, IconPackage, IconUser } from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getProfile } from "@/lib/api/auth";
import { getInitials, getSessionUserFromToken } from "@/lib/session";

const navMain = [
  {
    title: "Enquiry Form",
    url: "/enquiry",
    icon: IconMessageCircle,
  },
  {
    title: "Enquiries",
    url: "/dashboard/enquiries",
    icon: IconListDetails,
  },
  {
    title: "Services",
    url: "/dashboard/services",
    icon: IconPackage,
  },
  {
    title: "Account",
    url: "/dashboard/account",
    icon: IconUser,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState({
    name: "User",
    email: "",
    avatar: "",
    initials: "U",
  });

  React.useEffect(() => {
    const tokenUser = getSessionUserFromToken();
    if (tokenUser) {
      const tokenName = [tokenUser.firstName, tokenUser.lastName].filter(Boolean).join(" ").trim();
      setUser((current) => {
        const nextName = tokenName || tokenUser.email || current.name;
        const nextEmail = tokenUser.email || current.email;
        return {
          ...current,
          name: nextName,
          email: nextEmail,
          initials: getInitials(nextName, nextEmail),
        };
      });
    }

    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile) {
          const profileName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
          const nextName = profileName || profile.email || "User";
          const nextEmail = profile.email || "";

          setUser((current) => ({
            ...current,
            name: nextName,
            email: nextEmail,
            initials: getInitials(nextName, nextEmail),
          }));
        }
      } catch {
        // Keep token-based fallback when profile call fails.
      }
    };

    loadProfile();
  }, []);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5">
              <div className="flex min-w-0 items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary font-semibold">
                  D
                </div>
                <div className="min-w-0 text-left">
                  <p className="truncate text-base font-semibold">Draskenlabs</p>
                  <p className="truncate text-xs text-muted-foreground">draskenlabs@gmail.com</p>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
