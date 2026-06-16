"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
// https://vitejs.dev/config
exports.default = (0, vite_1.defineConfig)({
    server: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true,
            },
        },
    },
});
//# sourceMappingURL=vite.renderer.config.js.map