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
  return {
    token: process.env.NEXT_PUBLIC_AUTH_TOKEN || undefined,
    apiKey: process.env.NEXT_PUBLIC_API_KEY || undefined,
    // Add any custom headers here
    customHeaders: {
      // Example: "X-Custom-Header": process.env.NEXT_PUBLIC_CUSTOM_HEADER || undefined,
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
  // Fallback to token if provided and not empty
  else if (authConfig.token && authConfig.token.trim() !== "") {
    headers["Authorization"] = `Bearer ${authConfig.token}`;
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
  const headers = createAuthHeaders(config);
  
  // Return HttpEndpoint object if headers exist, otherwise return string
  return Object.keys(headers).length > 0 
    ? { url, headers }
    : url;
};

/**
 * Default RPC endpoint with auth
 */
export const DEFAULT_RPC_ENDPOINT = process.env.NODE_ENV === 'development' 
  ? "http://localhost:3000/api/rpc-proxy"
  : "https://api.chandrastation.com/rpc/gravity/";

/**
 * Default REST endpoint with auth  
 */
export const DEFAULT_REST_ENDPOINT = "https://api.chandrastation.com/api/gravity/"; 