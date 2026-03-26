import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, '../data/CMS_ASP_Q3_2026.csv');
const OUTPUT_PATH = path.join(__dirname, '../public/cms_asp_data.json');

console.log(`[Ingestion Core] Starting CMS ASP Processing Pipeline...`);
console.log(`[Ingestion Core] Target File: ${CSV_PATH}`);

try {
    const rawCSV = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = rawCSV.split('\n').filter(line => line.trim().length > 0);
    
    // Validate Headers
    const headers = lines[0].split(',').map(h => h.trim());
    console.log(`[Ingestion Core] Detected Columns: ${headers.join(' | ')}`);
    
    const dictionary = {};
    let processedCount = 0;

    // Parse Rows
    for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(c => c.trim());
        if (columns.length < 7) continue;

        const hcpcs = columns[0];
        dictionary[hcpcs] = {
            hcpcs: hcpcs,
            description: columns[1],
            aspPrice: parseFloat(columns[2]),
            prevASP: parseFloat(columns[3]),
            nextASP: parseFloat(columns[4]),
            reimbursementRate: parseFloat(columns[5]),
            isBiosimilar: columns[6].toLowerCase() === 'true',
            effectiveDate: '2026-07-01' // Q3 2026
        };
        processedCount++;
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(dictionary, null, 2));
    
    console.log(`[Ingestion Core] SUCCESS. Compiled ${processedCount} HCPCS codes into hyper-fast JSON dictionary.`);
    console.log(`[Ingestion Core] Output Dictionary Location: ${OUTPUT_PATH}`);

} catch (err) {
    console.error(`[Ingestion Core] FATAL ERROR: ${err.message}`);
    process.exit(1);
}
