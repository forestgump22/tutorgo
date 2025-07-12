"use client";

import { useEffect, useState } from 'react';
import { getMisNotificaciones, marcarComoLeida, marcarTodasComoLeidas } from '@/services/notificacion.service';
import type { Notificacion } from '@/models/notificacion.models';

// Importando los componentes de UI y lucide-react
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Bell, Clock, AlertCircle, CheckCircle, Info, Loader2, Check, CheckSquare } from "lucide-react";

export default function MisNotificacionesPage() {
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [marcandoComoLeida, setMarcandoComoLeida] = useState<number | null>(null);
    const [marcandoTodas, setMarcandoTodas] = useState(false);

    useEffect(() => {
        setLoading(true);
        getMisNotificaciones()
            .then(response => {
                console.log('Notificaciones recibidas:', response);
                // Tu lógica original está perfecta aquí
                if (Array.isArray(response)) {
                    setNotificaciones(response);
                } else {
                    setNotificaciones([]);
                }
            })
            .catch(err => {
                console.error('Error al cargar notificaciones:', err);
                setError(err.message);
                setNotificaciones([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `hace instantes`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `hace ${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `hace ${diffInDays} día(s)`;
    };

    const handleMarcarComoLeida = async (id: number) => {
        try {
            setMarcandoComoLeida(id);
            await marcarComoLeida(id);
            setNotificaciones(prev => 
                prev.map(n => n.id === id ? { ...n, leida: true } : n)
            );
        } catch (error: any) {
            console.error('Error al marcar como leída:', error);
        } finally {
            setMarcandoComoLeida(null);
        }
    };

    const handleMarcarTodasComoLeidas = async () => {
        try {
            setMarcandoTodas(true);
            await marcarTodasComoLeidas();
            setNotificaciones(prev => 
                prev.map(n => ({ ...n, leida: true }))
            );
        } catch (error: any) {
            console.error('Error al marcar todas como leídas:', error);
        } finally {
            setMarcandoTodas(false);
        }
    };

    const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

    // Mapeo de tipos a iconos y colores para una mejor UI
    const getNotificationAppearance = (tipo: string) => {
        switch (tipo.toUpperCase()) {
            case 'RECORDATORIO':
            case 'RESERVA':
                return { icon: <Bell className="h-5 w-5 text-blue-600" />, color: "bg-blue-50 border-blue-200" };
            case 'CONFIRMACION':
            case 'PAGO':
                return { icon: <CheckCircle className="h-5 w-5 text-green-600" />, color: "bg-green-50 border-green-200" };
            default:
                return { icon: <Info className="h-5 w-5 text-gray-600" />, color: "bg-gray-50 border-gray-200" };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                    <p className="text-muted-foreground">Cargando tus notificaciones...</p>
                </div>
            </div>
        );
    }

    if (error) {
         return (
            <Card className="m-auto mt-10 max-w-lg border-red-200 bg-red-50">
                <CardContent className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-red-800">Error al Cargar</h2>
                    <p className="text-red-700 mt-2">{error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <Bell className="h-8 w-8 text-blue-600" />
                            Mis Notificaciones
                        </h1>
                        <p className="text-muted-foreground">Mantente al día con todas tus actualizaciones importantes.</p>
                    </div>
                    {notificacionesNoLeidas > 0 && (
                        <Button 
                            onClick={handleMarcarTodasComoLeidas}
                            disabled={marcandoTodas}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            {marcandoTodas ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckSquare className="h-4 w-4" />
                            )}
                            Marcar todas como leídas
                        </Button>
                    )}
                </div>
            </div>
            
            <div className="space-y-4">
                {notificaciones.length > 0 ? (
                    notificaciones.map(n => {
                        const { icon, color } = getNotificationAppearance(n.tipo);
                        return (
                            <Card key={n.id} className={`transition-all hover:shadow-md border-l-4 ${color} ${!n.leida ? 'ring-2 ring-blue-200 bg-blue-50' : ''}`}>
                                <CardContent className="p-5 flex items-start gap-4">
                                    <div className="flex-shrink-0 bg-white h-10 w-10 flex items-center justify-center rounded-full shadow-sm">
                                        {icon}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <h2 className="font-semibold text-card-foreground">{n.titulo}</h2>
                                                {!n.leida && (
                                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                                        Nuevo
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs whitespace-nowrap">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {formatRelativeTime(n.fechaCreacion)}
                                                </Badge>
                                                {!n.leida && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleMarcarComoLeida(n.id)}
                                                        disabled={marcandoComoLeida === n.id}
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        {marcandoComoLeida === n.id ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Check className="h-3 w-3" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground mt-1 text-sm">{n.texto}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                ) : (
                    <Card className="text-center py-20">
                        <CardContent>
                            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bell className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold">Bandeja de entrada vacía</h3>
                            <p className="text-muted-foreground mt-1">No tienes notificaciones nuevas en este momento.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}