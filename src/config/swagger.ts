import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BrightPath API',
      version: '1.0.0',
      description: 'BrightPath MVP Backend API Documentation',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
        },
      },
      schemas: {
        Province: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        School: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            province_id: { type: 'string', format: 'uuid' },
            city: { type: 'string' },
            governor: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'confirmed'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            province: { $ref: '#/components/schemas/Province' },
          },
        },
        CreateSchoolInput: {
          type: 'object',
          required: ['name', 'province_id', 'city', 'governor', 'email', 'password', 'phone', 'address'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 255 },
            province_id: { type: 'string', format: 'uuid' },
            city: { type: 'string', minLength: 2, maxLength: 255 },
            governor: { type: 'string', minLength: 2, maxLength: 255 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            phone: { type: 'string', minLength: 5, maxLength: 20 },
            address: { type: 'string', minLength: 5, maxLength: 500 },
          },
        },
        VerifyOtpInput: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: { type: 'string', format: 'email' },
            otp: { type: 'string', length: 6 },
          },
        },
        CreateProvinceInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                stack: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
