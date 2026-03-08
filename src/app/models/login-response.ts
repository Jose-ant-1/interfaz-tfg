export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  roles: string[];
}
