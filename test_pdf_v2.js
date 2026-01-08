const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const dataBuffer = fs.readFileSync('upload/6 ano A.pdf');

(async () => {
    try {
        console.log('Loading PDF...');
        const parser = new PDFParse();
        // Based on CLI usage, it seems we might need to load it. 
        // But the CLI imports PDFParse and then... what?
        // Let's assume standard usage of this library if I can't see the constructor.
        // Actually, if I look at standard pdf-parse (mehmet-kozan version seems unique).

        // Let's try to just inspect the prototype or do a load.
        // If the CLI does: import { PDFParse } from 'pdf-parse';
        // and later: const result = await parser.text(options);
        // It implies `parser` is an instance.

        // Let's try to pass the buffer to the constructor.
        const instance = new PDFParse();
        const result = await instance.extractText(dataBuffer); // Guessing method name
        console.log(result.text.substring(0, 500));

    } catch (e) {
        console.log('Constructor failed or method wrong.');
        console.log(e);

        // Fallback: Check if it's the static method style
        try {
            // Maybe it follows the standard pdf-parse style but under a different key?
            // But the keys showed PDFParse class.

            // Let's inspect the PDFParse class/function itself
            console.log('PDFParse type:', typeof PDFParse);
            if (typeof PDFParse === 'function') {
                try {
                    const p = new PDFParse();
                    console.log('Instance keys:', Object.keys(p));
                    console.log('Instance proto keys:', Object.getOwnPropertyNames(Object.getPrototypeOf(p)));
                } catch (err) {
                    console.log('Instantiation failed', err);
                }
            }

        } catch (e2) {
            console.log(e2);
        }
    }
})();
