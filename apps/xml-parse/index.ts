import { promises as fs } from 'node:fs';
import knex from 'knex';
import * as dotenv from 'dotenv';
import { BattleScribeParser } from './parser';
import { ingestData } from './ingestor';
// @ts-ignore
import knexConfig from '../../knexfile.js';

dotenv.config();

/**
 * Get data from a file path
 * @param filePath 
 */
async function loadFileData(filePath: string) {
    return await fs.readFile(filePath, 'utf-8');
}

async function main(): Promise<void> {
    console.log("Starting XML Parse & DB Ingest");

    // Initialize Database
    const environment = process.env.VITE_DB_CLIENT || 'devpostgresql';
    const config = knexConfig[environment];
    
    if (!config) {
        throw new Error(`Knex configuration not found for environment: ${environment}`);
    }

    console.log(`Connecting to database via environment: ${environment}`);
    const db = knex(config);

    try {
        console.log('Running database migrations...');
        await db.migrate.latest();

        const parser = new BattleScribeParser();

        // 1. Process Core Rules (.gst)
        console.log('Parsing core rules...');
        const mainFile = await loadFileData('./apps/xml-parse/data/Warhammer 40,000.gst');
        const coreData = parser.parseGameSystem(mainFile);
        console.log(`Parsed ${coreData.game_categories.length} core categories and ${coreData.game_selections.length} selections.`);
        
        console.log('Ingesting core rules into DB...');
        await ingestData(db, coreData);

        // 2. Process Faction Data (.cat)
        const factionFiles: string[] = [
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
                await ingestData(db, factionData);
            } catch (err: any) {
                console.error(`Failed to process ${file}: ${err.message}`);
                // Continue to the next file even if one fails
            }
        }

        console.log("\nImport process fully completed.");
    } catch (e) {
        console.error('Fatal error during import:', e);
    } finally {
        await db.destroy();
    }
}

main();
