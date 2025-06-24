// src/models/auth.models.ts

// Basado en tu LoginRequest del backend
export interface LoginRequest {
  email: string;
  password: string;
}

// Basado en tu UserResponse del backend
export interface UserResponse {
  id: number;
  nombre: string;
  email: string;
  rol: 'TUTOR' | 'ESTUDIANTE' | 'ADMIN'; // Usamos un tipo literal para más seguridad
  fotoUrl?: string;
}

// Basado en tu JwtAuthenticationResponse del backend
export interface AuthResponse {
  accessToken: string;
  user: UserResponse;
}

// ... (LoginRequest, UserResponse, AuthResponse se mantienen igual) ...

export type RoleName = 'ESTUDIANTE' | 'TUTOR'; // No incluimos ADMIN para el registro público

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol: RoleName;
  // Campos opcionales según el rol
  centroEstudio?: string; // Para ESTUDIANTE
  tarifaHora?: number;    // Para TUTOR
  rubro?: string;         // Para TUTOR
  bio?: string;           // Para TUTOR
  fotoUrl?: string;       // Opcional para todos
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string; // El backend espera esta confirmación
}

export interface UpdateUserProfileRequest {
  nombre: string;
  fotoUrl?: string; // Es opcional
}