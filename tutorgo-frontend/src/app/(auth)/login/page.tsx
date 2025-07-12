import { Suspense } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginClient from './LoginClient';

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Suspense fallback={<Loading />}>
        <LoginClient />
      </Suspense>
    </GoogleOAuthProvider>
  );
}