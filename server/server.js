import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import groupRoutes from './routes/group.routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDoc from './docs/swagger.js';
import { initSocket } from './socket/socket.js';
import { seedAdmin } from './seeders/admin.seeder.js';
import adminRoutes from './routes/admin.routes.js';
import { validate, registerValidation, loginValidation } from './middlewares/validation.middleware.js';
import { logger } from './services/logger.service.js';
import { authLimiter, apiLimiter } from './middlewares/rate-limit.middleware.js';
import userSwaggerSpec from './docs/swagger-user.js';
import adminSwaggerSpec from './docs/swagger-admin.js';
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();
// At the end of your server.js, after connectDB():
(async () => {
  try {
    await seedAdmin();
    console.log('Admin seeding completed successfully');
  } catch (error) {
    console.error('Admin seeding failed:', error);
  }
})();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false  // Disable for easier testing
}));
app.use(morgan('dev'));

// Debug middleware for auth headers
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    if (req.headers.authorization) {
      logger.debug('Authorization header present');
    }
    next();
  });

// Welcome route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Update routes with validation
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/admin', adminRoutes);

// Update Swagger docs
app.use('/api/docs/user', swaggerUi.serve, swaggerUi.setup(userSwaggerSpec));
app.use('/api/docs/admin', swaggerUi.serve, swaggerUi.setup(adminSwaggerSpec));
// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Add to server.js
app.get('/socket-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));