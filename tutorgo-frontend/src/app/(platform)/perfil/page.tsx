"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import type { UpdateUserProfileRequest } from '@/models/auth.models'; 
import { updateUserProfile } from '@/services/user.service'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Camera, CheckCircle, AlertCircle, Loader2, Edit } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser: setUserInStore, isLoading: isAuthLoading } = useAuthStore((state) => ({
    user: state.user,
    updateUser: state.updateUser,
    isLoading: state.isLoading,
  }));

  const [nombre, setNombre] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre);
      setFotoUrl(user.fotoUrl || '');
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

    const profileData: UpdateUserProfileRequest = { nombre, fotoUrl };

    try {
      const updatedUser = await updateUserProfile(profileData);
      setUserInStore(updatedUser);
      setSuccessMessage("Perfil actualizado correctamente.");
    } catch (err: any) {
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
        <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    );
  }

  if (!user) {
    return (
      <Card className="m-auto mt-10 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold">Error</h2>
            <p className="text-muted-foreground">No se pudo cargar la información del perfil.</p>
          </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
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
    </div>
  );
}