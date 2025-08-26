import { BaseApiResponse } from './baseApi';

export interface User {
  id: number;
  clientName: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface ApiUsers extends BaseApiResponse<User[]> {}
export interface ApiUser extends BaseApiResponse<User> {}
