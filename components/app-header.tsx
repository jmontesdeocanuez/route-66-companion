"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Map, User, BedDouble, Plane, Binoculars, ArrowLeftRight, Users, Luggage } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  userName: string;
  avatar: string | null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AppHeader({ userName, avatar: initialAvatar }: AppHeaderProps) {
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState(initialAvatar);
  const router = useRouter();

  useEffect(() => {
    function handleAvatarUpdate(e: Event) {
      const url = (e as CustomEvent<string>).detail;
      setAvatar(url);
    }
    window.addEventListener("avatar-updated", handleAvatarUpdate);
    return () => window.removeEventListener("avatar-updated", handleAvatarUpdate);
  }, []);

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
            Route 66 <span className="text-muted-foreground font-normal">Companion</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/perfil"
              className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold select-none overflow-hidden ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Ver perfil"
            >
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt={userName} className="size-8 object-cover" />
              ) : (
                getInitials(userName)
              )}
            </Link>
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
              href="/excursiones"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Binoculars className="size-4" />
              Excursiones
            </Link>
            <Link
              href="/equipaje"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Luggage className="size-4" />
              Mi Equipaje
            </Link>
            <Link
              href="/conversores"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ArrowLeftRight className="size-4" />
              Conversores
            </Link>
            <Link
              href="/viajeros"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Users className="size-4" />
              Viajeros
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
