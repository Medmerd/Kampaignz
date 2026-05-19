import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  logLevel: 'info',
  build: {
    rollupOptions: {
      external: ['better-sqlite3', 'sqlite3', 'knex', 'pg', 'tedious', 'mysql', 'mysql2', 'oracledb', 'pg-query-stream'],
    },
  },
});
