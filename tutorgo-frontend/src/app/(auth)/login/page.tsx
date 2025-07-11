import { Suspense } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginClient from './LoginClient';

function Loading() {
  return <div>Cargando...</div>;
}

export default function LoginPage() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LoginClient />
    </GoogleOAuthProvider>
  );
}