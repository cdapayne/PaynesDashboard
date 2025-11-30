import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import routes from './api/routes';
import { errorHandler, notFoundHandler } from './middleware';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = () => {
  app.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
  });
};

// Only start if this is the main module
if (require.main === module) {
  startServer();
}

export { app, startServer };
