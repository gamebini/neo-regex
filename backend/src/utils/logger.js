// backend/src/utils/logger.js
import winston from 'winston';

const { combine, timestamp, errors, json, colorize, simple, printf } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
        msg += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return msg;
});

// Create logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        errors({ stack: true }),
        json()
    ),
    defaultMeta: {
        service: 'neo-regex-api'
    },
    transports: []
});

// Configure transports based on environment
if (process.env.NODE_ENV === 'production') {
    // Production logging
    logger.add(new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true
    }));

    logger.add(new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 10,
        tailable: true
    }));

    // Console for production (structured logs)
    logger.add(new winston.transports.Console({
        format: json()
    }));

} else {
    // Development logging
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            timestamp({
                format: 'HH:mm:ss'
            }),
            devFormat
        )
    }));

    // File logging for development (optional)
    if (process.env.LOG_TO_FILE === 'true') {
        logger.add(new winston.transports.File({
            filename: 'logs/dev.log',
            format: combine(
                timestamp(),
                json()
            )
        }));
    }
}

// Helper methods for common logging patterns
const logMethods = {
    // HTTP request logging
    req: (req, res) => {
        const start = Date.now();
        
        res.on('finish', () => {
            const duration = Date.now() - start;
            const level = res.statusCode >= 400 ? 'warn' : 'info';
            
            logger.log(level, 'HTTP Request', {
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                userAgent: req.get('User-Agent'),
                ip: req.ip
            });
        });
    },

    // Database operation logging
    db: (operation, table, duration, error = null) => {
        if (error) {
            logger.error('Database Error', {
                operation,
                table,
                duration: duration ? `${duration}ms` : undefined,
                error: error.message,
                stack: error.stack
            });
        } else {
            logger.info('Database Operation', {
                operation,
                table,
                duration: duration ? `${duration}ms` : undefined
            });
        }
    },

    // Authentication logging
    auth: (event, user, details = {}) => {
        logger.info('Auth Event', {
            event,
            userId: user?.id,
            email: user?.email,
            ip: details.ip,
            userAgent: details.userAgent,
            ...details
        });
    },

    // Regex operation logging
    regex: (pattern, flags, duration, success, error = null) => {
        const level = error ? 'warn' : 'info';
        
        logger.log(level, 'Regex Operation', {
            pattern: pattern?.substring(0, 100), // Truncate long patterns
            flags,
            duration: duration ? `${duration}ms` : undefined,
            success,
            error: error?.message
        });
    },

    // Performance monitoring
    perf: (operation, duration, metadata = {}) => {
        const level = duration > 1000 ? 'warn' : 'info'; // Warn for operations > 1s
        
        logger.log(level, 'Performance', {
            operation,
            duration: `${duration}ms`,
            ...metadata
        });
    },

    // Security events
    security: (event, details = {}) => {
        logger.warn('Security Event', {
            event,
            timestamp: new Date().toISOString(),
            ...details
        });
    }
};

// Add helper methods to logger
Object.assign(logger, logMethods);

// Log uncaught exceptions and unhandled rejections
if (process.env.NODE_ENV === 'production') {
    logger.exceptions.handle(
        new winston.transports.File({ filename: 'logs/exceptions.log' })
    );

    logger.rejections.handle(
        new winston.transports.File({ filename: 'logs/rejections.log' })
    );
}

// Export configured logger
export { logger };

// Health check for logger
export const loggerHealthCheck = () => {
    try {
        logger.info('Logger health check');
        return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
        return { 
            status: 'unhealthy', 
            error: error.message, 
            timestamp: new Date().toISOString() 
        };
    }
};

// Log system startup
logger.info('Logger initialized', {
    level: logger.level,
    environment: process.env.NODE_ENV || 'development',
    transports: logger.transports.length
});

export default logger;