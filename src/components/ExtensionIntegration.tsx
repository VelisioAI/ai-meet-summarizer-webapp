'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Add Chrome extension types
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage: (
          extensionId: string, 
          message: any, 
          responseCallback?: (response: any) => void
        ) => void;
        lastError?: { message: string };
      };
    };
  }
}

// Define message types
type ExtensionMessage = {
  source: string;
  type: string;
  [key: string]: any;
};

type ExtensionResponse = {
  success: boolean;
  [key: string]: any;
};

const CHROME_EXTENSION_ID = process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID || 'YOUR_EXTENSION_ID_HERE';

export default function ExtensionIntegration() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return;

    const handleMessage = (event: MessageEvent<ExtensionMessage>) => {
      // Verify the message is from our extension
      if (event.data?.source === 'chrome-extension-ai-meet-summarizer') {
        if (event.data.type === 'AUTH_SUCCESS') {
          // Handle successful authentication from extension
          console.log('Received auth success from extension', event.data);
          // Refresh the page to update auth state
          window.location.reload();
        }
      }
    };

    // Listen for messages from the extension
    window.addEventListener('message', handleMessage);

    // If user is not logged in, try to trigger extension login
    if (!loading && !user) {
      triggerExtensionLogin();
    }

    // Clean up event listener
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [user, loading, router]);

  const triggerExtensionLogin = () => {
    // This URL will be handled by your Chrome extension
    const extensionUrl = `chrome-extension://${CHROME_EXTENSION_ID}/index.html#/login`;
    
    // Try to open the extension
    window.open(extensionUrl, '_blank');
    
    // Alternative method to communicate with extension
    const chromeRuntime = window.chrome?.runtime;
    if (chromeRuntime) {
      try {
        chromeRuntime.sendMessage(
          CHROME_EXTENSION_ID,
          { 
            type: 'LOGIN_REQUEST', 
            url: window.location.href 
          },
          (response: ExtensionResponse) => {
            if (chromeRuntime.lastError) {
              console.log('Extension not installed or error:', chromeRuntime.lastError);
              return;
            }
            
            if (response?.success) {
              console.log('Login initiated in extension');
            }
          }
        );
      } catch (error) {
        console.error('Error communicating with extension:', error);
      }
    }
  };

  return null; // This component doesn't render anything
}
