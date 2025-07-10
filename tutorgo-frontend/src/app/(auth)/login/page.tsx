"use client";

import { useState, FormEvent, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setCookie } from 'cookies-next';
import { useAuthStore } from '@/stores/auth.store';
import { loginUser, loginWithGoogle } from '@/services/auth.service';
import type { LoginRequest, AuthResponse } from '@/models/auth.models';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import Link from 'next/link';

// Importando los componentes de shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, LogIn, AlertCircle, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);
  
  const handleAuthSuccess = useCallback((response: AuthResponse) => {
    setCookie('token', response.accessToken, {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 día
    });
    setAuth(response.accessToken, response.user);
    router.push('/dashboard');
    router.refresh(); 
  }, [setAuth, router]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Limpiar mensajes al intentar de nuevo
    const credentials: LoginRequest = { email, password };
    try {
      const response = await loginUser(credentials);
      handleAuthSuccess(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
          if (credentialResponse.credential) {
              const response = await loginWithGoogle(credentialResponse.credential);
              handleAuthSuccess(response);
          } else {
              throw new Error("No se recibió la credencial de Google.");
          }
      } catch (err: any) {
          setError(err.message);
      } finally {
        setLoading(false);
      }
  };

  const handleGoogleError = () => {
      setError("El inicio de sesión con Google falló. Por favor, inténtelo de nuevo.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión en TutorGo</CardTitle>
          <CardDescription>Ingresa a tu cuenta para continuar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {successMessage && (
            <Alert className="border-green-200 bg-green-50 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          {error && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                shape="rectangular"
            />
          </div>

          <div className="relative flex items-center">
              <Separator className="flex-1" />
              <span className="flex-shrink px-2 text-xs text-muted-foreground">O</span>
              <Separator className="flex-1" />
          </div>
        
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingresando...
                </>
               ) : (
                <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                </>
              )}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}