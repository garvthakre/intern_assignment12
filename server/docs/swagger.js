import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API Project',
      version: '1.0.0',
      description: 'API documentation for our REST API project'
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

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;