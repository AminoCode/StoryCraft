import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

// Provide typed access to the current authenticated user. Without a type
// parameter, `useQuery` would infer the data as `unknown`, which means
// consumers cannot safely access properties like `id` on the returned user
// object. This resulted in TypeScript errors when components attempted to use
// `user.id`.
export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}