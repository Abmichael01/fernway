import type { SignInValues } from "@/schemas/auth";
import type { User } from "@/types/banking";
import { apiRequest } from "./client";

export function signIn(values: SignInValues): Promise<User> {
  return apiRequest<User>("/auth/login", { method: "POST", body: values });
}

export function signOut(): Promise<void> {
  return apiRequest<void>("/auth/logout", { method: "POST" });
}

export function quickLogin(email: string): Promise<User> {
  return apiRequest<User>("/auth/quick-login", { method: "POST", body: { email } });
}
