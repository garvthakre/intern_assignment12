import swaggerJsdoc from 'swagger-jsdoc';

const userOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User API Documentation',
      version: '1.0.0',
      description: 'API documentation for regular users'
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

const userSwaggerSpec = swaggerJsdoc(userOptions);

export default userSwaggerSpec;