import { api } from "./api";
import type { LoginDto } from "../model/LoginDto";
import type { RegisterDto } from "../model/RegisterDto";

export interface AuthResponse {
    token: string;
    username: string;
    userId: number;
}

export const register = (dto: RegisterDto) =>
    api.post<AuthResponse>("/auth/register", dto);

export const login = (dto: LoginDto) =>
    api.post<AuthResponse>("/auth/login", dto);

export const setSession = (auth: AuthResponse) => {
    localStorage.setItem("token", auth.token);
    sessionStorage.setItem("username", auth.username);
};

export const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("username");
};

export const getUsername = () => sessionStorage.getItem("username");
export const isLoggedIn = () => !!localStorage.getItem("token");

export { api as API };
