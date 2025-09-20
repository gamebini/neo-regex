// tests/backend/regex.test.js
import { describe, it, expect, beforeEach, afterEach } from 'jest';
import request from 'supertest';
import app from '../../backend/src/app.js';

describe('Regex API', () => {
    describe('POST /api/regex/test', () => {
        it('should test valid regex pattern', async () => {
            const response = await request(app)
                .post('/api/regex/test')
                .send({
                    pattern: '\\d+',
                    text: 'abc123def456',
                    flags: 'g'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.matches).toBe(2);
            expect(response.body.results).toHaveLength(2);
            expect(response.body.results[0].match).toBe('123');
            expect(response.body.results[1].match).toBe('456');
        });

        it('should handle invalid regex pattern', async () => {
            const response = await request(app)
                .post('/api/regex/test')
                .send({
                    pattern: '[invalid',
                    text: 'test'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Invalid regular expression');
        });

        it('should reject dangerous patterns', async () => {
            const response = await request(app)
                .post('/api/regex/test')
                .send({
                    pattern: '(a+)+b',
                    text: 'aaaaaaaaaa'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('ReDoS');
        });

        it('should validate input parameters', async () => {
            const response = await request(app)
                .post('/api/regex/test')
                .send({
                    pattern: '',
                    text: 'test'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should handle large text input', async () => {
            const largeText = 'a'.repeat(50000);
            
            const response = await request(app)
                .post('/api/regex/test')
                .send({
                    pattern: 'a+',
                    text: largeText
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should respect text size limits', async () => {
            const tooLargeText = 'a'.repeat(200000);
            
            const response = await request(app)
                .post('/api/regex/test')
                .send({
                    pattern: 'a',
                    text: tooLargeText
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/regex/explain', () => {
        it('should explain simple patterns', async () => {
            const response = await request(app)
                .post('/api/regex/explain')
                .send({
                    pattern: '\\d+'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.explanation).toContain('\\d');
        });

        it('should handle complex patterns', async () => {
            const response = await request(app)
                .post('/api/regex/explain')
                .send({
                    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.explanation)).toBe(true);
        });
    });

    describe('Rate Limiting', () => {
        it('should enforce rate limits', async () => {
            // Make multiple requests quickly
            const promises = Array(35).fill().map(() =>
                request(app)
                    .post('/api/regex/test')
                    .send({
                        pattern: '\\d',
                        text: '1'
                    })
            );

            const responses = await Promise.all(promises);
            const rateLimited = responses.some(res => res.status === 429);
            expect(rateLimited).toBe(true);
        });
    });
});