import { auth as createAuth } from "@/app/api/auth/[...nextauth]/route";

// For use in Server Components
export const getCurrentUser = async () => {
  const session = await createAuth();
  return session?.user || null;
};

// For protecting server components
export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { user };
};

// For protecting API routes
export const requireApiAuth = async (request: Request) => {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
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
