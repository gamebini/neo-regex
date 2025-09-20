// tests/backend/auth.test.js
import { describe, it, expect } from 'jest';
import request from 'supertest';
import app from '../../backend/src/app.js';

describe('Auth API', () => {
    describe('POST /api/auth/register', () => {
        it('should register new user with valid data', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'Password123',
                displayName: 'Test User'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.user.email).toBe(userData.email);
            expect(response.body.token).toBeDefined();
        });

        it('should validate email format', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'Password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should validate password strength', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'weak'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Password');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
        });

        it('should reject invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should reject non-existent user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return user info with valid token', async () => {
            // First login to get token
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            const token = loginResponse.body.token;

            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user).toBeDefined();
        });

        it('should reject invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
        });

        it('should require token', async () => {
            const response = await request(app)
                .get('/api/auth/me');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const response = await request(app)
                .post('/api/auth/logout');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});