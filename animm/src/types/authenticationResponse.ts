import { BaseApiResponse } from './baseApi';

export interface AuthenticationResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
  jwtToken: string;
  refreshToken: string;
  expiry: Date;
  mustChangePassword: boolean;
  mustVerify: boolean;
  userRoles: UserRole[];
}

export interface UserRole {
  name: string;
}

export interface ApiAuthenticationResponse
  extends BaseApiResponse<AuthenticationResponse> {}
