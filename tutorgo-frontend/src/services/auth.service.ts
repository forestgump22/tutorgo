// src/services/auth.service.ts
import api from '@/lib/api'; // Ruta relativa
import { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '@/models/auth.models'; // Ruta relativa

// loginUser se mantiene igual
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
  }
};

export const registerUser = async (userData: RegisterRequest): Promise<{ message: string, data: UserResponse }> => {
  try {
    const response = await api.post<{ success: boolean, message: string, data: UserResponse }>('/auth/register', userData);
    if (response.data.success) {
      return { message: response.data.message, data: response.data.data };
    } else {
      throw new Error(response.data.message || 'Error en el registro.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Error desconocido en el registro.');
  }
};

export const getMe = async (): Promise<UserResponse> => {
  try {
    const response = await api.get<UserResponse>('/users/me/profile-details'); // OJO: Este endpoint debe existir en tu backend y devolver UserResponse.
                                                                       // Basado en tu UserController, tienes /users/me/profile que devuelve ApiResponse con UserResponse.
                                                                       // O si tu UserResponse en el login es completo, este 'getMe' no es estrictamente necesario para la rehidratación inicial.
    return response.data; // Ajusta esto si tu endpoint devuelve un ApiResponse anidado
  } catch (error: any) {
    console.error("Error obteniendo datos del usuario (getMe):", error);
    throw new Error(error.response?.data?.message || 'Error al obtener datos del usuario.');
  }
};