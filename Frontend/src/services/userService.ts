// import axios, { AxiosInstance, AxiosError } from 'axios';

// // ─── TYPES ──────────────────────────────────────────────────────────────────
// export type UserRole = 'ADMIN' | 'SHOP_MANAGER' | 'KITCHEN_STAFF' | 'DELIVERY_AGENT' | 'SALES_AGENT' | 'DRIVER' | 'USER';

// export interface User {
//   id: number;
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone_no?: string;
//   role: UserRole;
//   created_at?: string;
//   updated_at?: string;
// }

// export interface CreateUserPayload {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone_no?: string;
//   password: string;
//   role: UserRole;
// }

// export interface UpdateUserPayload {
//   first_name?: string;
//   last_name?: string;
//   email?: string;
//   phone_no?: string;
//   role?: UserRole;
//   password?: string;
// }

// export interface Permission {
//   id: number;
//   user_id: number;
//   module: string;
//   can_view: boolean;
//   can_create: boolean;
//   can_edit: boolean;
//   can_delete: boolean;
// }

// export interface PermissionPayload {
//   user_id: number;
//   module: string;
//   can_view: boolean;
//   can_create: boolean;
//   can_edit: boolean;
//   can_delete: boolean;
// }

// export interface ApiResponse<T> {
//   data: T;
//   message?: string;
//   error?: string;
//   status: number;
// }

// export class ApiError extends Error {
//   constructor(
//     public status: number,
//     public message: string,
//     public data?: any
//   ) {
//     super(message);
//     this.name = 'ApiError';
//   }
// }

// // ─── API SERVICE CLASS ──────────────────────────────────────────────────────
// class UserService {
//   private api: AxiosInstance;
//   private baseURL: string;

//   constructor() {
//     this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
//     this.api = axios.create({
//       baseURL: this.baseURL,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });

//     // Add JWT token to all requests
//     this.api.interceptors.request.use(
//       (config) => {
//         const token = localStorage.getItem('token');
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//       },
//       (error) => Promise.reject(error)
//     );

//     // Handle response errors
//     this.api.interceptors.response.use(
//       (response) => response,
//       (error: AxiosError<any>) => {
//         const status = error.response?.status || 500;
//         const message = error.response?.data?.error || error.message || 'Unknown error';
        
//         // Handle 401 - Token expired or invalid
//         if (status === 401) {
//           localStorage.removeItem('token');
//           localStorage.removeItem('user');
//           window.location.href = '/login';
//         }

//         throw new ApiError(status, message, error.response?.data);
//       }
//     );
//   }

//   // ─── USER ENDPOINTS ──────────────────────────────────────────────────────

//   /**
//    * Get all users with optional role filtering
//    */
//   async getUsers(role?: UserRole): Promise<User[]> {
//     try {
//       const params = role ? { role } : {};
//       const response = await this.api.get<{ users: User[] }>('/users', { params });
//       return response.data.users;
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get single user by ID
//    */
//   async getUserById(userId: number): Promise<User> {
//     try {
//       const response = await this.api.get<{ user: User }>(`/users/${userId}`);
//       return response.data.user;
//     } catch (error) {
//       console.error(`Error fetching user ${userId}:`, error);
//       throw error;
//     }
//   }

//   /**
//    * Create new user
//    */
//   async createUser(payload: CreateUserPayload): Promise<User> {
//     try {
//       const response = await this.api.post<{ user: User; message: string }>('/users', payload);
//       return response.data.user;
//     } catch (error) {
//       console.error('Error creating user:', error);
//       throw error;
//     }
//   }

//   /**
//    * Update user
//    */
//   async updateUser(userId: number, payload: UpdateUserPayload): Promise<User> {
//     try {
//       const response = await this.api.put<{ user: User; message: string }>(`/users/${userId}`, payload);
//       return response.data.user;
//     } catch (error) {
//       console.error(`Error updating user ${userId}:`, error);
//       throw error;
//     }
//   }

//   /**
//    * Delete user
//    */
//   async deleteUser(userId: number): Promise<string> {
//     try {
//       const response = await this.api.delete<{ message: string }>(`/users/${userId}`);
//       return response.data.message;
//     } catch (error) {
//       console.error(`Error deleting user ${userId}:`, error);
//       throw error;
//     }
//   }

//   // ─── OWNER STAFF ENDPOINTS ──────────────────────────────────────────────

//   /**
//    * Get all sales agents
//    */
//   async getSalesAgents(): Promise<User[]> {
//     try {
//       const response = await this.api.get<{ sales_agents: User[] }>('/owner/sales-agents');
//       return response.data.sales_agents;
//     } catch (error) {
//       console.error('Error fetching sales agents:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get single sales agent
//    */
//   async getSalesAgent(agentId: number): Promise<User> {
//     try {
//       const response = await this.api.get<{ agent: User }>(`/owner/sales-agents/${agentId}`);
//       return response.data.agent;
//     } catch (error) {
//       console.error(`Error fetching sales agent ${agentId}:`, error);
//       throw error;
//     }
//   }

//   /**
//    * Get all delivery agents
//    */
//   async getDeliveryAgents(): Promise<User[]> {
//     try {
//       const response = await this.api.get<{ delivery_agents: User[] }>('/owner/delivery-agents');
//       return response.data.delivery_agents;
//     } catch (error) {
//       console.error('Error fetching delivery agents:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get single delivery agent
//    */
//   async getDeliveryAgent(agentId: number): Promise<User> {
//     try {
//       const response = await this.api.get<{ agent: User }>(`/owner/delivery-agents/${agentId}`);
//       return response.data.agent;
//     } catch (error) {
//       console.error(`Error fetching delivery agent ${agentId}:`, error);
//       throw error;
//     }
//   }

//   /**
//    * Get all drivers
//    */
//   async getDrivers(): Promise<User[]> {
//     try {
//       const response = await this.api.get<{ drivers: User[] }>('/owner/drivers');
//       return response.data.drivers;
//     } catch (error) {
//       console.error('Error fetching drivers:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get single driver
//    */
//   async getDriver(driverId: number): Promise<User> {
//     try {
//       const response = await this.api.get<{ driver: User }>(`/owner/drivers/${driverId}`);
//       return response.data.driver;
//     } catch (error) {
//       console.error(`Error fetching driver ${driverId}:`, error);
//       throw error;
//     }
//   }

//   // ─── PERMISSION ENDPOINTS ──────────────────────────────────────────────

//   /**
//    * Get all permissions
//    */
//   async getPermissions(): Promise<Permission[]> {
//     try {
//       const response = await this.api.get<{ permissions: Permission[] }>('/permissions');
//       return response.data.permissions;
//     } catch (error) {
//       console.error('Error fetching permissions:', error);
//       throw error;
//     }
//   }

//   /**
//    * Assign permission to user
//    */
//   async assignPermission(payload: PermissionPayload): Promise<Permission> {
//     try {
//       const response = await this.api.post<{ permission: Permission; message: string }>(
//         '/permissions/assign',
//         payload
//       );
//       return response.data.permission;
//     } catch (error) {
//       console.error('Error assigning permission:', error);
//       throw error;
//     }
//   }

//   /**
//    * Update user permission
//    */
//   async updatePermission(payload: PermissionPayload): Promise<Permission> {
//     try {
//       const response = await this.api.put<{ permission: Permission; message: string }>(
//         '/permissions/update',
//         payload
//       );
//       return response.data.permission;
//     } catch (error) {
//       console.error('Error updating permission:', error);
//       throw error;
//     }
//   }

//   // ─── HELPER METHODS ─────────────────────────────────────────────────────

//   /**
//    * Check if user has permission
//    */
//   hasPermission(permissions: Permission[], userId: number, module: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean {
//     const permission = permissions.find(p => p.user_id === userId && p.module === module);
//     if (!permission) return false;

//     const actionMap = {
//       view: permission.can_view,
//       create: permission.can_create,
//       edit: permission.can_edit,
//       delete: permission.can_delete
//     };

//     return actionMap[action];
//   }

//   /**
//    * Get user full name
//    */
//   getFullName(user: User): string {
//     return `${user.first_name} ${user.last_name}`.trim();
//   }

//   /**
//    * Format role for display
//    */
//   formatRole(role: UserRole): string {
//     const roleMap: { [key in UserRole]: string } = {
//       ADMIN: 'Administrator',
//       SHOP_MANAGER: 'Shop Manager',
//       KITCHEN_STAFF: 'Kitchen Staff',
//       DELIVERY_AGENT: 'Delivery Agent',
//       SALES_AGENT: 'Sales Agent',
//       DRIVER: 'Driver',
//       USER: 'User'
//     };
//     return roleMap[role] || role;
//   }
// }

// // ─── EXPORT SINGLETON INSTANCE ──────────────────────────────────────────────
// export const userService = new UserService();

// export default userService;


import axios from "axios";
import { api, BASE_URL } from "./api";


// ─────────────────────────────────────────────────────────────
// AUTH HEADERS (for old axios endpoints)
// ─────────────────────────────────────────────────────────────

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type UserRole =
  | "ADMIN"
  | "SHOP_MANAGER"
  | "SALES_AGENT"
  | "DELIVERY_AGENT"
  | "DRIVER"
  | "KITCHEN_STAFF"
  | "USER"

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  role: UserRole;
  created_at?: string;
}

export interface Permission {
  id: number;
  user_id: number;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface AssignPermissionPayload {
  user_id: number;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface CreateUserPayload {
  first_name: string;
  last_name: string;
  phone_no: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  phone_no?: string;
  email?: string;
  role?: UserRole;
  password?: string;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  phone_no: string;
  email: string;
}

// ─────────────────────────────────────────────────────────────
// OLD USER APIs (axios-based)
// ─────────────────────────────────────────────────────────────

export const getUsers = async (role?: string): Promise<User[]> => {
  const res = await axios.get(`${BASE_URL}/users`, {
    headers: getAuthHeaders(),
    params: role ? { role } : {},
  });
  return res.data.users;
};

export const searchCustomers = async (
  keyword: string
): Promise<Customer[]> => {
  if (!keyword.trim()) return [];

  const res = await api.get("/customers/search", {
    params: {
      q: keyword,
    },
  });

  return res.data?.customers ?? [];
};

export const getUserById = async (id: number): Promise<User> => {
  const res = await axios.get(`${BASE_URL}/users/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data.user;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const res = await axios.post(`${BASE_URL}/users`, payload, {
    headers: getAuthHeaders(),
  });
  return res.data.user;
};

export const updateUser = async (
  id: number,
  payload: UpdateUserPayload
): Promise<void> => {
  await axios.put(`${BASE_URL}/users/${id}`, payload, {
    headers: getAuthHeaders(),
  });
};

export const deleteUser = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/users/${id}`, {
    headers: getAuthHeaders(),
  });
};

// ─────────────────────────────────────────────────────────────
// ROLE-BASED APIs
// ─────────────────────────────────────────────────────────────

export const getKitchenStaff = async (): Promise<any[]> => {
  const res = await api.get("/kitchen-staff");
  return Array.isArray(res.data) ? res.data : res.data?.staff ?? [];
};

export const getDeliveryAgents = async (): Promise<any[]> => {
  const res = await api.get("/delivery-agents");
  return Array.isArray(res.data) ? res.data : res.data?.agents ?? [];
};

export const getDrivers = async (): Promise<any[]> => {
  const res = await api.get("/drivers");
  return Array.isArray(res.data) ? res.data : res.data?.drivers ?? [];
};

export const getAvailableDrivers = async (): Promise<any[]> => {
  const res = await api.get("/drivers/available");
  return Array.isArray(res.data) ? res.data : res.data?.drivers ?? [];
};

export const getDriverDashboard = async (driverId: number): Promise<any> => {
  const res = await api.get(`/drivers/${driverId}/dashboard`);
  return res.data;
};

export const getDriverAssigned = async (driverId: number): Promise<any[]> => {
  const res = await api.get(`/drivers/${driverId}/assigned`);
  return res.data?.orders ?? res.data ?? [];
};

export const getDriverCompleted = async (driverId: number): Promise<any[]> => {
  const res = await api.get(`/drivers/${driverId}/completed`);
  return res.data?.orders ?? res.data ?? [];
};

export const updateDriverStatus = async (
  driverId: number,
  status: "ONLINE" | "BUSY" | "OFFLINE"
): Promise<any> => {
  const res = await api.post(`/drivers/${driverId}/status`, { status });
  return res.data;
};

// ─────────────────────────────────────────────────────────────
// PERMISSIONS (THIS FIXES YOUR ERROR)
// ─────────────────────────────────────────────────────────────

export const getPermissions = async (): Promise<Permission[]> => {
  const res = await axios.get(`${BASE_URL}/permissions`, {
    headers: getAuthHeaders(),
  });
  return res.data.permissions;
};

export const assignPermission = async (
  payload: AssignPermissionPayload
): Promise<void> => {
  await axios.post(`${BASE_URL}/permissions/assign`, payload, {
    headers: getAuthHeaders(),
  });
};

export const updatePermission = async (
  payload: AssignPermissionPayload
): Promise<void> => {
  await axios.put(`${BASE_URL}/permissions/update`, payload, {
    headers: getAuthHeaders(),
  });
};