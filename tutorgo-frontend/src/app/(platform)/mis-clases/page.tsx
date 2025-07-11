"use client";

import { useEffect, useState, type FormEvent, useCallback } from 'react';
import type { SesionResponse } from '@/models/sesion.models';
import type { EnlaceSesionRequest, EnlaceSesionResponse } from '@/models/enlace.models';
import { getMisClases } from '@/services/tutor.clases.service';
import { addEnlaces, deleteEnlace } from '@/services/enlace.service';
import { useAuthStore } from '@/stores/auth.store';

// Importando componentes de UI y lucide-react
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link as LinkIcon, Trash2, Plus, Loader2, AlertCircle, Calendar, Clock, User, BookUser } from "lucide-react";
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// --- MODAL PARA GESTIONAR ENLACES ---
const GestionarEnlacesModal = ({ sesion, onClose, onUpdate }: { sesion: SesionResponse, onClose: () => void, onUpdate: () => void }) => {
    const [nombre, setNombre] = useState('');
    const [enlace, setEnlace] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddEnlace = async (e: FormEvent) => {
        e.preventDefault();
        if (!nombre.trim() || !enlace.trim()) {
            setError("Ambos campos son obligatorios.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        
        try {
            await addEnlaces(sesion.id, [{ nombre, enlace }]);
            setNombre('');
            setEnlace('');
            onUpdate();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteEnlace = async (enlaceId: number) => {
        if (!window.confirm("¿Estás seguro de eliminar este enlace?")) return;
        try {
            await deleteEnlace(sesion.id, enlaceId);
            onUpdate();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5 text-blue-600" />Gestionar Enlaces</DialogTitle>
                    <DialogDescription>Añade o elimina enlaces para la sesión con {sesion.nombreEstudiante}.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="space-y-3 max-h-48 overflow-y-auto p-2 border rounded-md bg-secondary/50">
                        {sesion.enlaces?.length > 0 ? sesion.enlaces.map(link => (
                            <div key={link.id} className="flex justify-between items-center bg-background p-2 rounded shadow-sm">
                                <a href={link.enlace} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate text-sm" title={link.enlace}>{link.nombre}</a>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteEnlace(link.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )) : <p className="text-muted-foreground text-sm text-center py-4">No hay enlaces añadidos.</p>}
                    </div>
                    {sesion.enlaces?.length < 5 && (
                        <form onSubmit={handleAddEnlace} className="space-y-4 border-t pt-4">
                            <h4 className="font-semibold text-card-foreground">Añadir Nuevo Enlace</h4>
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre del Enlace</Label>
                                <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Material de Clase, Enlace de Meet" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="enlace">URL del Enlace</Label>
                                <Input type="url" id="enlace" value={enlace} onChange={e => setEnlace(e.target.value)} placeholder="https://..." />
                            </div>
                            {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                            <Button type="submit" disabled={isSubmitting || !nombre || !enlace} className="w-full">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Añadiendo...' : 'Añadir Enlace'}
                            </Button>
                        </form>
                    )}
                    {sesion.enlaces?.length >= 5 && <p className="text-center text-sm text-muted-foreground pt-4 border-t">Has alcanzado el límite de 5 enlaces.</p>}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function MisClasesPage() {
    const user = useAuthStore((state) => state.user);
    const [sesiones, setSesiones] = useState<SesionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSesion, setSelectedSesion] = useState<SesionResponse | null>(null);

    const fetchClases = useCallback(() => {
        setLoading(true);
        getMisClases()
            .then(data => {
                const sortedData = data.sort((a, b) => new Date(a.horaInicial).getTime() - new Date(b.horaInicial).getTime());
                setSesiones(sortedData);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (user?.rol === 'TUTOR') {
            fetchClases();
        } else if (user) {
            setLoading(false);
        }
    }, [user, fetchClases]);
    
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

    const clasesConfirmadas = sesiones.filter(s => s.tipoEstado === 'CONFIRMADO');
    const formatDate = (dateTimeString: string) => new Date(dateTimeString).toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' });
    const formatTime = (dateTimeString:string) => new Date(dateTimeString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="max-w-4xl mx-auto space-y-8">
             <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Clases Programadas</h1>
                <p className="text-muted-foreground">Gestiona los materiales y enlaces para tus próximas sesiones.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Clases Confirmadas</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                    
                    {!error && clasesConfirmadas.length === 0 ? (
                         <div className="text-center py-16 text-muted-foreground">
                            <BookUser className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="font-semibold text-lg text-card-foreground">No tienes clases programadas</h3>
                            <p className="mt-1">Cuando un estudiante confirme una tutoría, aparecerá aquí.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {clasesConfirmadas.map(sesion => (
                                <div key={sesion.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{sesion.nombreEstudiante?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">Clase con {sesion.nombreEstudiante}</p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Calendar className="h-3 w-3"/>{formatDate(sesion.horaInicial)}
                                                    <span className="text-gray-300">|</span> 
                                                    <Clock className="h-3 w-3"/>{formatTime(sesion.horaInicial)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button onClick={() => setSelectedSesion(sesion)} className="w-full sm:w-auto">
                                        <LinkIcon className="mr-2 h-4 w-4" /> Gestionar Enlaces
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedSesion && (
                <GestionarEnlacesModal 
                    sesion={selectedSesion} 
                    onClose={() => setSelectedSesion(null)}
                    onUpdate={() => {
                        fetchClases(); // Refresca para obtener los nuevos enlaces
                        setSelectedSesion(null);
                    }} 
                />
            )}
        </div>
    );
}