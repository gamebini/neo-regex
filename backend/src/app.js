// backend/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 보안 미들웨어
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 기본 미들웨어
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use('/api', limiter);
}

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0'
  });
});

// API 라우트
app.use('/api/regex', (req, res, next) => {
  // 임시 정규식 API 엔드포인트
  if (req.method === 'POST' && req.path === '/test') {
    const { pattern, text, flags = '' } = req.body;
    
    try {
      const regex = new RegExp(pattern, flags);
      const matches = [...text.matchAll(regex)];
      
      res.json({
        success: true,
        pattern,
        flags,
        text,
        matches: matches.map(match => ({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        })),
        totalMatches: matches.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  } else {
    next();
  }
});

// 패턴 라이브러리 API
app.get('/api/patterns', (req, res) => {
  // 임시 패턴 데이터
  const patterns = [
    {
      id: 'email',
      title: '이메일 주소',
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      description: '일반적인 이메일 주소 형식을 검증합니다.',
      category: 'validation',
      examples: {
        valid: ['user@example.com', 'test.email@domain.org'],
        invalid: ['invalid-email', 'user@', '@domain.com']
      }
    },
    {
      id: 'phone-kr',
      title: '한국 전화번호',
      pattern: '01[016789]-?\\d{3,4}-?\\d{4}',
      description: '한국의 휴대폰 번호 형식을 검증합니다.',
      category: 'validation',
      examples: {
        valid: ['010-1234-5678', '01012345678', '011-123-4567'],
        invalid: ['010-12-345', '02-1234-5678', '010-1234-567']
      }
    },
    {
      id: 'url',
      title: 'URL',
      pattern: 'https?://[^\\s]+',
      description: 'HTTP/HTTPS URL을 매칭합니다.',
      category: 'web',
      examples: {
        valid: ['https://example.com', 'http://test.org/path'],
        invalid: ['ftp://example.com', 'invalid-url', 'https://']
      }
    }
  ];
  
  res.json({
    success: true,
    patterns,
    total: patterns.length
  });
});

// 404 에러 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// 글로벌 에러 핸들러
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 NEO Regex Backend Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔧 API Base URL: http://localhost:${PORT}/api`);
    console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  }
});

export default app;