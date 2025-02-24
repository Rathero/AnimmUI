"use client";

import { Home, Frame, GalleryHorizontalEnd, ActivityIcon } from "lucide-react";
import { NavUser } from "./sideBar/nav-user";
import { TeamSwitcher } from "./sideBar/team-switcher";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarRail,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Collections",
    url: "/collections",
    icon: Frame,
  },
];
const user = {
  name: "Adrian Moran",
  email: "Adrian@animm.co",
  avatar: "/img/Avatar.webp",
};
const teams = [
  {
    name: "Animm",
    logo: GalleryHorizontalEnd,
    plan: "Enterprise",
  },
  {
    name: "Zara",
    logo: ActivityIcon,
    plan: "Enterprise",
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
