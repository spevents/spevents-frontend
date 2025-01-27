// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALLOWED_EMAIL: string
  readonly VITE_EVENT_ID: string 


}
interface ImportMeta {
  readonly env: ImportMetaEnv
}