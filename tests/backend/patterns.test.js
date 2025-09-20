// tests/backend/patterns.test.js
import { describe, it, expect, beforeEach } from 'jest';
import request from 'supertest';
import app from '../../backend/src/app.js';

describe('Patterns API', () => {
    let authToken;

    beforeEach(async () => {
        // Mock authentication - in real tests, you'd set up proper auth
        authToken = 'mock-jwt-token';
    });

    describe('GET /api/patterns', () => {
        it('should return pattern list', async () => {
            const response = await request(app)
                .get('/api/patterns');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.patterns)).toBe(true);
            expect(response.body.pagination).toBeDefined();
        });

        it('should filter by category', async () => {
            const response = await request(app)
                .get('/api/patterns?category=validation');

            expect(response.status).toBe(200);
            expect(response.body.patterns.every(p => p.category === 'validation')).toBe(true);
        });

        it('should search patterns', async () => {
            const response = await request(app)
                .get('/api/patterns?search=email');

            expect(response.status).toBe(200);
            const hasEmailPattern = response.body.patterns.some(p =>
                p.title.toLowerCase().includes('email') ||
                p.description.toLowerCase().includes('email')
            );
            expect(hasEmailPattern).toBe(true);
        });

        it('should paginate results', async () => {
            const response = await request(app)
                .get('/api/patterns?limit=2&offset=0');

            expect(response.status).toBe(200);
            expect(response.body.patterns.length).toBeLessThanOrEqual(2);
            expect(response.body.pagination.limit).toBe(2);
            expect(response.body.pagination.offset).toBe(0);
        });
    });

    describe('GET /api/patterns/:id', () => {
        it('should return specific pattern', async () => {
            const response = await request(app)
                .get('/api/patterns/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.pattern.id).toBe(1);
        });

        it('should return 404 for non-existent pattern', async () => {
            const response = await request(app)
                .get('/api/patterns/99999');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/patterns', () => {
        it('should create new pattern with auth', async () => {
            const newPattern = {
                title: 'Test Pattern',
                pattern: '\\d{3}-\\d{3}-\\d{4}',
                description: 'Test phone number pattern',
                category: 'validation',
                tags: ['phone', 'test']
            };

            const response = await request(app)
                .post('/api/patterns')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newPattern);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.pattern.title).toBe(newPattern.title);
        });

        it('should require authentication', async () => {
            const response = await request(app)
                .post('/api/patterns')
                .send({
                    title: 'Test',
                    pattern: '\\d+',
                    category: 'basic'
                });

            expect(response.status).toBe(401);
        });

        it('should validate pattern data', async () => {
            const response = await request(app)
                .post('/api/patterns')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'A', // Too short
                    pattern: '[invalid', // Invalid regex
                    category: 'invalid' // Invalid category
                });

            expect(response.status).toBe(400);
        });
    });

    describe('PUT /api/patterns/:id', () => {
        it('should update pattern with proper auth', async () => {
            const updates = {
                title: 'Updated Pattern',
                description: 'Updated description'
            };

            const response = await request(app)
                .put('/api/patterns/1')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updates);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should require authentication', async () => {
            const response = await request(app)
                .put('/api/patterns/1')
                .send({ title: 'Updated' });

            expect(response.status).toBe(401);
        });
    });

    describe('DELETE /api/patterns/:id', () => {
        it('should delete pattern with proper auth', async () => {
            const response = await request(app)
                .delete('/api/patterns/1')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should require authentication', async () => {
            const response = await request(app)
                .delete('/api/patterns/1');

            expect(response.status).toBe(401);
        });
    });
});