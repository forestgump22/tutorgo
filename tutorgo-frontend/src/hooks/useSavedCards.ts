import { useState, useEffect } from 'react';

export interface MetodoPagoGuardado {
  id: string;
  tipo: 'Visa' | 'Mastercard' | 'Otro';
  ultimosCuatro: string;
  expiracion: string; // "MM/AA"
  stripeToken?: string; // Token de Stripe para usar en pagos
}

export const useSavedCards = () => {
  const [tarjetas, setTarjetas] = useState<MetodoPagoGuardado[]>([]);

  // Cargar tarjetas guardadas al montar el hook
  useEffect(() => {
    const savedCards = localStorage.getItem('savedCards');
    if (savedCards) {
      try {
        const parsedCards = JSON.parse(savedCards);
        setTarjetas(parsedCards);
      } catch (error) {
        console.error('Error loading saved cards:', error);
      }
    }
  }, []);

  // Función para guardar tarjetas en localStorage
  const saveCardsToStorage = (cards: MetodoPagoGuardado[]) => {
    localStorage.setItem('savedCards', JSON.stringify(cards));
  };

  // Función para agregar una nueva tarjeta
  const addCard = (newCard: MetodoPagoGuardado) => {
    const updatedCards = [...tarjetas, newCard];
    setTarjetas(updatedCards);
    saveCardsToStorage(updatedCards);
  };

  // Función para eliminar una tarjeta
  const removeCard = (cardId: string) => {
    const updatedCards = tarjetas.filter(card => card.id !== cardId);
    setTarjetas(updatedCards);
    saveCardsToStorage(updatedCards);
  };

  return {
    tarjetas,
    addCard,
    removeCard,
  };
}; 