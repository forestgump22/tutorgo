"use client";

import { useEffect, useState, type FormEvent } from 'react';
import type { Disponibilidad } from '@/models/sesion.models';
import { getMyDisponibilidad, addDisponibilidad, deleteDisponibilidad } from '@/services/disponibilidad.service';
import { useAuthStore } from '@/stores/auth.store';

// Importando componentes de UI de shadcn y lucide-react
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarPlus, Trash2, Loader2, AlertCircle, CalendarX2, CalendarCheck, Clock } from "lucide-react";
import { Separator } from '@/components/ui/separator';

export default function MiDisponibilidadPage() {
  const user = useAuthStore((state) => state.user);
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el formulario
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFinal, setHoraFinal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchDisponibilidades = () => {
    setLoading(true);
    getMyDisponibilidad()
      .then(data => {
        const sortedData = data.sort((a, b) => new Date(a.horaInicial).getTime() - new Date(b.horaInicial).getTime());
        setDisponibilidades(sortedData);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.rol === 'TUTOR') {
      fetchDisponibilidades();
    } else if (user) {
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    if (new Date(`${fecha}T${horaFinal}`) <= new Date(`${fecha}T${horaInicio}`)) {
        setFormError("La hora de finalización debe ser posterior a la hora de inicio.");
        setIsSubmitting(false);
        return;
    }

    try {
      await addDisponibilidad({ fecha, horaInicio: `${horaInicio}:00`, horaFinal: `${horaFinal}:00` });
      fetchDisponibilidades();
      setFecha('');
      setHoraInicio('');
      setHoraFinal('');
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este horario?")) return;
    
    try {
        await deleteDisponibilidad(id);
        setDisponibilidades(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
        setFormError(err.message || "Error al eliminar el horario.");
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (user?.rol !== 'TUTOR') {
      return (
          <Card className="m-auto mt-10 max-w-lg border-destructive bg-red-50">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-semibold text-destructive">Acceso Denegado</h2>
              <p className="text-muted-foreground mt-2">Esta sección es exclusiva para tutores.</p>
            </CardContent>
          </Card>
      );
  }

  const formatDate = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const formatTime = (dateTimeString: string) => new Date(dateTimeString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestionar mi Disponibilidad</h1>
          <p className="text-muted-foreground">Añade o elimina los bloques de tiempo en los que estás disponible para dar tutorías.</p>
      </div>

      {/* Formulario para añadir nueva disponibilidad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarPlus className="h-5 w-5" />Añadir Nuevo Horario</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input type="date" id="fecha" value={fecha} onChange={e => setFecha(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="horaInicio">Desde</Label>
                    <Input type="time" id="horaInicio" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="horaFinal">Hasta</Label>
                    <Input type="time" id="horaFinal" value={horaFinal} onChange={e => setHoraFinal(e.target.value)} required />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Añadir Horario
                </Button>
            </form>
            {formError && <Alert variant="destructive" className="mt-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{formError}</AlertDescription></Alert>}
        </CardContent>
      </Card>

      {/* Lista de disponibilidades existentes */}
      <Card>
         <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarCheck className="h-5 w-5" />Mis Horarios Disponibles</CardTitle>
         </CardHeader>
         <CardContent>
            {error && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
            
            {disponibilidades.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <CalendarX2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="font-semibold text-lg text-card-foreground">No hay horarios configurados</h3>
                    <p className="mt-1">Añade tu primer bloque de disponibilidad para que los estudiantes puedan reservarte.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {disponibilidades.map(d => (
                        <div key={d.id} className="flex justify-between items-center p-3 border rounded-lg bg-secondary/30 hover:bg-secondary transition-colors">
                            <div className="flex items-center gap-4">
                               <Clock className="h-5 w-5 text-primary" />
                               <div>
                                   <p className="font-semibold text-card-foreground">{formatDate(d.fecha)}</p>
                                   <p className="text-sm text-muted-foreground">{formatTime(d.horaInicial)} - {formatTime(d.horaFinal)}</p>
                               </div>
                            </div>
                            <Button onClick={() => handleDelete(d.id)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
         </CardContent>
      </Card>
    </div>
  );
}