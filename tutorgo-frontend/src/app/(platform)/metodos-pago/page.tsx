// src/app/(platform)/metodos-pago/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faPlus } from '@fortawesome/free-solid-svg-icons';
import { StripeSaveCardForm } from '@/components/StripeSaveCardForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useSavedCards, MetodoPagoGuardado } from '@/hooks/useSavedCards';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// Componente para la tarjeta de crédito (visual)
const CreditCard = ({ card }: { card: MetodoPagoGuardado }) => (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold">{card.tipo}</span>
            <div className="w-10 h-6 bg-yellow-400 rounded-sm"></div>
        </div>
        <div className="text-2xl font-mono tracking-widest mb-6">
            •••• •••• •••• {card.ultimosCuatro}
        </div>
        <div className="flex justify-between text-sm">
            <div>
                <span className="font-light text-gray-300">Vence</span><br/>
                <span className="font-medium">{card.expiracion}</span>
            </div>
        </div>
    </div>
);


export default function MetodosPagoPage() {
    const { tarjetas, addCard } = useSavedCards();
    const [showForm, setShowForm] = useState(false);
    
    // Estado para el formulario
    const [numero, setNumero] = useState('');
    const [titular, setTitular] = useState('');
    const [expiracion, setExpiracion] = useState('');
    const [cvv, setCvv] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!/^\d{16}$/.test(numero.replace(/\s/g, ''))) {
            setError("El número de tarjeta debe tener 16 dígitos.");
            return;
        }
        if (!/^\d{2}\/\d{2}$/.test(expiracion)) {
            setError("La fecha de expiración debe tener el formato MM/AA.");
            return;
        }

        const nuevaTarjeta: MetodoPagoGuardado = {
            id: Date.now().toString(),
            tipo: numero.startsWith('4') ? 'Visa' : numero.startsWith('5') ? 'Mastercard' : 'Otro',
            ultimosCuatro: numero.slice(-4),
            expiracion: expiracion,
        };
        
        addCard(nuevaTarjeta);
        alert("Método de pago registrado correctamente");

        setShowForm(false);
        setNumero('');
        setTitular('');
        setExpiracion('');
        setCvv('');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Columna de Navegación */}
            <div className="md:col-span-1">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Configuración de Cuenta</h2>
                    <nav className="flex flex-col space-y-2">
                        <Link href="/perfil" className="text-gray-600 hover:bg-gray-100 p-2 rounded">Editar Perfil</Link>
                        <Link href="/metodos-pago" className="text-blue-600 font-bold bg-blue-50 p-2 rounded">Métodos de Pago</Link>
                        <Link href="/cambiar-contrasena" className="text-gray-600 hover:bg-gray-100 p-2 rounded">Cambiar Contraseña</Link>
                        <Link href="/eliminar-cuenta" className="text-red-600 hover:bg-red-50 p-2 rounded">Eliminar Cuenta</Link>
                    </nav>
                </div>
            </div>

            {/* Columna Principal */}
            <div className="md:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Mis Métodos de Pago</h1>
                    
                    <div className="space-y-6 mb-8">
                        {tarjetas.length === 0 && <p className="text-gray-500">No tienes tarjetas guardadas.</p>}
                        {tarjetas.map(card => <CreditCard key={card.id} card={card} />)}
                    </div>

                    {!showForm ? (
                        <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors">
                            <FontAwesomeIcon icon={faPlus} />
                            Añadir Nuevo Método de Pago
                        </button>
                    ) : (
                        stripePromise ? (
                            <Elements stripe={stripePromise}>
                                <StripeSaveCardForm
                                    onCardSaved={async (token) => {
                                        // Crear nueva tarjeta con el token de Stripe
                                        const nuevaTarjeta: MetodoPagoGuardado = {
                                            id: Date.now().toString(),
                                            tipo: 'Visa', // En producción, obtén esto del backend/Stripe
                                            ultimosCuatro: token.slice(-4),
                                            expiracion: '12/25', // En producción, obtén esto del backend/Stripe
                                            stripeToken: token, // Guardar el token para usar en pagos
                                        };
                                        
                                        addCard(nuevaTarjeta);
                                        setShowForm(false);
                                    }}
                                />
                            </Elements>
                        ) : (
                            <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
                                <p className="text-yellow-800">
                                    Stripe no está configurado. Por favor, configura NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en tu archivo .env.local
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}