import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    console.log('[Dashboard API] Initializing route handler...');
    
    // Get the backend token from the Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Dashboard API] No authorization token provided');
      return NextResponse.json(
        { error: 'Unauthorized', details: 'No authorization token provided' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    console.log('[Dashboard API] Using backend token for authorization');
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    console.log(`[Dashboard API] Forwarding request to: ${apiUrl}/api/user/dashboard`);
    
    try {
      // Forward the request to your backend API with the backend token
      const response = await fetch(`${apiUrl}/api/user/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });

      console.log(`[Dashboard API] Backend response status: ${response.status}`);
      
      // If the backend returns an error, forward it to the client
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Dashboard API] Backend error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        return NextResponse.json(
          { 
            error: 'Failed to fetch dashboard data',
            details: errorData.message || errorText,
            status: response.status 
          },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('[Dashboard API] Successfully fetched dashboard data');
      return NextResponse.json(data);
      
    } catch (error) {
      console.error('[Dashboard API] Error forwarding request to backend:', error);
      return NextResponse.json(
        { 
          error: 'Backend connection failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('[Dashboard API] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
