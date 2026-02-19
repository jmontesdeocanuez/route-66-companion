"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Map, User, BedDouble, Plane } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  userName: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AppHeader({ userName }: AppHeaderProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full items-center justify-between px-4">
          <Link href="/" className="font-semibold text-lg">
            Route 66
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold select-none">
              {getInitials(userName)}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu />
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-72 sm:max-w-72 p-0">
          <SheetHeader className="h-16 flex-row items-center justify-between border-b px-4 py-0">
            <SheetTitle>Menú</SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-1 p-3">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Map className="size-4" />
              Itinerario
            </Link>
            <Link
              href="/hoteles"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <BedDouble className="size-4" />
              Hoteles
            </Link>
            <Link
              href="/vuelos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Plane className="size-4" />
              Vuelos
            </Link>
            <Link
              href="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <User className="size-4" />
              Perfil
            </Link>
          </nav>

          <div className="absolute bottom-8 left-0 right-0 px-3">
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
