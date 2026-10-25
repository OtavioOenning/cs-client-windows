/// <reference types="vite/client" />

import type { CsCompanionApi } from "../preload/index";

declare global {
  interface Window {
    csCompanion: CsCompanionApi;
  }
}

export {};
