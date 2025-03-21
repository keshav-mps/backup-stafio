/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LIVEKIT_API_KEY: string;
  readonly VITE_LIVEKIT_API_SECRET: string;
  readonly VITE_LIVEKIT_URL: string;
  readonly API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 