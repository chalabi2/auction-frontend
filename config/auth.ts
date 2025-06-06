/**
 * Authentication configuration for RPC and REST endpoints
 */

export interface AuthConfig {
  token?: string;
  apiKey?: string;
  customHeaders?: Record<string, string>;
}

export interface HttpEndpoint {
  url: string;
  headers: Record<string, string>;
}

/**
 * Get auth configuration from environment variables
 */
export const getAuthConfig = (): AuthConfig => {
  // Try multiple possible environment variable names
  // In server context, we can access all env vars
  // In client context, only NEXT_PUBLIC_ vars are available
  const apiKey = (typeof window === 'undefined' 
    ? (process.env.API_KEY || 
       process.env.NEXT_PUBLIC_API_KEY || 
       process.env.VERCEL_API_KEY ||
       process.env.CHANDRASTATION_API_KEY)
    : process.env.NEXT_PUBLIC_API_KEY) || undefined;

  return {
    apiKey,
    // Add any custom headers here
    customHeaders: {
      // Example: "X-Custom-Header": process.env.CUSTOM_HEADER || undefined,
    },
  };
};

/**
 * Create headers object from auth configuration
 */
export const createAuthHeaders = (config?: AuthConfig): Record<string, string> => {
  const authConfig = config || getAuthConfig();
  const headers: Record<string, string> = {};

  // Use API key as bearer token if provided and no separate token exists
  if (authConfig.apiKey && authConfig.apiKey.trim() !== "") {
    headers["Authorization"] = `Bearer ${authConfig.apiKey}`;
  }

  // Add any custom headers
  if (authConfig.customHeaders) {
    Object.entries(authConfig.customHeaders).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        headers[key] = value;
      }
    });
  }

  return headers;
};

/**
 * Create an endpoint configuration with auth headers
 */
export const createAuthEndpoint = (url: string, config?: AuthConfig): HttpEndpoint | string => {
  // Check if we're using the proxy (which handles auth server-side)
  const isUsingProxy = url.includes('/api/rpc-proxy') || url.includes('localhost:3000/api/rpc-proxy');
  
  // If using proxy, don't add auth headers (proxy handles auth)
  if (isUsingProxy) {
    return url;
  }
  
  // For direct API calls, try to add auth headers
  const authConfig = config || getAuthConfig();
  
  // Only add headers if we have an API key available
  if (authConfig.apiKey && authConfig.apiKey.trim() !== "") {
    const headers = createAuthHeaders(authConfig);
    return Object.keys(headers).length > 0 ? { url, headers } : url;
  }
  
  // If no API key available (e.g., in client-side context), return plain URL
  // This will work for public endpoints or when auth is handled elsewhere
  return url;
};

/**
 * Default RPC endpoint with auth
 */
export const DEFAULT_RPC_ENDPOINT = (() => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // For production, try proxy first but fallback to direct if needed
    if (process.env.NODE_ENV === 'production') {
      // In production, we'll handle the fallback in the client code
      return `${window.location.origin}/api/rpc-proxy`;
    }
    // Development: use proxy
    return `${window.location.origin}/api/rpc-proxy`;
  }
  
  // Server-side: use full URL for development
  if (process.env.NODE_ENV === 'development') {
    return "http://localhost:3000/api/rpc-proxy";
  }
  
  // For production server-side rendering, we'll default to the proxy path
  return "/api/rpc-proxy";
})();

/**
 * Fallback RPC endpoint for direct API calls
 */
export const FALLBACK_RPC_ENDPOINT = "https://api.chandrastation.com/rpc/gravity/";

/**
 * Default REST endpoint with auth  
 */
export const DEFAULT_REST_ENDPOINT = "https://api.chandrastation.com/api/gravity/"; 