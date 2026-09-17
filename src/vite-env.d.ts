/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_MONETAG_API_KEY?: string;
  readonly VITE_MONETAG_TOTAL_WITHDRAWALS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
