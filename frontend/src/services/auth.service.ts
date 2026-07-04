import api from './api';
import type {
  ApiResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from '@/types';

export const authService = {
  register: (data: RegisterPayload) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: LoginPayload) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  logout: () => api.post<ApiResponse<object>>('/auth/logout'),

  getProfile: () => api.get<ApiResponse<{ user: User }>>('/auth/profile'),

  updateProfile: (data: UpdateProfilePayload) =>
    api.put<ApiResponse<{ user: User }>>('/auth/profile', data),
};
