export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string | undefined;
  error?: string | undefined;
  statusCode?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface UserWithPermissions {
  id: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date | null;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}