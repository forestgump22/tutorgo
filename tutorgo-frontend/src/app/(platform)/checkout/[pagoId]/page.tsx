"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPagoDetails } from '@/services/pago.service';
import { confirmarPagoYCrearSesion } from '@/services/reserva.service';
import { PagoResponse } from '@/models/pago.models';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Lock, CheckCircle, AlertCircle, CreditCard, Calendar, Clock } from 'lucide-react';
import { StripePaymentForm } from '@/components/StripePaymentForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
            <Elements stripe={stripePromise}>
                <StripePaymentForm
                    amount={pago.monto}
                    description={pago.descripcion}
                    onTokenReceived={async (token) => {
                        setProcessing(true);
                        setError(null);
                        try {
                            // Aquí deberías llamar a un servicio que envíe el token y el pagoId al backend
                            await confirmarPagoYCrearSesion(pagoId, token);
                            setSuccess(true);
                        } catch (err: any) {
                            setError(err.message);
                        } finally {
                            setProcessing(false);
                        }
                    }}
                />
            </Elements>
        </div>
    );
}