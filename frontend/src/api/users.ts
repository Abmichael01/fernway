import type { User } from "@/types/banking";
import { apiRequest } from "./client";

export function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/auth/me");
}
