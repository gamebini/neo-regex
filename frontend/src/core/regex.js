// frontend/src/core/regex.js - 문법 오류 수정된 정규식 엔진
/**
 * NEO Regex 핵심 정규식 처리 엔진
 * 참고 CSS 스타일에 맞춘 완전히 새로운 구현
 */

export class RegexTester {
    constructor() {
        this.pattern = '';
        this.flags = '';
        this.testText = '';
        this.lastResult = null;
        this.performance = {
            executionTime: 0,
            complexity: 0
        };
    }

    /**
     * 정규식 패턴과 플래그 설정
     * @param {string} pattern - 정규식 패턴
     * @param {string} flags - 정규식 플래그 (g, i, m, s, u, y)
     */
    setPattern(pattern, flags = '') {
        this.pattern = pattern;
        this.flags = flags;
        return this;
    }

    /**
     * 테스트할 텍스트 설정
     * @param {string} text - 테스트 텍스트
     */
    setText(text) {
        this.testText = text;
        return this;
    }

    /**
     * 정규식 테스트 실행
     * @returns {Object} 테스트 결과 객체
     */
    test() {
        const startTime = performance.now();
        
        try {
            if (!this.pattern) {
                throw new Error('정규식 패턴이 비어있습니다.');
            }

            // 정규식 생성 및 검증
            const regex = new RegExp(this.pattern, this.flags);
            
            // 복잡도 계산
            this.performance.complexity = this.calculateComplexity(this.pattern);
            
            // 매칭 실행
            const matches = this.executeMatching(regex);
            
            const endTime = performance.now();
            this.performance.executionTime = endTime - startTime;

            this.lastResult = {
                success: true,
                pattern: this.pattern,
                flags: this.flags,
                text: this.testText,
                matches: matches.map((match, index) => ({
                    index: index,
                    match: match[0],
                    position: match.index,
                    length: match[0].length,
                    groups: match.slice(1),
                    namedGroups: match.groups || {}
                })),
                totalMatches: matches.length,
                executionTime: this.performance.executionTime,
                complexity: this.performance.complexity,
                timestamp: new Date().toISOString()
            };

            return this.lastResult;

        } catch (error) {
            const endTime = performance.now();
            this.performance.executionTime = endTime - startTime;

            this.lastResult = {
                success: false,
                error: this.formatError(error.message),
                pattern: this.pattern,
                flags: this.flags,
                text: this.testText,
                executionTime: this.performance.executionTime,
                timestamp: new Date().toISOString()
            };
            
            return this.lastResult;
        }
    }

    /**
     * 매칭 실행 (타임아웃 포함)
     * @param {RegExp} regex - 정규식 객체
     * @returns {Array} 매칭 결과 배열
     */
    executeMatching(regex) {
        const matches = [];
        const maxMatches = 1000; // 무한 루프 방지
        const timeout = 5000; // 5초 타임아웃
        const startTime = Date.now();

        if (this.flags.includes('g')) {
            let match;
            let matchCount = 0;
            
            while ((match = regex.exec(this.testText)) !== null && matchCount < maxMatches) {
                // 타임아웃 체크
                if (Date.now() - startTime > timeout) {
                    throw new Error('정규식 실행 시간이 너무 깁니다. 패턴을 간소화해주세요.');
                }
                
                matches.push(match);
                matchCount++;
                
                // 무한 루프 방지 (빈 문자열 매칭)
                if (match[0] === '') {
                    regex.lastIndex++;
                }
                
                // lastIndex가 재설정되지 않는 경우 방지
                if (regex.lastIndex <= match.index) {
                    break;
                }
            }
        } else {
            const match = this.testText.match(regex);
            if (match) {
                matches.push(match);
            }
        }

        return matches;
    }

    /**
     * 정규식 복잡도 계산
     * @param {string} pattern - 정규식 패턴
     * @returns {number} 복잡도 점수 (1-10)
     */
    calculateComplexity(pattern) {
        let complexity = 1;
        
        // 기본 패턴들
        const complexPatterns = [
            /\(\?\=/g,           // 전방 탐색
            /\(\?\!/g,           // 부정 전방 탐색
            /\(\?\<=/g,          // 후방 탐색
            /\(\?\<!/g,          // 부정 후방 탐색
            /\(\?\:/g,           // 비캡처 그룹
            /\*\+|\+\*|\{\d+,\}/g, // 중첩된 수량자
            /\[\^[^\]]*\]/g,     // 부정 문자 클래스
            /\|/g,               // 선택 연산자
            /\\\w/g              // 이스케이프 문자
        ];

        complexPatterns.forEach(cpx => {
            const matches = pattern.match(cpx);
            if (matches) {
                complexity += matches.length * 0.5;
            }
        });

        // 백트래킹 가능성 체크
        if (this.hasBacktrackingRisk(pattern)) {
            complexity += 2;
        }

        // 길이에 따른 복잡도
        complexity += Math.min(pattern.length / 20, 2);

        return Math.min(Math.round(complexity), 10);
    }

    /**
     * 백트래킹 위험성 체크 (ReDoS 방지)
     * @param {string} pattern - 정규식 패턴
     * @returns {boolean} 백트래킹 위험 여부
     */
    hasBacktrackingRisk(pattern) {
        // 위험한 패턴들
        const riskyPatterns = [
            /\(\.\*\)\+/,        // (.*)+
            /\(\.\+\)\*/,        // (.+)*
            /\(\w\*\)\+/,        // (\w*)+
            /\(\w\+\)\*/,        // (\w+)*
            /\(\[\w\]\*\)\+/,    // ([\w]*)+
            /\(\[\w\]\+\)\*/     // ([\w]+)*
        ];

        return riskyPatterns.some(pattern_risk => pattern_risk.test(pattern));
    }

    /**
     * 에러 메시지 포맷팅
     * @param {string} errorMessage - 원본 에러 메시지
     * @returns {string} 포맷된 에러 메시지
     */
    formatError(errorMessage) {
        const errorMap = {
            'Unterminated character class': '문자 클래스가 닫히지 않았습니다. ]를 추가해주세요.',
            'Unterminated group': '그룹이 닫히지 않았습니다. )를 추가해주세요.',
            'Invalid escape sequence': '잘못된 이스케이프 시퀀스입니다.',
            'Invalid regular expression': '유효하지 않은 정규식입니다.',
            'Nothing to repeat': '반복할 대상이 없습니다. *, +, ? 앞에 문자나 그룹이 있어야 합니다.',
            'Invalid quantifier': '유효하지 않은 수량자입니다.',
            'Incomplete quantifier': '수량자가 완전하지 않습니다. {숫자} 형태로 작성해주세요.'
        };

        for (const [key, value] of Object.entries(errorMap)) {
            if (errorMessage.includes(key)) {
                return value;
            }
        }

        return errorMessage;
    }

    /**
     * 정규식 문법 검증
     * @returns {Object} 검증 결과
     */
    validate() {
        try {
            new RegExp(this.pattern, this.flags);
            
            const suggestions = [];
            
            // 성능 관련 제안
            if (this.hasBacktrackingRisk(this.pattern)) {
                suggestions.push('백트래킹 위험이 있습니다. 패턴을 최적화하는 것을 고려해보세요.');
            }
            
            if (this.performance.complexity > 7) {
                suggestions.push('패턴이 복잡합니다. 간소화를 고려해보세요.');
            }
            
            // 효율성 관련 제안
            if (this.pattern.includes('.*.*')) {
                suggestions.push('중복된 .* 패턴을 단순화할 수 있습니다.');
            }
            
            if (this.pattern.includes('|') && this.pattern.length > 50) {
                suggestions.push('긴 선택 패턴은 여러 개의 정규식으로 분리하는 것을 고려해보세요.');
            }

            return { 
                valid: true, 
                suggestions: suggestions,
                complexity: this.performance.complexity
            };
        } catch (error) {
            return { 
                valid: false, 
                error: this.formatError(error.message),
                suggestions: this.getSuggestions(error.message)
            };
        }
    }

    /**
     * 에러에 대한 제안사항 제공
     * @param {string} errorMessage - 에러 메시지
     * @returns {Array} 제안사항 배열
     */
    getSuggestions(errorMessage) {
        const suggestions = [];
        
        if (errorMessage.includes('Unterminated character class')) {
            suggestions.push('문자 클래스 ]가 누락되었습니다. [abc] 형태로 닫아주세요.');
            suggestions.push('예시: [a-zA-Z0-9] (영문자와 숫자)');
        }
        
        if (errorMessage.includes('Unterminated group')) {
            suggestions.push('그룹 )이 누락되었습니다. (abc) 형태로 닫아주세요.');
            suggestions.push('예시: (hello|world) (hello 또는 world)');
        }
        
        if (errorMessage.includes('Invalid escape sequence')) {
            suggestions.push('잘못된 이스케이프 시퀀스입니다. \\를 두 번 사용하거나 올바른 이스케이프를 사용하세요.');
            suggestions.push('유효한 이스케이프: \\n, \\t, \\r, \\s, \\d, \\w 등');
        }
        
        if (errorMessage.includes('Nothing to repeat')) {
            suggestions.push('*, +, ? 앞에 반복할 문자나 그룹이 있어야 합니다.');
            suggestions.push('예시: a+ (a가 하나 이상), (abc)* (abc가 0개 이상)');
        }
        
        if (errorMessage.includes('Invalid quantifier')) {
            suggestions.push('수량자 형태를 확인해주세요.');
            suggestions.push('올바른 형태: {3}, {1,5}, {2,} 등');
        }

        return suggestions;
    }

    /**
     * 정규식 설명 생성
     * @returns {string} 정규식 설명
     */
    getExplanation() {
        if (!this.pattern) return '';

        const explanations = [];
        let currentPattern = this.pattern;

        // 기본 메타문자 설명
        const metaChars = {
            '^': '문자열의 시작',
            '$': '문자열의 끝',
            '.': '줄바꿈을 제외한 모든 문자',
            '*': '0개 이상 반복',
            '+': '1개 이상 반복',
            '?': '0개 또는 1개',
            '\\d': '숫자 (0-9)',
            '\\w': '단어 문자 (영문자, 숫자, _)',
            '\\s': '공백 문자',
            '\\D': '숫자가 아닌 문자',
            '\\W': '단어 문자가 아닌 문자',
            '\\S': '공백이 아닌 문자'
        };

        for (const [pattern, desc] of Object.entries(metaChars)) {
            if (currentPattern.includes(pattern)) {
                explanations.push(`${pattern}: ${desc}`);
            }
        }

        // 문자 클래스 설명
        const charClasses = currentPattern.match(/\[[^\]]+\]/g);
        if (charClasses) {
            charClasses.forEach(cls => {
                explanations.push(`${cls}: 문자 클래스 - 괄호 안의 문자 중 하나와 매칭`);
            });
        }

        // 그룹 설명
        const groups = currentPattern.match(/\([^)]+\)/g);
        if (groups) {
            explanations.push('(): 그룹 - 괄호 안의 패턴을 하나의 단위로 처리');
        }

        return explanations.join('\n');
    }

    /**
     * 마지막 테스트 결과 반환
     * @returns {Object|null} 마지막 테스트 결과
     */
    getLastResult() {
        return this.lastResult;
    }

    /**
     * 성능 통계 반환
     * @returns {Object} 성능 통계
     */
    getPerformanceStats() {
        return {
            executionTime: this.performance.executionTime,
            complexity: this.performance.complexity,
            hasBacktrackingRisk: this.hasBacktrackingRisk(this.pattern)
        };
    }

    /**
     * 정규식 최적화 제안
     * @returns {Array} 최적화 제안 배열
     */
    getOptimizationSuggestions() {
        const suggestions = [];
        
        // 비효율적인 패턴 체크
        if (this.pattern.includes('.*.*')) {
            suggestions.push({
                type: 'performance',
                original: '.*.*',
                suggested: '.*',
                reason: '중복된 .* 패턴을 단순화할 수 있습니다.'
            });
        }
        
        if (this.pattern.includes('[0-9]')) {
            suggestions.push({
                type: 'simplification',
                original: '[0-9]',
                suggested: '\\d',
                reason: '\\d가 더 간결하고 읽기 쉽습니다.'
            });
        }
        
        if (this.pattern.includes('[a-zA-Z0-9_]')) {
            suggestions.push({
                type: 'simplification',
                original: '[a-zA-Z0-9_]',
                suggested: '\\w',
                reason: '\\w가 더 간결하고 읽기 쉽습니다.'
            });
        }
        
        if (this.pattern.includes('[ \\t\\n\\r]')) {
            suggestions.push({
                type: 'simplification',
                original: '[ \\t\\n\\r]',
                suggested: '\\s',
                reason: '\\s가 더 간결하고 모든 공백 문자를 포함합니다.'
            });
        }

        return suggestions;
    }
}

/**
 * 정규식 패턴 라이브러리
 */
export const RegexPatterns = {
    // 기본 패턴
    basic: {
        email: {
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            description: '일반적인 이메일 주소 형식',
            examples: {
                valid: ['test@example.com', 'user.name@domain.org'],
                invalid: ['invalid-email', 'user@', '@domain.com']
            }
        },
        url: {
            pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
            description: 'HTTP/HTTPS URL 형식',
            examples: {
                valid: ['https://www.example.com', 'http://domain.org/path'],
                invalid: ['not-a-url', 'ftp://example.com']
            }
        },
        ipv4: {
            pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
            description: 'IPv4 주소 형식',
            examples: {
                valid: ['192.168.1.1', '10.0.0.1', '255.255.255.255'],
                invalid: ['256.1.1.1', '192.168.1', '192.168.1.1.1']
            }
        }
    },
    
    // 한국어 패턴
    korean: {
        phone: {
            pattern: '^01[016789]-?\\d{3,4}-?\\d{4}$',
            description: '한국 휴대폰 번호',
            examples: {
                valid: ['010-1234-5678', '01012345678', '011-123-4567'],
                invalid: ['02-1234-5678', '010-12-5678']
            }
        },
        hangul: {
            pattern: '^[가-힣]+$',
            description: '한글만 (완성형)',
            examples: {
                valid: ['안녕하세요', '정규식', '한글'],
                invalid: ['Hello', '안녕123', '한글!']
            }
        },
        koreanName: {
            pattern: '^[가-힣]{2,4}$',
            description: '한국 이름 (2-4자)',
            examples: {
                valid: ['김철수', '이영희', '박미영'],
                invalid: ['김', '김철수영희박', 'Kim']
            }
        }
    },
    
    // 검증 패턴
    validation: {
        strongPassword: {
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
            description: '강력한 비밀번호 (대소문자, 숫자, 특수문자 포함 8자 이상)',
            examples: {
                valid: ['Password123!', 'MyP@ssw0rd', 'Secure#2024'],
                invalid: ['password', '12345678', 'Password123']
            }
        },
        creditCard: {
            pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$',
            description: '신용카드 번호 (Visa, MasterCard, American Express 등)',
            examples: {
                valid: ['4111111111111111', '5555555555554444'],
                invalid: ['1234567890123456', '411111111111111']
            }
        },
        socialSecurityNumber: {
            pattern: '^(?:[0-9]{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[1,2][0-9]|3[0,1]))-?[1-4]-?[0-9]{6}$',
            description: '주민등록번호',
            examples: {
                valid: ['901201-1234567', '850315-2123456'],
                invalid: ['901301-1234567', '850230-1234567']
            }
        }
    },
    
    // 개발자 패턴
    developer: {
        htmlTag: {
            pattern: '<([a-z][a-z0-9]*)\\b[^>]*>(.*?)</\\1>',
            description: 'HTML 태그 (여는 태그와 닫는 태그 매칭)',
            examples: {
                valid: ['<div>내용</div>', '<p class="text">문단</p>'],
                invalid: ['<div>내용</span>', '<div>내용']
            }
        },
        cssSelector: {
            pattern: '^[a-zA-Z0-9\\-_#.\\[\\]:, >+~*]+$',
            description: 'CSS 선택자',
            examples: {
                valid: ['.class', '#id', 'div > p', '[data-value="test"]'],
                invalid: ['<div>', '{{variable}}']
            }
        },
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
            description: 'IP 주소 (IPv4)',
            examples: {
                valid: ['192.168.1.1', '10.0.0.1', '255.255.255.255'],
                invalid: ['256.1.1.1', '192.168.1', '192.168.1.1.1']
            }
        }
    }
};

/**
 * 정규식 유틸리티 함수들
 */
export const RegexUtils = {
    /**
     * 정규식에서 특수 문자 이스케이프
     * @param {string} text - 이스케이프할 텍스트
     * @returns {string} 이스케이프된 텍스트
     */
    escapeRegExp: function(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * 문자열에서 정규식 매칭 부분 하이라이트
     * @param {string} text - 원본 텍스트
     * @param {RegExp} regex - 정규식
     * @param {string} className - 하이라이트 CSS 클래스
     * @returns {string} 하이라이트된 HTML
     */
    highlightMatches: function(text, regex, className = 'match-highlight') {
        if (!regex.global) {
            // 전역 플래그가 없으면 추가
            regex = new RegExp(regex.source, regex.flags + 'g');
        }
        
        return text.replace(regex, `<span class="${className}">$&</span>`);
    },

    /**
     * 정규식의 그룹 정보 추출
     * @param {string} pattern - 정규식 패턴
     * @returns {Array} 그룹 정보 배열
     */
    extractGroups: function(pattern) {
        const groups = [];
        let groupIndex = 1;
        let i = 0;
        
        while (i < pattern.length) {
            if (pattern[i] === '\\') {
                i += 2; // 이스케이프된 문자 건너뛰기
                continue;
            }
            
            if (pattern[i] === '(') {
                if (pattern[i + 1] === '?') {
                    // 특별한 그룹 처리
                    if (pattern[i + 2] === ':') {
                        groups.push({
                            index: null,
                            type: 'non-capturing',
                            position: i
                        });
                    } else if (pattern[i + 2] === '=') {
                        groups.push({
                            index: null,
                            type: 'positive-lookahead',
                            position: i
                        });
                    } else if (pattern[i + 2] === '!') {
                        groups.push({
                            index: null,
                            type: 'negative-lookahead',
                            position: i
                        });
                    }
                } else {
                    // 캡처링 그룹
                    groups.push({
                        index: groupIndex++,
                        type: 'capturing',
                        position: i
                    });
                }
            }
            i++;
        }
        
        return groups;
    },

    /**
     * 정규식 플래그 설명 반환
     * @param {string} flags - 플래그 문자열
     * @returns {Array} 플래그 설명 배열
     */
    getFlagDescriptions: function(flags) {
        const flagMap = {
            'g': '전역 검색 - 모든 매치를 찾습니다',
            'i': '대소문자 무시 - 대소문자를 구분하지 않습니다',
            'm': '멀티라인 - ^와 $가 각 줄의 시작과 끝을 의미합니다',
            's': '도트올 - .이 줄바꿈 문자도 매치합니다',
            'u': '유니코드 - 유니코드를 올바르게 처리합니다',
            'y': '고정 - lastIndex 위치부터 정확히 매치해야 합니다'
        };
        
        return flags.split('').map(flag => ({
            flag: flag,
            description: flagMap[flag] || '알 수 없는 플래그'
        }));
    },

    /**
     * 정규식 성능 벤치마크
     * @param {RegExp} regex - 테스트할 정규식
     * @param {string} text - 테스트 텍스트
     * @param {number} iterations - 반복 횟수
     * @returns {Object} 벤치마크 결과
     */
    benchmark: function(regex, text, iterations = 1000) {
        const results = [];
        
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            regex.test(text);
            const end = performance.now();
            results.push(end - start);
        }
        
        const sortedResults = results.sort((a, b) => a - b);
        
        return {
            iterations: iterations,
            total: results.reduce((a, b) => a + b, 0),
            average: results.reduce((a, b) => a + b, 0) / iterations,
            median: sortedResults[Math.floor(sortedResults.length / 2)],
            min: Math.min(...results),
            max: Math.max(...results),
            standardDeviation: Math.sqrt(
                results.reduce((sum, time) => {
                    const avg = results.reduce((a, b) => a + b, 0) / iterations;
                    return sum + Math.pow(time - avg, 2);
                }, 0) / iterations
            )
        };
    },

    /**
     * 정규식 패턴을 사람이 읽기 쉬운 형태로 변환
     * @param {string} pattern - 정규식 패턴
     * @returns {string} 읽기 쉬운 설명
     */
    humanize: function(pattern) {
        let description = pattern;
        
        const replacements = [
            [/\^/g, '문자열 시작에서 '],
            [/\$/g, ' 문자열 끝까지'],
            [/\\d/g, '숫자'],
            [/\\w/g, '단어문자'],
            [/\\s/g, '공백'],
            [/\\D/g, '숫자가 아닌 문자'],
            [/\\W/g, '단어문자가 아닌 문자'],
            [/\\S/g, '공백이 아닌 문자'],
            [/\./g, '아무 문자'],
            [/\+/g, ' (1개 이상)'],
            [/\*/g, ' (0개 이상)'],
            [/\?/g, ' (선택적)'],
            [/\|/g, ' 또는 '],
            [/\[([^\]]+)\]/g, '[$1 중 하나]'],
            [/\{(\d+)\}/g, ' (정확히 $1개)'],
            [/\{(\d+),\}/g, ' ($1개 이상)'],
            [/\{(\d+),(\d+)\}/g, ' ($1-$2개)']
        ];
        
        replacements.forEach(([pattern, replacement]) => {
            description = description.replace(pattern, replacement);
        });
        
        return description.trim();
    }
};

/**
 * 정규식 빌더 클래스 (시각적 빌더용)
 */
export class RegexBuilder {
    constructor() {
        this.components = [];
    }

    /**
     * 컴포넌트 추가
     * @param {Object} component - 추가할 컴포넌트
     */
    addComponent(component) {
        this.components.push(component);
        return this;
    }

    /**
     * 컴포넌트 제거
     * @param {number} index - 제거할 인덱스
     */
    removeComponent(index) {
        if (index >= 0 && index < this.components.length) {
            this.components.splice(index, 1);
        }
        return this;
    }

    /**
     * 정규식 패턴 생성
     * @returns {string} 생성된 정규식 패턴
     */
    build() {
        return this.components.map(comp => comp.pattern).join('');
    }

    /**
     * 컴포넌트 목록 반환
     * @returns {Array} 컴포넌트 배열
     */
    getComponents() {
        return [...this.components];
    }

    /**
     * 빌더 초기화
     */
    clear() {
        this.components = [];
        return this;
    }
}

// 기본 내보내기
export default {
    RegexTester,
    RegexPatterns,
    RegexUtils,
    RegexBuilder
};