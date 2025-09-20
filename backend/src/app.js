// NEO Regex Backend Application
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Routes import
import authRoutes from './routes/auth.js';
import patternRoutes from './routes/patterns.js';
import userRoutes from './routes/users.js';

// Middleware import
import { errorHandler } from './middleware/error-handler.js';
import { authMiddleware } from './middleware/auth.js';
import { validationMiddleware } from './middleware/validation.js';

// Utils import
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// API specific rate limiting
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: {
        error: 'API rate limit exceeded. Please wait before making more requests.',
        retryAfter: 60
    }
});

// Regex testing specific rate limiting (more strict)
const regexTestLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 regex tests per minute
    message: {
        error: 'Regex testing rate limit exceeded. Please wait before testing more patterns.',
        retryAfter: 60
    }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patterns', apiLimiter, patternRoutes);
app.use('/api/users', authMiddleware, userRoutes);

// Regex testing endpoint with specific rate limiting
app.post('/api/regex/test', regexTestLimiter, async (req, res) => {
    try {
        const { pattern, text, flags = '' } = req.body;

        // Input validation
        if (!pattern || typeof pattern !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Pattern is required and must be a string'
            });
        }

        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Test text is required and must be a string'
            });
        }

        // Length limits
        if (pattern.length > 1000) {
            return res.status(400).json({
                success: false,
                error: 'Pattern too long (maximum 1000 characters)'
            });
        }

        if (text.length > 100000) {
            return res.status(400).json({
                success: false,
                error: 'Test text too long (maximum 100,000 characters)'
            });
        }

        // Basic ReDoS protection
        const dangerousPatterns = [
            /(\w+)+\$/,
            /(\w*)*\$/,
            /(\w+)+[^\w]/,
        ];

        const isDangerous = dangerousPatterns.some(dp => {
            try {
                return dp.test(pattern);
            } catch {
                return false;
            }
        });

        if (isDangerous) {
            return res.status(400).json({
                success: false,
                error: 'Potentially dangerous pattern detected (ReDoS risk)'
            });
        }

        // Execute regex test with timeout
        const startTime = Date.now();
        const timeoutMs = 5000; // 5 second timeout

        const result = await Promise.race([
            testRegexPattern(pattern, text, flags),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Regex execution timeout')), timeoutMs)
            )
        ]);

        const executionTime = Date.now() - startTime;

        res.json({
            success: true,
            ...result,
            executionTime,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Regex test error:', error);
        
        if (error.message === 'Regex execution timeout') {
            return res.status(408).json({
                success: false,
                error: 'Regex execution timed out (pattern too complex or text too large)'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error during regex testing'
        });
    }
});

// Pattern explanation endpoint
app.post('/api/regex/explain', apiLimiter, async (req, res) => {
    try {
        const { pattern } = req.body;

        if (!pattern || typeof pattern !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Pattern is required and must be a string'
            });
        }

        const explanation = explainRegexPattern(pattern);
        
        res.json({
            success: true,
            pattern,
            explanation,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Pattern explanation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to explain pattern'
        });
    }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        path: req.originalUrl
    });
});

// Static file serving (for production)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('public'));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
    });
}

// Global error handler (must be last)
app.use(errorHandler);

// Regex testing utility function
async function testRegexPattern(pattern, text, flags) {
    try {
        const regex = new RegExp(pattern, flags);
        const results = [];
        let matchCount = 0;
        const maxMatches = 1000;

        if (flags.includes('g')) {
            let match;
            while ((match = regex.exec(text)) !== null && matchCount < maxMatches) {
                results.push({
                    match: match[0],
                    index: match.index,
                    groups: match.slice(1),
                    namedGroups: match.groups || {}
                });
                matchCount++;

                if (match.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
            }
        } else {
            const match = text.match(regex);
            if (match) {
                results.push({
                    match: match[0],
                    index: match.index,
                    groups: match.slice(1),
                    namedGroups: match.groups || {}
                });
                matchCount = 1;
            }
        }

        return {
            matches: matchCount,
            results,
            isValid: true
        };

    } catch (error) {
        return {
            matches: 0,
            results: [],
            isValid: false,
            error: error.message
        };
    }
}

// Simple pattern explanation function
function explainRegexPattern(pattern) {
    const explanations = [];
    
    const metaChars = {
        '\\d': 'Matches any digit (0-9)',
        '\\w': 'Matches any word character (a-z, A-Z, 0-9, _)',
        '\\s': 'Matches any whitespace character',
        '\\D': 'Matches any non-digit character',
        '\\W': 'Matches any non-word character',
        '\\S': 'Matches any non-whitespace character',
        '.': 'Matches any character except newline',
        '^': 'Matches start of string',
        '$': 'Matches end of string',
        '*': 'Matches 0 or more repetitions',
        '+': 'Matches 1 or more repetitions',
        '?': 'Matches 0 or 1 repetition',
        '|': 'Alternation (OR operator)'
    };

    Object.entries(metaChars).forEach(([meta, desc]) => {
        if (pattern.includes(meta)) {
            explanations.push(`${meta}: ${desc}`);
        }
    });

    // Character classes
    const charClasses = pattern.match(/\[.*?\]/g) || [];
    charClasses.forEach(charClass => {
        explanations.push(`${charClass}: Character class - matches any one character inside brackets`);
    });

    // Quantifiers
    const quantifiers = pattern.match(/\{\d+(,\d*)?\}/g) || [];
    quantifiers.forEach(quantifier => {
        explanations.push(`${quantifier}: Specific repetition count`);
    });

    return explanations.length > 0 ? explanations : ['Basic literal string pattern'];
}

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

export default app;

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    app.listen(PORT, () => {
        logger.info(`🚀 NEO Regex server running on port ${PORT}`);
        logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
}