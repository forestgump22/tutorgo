// src/stores/auth.store.ts
import { create } from 'zustand';
import { UserResponse, RoleName } from '@/models/auth.models';
import { getCookie, deleteCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode'; 
import { getMe } from '@/services/auth.service';

interface DecodedToken {
  sub: string;      // El email del usuario (estándar JWT subject)
  roles: string;    // Ej: "ROLE_TUTOR,ROLE_USER" o "ROLE_ESTUDIANTE"
  userId: number;   // El ID del usuario que añadimos
  nombre: string;   // El nombre del usuario que añadimos
  // iat: number;   // Issued at (estándar JWT)
  // exp: number;   // Expiration time (estándar JWT)
}

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isLoading: boolean;
  setAuth: (token: string, user: UserResponse) => void;
  logout: () => void;
  hydrateAuth: () => void;
  isAuthenticated: () => boolean;
  updateUser: (updatedUser: UserResponse) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,
  
  setAuth: (token, user) => {
    set({ token, user, isLoading: false });
  },
  
  logout: () => {
    // La eliminación de la cookie debería ocurrir donde se llama a logout (ej. en Navbar)
    // deleteCookie('token', { path: '/' }); 
    set({ token: null, user: null, isLoading: false });
  },

  hydrateAuth: () => {
    if (typeof window !== 'undefined') {
      const tokenFromCookie = getCookie('token') as string | undefined;
      if (tokenFromCookie) {
        try {
          const decodedToken = jwtDecode<DecodedToken>(tokenFromCookie);
          
          // Mapear roles del token a tu tipo RoleName
          // Asumimos que tu claim "roles" es una cadena como "ROLE_TUTOR"
          let userRole: RoleName = 'ESTUDIANTE'; // Rol por defecto
          if (decodedToken.roles && decodedToken.roles.toUpperCase().includes('TUTOR')) {
            userRole = 'TUTOR';
          }
          // Podrías añadir más lógica si tienes más roles o un formato diferente.

          const userFromToken: UserResponse = {
            id: decodedToken.userId,
            email: decodedToken.sub, // El 'sub' es el email
            nombre: decodedToken.nombre,
            rol: userRole,
            // fotoUrl no suele estar en el token por tamaño, se obtendría de /users/me si es necesario
          };
          set({ token: tokenFromCookie, user: userFromToken, isLoading: false });
        } catch (error) {
          console.error("Error decodificando token al hidratar o token inválido:", error);
          deleteCookie('token', { path: '/' }); // Borrar cookie si el token es malo
          set({ token: null, user: null, isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    }
  },
  
  isAuthenticated: () => !!get().token,

  updateUser: (updatedUser) => {
    set((state) => ({
      ...state,
      user: updatedUser,
    }));
  },
}));