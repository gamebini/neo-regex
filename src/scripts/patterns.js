// NEO Regex Patterns - 정규식 패턴 데이터베이스

const RegexPatterns = {
    // 기본 패턴 (10개)
    basic: [
        {
            id: 'email',
            title: '이메일 주소',
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            description: '유효한 이메일 주소 형식을 검증합니다.',
            examples: {
                valid: ['user@example.com', 'test.email@domain.co.kr', 'name+tag@site.org'],
                invalid: ['invalid-email', '@domain.com', 'user@', 'user@domain']
            },
            icon: 'fa-envelope',
            difficulty: 'easy',
            tags: ['validation', 'email', 'basic']
        },
        {
            id: 'phone',
            title: '전화번호',
            pattern: '^\\d{2,3}-\\d{3,4}-\\d{4}$',
            description: '한국 전화번호 형식을 검증합니다.',
            examples: {
                valid: ['02-123-4567', '010-1234-5678', '031-123-4567'],
                invalid: ['1234-5678', '010-12345-678', '02-12-4567']
            },
            icon: 'fa-phone',
            difficulty: 'easy',
            tags: ['korean', 'phone', 'validation']
        },
        {
            id: 'url',
            title: 'URL',
            pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
            description: 'HTTP/HTTPS URL을 매칭합니다.',
            examples: {
                valid: ['https://example.com', 'http://www.site.org', 'https://sub.domain.co.kr/path?query=1'],
                invalid: ['ftp://example.com', 'not-a-url', 'www.example.com']
            },
            icon: 'fa-link',
            difficulty: 'medium',
            tags: ['url', 'web', 'basic']
        },
        {
            id: 'ip-address',
            title: 'IP 주소',
            pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
            description: 'IPv4 주소를 검증합니다.',
            examples: {
                valid: ['192.168.1.1', '127.0.0.1', '255.255.255.0'],
                invalid: ['256.1.1.1', '192.168.1', '192.168.1.1.1']
            },
            icon: 'fa-network-wired',
            difficulty: 'medium',
            tags: ['network', 'ip', 'validation']
        },
        {
            id: 'username',
            title: '사용자명',
            pattern: '^[a-zA-Z0-9_-]{3,16}$',
            description: '3-16자의 영문, 숫자, 언더스코어, 하이픈으로 구성된 사용자명입니다.',
            examples: {
                valid: ['user123', 'test_user', 'my-name'],
                invalid: ['us', 'verylongusername123456', 'user@name', 'user space']
            },
            icon: 'fa-user',
            difficulty: 'easy',
            tags: ['username', 'validation', 'basic']
        },
        {
            id: 'domain',
            title: '도메인 이름',
            pattern: '^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,}$',
            description: '유효한 도메인 이름을 검증합니다.',
            examples: {
                valid: ['example.com', 'sub-domain.org', 'my-site.co.kr'],
                invalid: ['-invalid.com', 'domain.', '.com', 'domain..com']
            },
            icon: 'fa-globe',
            difficulty: 'medium',
            tags: ['domain', 'web', 'validation']
        },
        {
            id: 'mac-address',
            title: 'MAC 주소',
            pattern: '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',
            description: 'MAC 주소 형식을 검증합니다.',
            examples: {
                valid: ['00:11:22:33:44:55', 'AA-BB-CC-DD-EE-FF', 'a1:b2:c3:d4:e5:f6'],
                invalid: ['00:11:22:33:44', '00-11-22-33-44-GG', '0011.2233.4455']
            },
            icon: 'fa-ethernet',
            difficulty: 'medium',
            tags: ['network', 'mac', 'hardware']
        },
        {
            id: 'time-24h',
            title: '24시간 시간',
            pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
            description: '24시간 형식의 시간을 검증합니다.',
            examples: {
                valid: ['09:30', '23:59', '00:00', '12:45'],
                invalid: ['25:00', '12:60', '9:5', '24:00']
            },
            icon: 'fa-clock',
            difficulty: 'easy',
            tags: ['time', 'validation', 'format']
        },
        {
            id: 'postal-code',
            title: '우편번호',
            pattern: '^\\d{5}$',
            description: '5자리 우편번호를 검증합니다.',
            examples: {
                valid: ['12345', '00001', '99999'],
                invalid: ['1234', '123456', 'ABCDE', '12-345']
            },
            icon: 'fa-mail-bulk',
            difficulty: 'easy',
            tags: ['postal', 'korean', 'validation']
        },
        {
            id: 'uuid',
            title: 'UUID',
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
            description: 'UUID v4 형식을 검증합니다.',
            examples: {
                valid: ['550e8400-e29b-41d4-a716-446655440000', '6ba7b810-9dad-11d1-80b4-00c04fd430c8'],
                invalid: ['550e8400-e29b-41d4-a716', 'not-a-uuid', '550e8400-e29b-41d4-a716-44665544000g']
            },
            icon: 'fa-fingerprint',
            difficulty: 'hard',
            tags: ['uuid', 'identifier', 'validation']
        }
    ],

    // 검증 패턴 (10개)
    validation: [
        {
            id: 'password-strong',
            title: '강한 비밀번호',
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
            description: '8자 이상, 대문자, 소문자, 숫자, 특수문자 포함',
            examples: {
                valid: ['Password123!', 'MySecure@Pass1', 'Strong#P4ssw0rd'],
                invalid: ['password', '12345678', 'Password123', 'password!']
            },
            icon: 'fa-shield-alt',
            difficulty: 'hard',
            tags: ['password', 'security', 'validation']
        },
        {
            id: 'credit-card',
            title: '신용카드 번호',
            pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$',
            description: '주요 신용카드 번호 형식을 검증합니다.',
            examples: {
                valid: ['4111111111111111', '5555555555554444', '378282246310005'],
                invalid: ['1234567890123456', '4111-1111-1111-1111', '411111111111111']
            },
            icon: 'fa-credit-card',
            difficulty: 'hard',
            tags: ['credit-card', 'payment', 'validation']
        },
        {
            id: 'date-iso',
            title: 'ISO 날짜',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            description: 'YYYY-MM-DD 형식의 날짜를 검증합니다.',
            examples: {
                valid: ['2024-01-15', '2024-12-31', '2000-02-29'],
                invalid: ['24-01-15', '2024/01/15', '2024-13-01', '2024-01-32']
            },
            icon: 'fa-calendar',
            difficulty: 'easy',
            tags: ['date', 'iso', 'validation']
        },
        {
            id: 'hex-color',
            title: 'HEX 색상 코드',
            pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
            description: 'HEX 색상 코드를 검증합니다.',
            examples: {
                valid: ['#FF0000', '#ff0000', '#F00', '#123ABC'],
                invalid: ['FF0000', '#GG0000', '#FF', '#FFFF']
            },
            icon: 'fa-palette',
            difficulty: 'easy',
            tags: ['color', 'hex', 'css']
        },
        {
            id: 'integer',
            title: '정수',
            pattern: '^-?\\d+$',
            description: '양수, 음수, 0을 포함한 정수를 매칭합니다.',
            examples: {
                valid: ['123', '-456', '0', '+789'],
                invalid: ['12.3', 'abc', '12a', '1.0']
            },
            icon: 'fa-hashtag',
            difficulty: 'easy',
            tags: ['number', 'integer', 'validation']
        },
        {
            id: 'decimal',
            title: '소수',
            pattern: '^-?\\d+\\.\\d+$',
            description: '소수점 숫자를 검증합니다.',
            examples: {
                valid: ['123.45', '-67.89', '0.1', '+3.14'],
                invalid: ['123', '12.', '.45', 'abc']
            },
            icon: 'fa-calculator',
            difficulty: 'easy',
            tags: ['number', 'decimal', 'validation']
        },
        {
            id: 'alphanumeric',
            title: '영숫자',
            pattern: '^[a-zA-Z0-9]+$',
            description: '영문자와 숫자만 포함하는 문자열입니다.',
            examples: {
                valid: ['abc123', 'Test456', 'ABC'],
                invalid: ['abc-123', 'test_456', 'hello world', '!@#']
            },
            icon: 'fa-font',
            difficulty: 'easy',
            tags: ['alphanumeric', 'validation', 'basic']
        },
        {
            id: 'version-number',
            title: '버전 번호',
            pattern: '^\\d+\\.\\d+\\.\\d+$',
            description: 'Semantic versioning 형식을 검증합니다.',
            examples: {
                valid: ['1.0.0', '2.15.3', '0.1.2'],
                invalid: ['1.0', '1.0.0.1', 'v1.0.0', '1.0.a']
            },
            icon: 'fa-code-branch',
            difficulty: 'easy',
            tags: ['version', 'semver', 'validation']
        },
        {
            id: 'latitude',
            title: '위도',
            pattern: '^[-+]?([1-8]?\\d(\\.\\d+)?|90(\\.0+)?)$',
            description: '유효한 위도 값을 검증합니다 (-90 ~ +90).',
            examples: {
                valid: ['37.5665', '-90.0', '0', '+45.123'],
                invalid: ['91.0', '-91.0', 'abc', '90.1']
            },
            icon: 'fa-map-marker-alt',
            difficulty: 'medium',
            tags: ['latitude', 'coordinate', 'validation']
        },
        {
            id: 'slug',
            title: 'URL 슬러그',
            pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
            description: 'URL 친화적인 슬러그 형식을 검증합니다.',
            examples: {
                valid: ['hello-world', 'my-blog-post', 'article-123'],
                invalid: ['Hello-World', 'my_blog_post', '-invalid', 'invalid-']
            },
            icon: 'fa-link',
            difficulty: 'easy',
            tags: ['slug', 'url', 'validation']
        }
    ],

    // 한국어 패턴 (5개)
    korean: [
        {
            id: 'korean-name',
            title: '한국어 이름',
            pattern: '^[가-힣]{2,4}$',
            description: '2-4글자 한글 이름을 검증합니다.',
            examples: {
                valid: ['김철수', '박영희', '이서준', '최도윤'],
                invalid: ['김', '김철수영', 'KIM', '김철수123']
            },
            icon: 'fa-user',
            difficulty: 'easy',
            tags: ['korean', 'name', 'validation']
        },
        {
            id: 'korean-phone',
            title: '휴대폰 번호',
            pattern: '^01[0-9]-\\d{3,4}-\\d{4}$',
            description: '한국 휴대폰 번호 형식을 검증합니다.',
            examples: {
                valid: ['010-1234-5678', '011-123-4567', '016-1234-5678'],
                invalid: ['010-12-5678', '02-123-4567', '010-1234-56789']
            },
            icon: 'fa-mobile-alt',
            difficulty: 'easy',
            tags: ['korean', 'mobile', 'phone']
        },
        {
            id: 'business-number',
            title: '사업자번호',
            pattern: '^\\d{3}-\\d{2}-\\d{5}$',
            description: '한국 사업자번호 형식을 검증합니다.',
            examples: {
                valid: ['123-45-67890', '000-00-00000'],
                invalid: ['1234567890', '123-456-78901', '123-45-6789']
            },
            icon: 'fa-building',
            difficulty: 'easy',
            tags: ['korean', 'business', 'validation']
        },
        {
            id: 'korean-postal',
            title: '한국 우편번호',
            pattern: '^\\d{5}$',
            description: '5자리 한국 우편번호를 검증합니다.',
            examples: {
                valid: ['03187', '12345', '99999'],
                invalid: ['1234', '123456', '03-187']
            },
            icon: 'fa-map',
            difficulty: 'easy',
            tags: ['korean', 'postal', 'address']
        },
        {
            id: 'korean-text',
            title: '한글 텍스트',
            pattern: '^[가-힣\\s]+$',
            description: '한글과 공백만 포함하는 텍스트입니다.',
            examples: {
                valid: ['안녕하세요', '한글 텍스트', '좋은 하루'],
                invalid: ['Hello', '안녕123', '한글!@#']
            },
            icon: 'fa-language',
            difficulty: 'easy',
            tags: ['korean', 'text', 'hangul']
        }
    ],

    // 개발자 패턴 (5개)
    developer: [
        {
            id: 'html-tag',
            title: 'HTML 태그',
            pattern: '<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)',
            description: 'HTML 태그를 매칭합니다.',
            examples: {
                valid: ['<div>content</div>', '<img src="image.jpg" />', '<p class="text">Hello</p>'],
                invalid: ['<div>content', '<>content</>', '<div></span>']
            },
            icon: 'fa-code',
            difficulty: 'hard',
            tags: ['html', 'markup', 'developer']
        },
        {
            id: 'css-class',
            title: 'CSS 클래스',
            pattern: '\\.[a-zA-Z][a-zA-Z0-9_-]*',
            description: 'CSS 클래스 선택자를 매칭합니다.',
            examples: {
                valid: ['.class-name', '.myClass', '.button_primary'],
                invalid: ['.123class', '.-invalid', '. space']
            },
            icon: 'fa-css3-alt',
            difficulty: 'medium',
            tags: ['css', 'class', 'developer']
        },
        {
            id: 'javascript-variable',
            title: 'JavaScript 변수',
            pattern: '^[a-zA-Z_$][a-zA-Z0-9_$]*$',
            description: '유효한 JavaScript 변수명을 검증합니다.',
            examples: {
                valid: ['myVariable', '_private', '$jquery', 'camelCase'],
                invalid: ['123var', 'my-variable', 'my variable', 'class']
            },
            icon: 'fa-js-square',
            difficulty: 'easy',
            tags: ['javascript', 'variable', 'developer']
        },
        {
            id: 'git-commit',
            title: 'Git 커밋 해시',
            pattern: '^[a-f0-9]{7,40}$',
            description: 'Git 커밋 해시를 매칭합니다.',
            examples: {
                valid: ['a1b2c3d', 'f4e5d6c7b8a9f1e2d3c4b5a6', '1234567890abcdef'],
                invalid: ['123456', 'g1h2i3j', '12345G7']
            },
            icon: 'fa-git-alt',
            difficulty: 'easy',
            tags: ['git', 'commit', 'hash']
        },
        {
            id: 'json-string',
            title: 'JSON 문자열',
            pattern: '"([^"\\\\]|\\\\.)*"',
            description: 'JSON 문자열 형식을 매칭합니다.',
            examples: {
                valid: ['"hello"', '"escaped \\"quote\\""', '"unicode \\u0041"'],
                invalid: ['"unclosed', 'no quotes', '"invalid\\escape"']
            },
            icon: 'fa-file-code',
            difficulty: 'medium',
            tags: ['json', 'string', 'developer']
        }
    ],

    // 카테고리 정보
    categories: {
        basic: {
            name: '기본 패턴',
            description: '자주 사용되는 기본적인 패턴들',
            icon: 'fa-star',
            color: '#3b82f6'
        },
        validation: {
            name: '검증 패턴',
            description: '데이터 검증을 위한 패턴들',
            icon: 'fa-check-circle',
            color: '#10b981'
        },
        korean: {
            name: '한국어 패턴',
            description: '한국어 및 한국 형식 패턴들',
            icon: 'fa-flag',
            color: '#f59e0b'
        },
        developer: {
            name: '개발자 패턴',
            description: '개발에 유용한 패턴들',
            icon: 'fa-code',
            color: '#8b5cf6'
        }
    },

    // 패턴 검색
    search(query) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        Object.entries(this).forEach(([categoryId, patterns]) => {
            if (categoryId === 'categories' || categoryId === 'search' || categoryId === 'getAll' || categoryId === 'getByCategory' || categoryId === 'getById') {
                return;
            }
            
            patterns.forEach(pattern => {
                const matchScore = this.calculateMatchScore(pattern, searchTerm);
                if (matchScore > 0) {
                    results.push({
                        ...pattern,
                        category: categoryId,
                        matchScore
                    });
                }
            });
        });
        
        return results.sort((a, b) => b.matchScore - a.matchScore);
    },

    // 매칭 점수 계산
    calculateMatchScore(pattern, searchTerm) {
        let score = 0;
        
        // 제목 매치 (가중치: 3)
        if (pattern.title.toLowerCase().includes(searchTerm)) {
            score += 3;
        }
        
        // 설명 매치 (가중치: 2)
        if (pattern.description.toLowerCase().includes(searchTerm)) {
            score += 2;
        }
        
        // 태그 매치 (가중치: 2)
        if (pattern.tags && pattern.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
            score += 2;
        }
        
        // 패턴 매치 (가중치: 1)
        if (pattern.pattern.toLowerCase().includes(searchTerm)) {
            score += 1;
        }
        
        // 예제 매치 (가중치: 1)
        if (pattern.examples) {
            const allExamples = [...pattern.examples.valid, ...pattern.examples.invalid];
            if (allExamples.some(example => example.toLowerCase().includes(searchTerm))) {
                score += 1;
            }
        }
        
        return score;
    },

    // 모든 패턴 가져오기
    getAll() {
        const allPatterns = [];
        Object.entries(this).forEach(([categoryId, patterns]) => {
            if (categoryId === 'categories' || categoryId === 'search' || categoryId === 'getAll' || categoryId === 'getByCategory' || categoryId === 'getById' || categoryId === 'calculateMatchScore') {
                return;
            }
            
            patterns.forEach(pattern => {
                allPatterns.push({
                    ...pattern,
                    category: categoryId
                });
            });
        });
        
        return allPatterns;
    },

    // 카테고리별 패턴 가져오기
    getByCategory(categoryId) {
        return this[categoryId] ? this[categoryId].map(pattern => ({ 
            ...pattern, 
            category: categoryId 
        })) : [];
    },

    // ID로 패턴 가져오기
    getById(id) {
        for (const [categoryId, patterns] of Object.entries(this)) {
            if (categoryId === 'categories' || categoryId === 'search' || categoryId === 'getAll' || categoryId === 'getByCategory' || categoryId === 'getById' || categoryId === 'calculateMatchScore') {
                continue;
            }
            
            const pattern = patterns.find(p => p.id === id);
            if (pattern) {
                return { ...pattern, category: categoryId };
            }
        }
        return null;
    }
};

// 패턴 유틸리티 함수들
const PatternUtils = {
    // 패턴 테스트
    testPattern(pattern, testString, flags = 'g') {
        try {
            const regex = new RegExp(pattern, flags);
            const matches = [...testString.matchAll(regex)];
            return {
                isValid: true,
                matches: matches,
                matchCount: matches.length
            };
        } catch (error) {
            return {
                isValid: false,
                error: error.message,
                matches: [],
                matchCount: 0
            };
        }
    },

    // 패턴 설명 생성
    explainPattern(pattern) {
        const explanations = {
            '^': '문자열의 시작',
            '$': '문자열의 끝',
            '.': '임의의 한 문자 (줄바꿈 제외)',
            '*': '0개 이상 반복',
            '+': '1개 이상 반복',
            '?': '0개 또는 1개',
            '\\d': '숫자 (0-9)',
            '\\w': '단어 문자 (알파벳, 숫자, _)',
            '\\s': '공백 문자',
            '\\D': '숫자가 아닌 문자',
            '\\W': '단어 문자가 아닌 문자',
            '\\S': '공백이 아닌 문자',
            '\\b': '단어 경계',
            '[a-z]': '소문자 a부터 z까지',
            '[A-Z]': '대문자 A부터 Z까지',
            '[0-9]': '숫자 0부터 9까지',
            '|': 'OR 연산자',
            '()': '그룹화',
            '[]': '문자 집합',
            '{}': '반복 횟수 지정'
        };

        return explanations;
    },

    // 패턴 복잡도 계산
    calculateComplexity(pattern) {
        let complexity = 0;
        
        // 기본 점수
        complexity += pattern.length * 0.1;
        
        // 특수 문자 점수
        const specialChars = /[.*+?^${}()|[\]\\]/g;
        const matches = pattern.match(specialChars);
        if (matches) {
            complexity += matches.length * 0.5;
        }
        
        // 문자 클래스 점수
        const charClasses = /\[[^\]]+\]/g;
        const charClassMatches = pattern.match(charClasses);
        if (charClassMatches) {
            complexity += charClassMatches.length * 1;
        }
        
        // 그룹 점수
        const groups = /\([^)]*\)/g;
        const groupMatches = pattern.match(groups);
        if (groupMatches) {
            complexity += groupMatches.length * 1.5;
        }
        
        return Math.min(Math.round(complexity), 10);
    },

    // 패턴 최적화 제안
    suggestOptimization(pattern) {
        const suggestions = [];
        
        // 중복 문자 클래스 검사
        if (pattern.includes('[a-zA-Z]') && pattern.includes('[A-Za-z]')) {
            suggestions.push('중복된 문자 클래스가 있습니다. 하나로 통일하세요.');
        }
        
        // 불필요한 이스케이프 검사
        if (pattern.includes('\\.') && !pattern.includes('[.')) {
            suggestions.push('문자 클래스 밖에서는 점(.)을 이스케이프할 필요가 없을 수 있습니다.');
        }
        
        // 성능 개선 제안
        if (pattern.includes('.*.*')) {
            suggestions.push('중첩된 .*는 성능에 영향을 줄 수 있습니다.');
        }
        
        return suggestions;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RegexPatterns, PatternUtils };
} else {
    window.RegexPatterns = RegexPatterns;
    window.PatternUtils = PatternUtils;
}