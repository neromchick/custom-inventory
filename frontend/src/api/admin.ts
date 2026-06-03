import { apiFetch } from './client';

export interface UserDto {
  id: string;
  userName: string;
  email: string;
  isBlocked: boolean;
  roles: string[];
}

export const getUsers = () => apiFetch<UserDto[]>('/admin/users');
export const blockUser = (id: string) => apiFetch(`/admin/users/${id}/block`, { method: 'POST' });
export const unblockUser = (id: string) => apiFetch(`/admin/users/${id}/unblock`, { method: 'POST' });
export const deleteUser = (id: string) => apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
export const makeAdmin = (id: string) => apiFetch(`/admin/users/${id}/make-admin`, { method: 'POST' });
export const removeAdmin = (id: string) => apiFetch(`/admin/users/${id}/remove-admin`, { method: 'POST' });