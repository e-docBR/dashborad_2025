import { importSchoolData } from './src/app/actions/import-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'upload');
const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.pdf'));

console.log(`Found ${files.length} PDF files to import\n`);

async function importAll() {
    let totalClasses = 0;
    let totalStudents = 0;
    let totalResults = 0;

    for (const filename of files) {
        const filePath = path.join(uploadDir, filename);
        const buffer = fs.readFileSync(filePath);

        const formData = new FormData();
        const blob = new Blob([buffer], { type: 'application/pdf' });
        formData.append('file', blob, filename);

        try {
            console.log(`Importing ${filename}...`);
            const result = await importSchoolData(formData);
            console.log(`  ${result.message}`);

            if (result.success) {
                // Parse stats from message
                const match = result.message.match(/Turmas: (\d+), Alunos: (\d+), Notas: (\d+)/);
                if (match) {
                    totalClasses += parseInt(match[1]);
                    totalStudents += parseInt(match[2]);
                    totalResults += parseInt(match[3]);
                }
            }
        } catch (error) {
            console.error(`  Error: ${error.message}`);
        }
    }

    console.log(`\n=== Import Complete ===`);
    console.log(`Total Classes: ${totalClasses}`);
    console.log(`Total Students: ${totalStudents}`);
    console.log(`Total Results: ${totalResults}`);
}

importAll().catch(console.error);
