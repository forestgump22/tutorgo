"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Disponibilidad, ReservaTutoriaRequest } from "@/models/sesion.models";
import { getDisponibilidadTutor, reservarTutoria } from "@/services/sesion.service";

// Importando componentes de UI y lucide-react
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, CreditCard, Minus, Plus, AlertCircle, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export function ReservaTutoria({ tutorId, tarifaHora }: { tutorId: number, tarifaHora: number }) {
  const router = useRouter();
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<Disponibilidad | null>(null);
  const [horaInicio, setHoraInicio] = useState("");
  const [duracion, setDuracion] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);

  useEffect(() => {
    getDisponibilidadTutor(tutorId)
      .then(data => setDisponibilidad(data))
      .catch((err) => setError(err.message || "No se pudo cargar la disponibilidad."))
      .finally(() => setLoading(false));
  }, [tutorId]);

  const opcionesHoraInicio = useMemo(() => {
    if (!selectedBlock) return [];
    const opciones = [];
    let horaActual = new Date(selectedBlock.horaInicial);
    const horaFinalBloque = new Date(selectedBlock.horaFinal);
    while (horaActual < horaFinalBloque) {
      opciones.push(horaActual.toTimeString().split(' ')[0]);
      horaActual.setHours(horaActual.getHours() + 1);
    }
    return opciones;
  }, [selectedBlock]);

  const precioTotal = useMemo(() => (tarifaHora || 0) * duracion, [tarifaHora, duracion]);

  const handleBlockSelect = (block: Disponibilidad) => {
    setSelectedBlock(block);
    setHoraInicio('');
    setDuracion(1);
    setError(null);
  };

  const handleReserve = async () => {
    if (!selectedBlock || !horaInicio) {
        setError("Por favor, selecciona una hora de inicio.");
        return;
    }
    setIsReserving(true);
    setError(null);

    const fecha = selectedBlock.fecha;
    const horaFinal = new Date(fecha + 'T' + horaInicio);
    horaFinal.setHours(horaFinal.getHours() + duracion);

    const reservaData: ReservaTutoriaRequest = {
      tutorId,
      fecha,
      horaInicio,
      horaFinal: horaFinal.toTimeString().split(' ')[0],
    };

    try {
      const sesionCreada = await reservarTutoria(reservaData);
      router.push(`/checkout/${sesionCreada.id}`);
    } catch (err: any) {
      setError(err.message);
      setIsReserving(false);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const formatTime = (dateTimeString: string) => new Date(dateTimeString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Reserva tu Tutoría</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <>
            <div>
              <Label className="font-semibold text-card-foreground">1. Elige un día disponible</Label>
              <div className="space-y-2 mt-2">
                {disponibilidad.length > 0 ? (
                  disponibilidad.map(block => (
                    <div key={block.id} onClick={() => handleBlockSelect(block)} className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedBlock?.id === block.id ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary/50 hover:bg-secondary'}`}>
                      <p className="font-semibold">{formatDate(block.fecha)}</p>
                      <p className="text-sm opacity-90">{formatTime(block.horaInicial)} - {formatTime(block.horaFinal)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-md">Este tutor no tiene horarios disponibles.</p>
                )}
              </div>
            </div>

            {selectedBlock && (
              <div className="space-y-4 pt-4 border-t animate-in fade-in-50">
                <Label className="font-semibold text-card-foreground">2. Configura tu sesión</Label>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="horaInicio" className="text-sm">Hora de inicio</Label>
                    <Select value={horaInicio} onValueChange={setHoraInicio}>
                      <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                      <SelectContent>{opcionesHoraInicio.map(hora => <SelectItem key={hora} value={hora}>{hora}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Duración</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => setDuracion(d => Math.max(1, d - 1))} disabled={duracion <= 1}><Minus className="h-4 w-4" /></Button>
                      <span className="font-bold text-center w-20">{duracion} {duracion > 1 ? "horas" : "hora"}</span>
                      <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => setDuracion(d => d + 1)}><Plus className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">Total a pagar:</span>
                        <span className="text-2xl font-bold text-primary">S/ {precioTotal.toFixed(2)}</span>
                    </div>
                    {error && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                    <Button onClick={handleReserve} disabled={isReserving || !horaInicio} className="w-full" size="lg">
                        {isReserving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : <><CreditCard className="mr-2 h-4 w-4" />Ir a Pagar</>}
                    </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}