/**
 * NEO Regex - Core Engine
 * 정규식 처리를 위한 핵심 엔진
 * 경로: src/core/regex.js
 */

// =========================
// 정규식 엔진 클래스
// =========================
class RegexEngine {
    constructor() {
        this.pattern = '';
        this.flags = '';
        this.testText = '';
        this.lastResult = null;
        this.performance = {
            executionTime: 0,
            complexity: 0,
            backtrackingRisk: 'low'
        };
    }

    /**
     * 정규식 패턴과 플래그를 설정
     * @param {string} pattern - 정규식 패턴
     * @param {string} flags - 정규식 플래그
     */
    setPattern(pattern, flags = '') {
        this.pattern = pattern;
        this.flags = flags;
        return this;
    }

    /**
     * 테스트할 텍스트를 설정
     * @param {string} text - 테스트 텍스트
     */
    setText(text) {
        this.testText = text;
        return this;
    }

    /**
     * 정규식 테스트 실행
     * @returns {Object} 테스트 결과
     */
    test() {
        if (!this.pattern || !this.testText) {
            return {
                success: false,
                error: '패턴과 테스트 텍스트가 모두 필요합니다.',
                matches: [],
                executionTime: 0
            };
        }

        const startTime = performance.now();
        
        try {
            // 위험한 패턴 검사
            if (this.isDangerousPattern(this.pattern)) {
                return {
                    success: false,
                    error: '위험한 패턴이 감지되었습니다. ReDoS 공격 위험이 있습니다.',
                    matches: [],
                    executionTime: 0
                };
            }

            const regex = new RegExp(this.pattern, this.flags);
            const matches = [];
            
            if (this.flags.includes('g')) {
                // 전역 검색
                let match;
                let iterations = 0;
                const maxIterations = 10000; // 무한 루프 방지
                
                while ((match = regex.exec(this.testText)) !== null && iterations < maxIterations) {
                    matches.push({
                        text: match[0],
                        index: match.index,
                        length: match[0].length,
                        groups: match.slice(1),
                        namedGroups: match.groups || {}
                    });
                    
                    // 무한 루프 방지 (길이가 0인 매치의 경우)
                    if (match[0].length === 0) {
                        regex.lastIndex++;
                    }
                    
                    iterations++;
                }
            } else {
                // 단일 검색
                const match = regex.exec(this.testText);
                if (match) {
                    matches.push({
                        text: match[0],
                        index: match.index,
                        length: match[0].length,
                        groups: match.slice(1),
                        namedGroups: match.groups || {}
                    });
                }
            }

            const executionTime = performance.now() - startTime;

            this.lastResult = {
                success: true,
                matches: matches,
                matchCount: matches.length,
                executionTime: executionTime,
                pattern: this.pattern,
                flags: this.flags,
                statistics: this.calculateStatistics(matches)
            };

            return this.lastResult;

        } catch (error) {
            const executionTime = performance.now() - startTime;
            
            return {
                success: false,
                error: this.formatError(error.message),
                matches: [],
                executionTime: executionTime
            };
        }
    }

    /**
     * 위험한 패턴 검사 (ReDoS 방지)
     * @param {string} pattern 
     * @returns {boolean}
     */
    isDangerousPattern(pattern) {
        // 중첩된 수량자 패턴 검사
        const dangerousPatterns = [
            /(\+|\*|\{[0-9,]+\})\s*(\+|\*|\{[0-9,]+\})/,  // 중첩된 수량자
            /(\([^)]*\+[^)]*\))\+/,                        // (a+)+
            /(\([^)]*\*[^)]*\))\*/,                        // (a*)*
            /(\([^)]*\+[^)]*\))\{[0-9,]+\}/               // (a+){n,m}
        ];

        return dangerousPatterns.some(dangerous => dangerous.test(pattern));
    }

    /**
     * 에러 메시지 포맷팅
     * @param {string} message 
     * @returns {string}
     */
    formatError(message) {
        const errorMap = {
            'Invalid regular expression': '잘못된 정규식 문법입니다.',
            'Unterminated group': '그룹이 제대로 닫히지 않았습니다.',
            'Invalid escape sequence': '잘못된 이스케이프 시퀀스입니다.',
            'Invalid character class': '잘못된 문자 클래스입니다.'
        };

        for (const [eng, kor] of Object.entries(errorMap)) {
            if (message.includes(eng)) {
                return kor;
            }
        }

        return message;
    }

    /**
     * 매치 통계 계산
     * @param {Array} matches 
     * @returns {Object}
     */
    calculateStatistics(matches) {
        if (matches.length === 0) {
            return {
                totalMatches: 0,
                averageLength: 0,
                longestMatch: '',
                shortestMatch: '',
                uniqueMatches: 0
            };
        }

        const lengths = matches.map(m => m.length);
        const texts = matches.map(m => m.text);
        const uniqueTexts = [...new Set(texts)];

        return {
            totalMatches: matches.length,
            averageLength: lengths.reduce((a, b) => a + b, 0) / lengths.length,
            longestMatch: matches.find(m => m.length === Math.max(...lengths))?.text || '',
            shortestMatch: matches.find(m => m.length === Math.min(...lengths))?.text || '',
            uniqueMatches: uniqueTexts.length,
            matchPositions: matches.map(m => ({ start: m.index, end: m.index + m.length }))
        };
    }

    /**
     * 매치된 텍스트를 하이라이트하여 반환
     * @param {string} className 하이라이트 CSS 클래스
     * @returns {string} 하이라이트된 HTML
     */
    getHighlightedText(className = 'highlight') {
        if (!this.lastResult || !this.lastResult.success) {
            return this.escapeHtml(this.testText);
        }

        if (this.lastResult.matches.length === 0) {
            return this.escapeHtml(this.testText);
        }

        let result = '';
        let lastIndex = 0;
        
        // 매치를 위치 순으로 정렬
        const sortedMatches = [...this.lastResult.matches].sort((a, b) => a.index - b.index);

        sortedMatches.forEach((match, index) => {
            // 매치 이전 텍스트
            result += this.escapeHtml(this.testText.slice(lastIndex, match.index));
            
            // 매치된 텍스트 (하이라이트)
            result += `<mark class="${className}" data-match-index="${index}" title="매치 ${index + 1}">${this.escapeHtml(match.text)}</mark>`;
            
            lastIndex = match.index + match.length;
        });

        // 마지막 매치 이후 텍스트
        result += this.escapeHtml(this.testText.slice(lastIndex));

        return result;
    }

    /**
     * HTML 이스케이프
     * @param {string} text 
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 패턴 복잡도 분석
     * @returns {Object}
     */
    analyzeComplexity() {
        if (!this.pattern) {
            return { score: 0, level: 'none', suggestions: [] };
        }

        let score = 0;
        const suggestions = [];

        // 기본 점수
        score += this.pattern.length * 0.1;

        // 특수 문자 검사
        const specialChars = /[.*+?^${}()|[\]\\]/g;
        const specialCharMatches = this.pattern.match(specialChars) || [];
        score += specialCharMatches.length * 2;

        // 그룹 검사
        const groups = this.pattern.match(/\([^)]*\)/g) || [];
        score += groups.length * 3;

        // 수량자 검사
        const quantifiers = this.pattern.match(/[+*?{]/g) || [];
        score += quantifiers.length * 2;

        // 문자 클래스 검사
        const charClasses = this.pattern.match(/\[[^\]]*\]/g) || [];
        score += charClasses.length * 1.5;

        // 복잡도 레벨 결정
        let level = 'low';
        if (score > 20) level = 'high';
        else if (score > 10) level = 'medium';

        // 제안사항 생성
        if (groups.length > 3) {
            suggestions.push('그룹이 너무 많습니다. 단순화를 고려해보세요.');
        }
        if (quantifiers.length > 5) {
            suggestions.push('수량자가 많습니다. 성능에 영향을 줄 수 있습니다.');
        }
        if (this.pattern.includes('.*.*')) {
            suggestions.push('중첩된 와일드카드는 성능 문제를 일으킬 수 있습니다.');
        }

        return {
            score: Math.round(score),
            level: level,
            suggestions: suggestions
        };
    }

    /**
     * 패턴 설명 생성
     * @returns {string}
     */
    explainPattern() {
        if (!this.pattern) {
            return '패턴이 없습니다.';
        }

        const explanations = [];
        const pattern = this.pattern;

        // 앵커
        if (pattern.startsWith('^')) explanations.push('문자열 시작에서 매치');
        if (pattern.endsWith('$')) explanations.push('문자열 끝에서 매치');

        // 기본 패턴 분석
        if (pattern.includes('\\d')) explanations.push('숫자 문자 포함');
        if (pattern.includes('\\w')) explanations.push('단어 문자 포함');
        if (pattern.includes('\\s')) explanations.push('공백 문자 포함');
        if (pattern.includes('.')) explanations.push('임의의 문자 포함');

        // 수량자
        if (pattern.includes('+')) explanations.push('하나 이상 반복');
        if (pattern.includes('*')) explanations.push('0개 이상 반복');
        if (pattern.includes('?')) explanations.push('선택적 매치');

        // 그룹
        const groupCount = (pattern.match(/\(/g) || []).length;
        if (groupCount > 0) explanations.push(`${groupCount}개의 그룹 사용`);

        return explanations.length > 0 
            ? explanations.join(', ')
            : '기본 문자열 매치';
    }
}

// =========================
// 정규식 패턴 라이브러리
// =========================
class PatternLibrary {
    constructor() {
        this.patterns = this.initializePatterns();
    }

    /**
     * 패턴 라이브러리 초기화
     * @returns {Object}
     */
    initializePatterns() {
        return {
            // 기본 패턴
            basic: {
                email: {
                    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                    description: '이메일 주소',
                    examples: {
                        valid: ['user@example.com', 'test.email@domain.org'],
                        invalid: ['invalid-email', 'user@', '@domain.com']
                    }
                },
                phone: {
                    pattern: '^(\\+82|0)([1-9][0-9]{1,2})([0-9]{3,4})([0-9]{4})$',
                    description: '한국 전화번호',
                    examples: {
                        valid: ['010-1234-5678', '+82-10-1234-5678'],
                        invalid: ['010-12-34', '123-456-7890']
                    }
                },
                url: {
                    pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
                    description: 'URL 주소',
                    examples: {
                        valid: ['https://www.example.com', 'http://test.com/path'],
                        invalid: ['not-a-url', 'ftp://invalid']
                    }
                }
            },
            
            // 검증 패턴
            validation: {
                password: {
                    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
                    description: '강력한 비밀번호 (8자 이상, 대소문자, 숫자, 특수문자)',
                    examples: {
                        valid: ['Password123!', 'MyP@ssw0rd'],
                        invalid: ['password', '12345678', 'Password123']
                    }
                },
                creditCard: {
                    pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})$',
                    description: '신용카드 번호 (Visa, MasterCard, AmEx)',
                    examples: {
                        valid: ['4111111111111111', '5555555555554444'],
                        invalid: ['1234567890123456', '411111111111111']
                    }
                }
            },
            
            // 개발자 패턴
            developer: {
                hexColor: {
                    pattern: '^#(?:[0-9a-fA-F]{3}){1,2}$',
                    description: 'HEX 색상 코드',
                    examples: {
                        valid: ['#fff', '#ffffff', '#123ABC'],
                        invalid: ['#gg', '#12345', 'ffffff']
                    }
                },
                ipAddress: {
                    pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
                    description: 'IPv4 주소',
                    examples: {
                        valid: ['192.168.1.1', '10.0.0.1'],
                        invalid: ['999.999.999.999', '192.168.1']
                    }
                }
            }
        };
    }

    /**
     * 패턴 검색
     * @param {string} query 
     * @returns {Array}
     */
    search(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();

        for (const [category, patterns] of Object.entries(this.patterns)) {
            for (const [key, pattern] of Object.entries(patterns)) {
                if (
                    key.toLowerCase().includes(lowerQuery) ||
                    pattern.description.toLowerCase().includes(lowerQuery)
                ) {
                    results.push({
                        id: key,
                        category: category,
                        ...pattern
                    });
                }
            }
        }

        return results;
    }

    /**
     * 카테고리별 패턴 가져오기
     * @param {string} category 
     * @returns {Array}
     */
    getByCategory(category) {
        if (!this.patterns[category]) {
            return [];
        }

        return Object.entries(this.patterns[category]).map(([key, pattern]) => ({
            id: key,
            category: category,
            ...pattern
        }));
    }

    /**
     * 모든 패턴 가져오기
     * @returns {Array}
     */
    getAll() {
        const results = [];
        
        for (const [category, patterns] of Object.entries(this.patterns)) {
            for (const [key, pattern] of Object.entries(patterns)) {
                results.push({
                    id: key,
                    category: category,
                    ...pattern
                });
            }
        }

        return results;
    }
}

// =========================
// 유틸리티 함수들
// =========================
const RegexUtils = {
    /**
     * 정규식 패턴 이스케이프
     * @param {string} string 
     * @returns {string}
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * 플래그 검증
     * @param {string} flags 
     * @returns {boolean}
     */
    validateFlags(flags) {
        const validFlags = 'gimuy';
        return flags.split('').every(flag => validFlags.includes(flag));
    },

    /**
     * 디바운스 함수
     * @param {Function} func 
     * @param {number} wait 
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// 전역 객체로 내보내기
window.RegexEngine = RegexEngine;
window.PatternLibrary = PatternLibrary;
window.RegexUtils = RegexUtils;