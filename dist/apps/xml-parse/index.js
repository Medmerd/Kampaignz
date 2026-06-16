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
const node_fs_1 = require("node:fs");
const knex_1 = __importDefault(require("knex"));
const dotenv = __importStar(require("dotenv"));
const parser_1 = require("./parser");
const ingestor_1 = require("./ingestor");
// @ts-ignore
const knexfile_js_1 = __importDefault(require("../../knexfile.js"));
dotenv.config();
/**
 * Get data from a file path
 * @param filePath
 */
async function loadFileData(filePath) {
    return await node_fs_1.promises.readFile(filePath, 'utf-8');
}
async function main() {
    console.log("Starting XML Parse & DB Ingest");
    // Initialize Database
    const environment = process.env.VITE_DB_CLIENT || 'devpostgresql';
    const config = knexfile_js_1.default[environment];
    if (!config) {
        throw new Error(`Knex configuration not found for environment: ${environment}`);
    }
    console.log(`Connecting to database via environment: ${environment}`);
    const db = (0, knex_1.default)(config);
    try {
        console.log('Running database migrations...');
        await db.migrate.latest();
        const parser = new parser_1.BattleScribeParser();
        // 1. Process Core Rules (.gst)
        console.log('Parsing core rules...');
        const mainFile = await loadFileData('./apps/xml-parse/data/Warhammer 40,000.gst');
        const coreData = parser.parseGameSystem(mainFile);
        console.log(`Parsed ${coreData.game_categories.length} core categories and ${coreData.game_selections.length} selections.`);
        console.log('Ingesting core rules into DB...');
        await (0, ingestor_1.ingestData)(db, coreData);
        // 2. Process Faction Data (.cat)
        const factionFiles = [
            './apps/xml-parse/data/Imperium - Adeptus Custodes.cat',
            './apps/xml-parse/data/Imperium - Space Marines.cat', // Assumes this file exists
        ];
        for (const file of factionFiles) {
            try {
                console.log(`\nParsing faction file: ${file}`);
                const fileData = await loadFileData(file);
                const factionData = parser.parseCatalogue(fileData);
                console.log(`Parsed ${factionData.game_catalogues[0].name}. Found ${factionData.game_selections.length} selections.`);
                console.log(`Ingesting faction rules into DB...`);
                await (0, ingestor_1.ingestData)(db, factionData);
            }
            catch (err) {
                console.error(`Failed to process ${file}: ${err.message}`);
                // Continue to the next file even if one fails
            }
        }
        console.log("\nImport process fully completed.");
    }
    catch (e) {
        console.error('Fatal error during import:', e);
    }
    finally {
        await db.destroy();
    }
}
main();
//# sourceMappingURL=index.js.map