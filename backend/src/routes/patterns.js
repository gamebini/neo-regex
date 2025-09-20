// backend/src/routes/patterns.js
import express from 'express';
import { asyncHandler } from '../middleware/error-handler.js';
import { validatePattern } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// 기본 패턴 데이터 (실제로는 DB에서 가져옴)
const defaultPatterns = [
    {
        id: 1,
        title: '이메일 주소',
        pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
        flags: '',
        description: '기본적인 이메일 주소 형식을 검증합니다.',
        category: 'validation',
        tags: ['이메일', 'email', '검증'],
        isPublic: true,
        usageCount: 1234
    },
    {
        id: 2,
        title: '한국 전화번호',
        pattern: '0\\d{1,2}-\\d{3,4}-\\d{4}',
        flags: 'g',
        description: '한국 전화번호 형식을 찾습니다.',
        category: 'validation',
        tags: ['전화번호', 'phone', '한국'],
        isPublic: true,
        usageCount: 856
    }
];

// 모든 패턴 조회
router.get('/', asyncHandler(async (req, res) => {
    const { category, search, limit = 50, offset = 0 } = req.query;

    let patterns = [...defaultPatterns];

    // 카테고리 필터
    if (category && category !== 'all') {
        patterns = patterns.filter(p => p.category === category);
    }

    // 검색 필터
    if (search) {
        const searchLower = search.toLowerCase();
        patterns = patterns.filter(p =>
            p.title.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower) ||
            p.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }

    // 페이지네이션
    const total = patterns.length;
    patterns = patterns.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
        success: true,
        patterns,
        pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: parseInt(offset) + parseInt(limit) < total
        }
    });
}));

// 패턴 상세 조회
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pattern = defaultPatterns.find(p => p.id === parseInt(id));

    if (!pattern) {
        return res.status(404).json({
            success: false,
            error: { message: 'Pattern not found' }
        });
    }

    // 사용 횟수 증가 (실제로는 DB 업데이트)
    pattern.usageCount++;

    res.json({
        success: true,
        pattern
    });
}));

// 패턴 생성 (인증 필요)
router.post('/', authMiddleware, validatePattern, asyncHandler(async (req, res) => {
    const { title, pattern, flags, description, category, tags, testText, isPublic } = req.body;

    // 새 패턴 생성 (실제로는 DB에 저장)
    const newPattern = {
        id: Date.now(),
        title,
        pattern,
        flags: flags || '',
        description,
        category,
        tags: tags || [],
        testText,
        isPublic: isPublic || false,
        userId: req.user.id,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    logger.info('Pattern created', {
        patternId: newPattern.id,
        userId: req.user.id,
        title: newPattern.title
    });

    res.status(201).json({
        success: true,
        pattern: newPattern
    });
}));

// 패턴 수정 (인증 필요, 소유자만)
router.put('/:id', authMiddleware, validatePattern, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // 패턴 조회 및 권한 확인 (실제로는 DB에서)
    const pattern = defaultPatterns.find(p => p.id === parseInt(id));

    if (!pattern) {
        return res.status(404).json({
            success: false,
            error: { message: 'Pattern not found' }
        });
    }

    // 소유자 확인 (임시)
    if (pattern.userId && pattern.userId !== req.user.id) {
        return res.status(403).json({
            success: false,
            error: { message: 'Access denied' }
        });
    }

    // 패턴 업데이트
    Object.assign(pattern, updates, { updatedAt: new Date() });

    logger.info('Pattern updated', {
        patternId: pattern.id,
        userId: req.user.id
    });

    res.json({
        success: true,
        pattern
    });
}));

// 패턴 삭제 (인증 필요, 소유자만)
router.delete('/:id', authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 패턴 조회 및 권한 확인
    const patternIndex = defaultPatterns.findIndex(p => p.id === parseInt(id));

    if (patternIndex === -1) {
        return res.status(404).json({
            success: false,
            error: { message: 'Pattern not found' }
        });
    }

    const pattern = defaultPatterns[patternIndex];

    // 소유자 확인
    if (pattern.userId && pattern.userId !== req.user.id) {
        return res.status(403).json({
            success: false,
            error: { message: 'Access denied' }
        });
    }

    // 패턴 삭제
    defaultPatterns.splice(patternIndex, 1);

    logger.info('Pattern deleted', {
        patternId: pattern.id,
        userId: req.user.id
    });

    res.json({
        success: true,
        message: 'Pattern deleted successfully'
    });
}));

// 내 패턴 조회 (인증 필요)
router.get('/mine', authMiddleware, asyncHandler(async (req, res) => {
    // 실제로는 DB에서 사용자의 패턴만 조회
    const userPatterns = defaultPatterns.filter(p => p.userId === req.user.id);

    res.json({
        success: true,
        patterns: userPatterns
    });
}));

// 패턴 평가 (인증 필요)
router.post('/:id/rate', authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            error: { message: 'Rating must be between 1 and 5' }
        });
    }

    // 실제로는 DB에 평가 저장
    logger.info('Pattern rated', {
        patternId: id,
        userId: req.user.id,
        rating
    });

    res.json({
        success: true,
        message: 'Rating submitted successfully'
    });
}));

export default router;