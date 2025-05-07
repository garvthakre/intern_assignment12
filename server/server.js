import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDoc from './docs/swagger.js'  ;
import { initSocket } from './socket/socket.js';
import groupRoutes from './routes/group.routes.js';
dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));