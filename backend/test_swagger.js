require('dotenv').config();
try {
    const { specs } = require('./src/config/swagger');
    console.log('Swagger specs generated successfully!');
    // console.log(JSON.stringify(specs, null, 2));
} catch (error) {
    console.error('Swagger generation failed:', error.message);
    console.error(error);
    process.exit(1);
}
