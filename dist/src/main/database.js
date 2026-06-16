"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.initializeDatabase = exports.getDatabase = void 0;
const node_path_1 = __importDefault(require("node:path"));
const knex_1 = __importDefault(require("knex"));
const dotenv = __importStar(require("dotenv"));
// @ts-ignore
const knexConfig = require('../../knexfile.js');
dotenv.config();
let db = null;
const getDatabase = () => {
    if (!db) {
        throw new Error('Database is not initialized.');
    }
    return db;
};
exports.getDatabase = getDatabase;
const initializeDatabase = async () => {
    if (db) {
        return db;
    }
    const environment = process.env.VITE_DB_CLIENT || 'development';
    const config = knexConfig[environment];
    console.log('Using database environment:', environment, config);
    if (!config) {
        throw new Error(`Knex configuration not found for environment: ${environment}`);
    }
    if (config.client === 'sqlite3' || config.client === 'better-sqlite3') {
        if (!config.connection) {
            config.connection = {};
        }
        if (config.connection.filename === './dev.sqlite3') {
            try {
                const { app } = require('electron');
                config.connection.filename = node_path_1.default.join(app.getPath('userData'), 'kampaignz.db');
            }
            catch (err) {
                // Safe fallback when running outside Electron (e.g. standalone web-server pod)
                config.connection.filename = node_path_1.default.join(process.cwd(), 'dev.sqlite3');
            }
        }
        config.useNullAsDefault = true;
    }
    db = (0, knex_1.default)(config);
    if (config.client === 'sqlite3' || config.client === 'better-sqlite3') {
        await db.migrate.latest(config.migrations);
    }
    return db;
};
exports.initializeDatabase = initializeDatabase;
const closeDatabase = async () => {
    if (!db) {
        return;
    }
    await db.destroy();
    db = null;
};
exports.closeDatabase = closeDatabase;
//# sourceMappingURL=database.js.map