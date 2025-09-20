// backend/src/server.js
import app from './app.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3001;

// Start server
const server = app.listen(PORT, () => {
    logger.info(`🚀 NEO Regex server running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    
    if (process.env.NODE_ENV === 'development') {
        logger.info(`🌐 Frontend dev server should be running on http://localhost:5173`);
        logger.info(`📊 API endpoints available at http://localhost:${PORT}/api`);
    }
});

// Handle server errors
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

    switch (error.code) {
        case 'EACCES':
            logger.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    server.close(() => {
        logger.info('Server closed.');
        
        // Close database connections if any
        // db.close();
        
        process.exit(0);
    });

    // Force close server after 30 seconds
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;