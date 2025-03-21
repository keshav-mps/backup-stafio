// Environment variables and configuration settings
const config = {
  // API URLs
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://staffio-dev.999r.in:82',
  authBaseUrl: import.meta.env.VITE_AUTH_BASE_URL || 'https://staffio-dev.999r.in',
  
  // LiveKit configuration
  livekit: {
    apiKey: import.meta.env.VITE_LIVEKIT_API_KEY,
    apiSecret: import.meta.env.VITE_LIVEKIT_API_SECRET,
    url: import.meta.env.VITE_LIVEKIT_URL,
  },
  
  // Other configuration settings
  defaultPageSize: 10,
  maxUploadSize: 5 * 1024 * 1024, // 5MB
};

export default config; 