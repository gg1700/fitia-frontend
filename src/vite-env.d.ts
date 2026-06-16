/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // Agrega más variables si las tienes
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}