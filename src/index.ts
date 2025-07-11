import app from './app';
import { closeConnection } from './db/connection';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

const gracefulShutdown = async (): Promise<void> => {
  logger.info('Received shutdown signal. Closing server gracefully...');
  
  server.close(async (err) => {
    if (err) {
      logger.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    try {
      await closeConnection();
      logger.info('Database connection closed');
      logger.info('Server shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error closing database connection:', error);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default server;