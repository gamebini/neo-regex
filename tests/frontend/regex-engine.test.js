// tests/frontend/regex-engine.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { RegexEngine, RegexUtils } from '../../frontend/src/core/regex-engine.js';

describe('RegexEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new RegexEngine();
    });

    describe('Pattern Compilation', () => {
        it('should compile valid patterns', () => {
            const result = engine.setPattern('\\d+').compile();
            expect(result).toBe(true);
            expect(engine.lastError).toBeNull();
        });

        it('should reject invalid patterns', () => {
            const result = engine.setPattern('[invalid').compile();
            expect(result).toBe(false);
            expect(engine.lastError).toContain('Invalid regular expression');
        });

        it('should detect dangerous patterns', () => {
            const result = engine.setPattern('(a+)+b').compile();
            expect(result).toBe(false);
            expect(engine.lastError).toContain('위험한 패턴');
        });
    });

    describe('Pattern Testing', () => {
        it('should match simple patterns', () => {
            const result = engine.setPattern('\\d+').test('abc123def456');
            
            expect(result.success).toBe(true);
            expect(result.matches).toBe(1); // Without global flag
            expect(result.results[0].match).toBe('123');
            expect(result.results[0].index).toBe(3);
        });

        it('should match with global flag', () => {
            const result = engine.setPattern('\\d+', 'g').test('abc123def456');
            
            expect(result.success).toBe(true);
            expect(result.matches).toBe(2);
            expect(result.results[0].match).toBe('123');
            expect(result.results[1].match).toBe('456');
        });

        it('should handle empty text', () => {
            const result = engine.setPattern('\\d+').test('');
            
            expect(result.success).toBe(true);
            expect(result.matches).toBe(0);
            expect(result.results).toHaveLength(0);
        });

        it('should handle no matches', () => {
            const result = engine.setPattern('\\d+').test('abcdef');
            
            expect(result.success).toBe(true);
            expect(result.matches).toBe(0);
        });

        it('should capture groups', () => {
            const result = engine.setPattern('(\\d{3})-(\\d{3})-(\\d{4})').test('123-456-7890');
            
            expect(result.success).toBe(true);
            expect(result.matches).toBe(1);
            expect(result.results[0].groups).toEqual(['123', '456', '7890']);
        });
    });

    describe('Pattern Explanation', () => {
        it('should explain basic patterns', () => {
            engine.setPattern('\\d+');
            const explanation = engine.explainPattern();
            
            expect(explanation).toContain('\\d');
            expect(explanation).toContain('숫자');
        });

        it('should explain character classes', () => {
            engine.setPattern('[a-zA-Z]+');
            const explanation = engine.explainPattern();
            
            expect(explanation).toContain('[a-zA-Z]');
            expect(explanation).toContain('문자 클래스');
        });
    });

    describe('Performance Measurement', () => {
        it('should measure execution time', () => {
            const result = engine.setPattern('\\d+').test('123');
            
            expect(result.executionTime).toBeGreaterThan(0);
            expect(result.executionTime).toBeLessThan(100); // Should be fast
        });

        it('should calculate complexity', () => {
            engine.setPattern('\\d+[a-z]*\\w{3,5}');
            const complexity = engine.calculateComplexity();
            
            expect(complexity).toBeGreaterThan(0);
        });
    });

    describe('Code Generation', () => {
        it('should generate JavaScript code', () => {
            engine.setPattern('\\d+', 'g');
            const code = engine.generateCodeExamples('javascript');
            
            expect(code.test).toContain('new RegExp');
            expect(code.test).toContain('\\d+');
            expect(code.test).toContain('g');
        });

        it('should generate Python code', () => {
            engine.setPattern('\\d+');
            const code = engine.generateCodeExamples('python');
            
            expect(code.test).toContain('import re');
            expect(code.test).toContain('\\d+');
        });
    });

    describe('Suggestions', () => {
        it('should suggest optimizations', () => {
            engine.setPattern('[0-9]+');
            const suggestions = engine.getSuggestions();
            
            const optimizationSuggestion = suggestions.find(s => s.type === 'optimization');
            expect(optimizationSuggestion).toBeTruthy();
            expect(optimizationSuggestion.message).toContain('\\d');
        });

        it('should detect security issues', () => {
            engine.setPattern('(a+)+b');
            const suggestions = engine.getSuggestions();
            
            const securitySuggestion = suggestions.find(s => s.type === 'security');
            expect(securitySuggestion).toBeTruthy();
        });
    });
});

describe('RegexUtils', () => {
    describe('highlightMatches', () => {
        it('should highlight single match', () => {
            const text = 'abc123def';
            const results = [{ match: '123', index: 3, lastIndex: 6 }];
            
            const highlighted = RegexUtils.highlightMatches(text, results);
            expect(highlighted).toContain('<span class="match-highlight');
            expect(highlighted).toContain('123');
        });

        it('should handle multiple matches', () => {
            const text = 'abc123def456';
            const results = [
                { match: '123', index: 3, lastIndex: 6 },
                { match: '456', index: 9, lastIndex: 12 }
            ];
            
            const highlighted = RegexUtils.highlightMatches(text, results);
            expect(highlighted).toContain('match-highlight-0');
            expect(highlighted).toContain('match-highlight-1');
        });

        it('should handle empty results', () => {
            const text = 'abc';
            const highlighted = RegexUtils.highlightMatches(text, []);
            expect(highlighted).toBe(text);
        });
    });

    describe('escapeString', () => {
        it('should escape regex special characters', () => {
            const escaped = RegexUtils.escapeString('test.txt');
            expect(escaped).toBe('test\\.txt');
        });

        it('should escape multiple special characters', () => {
            const escaped = RegexUtils.escapeString('a+b*c?d');
            expect(escaped).toBe('a\\+b\\*c\\?d');
        });
    });

    describe('unescapeString', () => {
        it('should unescape escaped characters', () => {
            const unescaped = RegexUtils.unescapeString('test\\.txt');
            expect(unescaped).toBe('test.txt');
        });
    });
});

---

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

---

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

---

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