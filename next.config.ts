import type { NextConfig } from "next";

// Default backend URL if environment variable is not set
const DEFAULT_BACKEND_URL = 'http://localhost:3001';

const nextConfig: NextConfig = {
  async headers() {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      // Add other allowed origins as needed
    ];

    return [
      {
        source: '/api/:path*',
        headers: [
          { 
            key: 'Access-Control-Allow-Credentials', 
            value: 'true' 
          },
          { 
            key: 'Access-Control-Allow-Origin', 
            // For development, you can use a specific origin or a function to check against allowedOrigins
            value: process.env.NODE_ENV === 'production' 
              ? 'https://your-production-domain.com' 
              : 'http://localhost:3000' 
          },
          { 
            key: 'Access-Control-Allow-Methods', 
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' 
          },
          { 
            key: 'Access-Control-Allow-Headers', 
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' 
          }
        ]
      }
    ];
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;
    
    // Remove trailing slash if present
    const cleanBackendUrl = backendUrl.endsWith('/') 
      ? backendUrl.slice(0, -1) 
      : backendUrl;
    
    if (!cleanBackendUrl) {
      console.warn('NEXT_PUBLIC_BACKEND_URL is not set. Using default backend URL.');
      return [];
    }
    
    return [
      {
        source: '/api/:path*',
        destination: `${cleanBackendUrl}/api/:path*`,
      },
    ]
  }
};

export default nextConfig;