"use client";

import { useEffect, useState, useCallback, FormEvent } from 'react';
import type { SesionResponse } from '@/models/sesion.models';
import { getMisTutorias } from '@/services/sesion.service'; // Solo necesitamos este servicio
import { useAuthStore } from '@/stores/auth.store';
import type { ResenaRequest } from '@/models/resena.models';
import { crearResena } from '@/services/resena.service';

// --- Componentes de UI ---
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Link as LinkIcon, Edit3, Star, Calendar, Clock, User, CheckCircle, AlertCircle, GraduationCap, History } from "lucide-react";
import Link from 'next/link';

// --- MODAL PARA CALIFICAR (Sin cambios) ---
const CalificarModal = ({ sesionId, onClose, onResenaEnviada }: { sesionId: number; onClose: () => void; onResenaEnviada: (sesionId: number) => void; }) => {
    // ... (El código de este componente está bien, no se necesita cambiar)
    const [calificacion, setCalificacion] = useState(0);
    const [hoverCalificacion, setHoverCalificacion] = useState(0);
    const [comentario, setComentario] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (calificacion === 0) {
            setError("Debes seleccionar al menos una estrella.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        const resenaData: ResenaRequest = { calificacion, comentario };
        try {
            await crearResena(sesionId, resenaData);
            onResenaEnviada(sesionId);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" />Calificar Tutoría</DialogTitle>
                    <DialogDescription>Tu opinión ayuda a otros estudiantes.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div>
                        <Label htmlFor="calificacion" className="block text-sm font-medium text-center text-card-foreground mb-3">Tu calificación *</Label>
                        <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" className={`p-1 transition-transform duration-150 ease-in-out hover:scale-125 ${(hoverCalificacion || calificacion) >= star ? "text-yellow-400" : "text-gray-300"}`} onMouseEnter={() => setHoverCalificacion(star)} onMouseLeave={() => setHoverCalificacion(0)} onClick={() => setCalificacion(star)}>
                                    <Star className="h-8 w-8 fill-current" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="comentario" className="block text-sm font-medium text-card-foreground mb-2">Comentario (opcional)</Label>
                        <Textarea id="comentario" value={comentario} onChange={e => setComentario(e.target.value)} rows={4} maxLength={500} placeholder="Comparte tu experiencia..." />
                        <p className="text-xs text-muted-foreground mt-1 text-right">{comentario.length}/500</p>
                    </div>
                    {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting || calificacion === 0} className="flex-1">
                            {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</> : "Enviar Calificación"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};


// --- MODAL PARA VER ENLACES (Sin cambios en lógica) ---
const VerEnlacesModal = ({ sesion, onClose }: { sesion: SesionResponse; onClose: () => void }) => (
    <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5 text-blue-600" />Materiales para la sesión</DialogTitle>
                <DialogDescription>Tutor: {sesion.nombreTutor}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-64 overflow-y-auto py-4">
                {sesion.enlaces && sesion.enlaces.length > 0 ? (
                    sesion.enlaces.map(link => (
                        <a key={link.id} href={link.enlace} target="_blank" rel="noopener noreferrer" className="block p-3 bg-secondary hover:bg-muted rounded-lg text-secondary-foreground font-medium transition-colors">
                            {link.nombre}
                        </a>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground"><LinkIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p>El tutor aún no ha compartido materiales.</p></div>
                )}
            </div>
        </DialogContent>
    </Dialog>
);

// --- TARJETA DE SESIÓN (Simplificada y corregida) ---
const SesionCard = ({ sesion, onVerEnlaces, onCalificar }: { sesion: SesionResponse; onVerEnlaces: (sesion: SesionResponse) => void; onCalificar: (sesionId: number) => void; }) => {
    const formatDate = (dateTimeString: string) => new Date(dateTimeString).toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' });
    const formatTime = (dateTimeString:string) => new Date(dateTimeString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const ahora = new Date();
    const horaFinalSesion = new Date(sesion.horaFinal.endsWith('Z') ? sesion.horaFinal : sesion.horaFinal + 'Z');
    const sesionPasada = horaFinalSesion < ahora;
    
    const getStatusInfo = () => {
        if (sesionPasada) return { color: 'border-blue-400 bg-blue-50', icon: <CheckCircle className="h-4 w-4 text-blue-600" />, text: 'Completada' };
        return { color: 'border-green-400 bg-green-50', icon: <Calendar className="h-4 w-4 text-green-600" />, text: 'Próxima' };
    };

    const statusInfo = getStatusInfo();

    return (
        <Card className={`transition-all hover:shadow-md border-l-4 ${statusInfo.color}`}>
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${statusInfo.color}`}>{statusInfo.icon}</div>
                            <div>
                                <h3 className="font-semibold text-card-foreground">Tutoría con {sesion.nombreTutor}</h3>
                                <Badge variant="outline" className="text-xs">{statusInfo.text}</Badge>
                            </div>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground pl-12 sm:pl-14">
                            <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{formatDate(sesion.horaInicial)}</span></div>
                            <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{formatTime(sesion.horaInicial)} - {formatTime(sesion.horaFinal)}</span></div>
                        </div>
                    </div>
                    <div className="w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 flex flex-col items-stretch gap-2">
                        {!sesionPasada && <Button onClick={() => onVerEnlaces(sesion)} className="w-full"><LinkIcon className="mr-2 h-4 w-4" />Ver Enlaces de Clase</Button>}
                        {sesionPasada && !sesion.fueCalificada && <Button onClick={() => onCalificar(sesion.id)} variant="outline" className="w-full"><Edit3 className="mr-2 h-4 w-4" />Calificar Tutor</Button>}
                        {sesionPasada && sesion.fueCalificada && <Badge variant="secondary" className="self-center sm:self-end"><Star className="mr-2 h-3 w-3" />Calificada</Badge>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function MisTutoriasPage() {
    const user = useAuthStore((state) => state.user);
    const [sesiones, setSesiones] = useState<SesionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [sesionSeleccionada, setSesionSeleccionada] = useState<SesionResponse | null>(null);
    const [sesionParaCalificar, setSesionParaCalificar] = useState<number | null>(null);
    
    const fetchSesiones = useCallback(() => {
        if (user?.rol === 'ESTUDIANTE') {
            setLoading(true);
            getMisTutorias()
                .then(data => {
                    // Filtrar solo sesiones confirmadas (pagadas)
                    const sesionesConfirmadas = data.filter(sesion => 
                        sesion.tipoEstado === 'CONFIRMADO'
                    );
                    const sortedData = sesionesConfirmadas.sort((a, b) => new Date(a.horaInicial).getTime() - new Date(b.horaInicial).getTime());
                    setSesiones(sortedData);
                })
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchSesiones(); }, [fetchSesiones]);

    const handleResenaEnviada = (sesionId: number) => {
        setSesiones(prev => prev.map(s => s.id === sesionId ? { ...s, fueCalificada: true } : s));
        setSuccessMessage("¡Gracias por tu calificación!");
    };

    if (loading) {
        return <div className="text-center py-12 flex items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Cargando tus tutorías...</div>;
    }

    if (user && user.rol !== 'ESTUDIANTE') {
        return <p>Acceso Denegado</p>;
    }
    
    // Filtramos las sesiones en dos grupos: próximas y pasadas.
    const ahora = new Date();
    const sesionesProximas = sesiones.filter(s => new Date(s.horaFinal) > ahora);
    const historialSesiones = sesiones.filter(s => new Date(s.horaFinal) <= ahora);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Tutorías</h1>
                <p className="text-muted-foreground">Gestiona tus sesiones próximas y revisa tu historial.</p>
            </div>

            {successMessage && <Alert className="border-green-200 bg-green-50 text-green-700"><CheckCircle className="h-4 w-4" /><AlertDescription>{successMessage}</AlertDescription></Alert>}
            {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

            <div className="space-y-10">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Calendar className="text-green-500" />Próximas Tutorías ({sesionesProximas.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {sesionesProximas.length > 0 ? (
                            sesionesProximas.map(sesion => <SesionCard key={sesion.id} sesion={sesion} onVerEnlaces={setSesionSeleccionada} onCalificar={setSesionParaCalificar} />)
                        ) : (<p className="text-sm text-muted-foreground py-4 text-center">No tienes tutorías confirmadas próximamente.</p>)}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><History className="text-blue-500" />Historial ({historialSesiones.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {historialSesiones.length > 0 ? (
                            historialSesiones.map(sesion => <SesionCard key={sesion.id} sesion={sesion} onVerEnlaces={setSesionSeleccionada} onCalificar={setSesionParaCalificar} />)
                        ) : (<p className="text-sm text-muted-foreground py-4 text-center">Aún no has completado ninguna tutoría.</p>)}
                    </CardContent>
                </Card>
            </div>
            
            {sesionParaCalificar && <CalificarModal sesionId={sesionParaCalificar} onClose={() => setSesionParaCalificar(null)} onResenaEnviada={handleResenaEnviada} />}
            {sesionSeleccionada && <VerEnlacesModal sesion={sesionSeleccionada} onClose={() => setSesionSeleccionada(null)} />}
        </div>
    );
}