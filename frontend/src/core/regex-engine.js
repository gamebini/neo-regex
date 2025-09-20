// NEO Regex Engine - 정규식 테스트 및 분석 엔진
export class RegexEngine {
    constructor(pattern = '', flags = '', options = {}) {
        this.pattern = pattern;
        this.flags = flags;
        this.options = {
            timeout: options.timeout || 5000, // 5초 타임아웃
            maxMatches: options.maxMatches || 1000, // 최대 매치 수
            ...options
        };
        this.regex = null;
        this.lastError = null;
        this.executionTime = 0;
    }

    /**
     * 정규식 패턴 설정
     */
    setPattern(pattern, flags = '') {
        this.pattern = pattern;
        this.flags = flags;
        this.regex = null;
        this.lastError = null;
        return this;
    }

    /**
     * 정규식 컴파일 및 유효성 검사
     */
    compile() {
        try {
            if (!this.pattern) {
                throw new Error('정규식 패턴이 비어있습니다.');
            }

            // ReDoS 공격 방지를 위한 기본 검사
            if (this.isPatternDangerous(this.pattern)) {
                throw new Error('위험한 패턴이 감지되었습니다. 성능 문제를 일으킬 수 있습니다.');
            }

            this.regex = new RegExp(this.pattern, this.flags);
            this.lastError = null;
            return true;
        } catch (error) {
            this.lastError = error.message;
            this.regex = null;
            return false;
        }
    }

    /**
     * 텍스트에 대한 정규식 테스트 실행
     */
    test(text) {
        const startTime = performance.now();

        try {
            if (!this.compile()) {
                return this.createErrorResult();
            }

            const result = this.executeTest(text);
            this.executionTime = performance.now() - startTime;
            
            return {
                success: true,
                matches: result.matches,
                results: result.results,
                executionTime: this.executionTime,
                pattern: this.pattern,
                flags: this.flags,
                statistics: this.calculateStatistics(result.results, text)
            };

        } catch (error) {
            this.executionTime = performance.now() - startTime;
            this.lastError = error.message;
            return this.createErrorResult();
        }
    }

    /**
     * 실제 정규식 테스트 실행
     */
    executeTest(text) {
        if (!text || typeof text !== 'string') {
            return { matches: 0, results: [] };
        }

        const results = [];
        let matchCount = 0;

        if (this.flags.includes('g')) {
            // 전역 매치
            let match;
            const regex = new RegExp(this.pattern, this.flags);
            
            while ((match = regex.exec(text)) !== null && matchCount < this.options.maxMatches) {
                results.push(this.formatMatch(match, text));
                matchCount++;
                
                // 무한 루프 방지
                if (match.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
            }
        } else {
            // 단일 매치
            const match = text.match(this.regex);
            if (match) {
                results.push(this.formatMatch(match, text));
                matchCount = 1;
            }
        }

        return { matches: matchCount, results };
    }

    /**
     * 매치 결과 포맷팅
     */
    formatMatch(match, originalText) {
        return {
            match: match[0],
            index: match.index,
            lastIndex: match.index + match[0].length,
            groups: match.slice(1),
            namedGroups: match.groups || {},
            input: originalText.substring(
                Math.max(0, match.index - 10),
                Math.min(originalText.length, match.index + match[0].length + 10)
            )
        };
    }

    /**
     * 매치 통계 계산
     */
    calculateStatistics(results, text) {
        if (!results || results.length === 0) {
            return {
                totalMatches: 0,
                matchPercentage: 0,
                averageMatchLength: 0,
                longestMatch: '',
                shortestMatch: '',
                uniqueMatches: 0
            };
        }

        const matches = results.map(r => r.match);
        const uniqueMatches = [...new Set(matches)];
        const totalLength = matches.reduce((sum, match) => sum + match.length, 0);

        return {
            totalMatches: results.length,
            matchPercentage: ((results.length / text.split('').length) * 100).toFixed(2),
            averageMatchLength: (totalLength / results.length).toFixed(2),
            longestMatch: matches.reduce((a, b) => a.length > b.length ? a : b),
            shortestMatch: matches.reduce((a, b) => a.length < b.length ? a : b),
            uniqueMatches: uniqueMatches.length,
            matchPositions: results.map(r => ({ start: r.index, end: r.lastIndex }))
        };
    }

    /**
     * 위험한 패턴 감지 (ReDoS 방지)
     */
    isPatternDangerous(pattern) {
        const dangerousPatterns = [
            /(\w+)+\$/, // 지수적 백트래킹
            /(\w*)*\$/, // 중첩된 수량자
            /(\w+)+[^\w]/, // 겹치는 교대
            /(\d+)*\d+/, // 중첩된 수량자 with digit
            /(a+)+b/, // 전형적인 ReDoS 패턴
        ];

        return dangerousPatterns.some(dangerousPattern => {
            try {
                return dangerousPattern.test(pattern);
            } catch {
                return false;
            }
        });
    }

    /**
     * 패턴 복잡도 계산
     */
    calculateComplexity() {
        if (!this.pattern) return 0;

        let complexity = 0;
        
        // 수량자 복잡도
        complexity += (this.pattern.match(/[\*\+\?]/g) || []).length * 2;
        complexity += (this.pattern.match(/\{[\d,]+\}/g) || []).length * 3;
        
        // 문자 클래스 복잡도
        complexity += (this.pattern.match(/\[.*?\]/g) || []).length * 1;
        
        // 그룹 복잡도
        complexity += (this.pattern.match(/\(/g) || []).length * 1;
        
        // 백슬래시 이스케이프 복잡도
        complexity += (this.pattern.match(/\\./g) || []).length * 0.5;
        
        // 앵커 복잡도
        complexity += (this.pattern.match(/[\^\$]/g) || []).length * 0.5;

        return Math.round(complexity * 10) / 10;
    }

    /**
     * 에러 결과 생성
     */
    createErrorResult() {
        return {
            success: false,
            error: this.lastError,
            matches: 0,
            results: [],
            executionTime: this.executionTime,
            pattern: this.pattern,
            flags: this.flags
        };
    }

    /**
     * 패턴 설명 생성 (간단한 버전)
     */
    explainPattern() {
        if (!this.pattern) return '패턴이 없습니다.';

        const explanations = [];
        const pattern = this.pattern;

        // 기본 메타문자 설명
        const metaChars = {
            '\\d': '숫자 (0-9)',
            '\\w': '단어 문자 (a-z, A-Z, 0-9, _)',
            '\\s': '공백 문자 (스페이스, 탭, 줄바꿈)',
            '\\D': '숫자가 아닌 문자',
            '\\W': '단어 문자가 아닌 문자',
            '\\S': '공백이 아닌 문자',
            '.': '줄바꿈을 제외한 모든 문자',
            '^': '문자열 시작',
            '$': '문자열 끝',
            '*': '0개 이상 반복',
            '+': '1개 이상 반복',
            '?': '0개 또는 1개',
            '|': '또는 (OR)'
        };

        Object.entries(metaChars).forEach(([meta, desc]) => {
            if (pattern.includes(meta)) {
                explanations.push(`${meta}: ${desc}`);
            }
        });

        // 문자 클래스 설명
        const charClasses = pattern.match(/\[.*?\]/g) || [];
        charClasses.forEach(charClass => {
            explanations.push(`${charClass}: 문자 클래스 - 대괄호 안의 문자 중 하나`);
        });

        // 수량자 설명
        const quantifiers = pattern.match(/\{\d+(,\d*)?\}/g) || [];
        quantifiers.forEach(quantifier => {
            explanations.push(`${quantifier}: 정확한 반복 횟수 지정`);
        });

        return explanations.length > 0 ? explanations.join('\n') : '기본 문자열 패턴입니다.';
    }

    /**
     * 코드 예제 생성
     */
    generateCodeExamples(language = 'javascript') {
        const examples = {
            javascript: {
                test: `const regex = new RegExp('${this.pattern}', '${this.flags}');
const text = 'your test text here';
const match = text.match(regex);
console.log(match);`,
                replace: `const regex = new RegExp('${this.pattern}', '${this.flags}');
const text = 'your text here';
const result = text.replace(regex, 'replacement');
console.log(result);`
            },
            python: {
                test: `import re

pattern = r'${this.pattern}'
text = 'your test text here'
matches = re.findall(pattern, text)
print(matches)`,
                replace: `import re

pattern = r'${this.pattern}'
text = 'your text here'
result = re.sub(pattern, 'replacement', text)
print(result)`
            }
        };

        return examples[language] || examples.javascript;
    }

    /**
     * 성능 벤치마크
     */
    benchmark(text, iterations = 1000) {
        if (!this.compile()) {
            return { error: this.lastError };
        }

        const times = [];
        
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            this.regex.test(text);
            times.push(performance.now() - start);
        }

        times.sort((a, b) => a - b);
        
        return {
            iterations,
            averageTime: times.reduce((a, b) => a + b, 0) / times.length,
            medianTime: times[Math.floor(times.length / 2)],
            minTime: times[0],
            maxTime: times[times.length - 1],
            complexity: this.calculateComplexity()
        };
    }

    /**
     * 정규식 최적화 제안
     */
    getSuggestions() {
        const suggestions = [];
        
        if (!this.pattern) return suggestions;

        // 성능 최적화 제안
        if (this.pattern.includes('.*.*')) {
            suggestions.push({
                type: 'performance',
                message: '중복된 .* 패턴이 있습니다. 하나로 합치는 것을 고려해보세요.',
                severity: 'warning'
            });
        }

        if (this.pattern.includes('[0-9]') && !this.pattern.includes('\\d')) {
            suggestions.push({
                type: 'optimization',
                message: '[0-9] 대신 \\d를 사용하면 더 간단합니다.',
                severity: 'info'
            });
        }

        // 보안 관련 제안
        if (this.isPatternDangerous(this.pattern)) {
            suggestions.push({
                type: 'security',
                message: '이 패턴은 ReDoS(Regular Expression Denial of Service) 공격에 취약할 수 있습니다.',
                severity: 'error'
            });
        }

        return suggestions;
    }
}

// 정규식 유틸리티 함수들
export const RegexUtils = {
    /**
     * 텍스트에서 매치된 부분 하이라이트
     */
    highlightMatches(text, results) {
        if (!results || results.length === 0) return text;

        let highlightedText = text;
        let offset = 0;

        results.forEach((result, index) => {
            const start = result.index + offset;
            const end = start + result.match.length;
            const highlightClass = `match-highlight match-${index}`;
            
            const before = highlightedText.slice(0, start);
            const match = highlightedText.slice(start, end);
            const after = highlightedText.slice(end);
            
            highlightedText = `${before}<span class="${highlightClass}">${match}</span>${after}`;
            offset += `<span class="${highlightClass}"></span>`.length;
        });

        return highlightedText;
    },

    /**
     * 이스케이프된 문자열을 일반 문자열로 변환
     */
    unescapeString(str) {
        return str.replace(/\\(.)/g, '$1');
    },

    /**
     * 일반 문자열을 정규식용으로 이스케이프
     */
    escapeString(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};