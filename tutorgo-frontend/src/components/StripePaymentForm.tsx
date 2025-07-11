import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  description?: string;
  onTokenReceived: (token: string) => Promise<void>;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ amount, description, onTokenReceived }) => {
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
      await onTokenReceived(token.id);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Pagar con Tarjeta</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border p-4 rounded-md bg-secondary">
            <CardElement options={{ hidePostalCode: true }} />
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total:</span>
            <span className="text-xl font-bold text-primary">S/ {amount.toFixed(2)}</span>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-sm">¡Pago exitoso!</div>
          )}
          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? 'Procesando...' : 'Pagar Ahora'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 