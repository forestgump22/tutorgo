import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

interface StripeSaveCardFormProps {
  onCardSaved: (token: string) => Promise<void>;
}

export const StripeSaveCardForm: React.FC<StripeSaveCardFormProps> = ({ onCardSaved }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!stripe || !elements) {
      setError('Stripe no está listo.');
      setLoading(false);
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('No se pudo obtener el elemento de la tarjeta.');
      setLoading(false);
      return;
    }
    const { token, error: stripeError } = await stripe.createToken(cardElement);
    if (stripeError || !token) {
      setError(stripeError?.message || 'Error al generar token.');
      setLoading(false);
      return;
    }
    try {
      await onCardSaved(token.id);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la tarjeta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Agregar Tarjeta</CardTitle>
        <CardDescription>Guarda una tarjeta de crédito o débito para futuros pagos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border p-4 rounded-md bg-secondary">
            <CardElement options={{ hidePostalCode: true }} />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-sm">¡Tarjeta guardada exitosamente!</div>
          )}
          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? 'Guardando...' : 'Guardar Tarjeta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 