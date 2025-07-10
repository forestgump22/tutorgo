"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import type { SesionResponse } from "@/models/sesion.models";
import { getMisTutorias, confirmarPago } from "@/services/sesion.service";
import { useAuthStore } from "@/stores/auth.store";
import type { ResenaRequest } from "@/models/resena.models";
import { crearResena } from "@/services/resena.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Loader2, Link as LinkIcon, Edit3, Star, Calendar, Clock, User, CheckCircle, AlertCircle, Hourglass, BookUser } from "lucide-react";
import { Label } from "@/components/ui/label";

// --- MODAL PARA CALIFICAR (Sin cambios en lógica, solo usa componentes UI) ---
const CalificarModal = ({ sesionId, onClose, onResenaEnviada }: { sesionId: number; onClose: () => void; onResenaEnviada: (sesionId: number) => void; }) => {
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

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function MisTutoriasPage() {
    const user = useAuthStore((state) => state.user);
    const [sesiones, setSesiones] = useState<SesionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<{ [key: number]: 'loading' | 'success' | 'error' }>({});
    const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
    const [sesionSeleccionada, setSesionSeleccionada] = useState<SesionResponse | null>(null);
    const [sesionParaCalificar, setSesionParaCalificar] = useState<number | null>(null);
    
    const fetchSesiones = useCallback(() => {
        setLoading(true);
        getMisTutorias()
            .then(data => {
                const sortedData = data.sort((a, b) => new Date(a.horaInicial).getTime() - new Date(b.horaInicial).getTime());
                setSesiones(sortedData);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchSesiones(); }, [fetchSesiones]);

    const handlePagar = async (sesionId: number) => {
        setPaymentStatus(prev => ({ ...prev, [sesionId]: 'loading' }));
        setPaymentMessage(null);
        try {
            const message = await confirmarPago({ sesionId, metodoPago: 'TARJETA_CREDITO' });
            setPaymentStatus(prev => ({ ...prev, [sesionId]: 'success' }));
            setPaymentMessage(message);
            fetchSesiones(); // Volvemos a cargar todo para tener la data más fresca
        } catch (err: any) {
            setPaymentStatus(prev => ({ ...prev, [sesionId]: 'error' }));
            setPaymentMessage(err.message);
        }
    };
    
    const handleResenaEnviada = (sesionId: number) => {
        setSesiones(prev => prev.map(s => s.id === sesionId ? { ...s, fueCalificada: true } : s));
        setPaymentMessage("¡Gracias por tu calificación!");
    };

    if (user?.rol !== 'ESTUDIANTE' && !loading) {
        return <div className="text-center p-8"><h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1><p className="text-muted-foreground mt-2">Esta página es solo para estudiantes.</p></div>;
    }
    
    const sesionesPendientes = sesiones.filter(s => s.tipoEstado === 'PENDIENTE');
    const sesionesActivas = sesiones.filter(s => s.tipoEstado === 'CONFIRMADO' && new Date(s.horaFinal) > new Date());
    const historialSesiones = sesiones.filter(s => s.tipoEstado === 'CONFIRMADO' && new Date(s.horaFinal) <= new Date());

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Tutorías</h1>
                <p className="text-muted-foreground">Gestiona tus sesiones pendientes, próximas y pasadas.</p>
            </div>

            {paymentMessage && (
                <Alert className={`mb-6 ${Object.values(paymentStatus).some(s => s === 'error') ? 'variant="destructive"' : 'border-green-200 bg-green-50 text-green-700'}`}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{paymentMessage}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                 <div className="text-center py-12 flex items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Cargando tus tutorías...</div>
            ) : error ? (
                <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
            ) : (
                <div className="space-y-10">
                    {/* SECCIÓN PENDIENTES */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Hourglass className="text-yellow-500" />
                                Pendientes de Pago ({sesionesPendientes.length})
                            </CardTitle>
                            <CardDescription>Confirma estas sesiones para asegurar tu cupo con el tutor.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {sesionesPendientes.length > 0 ? (
                                sesionesPendientes.map(sesion => <SesionCard key={sesion.id} sesion={sesion} onPagar={handlePagar} onVerEnlaces={setSesionSeleccionada} onCalificar={setSesionParaCalificar} isPaying={paymentStatus[sesion.id] === 'loading'} />)
                            ) : (<p className="text-sm text-muted-foreground py-4 text-center">No tienes sesiones pendientes.</p>)}
                        </CardContent>
                    </Card>

                    {/* SECCIÓN PRÓXIMAS */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="text-green-500" />
                                Próximas Tutorías ({sesionesActivas.length})
                            </CardTitle>
                             <CardDescription>¡Prepárate para tu próxima sesión de aprendizaje!</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {sesionesActivas.length > 0 ? (
                                sesionesActivas.map(sesion => <SesionCard key={sesion.id} sesion={sesion} onPagar={handlePagar} onVerEnlaces={setSesionSeleccionada} onCalificar={setSesionParaCalificar} isPaying={paymentStatus[sesion.id] === 'loading'} />)
                            ) : (<p className="text-sm text-muted-foreground py-4 text-center">No tienes tutorías confirmadas próximamente.</p>)}
                        </CardContent>
                    </Card>

                     {/* SECCIÓN HISTORIAL */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="text-blue-500" />
                                Historial de Tutorías ({historialSesiones.length})
                            </CardTitle>
                            <CardDescription>Revisa tus sesiones pasadas y califica la experiencia.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {historialSesiones.length > 0 ? (
                                historialSesiones.map(sesion => <SesionCard key={sesion.id} sesion={sesion} onPagar={handlePagar} onVerEnlaces={setSesionSeleccionada} onCalificar={setSesionParaCalificar} isPaying={paymentStatus[sesion.id] === 'loading'} />)
                            ) : (<p className="text-sm text-muted-foreground py-4 text-center">Aún no has completado ninguna tutoría.</p>)}
                        </CardContent>
                    </Card>
                </div>
            )}
            
            {sesionParaCalificar && <CalificarModal sesionId={sesionParaCalificar} onClose={() => setSesionParaCalificar(null)} onResenaEnviada={handleResenaEnviada} />}
            {sesionSeleccionada && <VerEnlacesModal sesion={sesionSeleccionada} onClose={() => setSesionSeleccionada(null)} />}
        </div>
    );
}