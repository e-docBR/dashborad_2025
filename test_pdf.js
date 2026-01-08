const fs = require('fs');
const pdfLib = require('pdf-parse');

console.log('Type of pdfLib:', typeof pdfLib);
console.log('Keys:', Object.keys(pdfLib));

let pdf = pdfLib;

const dataBuffer = fs.readFileSync('upload/6 ano A.pdf');

// Check if it's a promise or needs different call
try {
    pdf(dataBuffer).then(function (data) {
        console.log(data.text.substring(0, 3000));
    });
} catch (e) {
    console.error('Error calling pdf:', e);
}
