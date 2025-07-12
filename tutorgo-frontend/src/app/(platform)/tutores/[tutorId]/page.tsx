import { getTutorProfileById } from "@/services/tutor.service";
import type { TutorProfile } from "@/models/tutor.models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, Award, BookOpen, Users, AlertCircle, UserCircle } from "lucide-react";
import { ReservaTutoria } from './ReservaTutoria';

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0; // Simplificado para mostrar llena o vacía

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-yellow-400" />);
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
  }
  return stars;
};

export default async function TutorProfilePage({ params }: { params: Promise<{ tutorId: string }> }) {
  const { tutorId } = await params;
  const tutorIdNumber = parseInt(tutorId);

  if (isNaN(tutorIdNumber)) {
    return (
        <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-red-600">ID de Tutor Inválido</h1>
            <p className="text-gray-600 mt-2">El ID proporcionado no es un número.</p>
        </div>
    );
  }

  let tutor: TutorProfile | null = null;
  let error: string | null = null;

  try {
    tutor = await getTutorProfileById(tutorIdNumber);
  } catch (e: any) {
    error = e.message;
  }

  if (error || !tutor) {
     return (
      <Card className="m-auto mt-10 max-w-lg border-destructive bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold text-destructive">Error al Cargar Perfil</h2>
            <p className="text-muted-foreground mt-2">{error || "El tutor no fue encontrado."}</p>
          </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* CARD DE ENCABEZADO CON BANNER */}
      <Card className="mb-8 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 md:h-40" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20">
            <Avatar className="w-32 h-32 border-4 border-background shadow-md">
              <AvatarImage src={tutor.fotoUrlUsuario || ''} alt={`Foto de ${tutor.nombreUsuario}`} />
              <AvatarFallback className="text-4xl">{tutor.nombreUsuario.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <Badge variant="secondary" className="mb-2 bg-white">{tutor.rubro}</Badge>
              <h1 className="text-3xl font-bold text-card-foreground">{tutor.nombreUsuario}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-muted-foreground">
                {renderStars(tutor.estrellasPromedio)}
                <span className="font-semibold">{tutor.estrellasPromedio.toFixed(1)}</span>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-3xl font-extrabold text-primary">S/{tutor.tarifaHora}</p>
              <p className="text-sm text-muted-foreground">por hora</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CONTENIDO PRINCIPAL EN DOS COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Información */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCircle className="h-5 w-5 text-blue-600"/>Sobre Mí</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground whitespace-pre-wrap">
                    {tutor.bio || 'Este tutor aún no ha añadido una biografía.'}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" />Especialidades</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {tutor.rubro ? tutor.rubro.split(/, | |y/g).filter(s => s).map((specialty, index) => (
                        <Badge key={index} variant="outline">{specialty}</Badge>
                    )) : (
                        <p className="text-muted-foreground">No hay especialidades registradas</p>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Columna Derecha: Reserva */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <ReservaTutoria tutorId={tutor.id} tarifaHora={tutor.tarifaHora} />      
          </div>
        </div>
      </div>
    </div>
  );
}