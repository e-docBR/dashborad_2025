import fs from 'fs';
import path from 'path';
import { parseSchoolPDF } from './src/lib/parsers';

const UPLOAD_DIR = path.join(process.cwd(), 'upload');

async function debug() {
    const file = '6 ano A.pdf';
    const filePath = path.join(UPLOAD_DIR, file);
    const buffer = fs.readFileSync(filePath);

    console.log(`Parsing ${file}...`);
    const parsed = await parseSchoolPDF(buffer);

    console.log(`Class: ${parsed[0]?.className}`);
    console.log(`Students Found: ${parsed[0]?.students?.length}`);
    console.log('--- List of Found Students ---');
    parsed[0]?.students.forEach((s, i) => console.log(`${i + 1}. ${s.name}`));

    // Print raw text to find missing ones
    const pdfLib = require('pdf-parse');
    const data = await pdfLib(buffer);
    const lines = data.text.split('\n');

    console.log('\n--- ALL RAW LINES with > 5 chars ---');
    lines.forEach((l: string, i: number) => {
        if (l.trim().length > 5) console.log(`${i}: ${l.trim()}`);
    });
}

debug();
