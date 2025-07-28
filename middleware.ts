import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables in middleware');
}

// Public paths that don't require authentication
const publicPaths = ['/login', '/signup', '/', '/forgot-password', '/reset-password'];

// API routes that don't require authentication
const publicApiRoutes = ['/api/auth/callback', '/api/health'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Skip middleware for public paths and API routes
  if (
    publicPaths.some(path => pathname.startsWith(path)) ||
    publicApiRoutes.some(route => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
    }
  );

  // Get the session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check for API token in cookies or headers for API routes
  const isApiRoute = pathname.startsWith('/api');
  const apiToken = req.cookies.get('apiToken') || 
                  req.headers.get('authorization')?.replace('Bearer ', '');
  
  // For API routes, check for a valid API token
  if (isApiRoute) {
    if (!apiToken) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Optionally validate the API token here if needed
    return res;
  }

  // For non-API routes, check for a valid session
  if (!session) {
    // Redirect to login with the current path as the return URL
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
