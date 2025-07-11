"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Calendar,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  History,
  UserCircle,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Menu,
  BookUser,
  Search,
} from "lucide-react";
import { deleteCookie } from "cookies-next";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Footer } from "@/components/shared/Footer";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const logoutFromStore = useAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logoutFromStore();
    deleteCookie('token', { path: '/' });
    router.push('/login');
  };

  const getNavigationItems = () => {
    const commonItems = [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/perfil", label: "Mi Perfil", icon: UserCircle },
      { href: "/historial-pagos", label: "Historial Pagos", icon: History },
      { href: "/mis-notificaciones", label: "Notificaciones", icon: Bell },
      { href: "/cambiar-contrasena", label: "Seguridad", icon: Settings },
    ];

    if (user?.rol === 'TUTOR') {
      return [
        ...commonItems,
        { href: "/mis-clases", label: "Mis Clases", icon: BookUser },
        { href: "/mi-disponibilidad", label: "Mi Disponibilidad", icon: Calendar },
      ];
    }
    
    return [
      ...commonItems,
      { href: "/mis-tutorias", label: "Mis Tutorías", icon: GraduationCap },
      { href: "/metodos-pago", label: "Métodos de Pago", icon: CreditCard },
      { href: "/buscar-tutores", label: "Buscar Tutores", icon: Search },
    ];
  };

  const navigationItems = getNavigationItems();

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center">
          <div className="text-2xl font-bold text-blue-400">TUTOR</div>
          <span className="text-2xl font-bold text-white bg-blue-600 px-2 rounded-md ml-1">GO</span>
        </Link>
      </div>

      <div className="p-4 mt-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12"><AvatarImage src={user?.fotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'U')}`} /><AvatarFallback className="bg-gray-600 text-white">{user?.nombre?.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
          <div><p className="font-medium text-white break-all">{user?.nombre}</p><p className="text-xs text-gray-400 break-all">{user?.email}</p></div>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}><item.icon className="h-4 w-4" />{item.label}</Link>;
          })}
        </div>
      </nav>
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:text-white hover:bg-sidebar-accent" onClick={handleLogout}><LogOut className="h-4 w-4 mr-3" />Cerrar Sesión</Button>
      </div>
    </>
  );

   return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar para Desktop */}
      <aside className="bg-sidebar text-sidebar-foreground w-64 min-h-screen flex-col hidden md:flex">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header para Móvil con Menú Hamburguesa */}
        <header className="md:hidden bg-white shadow-sm border-b p-4 flex justify-between items-center sticky top-0 z-40">
           <Link href="/dashboard" className="flex items-center">
                <div className="text-xl font-bold text-blue-600">TUTOR</div>
                <span className="text-xl font-bold text-white bg-blue-600 px-1.5 rounded-md ml-1">GO</span>
            </Link>
          <Sheet>
            <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="h-6 w-6" /></Button></SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar text-sidebar-foreground p-0 flex flex-col"><SidebarContent /></SheetContent>
          </Sheet>
        </header>
        
        {/* Contenido Principal */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
            {children}
        </main>
      </div>
    </div>
  );
}