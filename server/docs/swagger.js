import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API Project',
      version: '1.0.0'
    },
    servers: [
      { url: 'http://localhost:5000' }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;