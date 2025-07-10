"use client";

import { useAuthStore } from "@/stores/auth.store";
import Link from "next/link";

// Importando componentes de UI y lucide-react
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen,
  Users,
  Star,
  ChevronRight,
  Calendar,
  CreditCard,
  Bell,
  Settings,
  History,
  UserCircle,
  Loader2,
  AlertCircle,
  GraduationCap,
  BookUser,
  CalendarPlus,
  CheckCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore((state) => ({
    user: state.user,
    isLoading: state.isLoading,
  }));

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-muted-foreground">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="m-auto mt-10 max-w-md">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-semibold">Error de Autenticación</h2>
          <p className="text-muted-foreground">No se pudo cargar tu información.</p>
          <Button asChild className="mt-4">
            <Link href="/login">Ir a Iniciar Sesión</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // --- LÓGICA DE RENDERIZADO CONDICIONAL ---
  const renderDashboardContent = () => {
    if (user.rol === 'TUTOR') {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próxima Clase</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Física II</div>
              <p className="text-xs text-muted-foreground">Hoy a las 4:00 PM con Sofía V.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">S/ 1,250.00</div>
              <p className="text-xs text-muted-foreground">+15% vs. el mes anterior</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Acciones Rápidas de Tutor</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Button asChild variant="outline">
                    <Link href="/mi-disponibilidad"><CalendarPlus className="mr-2 h-4 w-4"/> Gestionar Disponibilidad</Link>
                </Button>
                <Button asChild>
                    <Link href="/mis-clases"><BookUser className="mr-2 h-4 w-4" />Ver Mis Clases</Link>
                </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Por defecto, rol ESTUDIANTE
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próxima Tutoría</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Cálculo I</div>
              <p className="text-xs text-muted-foreground">Mañana a las 10:00 AM con Ana García</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tutorías Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 este mes</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Button asChild>
                    <Link href="/buscar-tutores"><Search className="mr-2 h-4 w-4"/>Buscar Nuevo Tutor</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/mis-tutorias"><GraduationCap className="mr-2 h-4 w-4" />Ver Mis Tutorías</Link>
                </Button>
            </CardContent>
          </Card>
        </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Encabezado del Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">¡Bienvenido, {user.nombre.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Este es tu panel de control como <span className="font-semibold text-primary">{user.rol.toLowerCase()}</span>.</p>
        </div>
        <Badge variant="secondary" className="capitalize bg-blue-100 text-blue-800 self-start sm:self-center">
            {user.rol.toLowerCase()}
        </Badge>
      </div>

      {/* Contenido dinámico del Dashboard */}
      {renderDashboardContent()}

       {/* Sección de tutores recomendados (podría ser para ambos roles) */}
       <div className="pt-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Tutores Recomendados para ti</h2>
                <Button variant="ghost" asChild>
                    <Link href="/buscar-tutores">
                        Ver todos <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Aquí iría un map sobre datos reales, por ahora usamos mock */}
                {[
                    { name: 'Miguel Díaz', rating: 4.9, subject: 'Física y Química', image: `https://i.pravatar.cc/150?u=1` },
                    { name: 'Isaura Ruiz', rating: 4.8, subject: 'Matemáticas', image: `https://i.pravatar.cc/150?u=2` },
                    { name: 'Carlos Domínguez', rating: 4.7, subject: 'Informática', image: `https://i.pravatar.cc/150?u=3` },
                    { name: 'Washington Quinde', rating: 4.2, subject: 'Biología', image: `https://i.pravatar.cc/150?u=4` }
                ].map((tutor) => (
                    <Card key={tutor.name} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 text-center">
                            <Avatar className="w-20 h-20 mx-auto mb-4">
                                <AvatarImage src={tutor.image} alt={tutor.name} />
                                <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold text-lg">{tutor.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{tutor.subject}</p>
                            <div className="flex items-center justify-center text-sm">
                                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                <span>{tutor.rating}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
       </div>

    </div>
  );
}