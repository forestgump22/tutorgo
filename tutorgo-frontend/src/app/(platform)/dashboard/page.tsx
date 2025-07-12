"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { getDashboardStats } from "@/services/dashboard.service";
import { DashboardStats } from "@/models/dashboard.models";
import Link from "next/link";

// Componentes UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, ChevronRight, Calendar, CreditCard, Users, Loader2, AlertCircle, CheckCircle, BookUser } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      setLoadingStats(true);
      getDashboardStats()
        .then(setStats)
        .catch((error) => {
          console.error('Error al cargar dashboard stats:', error);
          // No mostrar error al usuario, usar datos por defecto
        })
        .finally(() => setLoadingStats(false));
    }
  }, [user]);

  if (isAuthLoading || (loadingStats && user)) {
    return <div className="flex items-center justify-center h-full py-20"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return <p>Error al cargar usuario.</p>;
  }

  const isTutor = user.rol === 'TUTOR';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">¡Bienvenido, {user.nombre.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Aquí tienes un resumen de tu actividad en TutorGO.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isTutor ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Próxima Clase</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><p className="text-lg font-bold truncate">{stats?.proximaClaseInfo}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle><CreditCard className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><p className="text-2xl font-bold">S/ {stats?.ingresosEsteMes?.toFixed(2) || '0.00'}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Mi Calificación</CardTitle><Star className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><p className="text-2xl font-bold">{stats?.calificacionPromedio?.toFixed(1) || 'N/A'}</p></CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Próxima Tutoría</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><p className="text-lg font-bold truncate">{stats?.proximaTutoriaInfo}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Tutorías Completadas</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><p className="text-2xl font-bold">{stats?.tutoriasCompletadas || 0}</p></CardContent>
            </Card>
          </>
        )}
      </div>
      
      <div className="pt-8">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Tutores Destacados</h2>
            <Button variant="ghost" asChild>
                <Link href="/buscar-tutores">Ver todos <ChevronRight className="h-4 w-4 ml-1" /></Link>
            </Button>
        </div>
        {loadingStats ? (<p>Cargando tutores...</p>) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats?.tutoresDestacados?.map((tutor) => (
                    <Card key={tutor.tutorId} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 text-center">
                            <Avatar className="w-20 h-20 mx-auto mb-4">
                                <AvatarImage src={tutor.fotoUrlUsuario || ''} alt={tutor.nombreUsuario} />
                                <AvatarFallback>{tutor.nombreUsuario.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold text-lg">{tutor.nombreUsuario}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{tutor.rubro}</p>
                            <div className="flex items-center justify-center text-sm">
                                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                <span>{tutor.estrellasPromedio.toFixed(1)}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
       </div>
    </div>
  );
}