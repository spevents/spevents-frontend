// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALLOWED_EMAIL: string

}
interface ImportMeta {
  readonly env: ImportMetaEnv
}