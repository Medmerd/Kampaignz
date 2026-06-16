"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeTestDatabase = exports.getTestDatabase = exports.setupTestDatabase = void 0;
const knex_1 = __importDefault(require("knex"));
let db = null;
const setupTestDatabase = async () => {
    if (db) {
        await db.destroy();
    }
    db = (0, knex_1.default)({
        // client: 'better-sqlite3',
        client: 'sqlite3',
        connection: ':memory:',
        useNullAsDefault: true,
    });
    // Run the new knex migrations
    await db.migrate.latest({
        directory: './migrations',
    });
    return db;
};
exports.setupTestDatabase = setupTestDatabase;
const getTestDatabase = () => {
    if (!db) {
        throw new Error('Test database not initialized. Call setupTestDatabase() first.');
    }
    return db;
};
exports.getTestDatabase = getTestDatabase;
const closeTestDatabase = async () => {
    if (db) {
        await db.destroy();
        db = null;
    }
};
exports.closeTestDatabase = closeTestDatabase;
//# sourceMappingURL=db-setup.js.map