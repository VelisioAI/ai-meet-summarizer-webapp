import { auth as createAuth } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

// Re-export the auth function
export { auth } from "@/app/api/auth/[...nextauth]/route";

// For use in server components
export const getAuthSession = async () => {
  const session = await createAuth();
  return session;
};

// For getting current user in server components
export const getCurrentUser = async () => {
  const session = await getAuthSession();
  return session?.user || null;
};

// For protecting API routes
export const requireAuth = async (req: NextRequest) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  return session.user;
};

// For protecting server components
export const requireAuthClient = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { user };
};
