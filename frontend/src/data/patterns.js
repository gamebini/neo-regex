// frontend/src/data/patterns.js

/**
 * Predefined regex patterns library
 * Each pattern includes examples, description, and usage information
 */

export const patternCategories = {
    basic: {
        id: 'basic',
        name: '기본 패턴',
        description: '가장 많이 사용되는 기본적인 정규식 패턴들',
        icon: '🔤'
    },
    validation: {
        id: 'validation',
        name: '검증 패턴',
        description: '데이터 유효성 검사를 위한 패턴들',
        icon: '✅'
    },
    korean: {
        id: 'korean',
        name: '한국어 패턴',
        description: '한국어 특화 정규식 패턴들',
        icon: '🇰🇷'
    },
    developer: {
        id: 'developer',
        name: '개발자 패턴',
        description: '개발 관련 패턴 매칭용',
        icon: '💻'
    },
    extraction: {
        id: 'extraction',
        name: '추출 패턴',
        description: '특정 데이터 추출을 위한 패턴들',
        icon: '🔍'
    }
};

export const regexPatterns = [
    // Basic Patterns
    {
        id: 'digits',
        title: '숫자',
        category: 'basic',
        pattern: '\\d+',
        flags: 'g',
        description: '하나 이상의 숫자를 찾습니다.',
        examples: {
            valid: ['123', '456789', '0'],
            invalid: ['abc', 'hello', '!@#']
        },
        testText: 'Order #123 costs $45.99 and item ID is 789',
        explanation: '\\d는 0-9 사이의 숫자를 의미하고, +는 1개 이상을 의미합니다.',
        tags: ['숫자', 'number', 'digit', '기본'],
        difficulty: 'beginner',
        usage: {
            javascript: 'text.match(/\\d+/g)',
            python: 're.findall(r\'\\d+\', text)'
        }
    },
    {
        id: 'letters',
        title: '영문자',
        category: 'basic',
        pattern: '[a-zA-Z]+',
        flags: 'g',
        description: '하나 이상의 영문자를 찾습니다.',
        examples: {
            valid: ['Hello', 'world', 'ABC'],
            invalid: ['123', '!@#', '한글']
        },
        testText: 'Hello World 123 안녕하세요',
        explanation: '[a-zA-Z]는 대소문자 영문자를 의미하고, +는 1개 이상을 의미합니다.',
        tags: ['영문자', 'alphabet', 'letter', '기본'],
        difficulty: 'beginner'
    },
    {
        id: 'words',
        title: '단어 문자',
        category: 'basic',
        pattern: '\\w+',
        flags: 'g',
        description: '단어를 구성하는 문자들 (영문자, 숫자, 밑줄)을 찾습니다.',
        examples: {
            valid: ['hello', 'test123', 'var_name'],
            invalid: ['!@#', '   ', '()']
        },
        testText: 'var_name = "hello_world123" + special!chars',
        explanation: '\\w는 영문자, 숫자, 밑줄(_)을 의미합니다.',
        tags: ['단어', 'word', 'alphanumeric', '기본'],
        difficulty: 'beginner'
    },

    // Validation Patterns
    {
        id: 'email_basic',
        title: '이메일 주소 (기본)',
        category: 'validation',
        pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
        flags: '',
        description: '기본적인 이메일 주소 형식을 검증합니다.',
        examples: {
            valid: ['user@example.com', 'test.email@domain.org', 'name+tag@site.co.kr'],
            invalid: ['invalid-email', 'user@', '@domain.com', 'user.domain.com']
        },
        testText: 'Contact us at support@neoregex.com or admin@example.org for help.',
        explanation: '@ 앞에는 영문자/숫자/특수문자, @ 뒤에는 도메인, 마지막에 최소 2글자 확장자',
        tags: ['이메일', 'email', '검증', 'validation'],
        difficulty: 'beginner'
    },
    {
        id: 'phone_korean',
        title: '한국 전화번호',
        category: 'validation',
        pattern: '0\\d{1,2}-\\d{3,4}-\\d{4}',
        flags: 'g',
        description: '한국 전화번호 형식을 찾습니다 (0XX-XXXX-XXXX).',
        examples: {
            valid: ['010-1234-5678', '02-987-6543', '031-123-4567'],
            invalid: ['1234-5678', '010-12-34', '02-9876-543']
        },
        testText: '연락처: 010-1234-5678, 사무실: 02-987-6543',
        explanation: '0으로 시작, 1-2자리 지역번호, 3-4자리, 4자리 순서',
        tags: ['전화번호', 'phone', '한국', 'korean'],
        difficulty: 'intermediate'
    },
    {
        id: 'url_http',
        title: 'URL (HTTP/HTTPS)',
        category: 'validation',
        pattern: 'https?://[\\w.-]+\\.[a-zA-Z]{2,}(?:/[\\w./?#\\[\\]@!$&\'()*+,;=-]*)?',
        flags: 'g',
        description: 'HTTP 또는 HTTPS URL을 찾습니다.',
        examples: {
            valid: ['https://example.com', 'http://test.org/page', 'https://neoregex.com/docs'],
            invalid: ['ftp://example.com', 'example.com', 'https://']
        },
        testText: 'Visit https://neoregex.com or check http://example.org/docs',
        explanation: 'http(s)://로 시작하여 도메인과 선택적 경로를 포함',
        tags: ['URL', 'link', 'web', 'http'],
        difficulty: 'intermediate'
    },
    {
        id: 'ip_address',
        title: 'IP 주소 (IPv4)',
        category: 'validation',
        pattern: '(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)',
        flags: 'g',
        description: 'IPv4 IP 주소를 찾습니다.',
        examples: {
            valid: ['192.168.1.1', '127.0.0.1', '8.8.8.8'],
            invalid: ['256.1.1.1', '192.168.1', '192.168.1.1.1']
        },
        testText: 'Server IP: 192.168.1.100, DNS: 8.8.8.8',
        explanation: '0-255 범위의 숫자 4개를 점으로 구분',
        tags: ['IP', 'address', 'network', 'IPv4'],
        difficulty: 'advanced'
    },

    // Korean Patterns
    {
        id: 'korean_only',
        title: '한글만',
        category: 'korean',
        pattern: '[가-힣]+',
        flags: 'g',
        description: '한글 문자만을 찾습니다.',
        examples: {
            valid: ['안녕하세요', '정규식', '한글'],
            invalid: ['hello', '123', 'ㄱㄴㄷ']
        },
        testText: '안녕하세요 hello 123 정규식 test',
        explanation: '[가-힣]는 완성된 한글 문자를 의미합니다.',
        tags: ['한글', 'korean', 'hangul'],
        difficulty: 'beginner'
    },
    {
        id: 'korean_name',
        title: '한국 이름',
        category: 'korean',
        pattern: '[가-힣]{2,4}',
        flags: 'g',
        description: '2-4자의 한국 이름을 찾습니다.',
        examples: {
            valid: ['김철수', '이영희', '박'],
            invalid: ['김', '가나다라마바']
        },
        testText: '참석자: 김철수, 이영희, 박지성',
        explanation: '2자에서 4자 사이의 한글 이름',
        tags: ['이름', 'name', 'korean', '한국'],
        difficulty: 'beginner'
    },
    {
        id: 'korean_postal',
        title: '한국 우편번호',
        category: 'korean',
        pattern: '\\d{5}',
        flags: 'g',
        description: '한국의 5자리 우편번호를 찾습니다.',
        examples: {
            valid: ['12345', '06234', '13579'],
            invalid: ['1234', '123456', 'abcde']
        },
        testText: '주소: 서울시 강남구 (우: 06234)',
        explanation: '정확히 5자리 숫자로 구성된 우편번호',
        tags: ['우편번호', 'postal', 'zip', 'korean'],
        difficulty: 'beginner'
    },

    // Developer Patterns
    {
        id: 'hex_color',
        title: 'HEX 색상 코드',
        category: 'developer',
        pattern: '#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}',
        flags: 'g',
        description: 'CSS HEX 색상 코드를 찾습니다.',
        examples: {
            valid: ['#FF0000', '#123', '#abc', '#123456'],
            invalid: ['#GG0000', '#12', '#1234567']
        },
        testText: 'Colors: primary #FF0000, secondary #00FF00, accent #12A',
        explanation: '#으로 시작하여 3자리 또는 6자리 16진수',
        tags: ['색상', 'color', 'hex', 'css'],
        difficulty: 'intermediate'
    },
    {
        id: 'html_tag',
        title: 'HTML 태그',
        category: 'developer',
        pattern: '<\\/?[a-zA-Z][a-zA-Z0-9]*(?:\\s[^>]*)?\\s*>',
        flags: 'g',
        description: 'HTML 태그를 찾습니다.',
        examples: {
            valid: ['<div>', '</div>', '<p class="text">', '<br/>'],
            invalid: ['<123>', '< div>', '<>']
        },
        testText: '<div class="container"><p>Hello</p></div>',
        explanation: '<>로 둘러싸인 태그 이름과 속성',
        tags: ['HTML', 'tag', 'markup'],
        difficulty: 'intermediate'
    },
    {
        id: 'css_property',
        title: 'CSS 속성',
        category: 'developer',
        pattern: '[a-zA-Z-]+\\s*:\\s*[^;]+;?',
        flags: 'g',
        description: 'CSS 속성을 찾습니다.',
        examples: {
            valid: ['color: red;', 'margin-top: 10px', 'font-size: 14px;'],
            invalid: ['color red', ': red;', 'color:']
        },
        testText: 'body { color: blue; margin: 0; font-size: 16px; }',
        explanation: '속성명: 값; 형태의 CSS 속성',
        tags: ['CSS', 'property', 'style'],
        difficulty: 'intermediate'
    },
    {
        id: 'json_string',
        title: 'JSON 문자열',
        category: 'developer',
        pattern: '"[^"\\\\]*(?:\\\\.[^"\\\\]*)*"',
        flags: 'g',
        description: 'JSON에서 문자열 값을 찾습니다.',
        examples: {
            valid: ['"hello"', '"escaped \\"quote\\""', '"value"'],
            invalid: ['"unclosed', 'not quoted', "'single'"]
        },
        testText: '{"name": "John", "message": "Hello \\"world\\""}',
        explanation: '쌍따옴표로 둘러싸인 이스케이프 가능한 문자열',
        tags: ['JSON', 'string', 'data'],
        difficulty: 'advanced'
    },

    // Extraction Patterns
    {
        id: 'price_amount',
        title: '가격/금액',
        category: 'extraction',
        pattern: '\\$\\d{1,3}(?:,\\d{3})*(?:\\.\\d{2})?|\\d{1,3}(?:,\\d{3})*원',
        flags: 'g',
        description: '달러 또는 원화 가격을 찾습니다.',
        examples: {
            valid: ['$1,234.56', '$99', '10,000원', '1,234,567원'],
            invalid: ['$1,23.456', '원', '$']
        },
        testText: 'Price: $1,234.56 or 50,000원',
        explanation: '통화 기호와 함께 쉼표로 구분된 숫자',
        tags: ['가격', 'price', 'money', 'currency'],
        difficulty: 'intermediate'
    },
    {
        id: 'date_format',
        title: '날짜 (YYYY-MM-DD)',
        category: 'extraction',
        pattern: '\\d{4}-\\d{2}-\\d{2}',
        flags: 'g',
        description: 'YYYY-MM-DD 형식의 날짜를 찾습니다.',
        examples: {
            valid: ['2024-01-15', '2023-12-31', '2025-06-01'],
            invalid: ['24-01-15', '2024/01/15', '2024-1-1']
        },
        testText: 'Created: 2024-01-15, Updated: 2024-03-20',
        explanation: '4자리 연도-2자리 월-2자리 일',
        tags: ['날짜', 'date', 'time'],
        difficulty: 'beginner'
    },
    {
        id: 'time_format',
        title: '시간 (HH:MM)',
        category: 'extraction',
        pattern: '(?:[01]?\\d|2[0-3]):[0-5]\\d',
        flags: 'g',
        description: '24시간 형식의 시간을 찾습니다.',
        examples: {
            valid: ['09:30', '23:59', '00:00', '12:45'],
            invalid: ['25:00', '12:60', '9:5']
        },
        testText: 'Meeting at 09:30, lunch at 12:00, end at 17:30',
        explanation: '00-23시간:00-59분 형태',
        tags: ['시간', 'time', 'hour', 'minute'],
        difficulty: 'intermediate'
    },
    {
        id: 'credit_card',
        title: '신용카드 번호',
        category: 'extraction',
        pattern: '\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}',
        flags: 'g',
        description: '신용카드 번호 형식을 찾습니다.',
        examples: {
            valid: ['1234-5678-9012-3456', '1234 5678 9012 3456', '1234567890123456'],
            invalid: ['1234-567-890-123', '12345678901234567']
        },
        testText: 'Card: 1234-5678-9012-3456 or 9876 5432 1098 7654',
        explanation: '4자리씩 4그룹으로 구분된 16자리 숫자',
        tags: ['신용카드', 'credit card', 'payment'],
        difficulty: 'intermediate'
    }
];

// Helper functions
export function getPatternsByCategory(categoryId) {
    return regexPatterns.filter(pattern => pattern.category === categoryId);
}

export function getPatternById(id) {
    return regexPatterns.find(pattern => pattern.id === id);
}

export function getPatternsByTag(tag) {
    return regexPatterns.filter(pattern => 
        pattern.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    );
}

export function getPatternsByDifficulty(difficulty) {
    return regexPatterns.filter(pattern => pattern.difficulty === difficulty);
}

export function searchPatterns(query) {
    const lowercaseQuery = query.toLowerCase();
    
    return regexPatterns.filter(pattern => 
        pattern.title.toLowerCase().includes(lowercaseQuery) ||
        pattern.description.toLowerCase().includes(lowercaseQuery) ||
        pattern.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
}

// Pattern statistics
export function getPatternStats() {
    const stats = {
        total: regexPatterns.length,
        byCategory: {},
        byDifficulty: {}
    };

    // Count by category
    Object.keys(patternCategories).forEach(categoryId => {
        stats.byCategory[categoryId] = getPatternsByCategory(categoryId).length;
    });

    // Count by difficulty
    ['beginner', 'intermediate', 'advanced'].forEach(difficulty => {
        stats.byDifficulty[difficulty] = getPatternsByDifficulty(difficulty).length;
    });

    return stats;
}

// Export all patterns data
export default {
    patterns: regexPatterns,
    categories: patternCategories,
    getPatternsByCategory,
    getPatternById,
    getPatternsByTag,
    getPatternsByDifficulty,
    searchPatterns,
    getPatternStats
};