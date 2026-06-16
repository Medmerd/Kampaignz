"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
// https://vitejs.dev/config
exports.default = (0, vite_1.defineConfig)({
    logLevel: 'info',
    build: {
        rollupOptions: {
            external: ['better-sqlite3', 'sqlite3', 'knex', 'pg', 'tedious', 'mysql', 'mysql2', 'oracledb', 'pg-query-stream'],
        },
    },
});
//# sourceMappingURL=vite.main.config.js.map