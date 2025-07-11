// src/services/user.service.ts
import api from '@/lib/api';
import { UpdatePasswordRequest, UpdateUserProfileRequest, UserResponse } from '@/models/auth.models'; // O puedes crear un user.models.ts

// Asumimos que el backend devuelve un ApiResponse simple con success y message
interface SimpleApiResponse {
  success: boolean;
  message: string;
  data?: any; // data puede ser opcional o no existir para esta operación
}

export const updateUserPassword = async (passwordData: UpdatePasswordRequest): Promise<SimpleApiResponse> => {
  try {
    const response = await api.put<SimpleApiResponse>('/users/me/password', passwordData);
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Error al actualizar la contraseña.');
    }
  } catch (error: any) {
    // Manejar errores de Axios o errores lanzados explícitamente
    // Tu backend en caso de error (ej. contraseña actual incorrecta) puede devolver un 400 con un mensaje.
    throw new Error(error.response?.data?.message || error.message || 'Error desconocido al actualizar la contraseña.');
  }
};

export const updateUserProfile = async (profileData: UpdateUserProfileRequest): Promise<UserResponse> => {
  try {
    // Tu backend devuelve un ApiResponse con el UserResponse actualizado en el campo 'data'
    const response = await api.put<SimpleApiResponse>('/users/me/profile', profileData);
    if (response.data.success && response.data.data) {
      return response.data.data as UserResponse;
    } else {
      throw new Error(response.data.message || 'Error al actualizar el perfil.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error desconocido al actualizar el perfil.');
  }
};

export const deleteUserProfile = async (): Promise<SimpleApiResponse> => {
  try {
    // El endpoint DELETE /users/me no necesita enviar un cuerpo de solicitud
    const response = await api.delete<SimpleApiResponse>('/users/me');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error desconocido al eliminar el perfil.');
  }
};

