// src/app/(platform)/metodos-pago/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faPlus } from '@fortawesome/free-solid-svg-icons';

// Definimos la interfaz aquí mismo para simplicidad
interface MetodoPagoGuardado {
  id: string;
  tipo: 'Visa' | 'Mastercard' | 'Otro';
  ultimosCuatro: string;
  expiracion: string; // "MM/AA"
}

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
    // Simulamos las tarjetas guardadas con un estado local
    const [tarjetas, setTarjetas] = useState<MetodoPagoGuardado[]>([
        { id: '1', tipo: 'Visa', ultimosCuatro: '4242', expiracion: '12/25' }
    ]);
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
        
        setTarjetas([...tarjetas, nuevaTarjeta]);
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
                        {tarjetas.map(card => <CreditCard key={card.id} card={card} />)}
                    </div>

                    {!showForm ? (
                        <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors">
                            <FontAwesomeIcon icon={faPlus} />
                            Añadir Nuevo Método de Pago
                        </button>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-6 border border-gray-200 rounded-lg space-y-4 animate-fadeIn">
                            <h3 className="font-semibold text-lg">Nueva Tarjeta</h3>
                            <div>
                                <label htmlFor="titular" className="block text-sm font-medium text-gray-700">Nombre del Titular</label>
                                <input type="text" id="titular" value={titular} onChange={e => setTitular(e.target.value)} required className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                            <div>
                                <label htmlFor="numero" className="block text-sm font-medium text-gray-700">Número de Tarjeta</label>
                                <input type="text" id="numero" value={numero} onChange={e => setNumero(e.target.value)} placeholder="0000 0000 0000 0000" required className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="expiracion" className="block text-sm font-medium text-gray-700">Expiración (MM/AA)</label>
                                    <input type="text" id="expiracion" value={expiracion} onChange={e => setExpiracion(e.target.value)} placeholder="MM/AA" required className="mt-1 w-full p-2 border rounded-md"/>
                                </div>
                                <div>
                                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">CVV</label>
                                    <input type="text" id="cvv" value={cvv} onChange={e => setCvv(e.target.value)} placeholder="123" required className="mt-1 w-full p-2 border rounded-md"/>
                                </div>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar Tarjeta</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}