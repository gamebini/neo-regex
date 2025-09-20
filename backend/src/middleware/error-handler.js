// backend/src/middleware/error-handler.js
import { logger } from '../utils/logger.js';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Error response formatter
 */
const formatErrorResponse = (error, req) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const baseResponse = {
        success: false,
        error: {
            message: error.message || 'Internal Server Error',
            statusCode: error.statusCode || 500,
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method
        }
    };

    // Add additional details in development
    if (isDevelopment) {
        baseResponse.error.stack = error.stack;
        baseResponse.error.details = error.details;
    }

    // Add request ID if available
    if (req.id) {
        baseResponse.error.requestId = req.id;
    }

    return baseResponse;
};

/**
 * Log error with appropriate level
 */
const logError = (error, req) => {
    const logContext = {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        requestId: req.id,
        statusCode: error.statusCode
    };

    if (error.statusCode >= 500) {
        logger.error('Server Error', {
            message: error.message,
            stack: error.stack,
            ...logContext
        });
    } else if (error.statusCode >= 400) {
        logger.warn('Client Error', {
            message: error.message,
            ...logContext
        });
    } else {
        logger.info('Request Error', {
            message: error.message,
            ...logContext
        });
    }
};

/**
 * Main error handling middleware
 */
export const errorHandler = (error, req, res, next) => {
    // Ensure error has statusCode
    if (!error.statusCode) {
        error.statusCode = 500;
    }

    // Log the error
    logError(error, req);

    // Handle specific error types
    let processedError = error;

    // MongoDB/Database errors
    if (error.name === 'ValidationError') {
        const message = Object.values(error.errors).map(err => err.message).join(', ');
        processedError = new ApiError(400, `Validation Error: ${message}`);
    } else if (error.name === 'CastError') {
        processedError = new ApiError(400, 'Invalid ID format');
    } else if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        processedError = new ApiError(400, `Duplicate value for ${field}`);
    }

    // JWT errors
    else if (error.name === 'JsonWebTokenError') {
        processedError = new ApiError(401, 'Invalid token');
    } else if (error.name === 'TokenExpiredError') {
        processedError = new ApiError(401, 'Token expired');
    }

    // Multer errors (file upload)
    else if (error.code === 'LIMIT_FILE_SIZE') {
        processedError = new ApiError(400, 'File too large');
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        processedError = new ApiError(400, 'Unexpected file field');
    }

    // Rate limit errors
    else if (error.type === 'entity.too.large') {
        processedError = new ApiError(413, 'Request entity too large');
    }

    // Regex specific errors
    else if (error.message.includes('Regular expression')) {
        processedError = new ApiError(400, 'Invalid regular expression pattern');
    }

    // Format and send error response
    const errorResponse = formatErrorResponse(processedError, req);
    
    // Set security headers
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    });

    res.status(processedError.statusCode).json(errorResponse);
};

/**
 * 404 handler middleware
 */
export const notFoundHandler = (req, res, next) => {
    const error = new ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Validation error handler
 */
export const validationErrorHandler = (errors) => {
    const formattedErrors = errors.map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
    }));

    throw new ApiError(400, 'Validation failed', true, JSON.stringify(formattedErrors));
};

/**
 * Rate limit error handler
 */
export const rateLimitErrorHandler = (req, res) => {
    const error = new ApiError(429, 'Too many requests, please try again later');
    const errorResponse = formatErrorResponse(error, req);
    
    logError(error, req);
    
    res.status(429).json(errorResponse);
};

/**
 * Regex operation error handler
 */
export const regexErrorHandler = (pattern, error, req) => {
    let message = 'Invalid regular expression';
    
    if (error.message.includes('Invalid regular expression')) {
        message = 'Syntax error in regular expression pattern';
    } else if (error.message.includes('timeout')) {
        message = 'Regular expression execution timed out (pattern too complex)';
    } else if (error.message.includes('ReDoS')) {
        message = 'Pattern may cause performance issues (ReDoS risk)';
    }

    logger.regex(pattern, req.body?.flags, null, false, error);
    
    throw new ApiError(400, message);
};

/**
 * Security error handler
 */
export const securityErrorHandler = (type, details, req) => {
    logger.security(type, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        ...details
    });

    let message = 'Security violation detected';
    let statusCode = 403;

    switch (type) {
        case 'sql_injection':
            message = 'Potential SQL injection attempt detected';
            break;
        case 'xss_attempt':
            message = 'Potential XSS attempt detected';
            break;
        case 'path_traversal':
            message = 'Path traversal attempt detected';
            break;
        case 'suspicious_pattern':
            message = 'Suspicious regex pattern detected';
            break;
        default:
            message = 'Security policy violation';
    }

    throw new ApiError(statusCode, message);
};

/**
 * Development error handler (more verbose)
 */
export const developmentErrorHandler = (error, req, res, next) => {
    console.error('🚨 Error Details:');
    console.error('Message:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Stack:', error.stack);
    console.error('Request:', {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query
    });

    errorHandler(error, req, res, next);
};

/**
 * Production error handler (minimal info)
 */
export const productionErrorHandler = (error, req, res, next) => {
    // Don't log client errors in production (4xx)
    if (error.statusCode >= 500) {
        logger.error('Production Error', {
            message: error.message,
            stack: error.stack,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip
        });
    }

    // Only send operational errors to client
    if (error.isOperational) {
        errorHandler(error, req, res, next);
    } else {
        // Send generic message for programming errors
        const genericError = new ApiError(500, 'Something went wrong!');
        errorHandler(genericError, req, res, next);
    }
};

/**
 * Error middleware factory
 */
export const createErrorHandler = (isDevelopment = false) => {
    return isDevelopment ? developmentErrorHandler : productionErrorHandler;
};

// Export default error handler based on environment
export default process.env.NODE_ENV === 'development' 
    ? developmentErrorHandler 
    : productionErrorHandler;