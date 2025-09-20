-- scripts/init-db.sql
-- NEO Regex 데이터베이스 초기화 스크립트

-- 기본 데이터베이스 생성 (필요한 경우)
-- CREATE DATABASE neoregex_dev;

-- Extensions 설치
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    subscription_type VARCHAR(20) DEFAULT 'free' CHECK (subscription_type IN ('free', 'pro', 'team', 'enterprise')),
    subscription_expires TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Custom patterns table
CREATE TABLE IF NOT EXISTS user_patterns (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    regex_pattern TEXT NOT NULL,
    flags VARCHAR(10) DEFAULT '',
    description TEXT,
    category VARCHAR(50),
    tags TEXT[],
    test_text TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    complexity_score INTEGER DEFAULT 0,
    performance_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Pattern collections (bookmarks/folders)
CREATE TABLE IF NOT EXISTS pattern_collections (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Collection items (many-to-many relationship)
CREATE TABLE IF NOT EXISTS collection_items (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES pattern_collections(id) ON DELETE CASCADE,
    pattern_id INTEGER REFERENCES user_patterns(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(collection_id, pattern_id)
);

-- Pattern ratings
CREATE TABLE IF NOT EXISTS pattern_ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pattern_id INTEGER REFERENCES user_patterns(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, pattern_id)
);

-- Usage analytics
CREATE TABLE IF NOT EXISTS usage_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    action_type VARCHAR(50) NOT NULL, -- 'test', 'generate', 'save', 'view', etc.
    pattern_category VARCHAR(50),
    pattern_complexity VARCHAR(20), -- 'simple', 'medium', 'complex'
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subscription management
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    status VARCHAR(50) NOT NULL, -- 'active', 'cancelled', 'past_due', 'incomplete'
    plan_type VARCHAR(50) NOT NULL,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- API Keys (for API access)
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    last_four CHAR(4) NOT NULL,
    permissions TEXT[] DEFAULT ARRAY['read'],
    rate_limit INTEGER DEFAULT 1000, -- requests per hour
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Feature flags
CREATE TABLE IF NOT EXISTS feature_flags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT FALSE,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_users INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_type, subscription_expires);

CREATE INDEX IF NOT EXISTS idx_patterns_user_id ON user_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_patterns_category ON user_patterns(category);
CREATE INDEX IF NOT EXISTS idx_patterns_public ON user_patterns(is_public);
CREATE INDEX IF NOT EXISTS idx_patterns_featured ON user_patterns(is_featured);
CREATE INDEX IF NOT EXISTS idx_patterns_tags ON user_patterns USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_patterns_search ON user_patterns USING GIN(to_tsvector('english', title || ' ' || description));

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON pattern_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_pattern ON collection_items(pattern_id);

CREATE INDEX IF NOT EXISTS idx_ratings_pattern ON pattern_ratings(pattern_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user ON pattern_ratings(user_id);

CREATE INDEX IF NOT EXISTS idx_usage_stats_user ON usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_action ON usage_stats(action_type);
CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON usage_stats(created_at);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(created_at);

-- 트리거 함수들
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patterns_updated_at BEFORE UPDATE ON user_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON pattern_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON pattern_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기본 데이터 삽입
INSERT INTO feature_flags (name, description, is_enabled) VALUES
    ('ai_assistant', 'AI 정규식 어시스턴트 기능', TRUE),
    ('visual_builder', '시각적 정규식 빌더 기능', TRUE),
    ('team_collaboration', '팀 협업 기능', FALSE),
    ('api_access', 'API 접근 기능', TRUE),
    ('advanced_analytics', '고급 분석 기능', FALSE)
ON CONFLICT (name) DO NOTHING;

-- 샘플 공개 패턴 데이터 (선택적)
INSERT INTO users (email, password_hash, display_name, subscription_type, email_verified) VALUES
    ('system@neoregex.com', '$2b$12$placeholder', 'System', 'enterprise', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 시스템 사용자 ID 가져오기 및 샘플 패턴 추가
DO $$
DECLARE
    system_user_id INTEGER;
BEGIN
    SELECT id INTO system_user_id FROM users WHERE email = 'system@neoregex.com';
    
    IF system_user_id IS NOT NULL THEN
        INSERT INTO user_patterns (user_id, title, regex_pattern, flags, description, category, tags, test_text, is_public, is_featured) VALUES
            (system_user_id, '이메일 주소 (기본)', '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '', '기본적인 이메일 주소 형식을 검증합니다.', 'validation', ARRAY['이메일', 'email', '검증'], 'user@example.com, test@domain.org', TRUE, TRUE),
            (system_user_id, '한국 전화번호', '0\d{1,2}-\d{3,4}-\d{4}', 'g', '한국 전화번호 형식을 찾습니다.', 'validation', ARRAY['전화번호', 'phone', '한국'], '010-1234-5678, 02-987-6543', TRUE, TRUE),
            (system_user_id, 'URL (HTTP/HTTPS)', 'https?://[\w.-]+\.[a-zA-Z]{2,}(?:/[\w./?#\[\]@!$&''()*+,;=-]*)?', 'g', 'HTTP 또는 HTTPS URL을 찾습니다.', 'validation', ARRAY['URL', 'link', 'web'], 'https://example.com, http://test.org', TRUE, TRUE),
            (system_user_id, '숫자', '\d+', 'g', '하나 이상의 숫자를 찾습니다.', 'basic', ARRAY['숫자', 'number', '기본'], '123, 456, 789', TRUE, TRUE),
            (system_user_id, '한글만', '[가-힣]+', 'g', '한글 문자만을 찾습니다.', 'korean', ARRAY['한글', 'korean'], '안녕하세요 hello 123', TRUE, TRUE)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 뷰 생성
CREATE OR REPLACE VIEW pattern_stats AS
SELECT 
    category,
    COUNT(*) as total_patterns,
    COUNT(*) FILTER (WHERE is_public = TRUE) as public_patterns,
    AVG(rating) as avg_rating,
    SUM(usage_count) as total_usage
FROM user_patterns 
GROUP BY category;

CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.display_name,
    u.subscription_type,
    COUNT(up.id) as pattern_count,
    COUNT(pc.id) as collection_count,
    MAX(us.created_at) as last_activity
FROM users u
LEFT JOIN user_patterns up ON u.id = up.user_id
LEFT JOIN pattern_collections pc ON u.id = pc.user_id
LEFT JOIN usage_stats us ON u.id = us.user_id
GROUP BY u.id, u.email, u.display_name, u.subscription_type;

-- 권한 설정 (선택적)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO neoregex_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO neoregex_app;

-- 백업 스키마 (선택적)
-- CREATE SCHEMA IF NOT EXISTS backup;

COMMIT;