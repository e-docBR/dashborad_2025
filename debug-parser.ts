import fs from 'fs';
import path from 'path';
import { parseSchoolPDF } from './src/lib/parsers';

const UPLOAD_DIR = path.join(process.cwd(), 'upload');

async function debug() {
    // Pick a 6th grade file which we know implies students exist
    const file = '6 ano A.pdf';
    const filePath = path.join(UPLOAD_DIR, file);
    const buffer = fs.readFileSync(filePath);

    console.log(`Parsing ${file}...`);
    const parsed = await parseSchoolPDF(buffer);

    console.log('--- Results ---');
    console.log(`Class: ${parsed[0]?.className}`);
    console.log(`Students Found: ${parsed[0]?.students?.length}`);

    // Let's print some lines from the extracted text to see format
    const pdfLib = require('pdf-parse');
    const data = await pdfLib(buffer);
    const lines = data.text.split('\n');

    console.log('--- Sample Lines ---');
    // Find lines that look like students but maybe failed regex
    const potentialStudents = lines.filter((l: string) => l.includes('APROVADO') || l.includes('REPROVADO'));
    console.log(potentialStudents.slice(0, 5));

    // Test Regex
    const studentLineRegex = /^(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s+([MF])\s+([\d,.-]+(?:\s+[\d,.-]+)*)\s+(APROVADO|REPROVADO|APCC|TRANSFERIDO|DESISTENTE|CANCELADO)$/;

    console.log('--- Regex Test ---');
    if (potentialStudents.length > 0) {
        const testLine = potentialStudents[0].trim();
        console.log(`Testing line: "${testLine}"`);
        const match = testLine.match(studentLineRegex);
        console.log(`Match? ${!!match}`);
        if (!match) {
            console.log('Regex failed. Analysis:');
            // Breakdown
            const parts = testLine.split(/\s+/);
            console.log('Parts:', parts);
        }
    }
}

debug();
