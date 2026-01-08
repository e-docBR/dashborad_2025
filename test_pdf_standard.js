const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('upload/6 ano A.pdf');

pdf(dataBuffer).then(function (data) {
    console.log('SUCCESS: Text extracted length:', data.text.length);
    console.log(data.text.substring(0, 500));
}).catch(e => {
    console.error('FAILURE:', e);
});
