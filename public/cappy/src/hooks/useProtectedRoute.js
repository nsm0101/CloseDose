import { requireAuth } from "../authService";

export async function useProtectedRoute(options = {}) {
  return requireAuth(options);
}
