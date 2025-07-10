"use client";

import { useEffect, useState } from 'react';
import { getHistorialPagos } from '@/services/pago.service';
import type { PagoResponse } from '@/models/pago.models';
import { useAuthStore } from '@/stores/auth.store';

// Componentes de UI de shadcn/ui y lucide-react
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Receipt, TrendingDown, TrendingUp, AlertTriangle, User as UserIcon, CreditCard as CreditCardIcon } from "lucide-react";

export default function HistorialPagosPage() {
    const user = useAuthStore((state) => state.user);
    const [pagos, setPagos] = useState<PagoResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        getHistorialPagos()
            .then(data => {
                // Ordenar por el ID del pago de forma descendente para mostrar el más reciente primero
                const sortedData = data.sort((a, b) => b.id - a.id);
                setPagos(sortedData);
            })
            .catch(err => setError(err.message || "Error desconocido al cargar el historial."))
            .finally(() => setLoading(false));
    }, []);

    const formatCurrency = (amount: number) => `S/ ${amount.toFixed(2)}`;

    const getStatusBadge = (status: PagoResponse['tipoEstado']) => {
        switch (status) {
            case 'COMPLETADO':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><div className="w-2 h-2 bg-green-500 rounded-full mr-1.5" />Completado</Badge>;
            case 'PENDIENTE':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><div className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5" />Pendiente</Badge>;
            case 'FALLIDO':
                return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100"><div className="w-2 h-2 bg-red-500 rounded-full mr-1.5" />Fallido</Badge>;
            default:
                return <Badge variant="secondary"><div className="w-2 h-2 bg-gray-500 rounded-full mr-1.5" />Desconocido</Badge>;
        }
    };
    
    const getTotalAmount = () => {
        return pagos
            .filter(pago => pago.tipoEstado === "COMPLETADO")
            .reduce((total, pago) => {
                const isGasto = user?.rol === "ESTUDIANTE";
                return isGasto ? total - pago.monto : total + pago.monto;
            }, 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                    <p className="text-muted-foreground">Cargando tu historial de transacciones...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="m-auto mt-10 max-w-lg border-red-200 bg-red-50">
                <CardContent className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-red-800">Error al Cargar</h2>
                    <p className="text-red-700 mt-2">{error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Receipt className="h-8 w-8 text-blue-600" />
                    Historial de Transacciones
                </h1>
                <p className="text-muted-foreground">Revisa todos tus pagos y transacciones realizadas en la plataforma.</p>
            </div>
            
            {pagos.length > 0 && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Resumen Financiero</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Transacciones</p>
                                <p className="text-3xl font-bold">{pagos.length}</p>
                            </div>
                             <div>
                                <p className="text-sm font-medium text-muted-foreground">{user?.rol === 'ESTUDIANTE' ? 'Total Gastado' : 'Total Recibido'}</p>
                                <p className={`text-3xl font-bold ${getTotalAmount() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(Math.abs(getTotalAmount()))}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Transacciones Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    {pagos.length === 0 ? (
                        <div className="text-center py-16">
                            <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">Sin Transacciones</h3>
                            <p className="text-muted-foreground mt-1">Cuando realices o recibas un pago, aparecerá aquí.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pagos.map((pago, index) => {
                                const isGasto = user?.rol === 'ESTUDIANTE';
                                return (
                                    <div key={pago.id}>
                                        <div className="flex items-center justify-between p-4 hover:bg-secondary/50 rounded-lg transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isGasto ? 'bg-red-100' : 'bg-green-100'}`}>
                                                    {isGasto ? <TrendingUp className="h-5 w-5 text-red-600" /> : <TrendingDown className="h-5 w-5 text-green-600" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-card-foreground">{pago.descripcion || 'Transacción de tutoría'}</p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <UserIcon className="h-3 w-3" />
                                                            <span>{isGasto ? `Para: ${pago.nombreTutor}` : `De: ${pago.nombreEstudiante}`}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                           <CreditCardIcon className="h-3 w-3" />
                                                           <span className="capitalize">{pago.metodoPago?.replace('_', ' ').toLowerCase() || 'No especificado'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold text-lg ${isGasto ? 'text-red-600' : 'text-green-600'}`}>
                                                    {isGasto ? '-' : '+'} {formatCurrency(pago.monto)}
                                                </p>
                                                {getStatusBadge(pago.tipoEstado)}
                                            </div>
                                        </div>
                                        {index < pagos.length - 1 && <Separator />}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}