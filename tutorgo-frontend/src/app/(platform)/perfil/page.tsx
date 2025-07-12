"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import type { UpdateUserProfileRequest, UserResponse } from '@/models/auth.models';
import { updateUserProfile } from '@/services/user.service';
import { updateTutorBio } from '@/services/tutor.service';
import { Tema } from '@/models/tema.models';
import { getAllTemas } from '@/services/tema.service';
import { getTutorTemas } from '@/services/tutor-tema.service';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Camera } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser: setUserInStore, isLoading: isAuthLoading } = useAuthStore();
  
  const [nombre, setNombre] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gestión de subtemas para tutores
  const [temas, setTemas] = useState<Tema[]>([]);
  const [tutorTemas, setTutorTemas] = useState<any[]>([]);
  const [temaSeleccionado, setTemaSeleccionado] = useState<number | null>(null);
  const [nuevoSubtema, setNuevoSubtema] = useState('');
  const [subtemaLoading, setSubtemaLoading] = useState(false);
  const [subtemaError, setSubtemaError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre);
      setFotoUrl(user.fotoUrl || '');
      
      if (user.rol === 'TUTOR' && user.tutorProfile) {
        setBio(user.tutorProfile.bio || '');
      }
    }
  }, [user]);

  // Cargar temas y temas del tutor
  useEffect(() => {
    if (user?.rol === 'TUTOR' && user.tutorProfile) {
      getAllTemas().then(setTemas);
      getTutorTemas(user.tutorProfile.id).then(setTutorTemas);
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!nombre.trim()) {
      setError("El nombre no puede estar vacío.");
      setIsSubmitting(false);
      return;
    }

    const promises: Promise<UserResponse | void>[] = [
        updateUserProfile({ nombre, fotoUrl })
    ];

    if (user?.rol === 'TUTOR') {
      promises.push(updateTutorBio(bio));
    }

    try {
      const [updatedUserResponse] = await Promise.all(promises);

      if (user && updatedUserResponse) {
          const newUserState = { 
              ...user, 
              ...(updatedUserResponse as UserResponse), 
              tutorProfile: user.tutorProfile ? { ...user.tutorProfile, bio: bio } : undefined 
          };
          setUserInStore(newUserState);
      }
      
      setSuccessMessage("Perfil actualizado correctamente.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Agregar subtema
  const handleAgregarSubtema = async (e: FormEvent) => {
    e.preventDefault();
    if (!temaSeleccionado || !nuevoSubtema.trim() || !user?.tutorProfile?.id) return;
    setSubtemaLoading(true);
    setSubtemaError(null);
    try {
      const tutorId = user.tutorProfile.id;
      await api.post('/tutor-temas', {
        tutorId: tutorId,
        temaId: temaSeleccionado,
        subtemas: [nuevoSubtema.trim()]
      });
      setNuevoSubtema('');
      // Refrescar lista
      const nuevos = await getTutorTemas(tutorId);
      setTutorTemas(nuevos);
    } catch (err: any) {
      setSubtemaError(err.message);
    } finally {
      setSubtemaLoading(false);
    }
  };

  // Eliminar subtema
  const handleEliminarSubtema = async (asignacionId: number) => {
    if (!user?.tutorProfile?.id) return;
    setSubtemaLoading(true);
    setSubtemaError(null);
    try {
      const tutorId = user.tutorProfile.id;
      await api.delete(`/tutor-temas/${asignacionId}`);
      // Refrescar lista
      const nuevos = await getTutorTemas(tutorId);
      setTutorTemas(nuevos);
    } catch (err: any) {
      setSubtemaError(err.message);
    } finally {
      setSubtemaLoading(false);
    }
  };

  if (isAuthLoading || !user) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-muted-foreground">Actualiza tu información personal y foto de perfil.</p>
        </div>

        {successMessage && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
        )}
        {error && (
            <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Información del Perfil</CardTitle>
                <CardDescription>Estos datos son visibles para otros usuarios en la plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={fotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=0D8ABC&color=fff&size=96`} alt="Avatar"/>
                                <AvatarFallback>{nombre?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <Button type="button" size="icon" variant="outline" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-background">
                                <Camera className="h-4 w-4"/>
                            </Button>
                        </div>
                         <div className="w-full space-y-2">
                            <Label htmlFor="email">Correo Electrónico (no se puede cambiar)</Label>
                            <Input id="email" type="email" value={user.email} disabled />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre Completo</Label>
                            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="fotoUrl">URL de la Foto de Perfil</Label>
                            <Input id="fotoUrl" type="url" placeholder="https://ejemplo.com/imagen.png" value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
        {user.rol === 'TUTOR' && (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Mis Temas y Subtemas</CardTitle>
          <CardDescription>Gestiona los subtemas que enseñas asociados a los temas disponibles.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAgregarSubtema} className="flex flex-col md:flex-row gap-4 mb-6">
            <select
              className="border rounded-md px-3 py-2"
              value={temaSeleccionado ?? ''}
              onChange={e => setTemaSeleccionado(e.target.value ? Number(e.target.value) : null)}
              required
            >
              <option value="">Selecciona un tema</option>
              {temas.map(tema => (
                <option key={tema.id} value={tema.id}>{tema.nombre}</option>
              ))}
            </select>
            <Input
              placeholder="Nuevo subtema"
              value={nuevoSubtema}
              onChange={e => setNuevoSubtema(e.target.value)}
              required
            />
            <Button type="submit" disabled={subtemaLoading}>
              {subtemaLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '+'}
              Agregar Subtema
            </Button>
          </form>
          {subtemaError && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{subtemaError}</AlertDescription></Alert>}
          <div className="space-y-4">
            {tutorTemas.length === 0 && <p className="text-gray-500">No tienes subtemas registrados.</p>}
            {tutorTemas.map((tt) => (
              <div key={tt.id} className="flex items-center gap-4 border-b pb-2">
                <span className="font-semibold">{temas.find(t => t.id === tt.temaId)?.nombre || 'Tema'}</span>
                <span className="text-gray-700">{tt.subtemas?.join(', ')}</span>
                <Button variant="destructive" size="sm" onClick={() => handleEliminarSubtema(tt.id)} disabled={subtemaLoading}>
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}
    </div>
  );
}