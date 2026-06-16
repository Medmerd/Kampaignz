"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        environment: 'node',
        include: ['tests/**/*.test.ts', 'apps/xml-parse/**/*.test.ts'],
        clearMocks: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            reportsDirectory: './coverage',
            include: ['src/main/repositories/**/*.ts', 'src/main/ipc/**/*.ts', 'apps/xml-parse/**/*.ts'],
        },
    },
});
//# sourceMappingURL=vitest.config.js.map