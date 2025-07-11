import { Suspense } from 'react';
import LoginClient from './LoginClient';

function Loading() {
  return <div>Cargando...</div>;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginClient />
    </Suspense>
  );
}