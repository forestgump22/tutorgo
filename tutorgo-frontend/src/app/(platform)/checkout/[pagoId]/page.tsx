"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPagoDetails } from '@/services/pago.service';
import { confirmarPagoYCrearSesion } from '@/services/reserva.service';
import { PagoResponse } from '@/models/pago.models';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Lock, CheckCircle, AlertCircle, CreditCard, Calendar, Clock } from 'lucide-react';

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const pagoId = Number(params.pagoId);

    const [pago, setPago] = useState<PagoResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isNaN(pagoId)) {
            setError("ID de pago inválido.");
            setLoading(false);
            return;
        }

        getPagoDetails(pagoId)
            .then(data => {
                if (data.tipoEstado !== 'PENDIENTE') {
                    setError("Este pago ya ha sido procesado o ha caducado.");
                }
                setPago(data);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [pagoId]);

    const handleConfirmPayment = async () => {
        setProcessing(true);
        setError(null);
        try {
            await confirmarPagoYCrearSesion(pagoId);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="text-center p-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    
    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="max-w-md mx-auto text-center shadow-lg">
                    <CardContent className="p-8">
                        <CheckCircle className="text-green-500 h-16 w-16 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold">¡Pago Exitoso!</h1>
                        <p className="text-muted-foreground mt-2">Tu tutoría ha sido confirmada. Puedes ver los detalles en tu sección de "Mis Tutorías".</p>
                        <Button onClick={() => router.push('/mis-tutorias')} className="mt-6 w-full">Ir a Mis Tutorías</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !pago) {
        return (
             <div className="flex items-center justify-center min-h-screen">
                <Card className="max-w-md mx-auto text-center shadow-lg border-destructive">
                     <CardContent className="p-8">
                        <AlertCircle className="text-destructive h-16 w-16 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold">Ocurrió un Error</h1>
                        <p className="text-muted-foreground mt-2">{error || "No se encontraron los detalles del pago."}</p>
                        <Button onClick={() => router.push('/buscar-tutores')} className="mt-6 w-full" variant="outline">Volver a Buscar</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary/30">
            <Card className="w-full max-w-lg mx-auto shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Confirmar y Pagar</CardTitle>
                    <CardDescription>Estás a un paso de reservar tu tutoría.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-secondary/50 p-4 rounded-lg mb-6 space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Tutor</p>
                            <p className="font-semibold">{pago.nombreTutor}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                            <p className="font-semibold">{pago.descripcion}</p>
                        </div>
                    </div>

                    <Card className="bg-background">
                        <CardContent className="p-6">
                             <div className="flex justify-between items-center">
                                <p className="text-lg font-semibold">Total a Pagar</p>
                                <p className="text-2xl font-bold text-primary">S/ {pago.monto.toFixed(2)}</p>
                             </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6">
                        <Button
                            onClick={handleConfirmPayment}
                            disabled={processing}
                            className="w-full"
                            size="lg"
                        >
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                            {processing ? 'Procesando...' : 'Pagar Ahora'}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">Simulación de pasarela de pago segura.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}