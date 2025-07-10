"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/services/auth.service';
import { RegisterRequest, RoleName } from '@/models/auth.models';
import { CentroEstudio } from '@/models/centroEstudio';
import { getAllCentrosEstudio } from '@/services/centroEstudio.service';

// Importando componentes de shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterRequest>({
    nombre: '',
    email: '',
    password: '',
    rol: 'ESTUDIANTE',
    centroEstudioId: undefined,
    tarifaHora: undefined,
    rubro: '',
    bio: '',
    fotoUrl: '',
  });

  const [centrosEstudio, setCentrosEstudio] = useState<CentroEstudio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCentros = async () => {
      try {
        const data = await getAllCentrosEstudio();
        setCentrosEstudio(data);
      } catch (err) {
        setError("No se pudieron cargar los centros de estudio.");
      }
    };
    fetchCentros();
  }, []);

  // Handler para Inputs/Textarea normales
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'tarifaHora') ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  // Handlers específicos para el componente Select de shadcn/ui
  const handleRoleChange = (value: RoleName) => {
    setFormData(prev => ({ ...prev, rol: value, centroEstudioId: undefined, tarifaHora: undefined, rubro: '', bio: '' }));
  };

  const handleCentroEstudioChange = (value: string) => {
    setFormData(prev => ({ ...prev, centroEstudioId: Number(value) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validaciones (sin cambios en la lógica)
    if (formData.rol === 'TUTOR' && (!formData.tarifaHora || !formData.rubro?.trim())) {
      setError("Para tutores, la tarifa por hora y el rubro son obligatorios.");
      setLoading(false);
      return;
    }
    if (formData.rol === 'ESTUDIANTE' && !formData.centroEstudioId) {
      setError("Para estudiantes, seleccionar un centro de estudio es obligatorio.");
      setLoading(false);
      return;
    }

    try {
      const response = await registerUser(formData);
      setSuccessMessage(response.message || "¡Registro exitoso!");
      setTimeout(() => {
        router.push('/login?message=¡Registro exitoso! Por favor, inicia sesión.');
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error durante el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Crear Cuenta en TutorGo</CardTitle>
          <CardDescription className="text-center">Únete a nuestra comunidad educativa.</CardDescription>
        </CardHeader>
        <CardContent>
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

            <form className="space-y-4" onSubmit={handleSubmit}>
              
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input id="nombre" name="nombre" required value={formData.nombre} onChange={handleChange} placeholder="Ej. Juan Pérez" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="tu@correo.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} />
                <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Quiero registrarme como *</Label>
                <Select onValueChange={handleRoleChange} defaultValue={formData.rol}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
                    <SelectItem value="TUTOR">Tutor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campos Condicionales ESTUDIANTE */}
              {formData.rol === 'ESTUDIANTE' && (
                <div className="space-y-2">
                  <Label htmlFor="centroEstudioId">Centro de Estudio *</Label>
                  <Select onValueChange={handleCentroEstudioChange} value={String(formData.centroEstudioId || '')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu centro de estudio" />
                    </SelectTrigger>
                    <SelectContent>
                      {centrosEstudio.map(centro => (
                        <SelectItem key={centro.id} value={String(centro.id)}>
                          {centro.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Campos Condicionales TUTOR */}
              {formData.rol === 'TUTOR' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tarifaHora">Tarifa por Hora (S/) *</Label>
                      <Input id="tarifaHora" name="tarifaHora" type="number" min="0" step="1" value={formData.tarifaHora || ''} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rubro">Rubro Principal *</Label>
                      <Input id="rubro" name="rubro" type="text" value={formData.rubro} onChange={handleChange} required placeholder="Ej. Matemáticas, Programación" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía Corta (opcional)</Label>
                    <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={3} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fotoUrl">URL de Foto de Perfil (opcional)</Label>
                <Input id="fotoUrl" name="fotoUrl" type="url" placeholder="https://ejemplo.com/imagen.png" value={formData.fotoUrl} onChange={handleChange} />
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-4">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : 'Crear Cuenta'}
              </Button>
            </form>
            <p className="text-sm text-center text-muted-foreground mt-6">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}