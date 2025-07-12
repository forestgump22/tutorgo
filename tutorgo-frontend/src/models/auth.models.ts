export interface TutorProfileData {
    id: number;
    tarifaHora: number;
    rubro: string;
    bio: string;
    estrellasPromedio: number;
}

export interface StudentProfileData {
    id: number;
    centroEstudio: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  nombre: string;
  email: string;
  rol: 'TUTOR' | 'ESTUDIANTE' | 'ADMIN';
  fotoUrl?: string;

  tutorProfile?: TutorProfileData;
  studentProfile?: StudentProfileData;
}

export interface AuthResponse {
  accessToken: string;
  user: UserResponse;
}

export type RoleName = 'ESTUDIANTE' | 'TUTOR';

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol: RoleName;
  centroEstudioId?: number; 
  tarifaHora?: number;
  temaPrincipalId?: number;
  bio?: string;
  fotoUrl?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateUserProfileRequest {
  nombre: string;
  fotoUrl?: string;
}