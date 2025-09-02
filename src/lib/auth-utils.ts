import { supabase } from './supabase';

// For use in Server Components
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// For protecting server components
export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { user };
};

// For client-side auth checks
export const authUtils = {
  isAuthenticated: async () => {
    const user = await getCurrentUser();
    return !!user;
  },
  getCurrentUser,
  requireAuth,
};

export default authUtils;
