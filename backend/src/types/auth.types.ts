export enum UserRole {
  CUSTOMER = 'customer',
  COOK = 'cook',
  MAID = 'maid',
  PROVIDER = 'provider',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export interface JwtAccessPayload {
  sub: string;
  role: UserRole;
  email: string;
}

export interface JwtRefreshPayload {
  sub: string;
  jti: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  expiresIn: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
