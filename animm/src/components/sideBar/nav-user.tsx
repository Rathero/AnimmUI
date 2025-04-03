'use client';

import { ChevronsUpDown, LogOut } from 'lucide-react';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
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
import useLoginService from '@/app/services/LoginService';
import { useRouter } from 'next/navigation';

export function NavUser() {
  const { isMobile } = useSidebar();

  const { authenticationResponse, setAuthenticationResponse } = platformStore(
    state => state
  );
  const { logout } = useLoginService();
  const router = useRouter();
  async function logoutFunction() {
    try {
      const response = await logout(authenticationResponse?.jwtToken ?? '');
      setAuthenticationResponse(undefined);
      router.push('/login');
    } catch (err) {}
  }

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
            {/*
            <DropdownMenuGroup>
              {optionsUser.map(option => (
                <Link href={option.url} key={option.title}>
                  <DropdownMenuItem>
                    <option.icon />
                    {option.title}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuGroup>*/}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="focus:!text-red-600 focus:!bg-red-100"
              onClick={logoutFunction}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
