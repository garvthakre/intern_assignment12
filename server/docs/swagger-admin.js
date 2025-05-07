import swaggerJsdoc from 'swagger-jsdoc';

const adminOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Admin API Documentation',
      version: '1.0.0',
      description: 'API documentation for administrators'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
    servers: [
      { url: 'http://localhost:5000' }
    ]
  },
  apis: ['./routes/*.js', './docs/swagger-docs.js']
};

const adminSwaggerSpec = swaggerJsdoc(adminOptions);

export default adminSwaggerSpec;