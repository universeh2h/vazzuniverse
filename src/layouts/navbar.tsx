'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { URL_LOGO } from '@/constants';
import { LogIn, LogOut, Menu, Settings, User, UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { signOut, useSession } from 'next-auth/react';

export function Navbar() {
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);
  return (
    <>
      <nav className="w-full h-16 px-4 py-3 backdrop-blur-sm fixed top-0 left-0 z-20  bg-white/80">
        <div className="flex items-center justify-between max-w-7xl mx-auto h-full">
          <div className="flex items-center space-x-3">
            {/* hamburger */}
            <Button
              onClick={() => setOpenSidebar(true)}
              className="bg-transparent shadow-none text-black hover:bg-transparent hover:text-primary"
              size="sm"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* image */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src={
                  (URL_LOGO as string) ||
                  '/placeholder.svg?height=100&width=100'
                }
                height={100}
                width={100}
                alt="logo vazzuniverse"
                className="object-contain h-10 w-auto"
              />
              <h1 className="text-base italic md:text-lg font-medium">
                Tempat Top up terpercaya se-universe
              </h1>
            </Link>
          </div>
          {/* auth dropdown */}
          <AuthDropdown>
            <Button
              size="sm"
              variant="outline"
              className="shadow-none hover:bg-primary/10 text-primary"
            >
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          </AuthDropdown>
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar open={openSidebar} onClose={() => setOpenSidebar(false)} />

      {/* Backdrop for sidebar */}
      {openSidebar && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
          onClick={() => setOpenSidebar(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export function AuthDropdown({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  // Jika sudah login, gunakan avatar atau inisial
  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full p-0 w-8 h-8"
          >
            {/* Tampilkan inisial jika tidak ada foto profil */}
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <span className="text-sm font-medium">
                {getInitials(session.user.name || session.user.username)}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-4 mt-2">
          <DropdownMenuLabel className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>{session.user.name || session.user.username}</span>
          </DropdownMenuLabel>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Role: {session.user.role}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Pengaturan Profil
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-destructive cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              signOut({ callbackUrl: '/' });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Jika belum login, tampilkan dropdown login biasa
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-4 mt-2">
        <div className="flex justify-center w-full mb-4">
          <Image
            src={(URL_LOGO as string) || '/placeholder.svg?height=80&width=80'}
            height={80}
            width={80}
            alt="logo universeh2h"
            className="object-contain h-14 w-auto"
          />
        </div>
        <div className="flex flex-col space-y-2 w-full">
          <Link href={'/login'}>
            <Button className="w-full justify-start" size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Masuk
            </Button>
          </Link>
          <Link href={'/register'}>
            <Button
              className="w-full justify-start"
              variant="outline"
              size="sm"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Daftar
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Utility function untuk mengambil inisial nama
function getInitials(name?: string | null): string {
  if (!name) return '??';
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return initials.slice(0, 2);
}
