'use client';

import Link from 'next/link';

import { BadgeCheck, ChevronsUpDown, CreditCard, LogOut } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { platformStore } from '@/stores/platformStore';

const optionsUser = [
  {
    title: 'Account',
    url: '/',
    icon: BadgeCheck,
  },
  {
    title: 'Billing',
    url: '/collections',
    icon: CreditCard,
  },
];

export function NavUser() {
  const { isMobile } = useSidebar();

  const { authenticationResponse } = platformStore(state => state);
  if (!authenticationResponse) return <></>;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={authenticationResponse.picture ?? '/img/Avatar.webp'}
                  alt={authenticationResponse.firstName}
                />
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {authenticationResponse.firstName}
                </span>
                <span className="truncate text-xs">
                  {authenticationResponse.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={authenticationResponse.picture ?? '/img/Avatar.webp'}
                    alt={authenticationResponse.firstName}
                  />
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {authenticationResponse.firstName}
                  </span>
                  <span className="truncate text-xs">
                    {authenticationResponse.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {optionsUser.map(option => (
                <Link href={option.url} key={option.title}>
                  <DropdownMenuItem>
                    <option.icon />
                    {option.title}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="focus:!text-red-600 focus:!bg-red-100">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
