/**
 * Swagger/OpenAPI Configuration
 * API documentation setup
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'NAMOAROGYA Healthcare API',
            version: '1.0.0',
            description: 'FHIR-compliant healthcare API integrating AYUSH (NAMASTE) and ICD-11 medical coding systems',
            contact: {
                name: 'NAMOAROGYA Team',
                email: 'support@namoarogya.com',
            },
            license: {
                name: 'Proprietary',
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: 'Development server',
            },
            {
                url: 'https://api.namoarogya.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token obtained from /api/auth/login',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                        error: {
                            type: 'object',
                        },
                    },
                },
                Patient: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        fhir_id: {
                            type: 'string',
                        },
                        name: {
                            type: 'string',
                        },
                        dob: {
                            type: 'string',
                            format: 'date',
                        },
                        gender: {
                            type: 'string',
                            enum: ['M', 'F', 'O'],
                        },
                        phone: {
                            type: 'string',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                        },
                        address: {
                            type: 'string',
                        },
                    },
                },
                FHIRPatient: {
                    type: 'object',
                    properties: {
                        resourceType: {
                            type: 'string',
                            example: 'Patient',
                        },
                        id: {
                            type: 'string',
                        },
                        identifier: {
                            type: 'array',
                            items: {
                                type: 'object',
                            },
                        },
                        name: {
                            type: 'array',
                            items: {
                                type: 'object',
                            },
                        },
                        gender: {
                            type: 'string',
                        },
                        birthDate: {
                            type: 'string',
                            format: 'date',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and authorization',
            },
            {
                name: 'Patients',
                description: 'Patient management operations',
            },
            {
                name: 'Diagnosis',
                description: 'Diagnosis and clinical records',
            },
            {
                name: 'NAMASTE',
                description: 'AYUSH medical codes',
            },
            {
                name: 'ICD-11',
                description: 'International Classification of Diseases codes',
            },
            {
                name: 'Dual Coding',
                description: 'NAMASTE to ICD-11 mapping',
            },
            {
                name: 'Analytics',
                description: 'Healthcare analytics and insights',
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Path to API route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
