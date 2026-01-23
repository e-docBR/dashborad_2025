const fs = require('fs');
const path = require('path');

// Simple script to import all PDFs via the import API
const uploadDir = path.join(__dirname, 'upload');
const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.pdf'));

console.log(`Found ${files.length} PDF files to import`);

async function importFile(filename) {
    const filePath = path.join(uploadDir, filename);
    const fileBuffer = fs.readFileSync(filePath);

    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('file', blob, filename);

    try {
        const response = await fetch('http://localhost:3000/api/import', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        console.log(`${filename}: ${result.message}`);
        return result;
    } catch (error) {
        console.error(`Error importing ${filename}:`, error.message);
        return { success: false, message: error.message };
    }
}

async function importAll() {
    for (const file of files) {
        await importFile(file);
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

importAll().catch(console.error);
