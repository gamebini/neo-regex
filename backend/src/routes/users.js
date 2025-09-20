// backend/src/routes/users.js
import express from 'express';
import { asyncHandler } from '../middleware/error-handler.js';
import { authMiddleware } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// 사용자 프로필 조회
router.get('/profile', authMiddleware, asyncHandler(async (req, res) => {
    // 실제로는 DB에서 사용자 정보 조회
    const user = {
        id: req.user.id,
        email: req.user.email,
        displayName: 'Test User',
        avatarUrl: null,
        subscriptionType: 'free',
        subscriptionExpires: null,
        createdAt: '2024-01-01T00:00:00Z',
        stats: {
            patternsCreated: 5,
            patternsUsed: 42,
            collectionsCreated: 2
        }
    };

    res.json({
        success: true,
        user
    });
}));

// 사용자 프로필 업데이트
router.put('/profile', authMiddleware, asyncHandler(async (req, res) => {
    const { displayName, avatarUrl } = req.body;

    // 실제로는 DB에서 사용자 정보 업데이트
    const updatedUser = {
        id: req.user.id,
        email: req.user.email,
        displayName: displayName || 'Test User',
        avatarUrl: avatarUrl || null,
        updatedAt: new Date()
    };

    logger.info('User profile updated', {
        userId: req.user.id,
        changes: { displayName, avatarUrl }
    });

    res.json({
        success: true,
        user: updatedUser
    });
}));

// 사용자 통계
router.get('/stats', authMiddleware, asyncHandler(async (req, res) => {
    // 실제로는 DB에서 통계 조회
    const stats = {
        patternsCreated: 5,
        patternsUsed: 42,
        collectionsCreated: 2,
        totalUsageTime: 12540, // seconds
        recentActivity: [
            {
                action: 'pattern_created',
                timestamp: new Date(Date.now() - 3600000), // 1 hour ago
                details: { patternTitle: 'Email Validation' }
            },
            {
                action: 'pattern_tested',
                timestamp: new Date(Date.now() - 7200000), // 2 hours ago
                details: { patternTitle: 'Phone Number' }
            }
        ]
    };

    res.json({
        success: true,
        stats
    });
}));

// 비밀번호 변경
router.put('/password', authMiddleware, asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            error: { message: 'Current password and new password are required' }
        });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            error: { message: 'New password must be at least 8 characters long' }
        });
    }

    // 실제로는 현재 비밀번호 확인 및 새 비밀번호로 변경
    logger.auth('password_changed', req.user, { ip: req.ip });

    res.json({
        success: true,
        message: 'Password updated successfully'
    });
}));

// 계정 삭제
router.delete('/account', authMiddleware, asyncHandler(async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({
            success: false,
            error: { message: 'Password confirmation required' }
        });
    }

    // 실제로는 비밀번호 확인 후 계정 삭제
    logger.auth('account_deleted', req.user, { ip: req.ip });

    res.json({
        success: true,
        message: 'Account deleted successfully'
    });
}));

export default router;