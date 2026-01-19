const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs');
const path = require('path');

// Create a dummy 1x1 png or use an existing one
const dummyPath = path.join(__dirname, '../public/images/dummy.png');

// Create a simple buffer for a valid PNG (1x1 pixel)
const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync(dummyPath, buffer);

console.log('🚀 Starting Model Download & Priming...');
console.log('This may take a minute or two. Please wait.');

removeBackground(`file://${dummyPath}`).then((blob) => {
    console.log('✅ Model Download Complete! Blob size:', blob.size);
    console.log('You can now use the API without timeouts.');
}).catch((err) => {
    console.error('❌ Error during priming:', err);
});
