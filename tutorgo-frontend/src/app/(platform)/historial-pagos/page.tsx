"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getHistorialPagos } from '@/services/pago.service';
import type { PagoResponse } from '@/models/pago.models';
import { useAuthStore } from '@/stores/auth.store';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from 'next/link';

// Componentes UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Receipt, TrendingDown, TrendingUp, AlertTriangle, User as UserIcon, CreditCard as CreditCardIcon, Clock, CheckCircle, XCircle, ShoppingCart, Search, Download, Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import { useDebounce } from '@/hooks/use-debounce'; 

export default function HistorialPagosPage() {
    const user = useAuthStore((state) => state.user);
    const [pagos, setPagos] = useState<PagoResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para los filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEstado, setSelectedEstado] = useState<string>("all");

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchData = useCallback(() => {
        if (user) {
            setLoading(true);
            getHistorialPagos(debouncedSearchTerm, selectedEstado)
                .then(data => {
                    setPagos(data);
                })
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [user, debouncedSearchTerm, selectedEstado]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleExportCSV = () => {
        if (pagos.length === 0) return;
        const headers = ["ID", "Tipo", "Monto", "Estado", "Fecha", "Contraparte"];
        const rows = pagos.map(p => [
            p.id,
            user?.rol === 'TUTOR' ? 'Ingreso' : 'Gasto',
            p.monto.toFixed(2),
            p.tipoEstado,
            p.fechaPago ? format(new Date(p.fechaPago), 'yyyy-MM-dd HH:mm') : 'N/A',
            `"${p.descripcion || ''}"`,
            `"${user?.rol === 'TUTOR' ? p.nombreEstudiante : p.nombreTutor}"`
        ].join(','));
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `historial_pagos_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatCurrency = (amount: number) => `S/ ${amount.toFixed(2)}`;

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Fecha no disponible';
        try {
            return format(new Date(dateString), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
        } catch {
            return 'Fecha inválida';
        }
    };

    const getEstadoBadge = (estado: PagoResponse['tipoEstado']) => {
        switch (estado) {
            case 'COMPLETADO': 
                return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 pointer-events-none">
                    <CheckCircle className="h-3 w-3 mr-1" />Completado
                </Badge>;
            case 'PENDIENTE': 
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 pointer-events-none">
                    <Clock className="h-3 w-3 mr-1" />Pendiente
                </Badge>;
            case 'FALLIDO': 
                return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 pointer-events-none">
                    <XCircle className="h-3 w-3 mr-1" />Fallido
                </Badge>;
            default: 
                return <Badge variant="secondary">{estado}</Badge>;
        }
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Cargando tu historial de transacciones...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="m-auto mt-10 max-w-lg border-destructive bg-red-50">
                <CardContent className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
                    <h2 className="text-xl font-semibold text-destructive">Error al Cargar</h2>
                    <p className="text-muted-foreground mt-2">{error}</p>
                </CardContent>
            </Card>
        );
    }

    const isTutor = user?.rol === 'TUTOR';

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isTutor ? "Mis Ingresos" : "Historial de Transacciones"}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Revisa y filtra todos tus movimientos financieros.
                    </p>
                </div>
                <Button onClick={handleExportCSV} disabled={pagos.length === 0}>
                    <Download className="mr-2 h-4 w-4" /> Exportar a CSV
                </Button>
            </div>

            {/* --- Filtros --- */}
            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por descripción o nombre..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="pl-10" 
                        />
                    </div>
                    <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Estados</SelectItem>
                            <SelectItem value="COMPLETADO">Completado</SelectItem>
                            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                            <SelectItem value="FALLIDO">Fallido</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* --- Lista de Transacciones --- */}
            {loading ? (
                <div className="text-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <Card className="border-destructive bg-red-50">
                    <CardContent className="p-8 text-center">
                        <AlertTriangle className="h-4 w-4 mx-auto mb-2 text-destructive" />
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {pagos.length === 0 ? (
                        <Card className="text-center py-16">
                            <CardContent>
                                <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold">No se encontraron transacciones</h3>
                                <p className="text-muted-foreground mt-1">
                                    Prueba con otros filtros o realiza tu primera transacción.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        pagos.map((pago) => (
                            <Card key={pago.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                        {/* Icono y tipo de transacción */}
                                        <div className="flex items-center gap-4 flex-shrink-0">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                pago.tipoEstado === 'PENDIENTE' ? 'bg-yellow-100' : 
                                                pago.tipoEstado === 'FALLIDO' ? 'bg-red-100' :
                                                isTutor ? 'bg-green-100' : 'bg-blue-100'
                                            }`}>
                                                {pago.tipoEstado === 'PENDIENTE' ? 
                                                    <Clock className="h-6 w-6 text-yellow-600" /> : 
                                                    pago.tipoEstado === 'FALLIDO' ? 
                                                    <XCircle className="h-6 w-6 text-red-600" /> :
                                                    isTutor ? 
                                                    <TrendingUp className="h-6 w-6 text-green-600" /> : 
                                                    <TrendingDown className="h-6 w-6 text-blue-600" />
                                                }
                                            </div>
                                        </div>

                                        {/* Información principal */}
                                        <div className="flex-1 min-w-0 space-y-3">
                                            {/* Descripción y monto */}
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-lg text-card-foreground truncate">
                                                        { `Tutoría`}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        ID: {pago.id}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-start sm:items-end gap-2">
                                                    <p className={`font-bold text-2xl ${
                                                        pago.tipoEstado === 'PENDIENTE' ? 'text-yellow-600' : 
                                                        pago.tipoEstado === 'FALLIDO' ? 'text-red-600' :
                                                        isTutor ? 'text-green-600' : 'text-blue-600'
                                                    }`}>
                                                        {isTutor ? '+' : '-'} {formatCurrency(pago.monto)}
                                                    </p>
                                                    {getEstadoBadge(pago.tipoEstado)}
                                                </div>
                                            </div>

                                            {/* Información de origen/destino */}
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <UserIcon className="h-4 w-4" />
                                                    <span className="font-medium">
                                                        {isTutor ? 'Recibido de:' : 'Enviado a:'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isTutor ? (
                                                        <ArrowRight className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <ArrowLeft className="h-4 w-4 text-blue-600" />
                                                    )}
                                                    <span className="font-medium text-card-foreground">
                                                        {isTutor ? pago.nombreEstudiante : pago.nombreTutor}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Fecha */}
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formatDate(pago.fechaPago)}</span>
                                            </div>
                                        </div>

                                        {/* Acción */}
                                        <div className="flex-shrink-0">
                                            {pago.tipoEstado === 'PENDIENTE' && !isTutor && (
                                                <Button asChild className="w-full sm:w-auto">
                                                    <Link href={`/checkout/${pago.id}`}>
                                                        <CreditCardIcon className="h-4 w-4 mr-2" />
                                                        Pagar Ahora
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}