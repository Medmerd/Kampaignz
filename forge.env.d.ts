/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />

import type { KampaignzApi } from './src/preload';

declare global {
  interface Window {
    api: KampaignzApi;
  }
}
