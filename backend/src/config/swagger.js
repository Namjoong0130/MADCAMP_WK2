const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MODIF API Docs',
            version: '1.0.0',
            description: 'API documentation for MODIF backend services, including AI generation and file uploads.',
        },
        servers: [
            {
                url: process.env.BASE_URL || 'http://localhost:3000',
                description: 'Development Server',
            },
            {
                url: 'http://172.10.5.178',
                description: 'Nginx Proxy Server',
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.js', './src/app.js'], // Scan these files for annotations
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs,
};
