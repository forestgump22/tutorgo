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
import api from '@/lib/api';
import { useSavedCards, MetodoPagoGuardado } from '@/hooks/useSavedCards';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const sesionId = Number(params.pagoId); // This is actually the session ID

    const [sesion, setSesion] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'saved' | 'new'>('new');
    const [selectedCard, setSelectedCard] = useState<string>('');

    const { tarjetas } = useSavedCards();

    useEffect(() => {
        if (isNaN(sesionId)) {
            setError("ID de sesión inválido.");
            setLoading(false);
            return;
        }

        // Get session details instead of payment details
        api.get(`/sesiones/${sesionId}`)
            .then((response: any) => {
                const sesionData = response.data.data;
                if (sesionData.tipoEstado !== 'PENDIENTE') {
                    setError("Esta sesión ya ha sido procesada o no está pendiente de pago.");
                }
                setSesion(sesionData);
            })
            .catch((err: any) => setError(err.response?.data?.message || err.message))
            .finally(() => setLoading(false));
    }, [sesionId]);

    const handleConfirmPayment = async () => {
        setProcessing(true);
        setError(null);
        try {
            await confirmarPagoYCrearSesion(sesionId);
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

    if (error || !sesion) {
        return (
             <div className="flex items-center justify-center min-h-screen">
                <Card className="max-w-md mx-auto text-center shadow-lg border-destructive">
                     <CardContent className="p-8">
                        <AlertCircle className="text-destructive h-16 w-16 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold">Ocurrió un Error</h1>
                        <p className="text-muted-foreground mt-2">{error || "No se encontraron los detalles de la sesión."}</p>
                        <Button onClick={() => router.push('/buscar-tutores')} className="mt-6 w-full" variant="outline">Volver a Buscar</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary/30">
            {stripePromise ? (
                <Elements stripe={stripePromise}>
                    <Card className="max-w-2xl mx-auto shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Completar Pago
                            </CardTitle>
                            <CardDescription>
                                Total a pagar: S/ {sesion.monto}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Método de pago */}
                            <div className="space-y-4">
                                <h3 className="font-semibold">Método de Pago</h3>
                                
                                {/* Opción para usar tarjetas guardadas */}
                                {tarjetas.length > 0 && (
                                    <div className="space-y-3">
                                        <RadioGroup 
                                            value={selectedPaymentMethod} 
                                            onValueChange={(value) => setSelectedPaymentMethod(value as 'saved' | 'new')}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="saved" id="saved" />
                                                <Label htmlFor="saved">Usar tarjeta guardada</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="new" id="new" />
                                                <Label htmlFor="new">Nueva tarjeta</Label>
                                            </div>
                                        </RadioGroup>

                                        {selectedPaymentMethod === 'saved' && (
                                            <div className="space-y-2">
                                                <RadioGroup value={selectedCard} onValueChange={setSelectedCard}>
                                                    {tarjetas.map((card) => (
                                                        <div key={card.id} className="flex items-center space-x-2">
                                                            <RadioGroupItem value={card.id} id={card.id} />
                                                            <Label htmlFor={card.id} className="flex items-center gap-2">
                                                                <div className="w-8 h-5 bg-blue-600 rounded-sm"></div>
                                                                •••• {card.ultimosCuatro} - {card.tipo}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Formulario de Stripe para nueva tarjeta */}
                                {selectedPaymentMethod === 'new' && (
                                    <StripePaymentForm
                                        amount={sesion.monto}
                                        description={sesion.descripcion}
                                        onTokenReceived={async (token) => {
                                            setProcessing(true);
                                            setError(null);
                                            try {
                                                await confirmarPagoYCrearSesion(sesionId, token);
                                                setSuccess(true);
                                            } catch (err: any) {
                                                setError(err.message);
                                            } finally {
                                                setProcessing(false);
                                            }
                                        }}
                                    />
                                )}

                                {/* Botón para pagar con tarjeta guardada */}
                                {selectedPaymentMethod === 'saved' && selectedCard && (
                                    <Button 
                                        onClick={async () => {
                                            setProcessing(true);
                                            setError(null);
                                            try {
                                                const selectedCardData = tarjetas.find(card => card.id === selectedCard);
                                                if (!selectedCardData?.stripeToken) {
                                                    throw new Error('Token de tarjeta no encontrado');
                                                }
                                                await confirmarPagoYCrearSesion(sesionId, selectedCardData.stripeToken);
                                                setSuccess(true);
                                            } catch (err: any) {
                                                setError(err.message);
                                            } finally {
                                                setProcessing(false);
                                            }
                                        }}
                                        disabled={processing}
                                        className="w-full"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Procesando pago...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                Pagar con tarjeta guardada
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </Elements>
            ) : (
                <Card className="max-w-md mx-auto text-center shadow-lg">
                    <CardContent className="p-8">
                        <AlertCircle className="text-yellow-500 h-16 w-16 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold">Stripe No Configurado</h1>
                        <p className="text-muted-foreground mt-2">
                            Por favor, configura NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en tu archivo .env.local para procesar pagos.
                        </p>
                        <Button onClick={() => router.push('/buscar-tutores')} className="mt-6 w-full" variant="outline">
                            Volver a Buscar
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}