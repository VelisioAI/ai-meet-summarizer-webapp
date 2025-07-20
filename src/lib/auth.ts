import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// For use in Server Components
export const getCurrentUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user || null;
};

// For use in API routes and server actions
export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { user };
};

// For use in Client Components
export const authUtils = {
  isAuthenticated: async () => {
    const user = await getCurrentUser();
    return !!user;
  },
  getCurrentUser,
  requireAuth,
};

export default authUtils;
