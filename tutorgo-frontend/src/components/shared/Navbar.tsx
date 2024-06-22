// src/components/shared/Navbar.tsx
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Bell, User, Menu, LogOut, LayoutDashboard, Settings, LogIn, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { deleteCookie } from 'cookies-next';
import { useRouter, usePathname } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function Navbar({ isLoggedIn: isLoggedInProp }: { isLoggedIn?: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logoutFromStore = useAuthStore((state) => state.logout);
  
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = isLoggedInProp !== undefined ? isLoggedInProp : !!token;

  const handleLogout = () => {
    logoutFromStore();
    deleteCookie('token', { path: '/' });
    router.push('/login');
    setIsMenuOpen(false); // Cierra el menú al desloguearse
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/buscar-tutores?query=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/buscar-tutores');
    }
  };

  // Cierra el menú móvil si cambia la ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = isAuthenticated 
    ? [ { href: "/buscar-tutores", label: "Buscar Tutores" }, { href: "/mis-tutorias", label: "Mis Tutorías" } ]
    : [ { href: "/#tutors", label: "Tutores" }, { href: "/#how-it-works", label: "Cómo Funciona" } ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y enlaces de navegación principales */}
          <div className="flex items-center space-x-8">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="text-xl font-bold text-blue-600 flex items-center">
              TUTOR <span className="bg-blue-600 text-white px-1 rounded ml-1">GO</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map(link => (
                 <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                    {link.label}
                 </Link>
              ))}
            </div>
          </div>
          
          {/* Buscador central (solo si está logueado) */}
          {isAuthenticated && (
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Busca un tutor por nombre o materia"
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button type="submit" aria-label="Buscar" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {/* Acciones de Usuario y Menú Móvil */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link href="/mis-notificaciones" title="Notificaciones" className="hidden md:inline-flex p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-blue-600">
                  <Bell className="h-5 w-5" />
                </Link>
                
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button aria-label="Menú de usuario" className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={user?.fotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'U')}&background=0D8ABC&color=fff`}
                        alt="Avatar del usuario"
                      />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content 
                      className="mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-1"
                      sideOffset={5}
                      align="end"
                    >
                      <DropdownMenu.Label className="px-2 py-2 text-xs text-gray-500">
                        Sesión iniciada como<br/>
                        <span className="font-semibold text-gray-800">{user?.nombre}</span>
                      </DropdownMenu.Label>
                      <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                      <DropdownMenu.Item asChild>
                        <Link href="/dashboard" className="flex items-center w-full px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:bg-gray-100 focus:text-blue-600">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <Link href="/perfil" className="flex items-center w-full px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:bg-gray-100 focus:text-blue-600">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Configuración</span>
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                      <DropdownMenu.Item asChild>
                         <button onClick={handleLogout} className="flex items-center w-full px-2 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:bg-red-50">
                           <LogOut className="mr-2 h-4 w-4" />
                           <span>Cerrar Sesión</span>
                         </button>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                  Iniciar Sesión
                </Link>
                <Link href="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Registrarse
                </Link>
              </div>
            )}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Abrir menú principal"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Menú Móvil */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
             <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map(link => (
                 <Link key={link.href} href={link.href} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                    {link.label}
                 </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {isAuthenticated ? (
                  <div className="px-2 space-y-1">
                    <Link href="/dashboard" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"><LayoutDashboard className="mr-3 h-5 w-5" />Dashboard</Link>
                    <Link href="/perfil" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"><Settings className="mr-3 h-5 w-5" />Configuración</Link>
                    <button onClick={handleLogout} className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"><LogOut className="mr-3 h-5 w-5" />Cerrar Sesión</button>
                  </div>
              ) : (
                  <div className="px-2 space-y-2">
                    <Link href="/login" className="flex w-full items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-blue-600 bg-blue-100 hover:bg-blue-200"><LogIn className="mr-2 h-5 w-5"/>Iniciar Sesión</Link>
                    <Link href="/register" className="flex w-full items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"><UserPlus className="mr-2 h-5 w-5"/>Registrarse</Link>
                  </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}