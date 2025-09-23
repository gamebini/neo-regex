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
     * 실제 테스트 실행
     */
    executeTest(text) {
        const matches = [];
        const results = [];
        
        if (this.flags.includes('g')) {
            // 전역 검색
            let match;
            let iterations = 0;
            const maxIterations = this.options.maxMatches;
            
            while ((match = this.regex.exec(text)) !== null && iterations < maxIterations) {
                const matchResult = this.processMatch(match, text);
                matches.push(matchResult.match);
                results.push(matchResult.result);
                
                // 무한 루프 방지
                if (match[0].length === 0) {
                    this.regex.lastIndex++;
                }
                
                iterations++;
            }
        } else {
            // 단일 검색
            const match = this.regex.exec(text);
            if (match) {
                const matchResult = this.processMatch(match, text);
                matches.push(matchResult.match);
                results.push(matchResult.result);
            }
        }

        return { matches, results };
    }

    /**
     * 매치 결과 처리
     */
    processMatch(match, text) {
        const matchData = {
            text: match[0],
            index: match.index,
            length: match[0].length,
            groups: match.slice(1),
            namedGroups: match.groups || {},
            input: text
        };

        const result = {
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            namedGroups: match.groups || {},
            before: text.slice(0, match.index),
            after: text.slice(match.index + match[0].length)
        };

        return { match: matchData, result };
    }

    /**
     * 위험한 패턴 검사 (ReDoS 방지)
     */
    isPatternDangerous(pattern) {
        const dangerousPatterns = [
            /(\+|\*|\{[0-9,]+\})\s*(\+|\*|\{[0-9,]+\})/,  // 중첩된 수량자
            /(\([^)]*\+[^)]*\))\+/,                        // (a+)+
            /(\([^)]*\*[^)]*\))\*/,                        // (a*)*
            /(\([^)]*\+[^)]*\))\{[0-9,]+\}/,              // (a+){n,m}
            /\.\*\.\*/,                                     // .*.*
            /\.\+\.\+/,                                     // .+.+
            /\(\.\*\)\+/,                                   // (.*)+
            /\(\.\+\)\+/                                    // (.+)+
        ];

        return dangerousPatterns.some(dangerous => dangerous.test(pattern));
    }

    /**
     * 에러 결과 생성
     */
    createErrorResult() {
        return {
            success: false,
            error: this.lastError,
            matches: [],
            results: [],
            executionTime: this.executionTime,
            pattern: this.pattern,
            flags: this.flags,
            statistics: null
        };
    }

    /**
     * 통계 계산
     */
    calculateStatistics(results, text) {
        if (!results || results.length === 0) {
            return {
                totalMatches: 0,
                averageLength: 0,
                totalLength: 0,
                coverage: 0,
                positions: [],
                uniqueMatches: 0
            };
        }

        const lengths = results.map(r => r.match.length);
        const totalLength = lengths.reduce((a, b) => a + b, 0);
        const uniqueMatches = new Set(results.map(r => r.match)).size;

        return {
            totalMatches: results.length,
            averageLength: totalLength / results.length,
            totalLength: totalLength,
            coverage: (totalLength / text.length) * 100,
            positions: results.map(r => ({ start: r.index, end: r.index + r.match.length })),
            uniqueMatches: uniqueMatches
        };
    }

    /**
     * 텍스트 하이라이트
     */
    highlightMatches(text, className = 'match') {
        if (!this.regex) {
            return this.escapeHtml(text);
        }

        const testResult = this.test(text);
        if (!testResult.success || testResult.results.length === 0) {
            return this.escapeHtml(text);
        }

        let highlightedText = '';
        let lastIndex = 0;

        testResult.results.forEach((result, index) => {
            // 매치 이전 텍스트
            highlightedText += this.escapeHtml(text.slice(lastIndex, result.index));
            
            // 하이라이트된 매치
            highlightedText += `<span class="${className}" data-match="${index}" title="Match ${index + 1}: ${this.escapeHtml(result.match)}">${this.escapeHtml(result.match)}</span>`;
            
            lastIndex = result.index + result.match.length;
        });

        // 마지막 매치 이후 텍스트
        highlightedText += this.escapeHtml(text.slice(lastIndex));

        return highlightedText;
    }

    /**
     * HTML 이스케이프
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 패턴 분석
     */
    analyzePattern() {
        if (!this.pattern) {
            return {
                complexity: 0,
                components: [],
                suggestions: [],
                explanation: ''
            };
        }

        const components = [];
        const suggestions = [];
        let complexity = 0;

        // 앵커 분석
        if (this.pattern.startsWith('^')) {
            components.push({ type: 'anchor', value: '^', description: '문자열 시작' });
            complexity += 1;
        }
        if (this.pattern.endsWith('$')) {
            components.push({ type: 'anchor', value: '$', description: '문자열 끝' });
            complexity += 1;
        }

        // 수량자 분석
        const quantifiers = this.pattern.match(/[+*?{}]/g) || [];
        quantifiers.forEach(q => {
            components.push({ type: 'quantifier', value: q, description: this.getQuantifierDescription(q) });
            complexity += 2;
        });

        // 문자 클래스 분석
        const charClasses = this.pattern.match(/\[[^\]]*\]/g) || [];
        charClasses.forEach(cc => {
            components.push({ type: 'character_class', value: cc, description: '문자 클래스' });
            complexity += 1.5;
        });

        // 그룹 분석
        const groups = this.pattern.match(/\([^)]*\)/g) || [];
        groups.forEach((group, index) => {
            components.push({ 
                type: 'group', 
                value: group, 
                description: `그룹 ${index + 1}`,
                capturing: !group.startsWith('(?:')
            });
            complexity += 3;
        });

        // 백슬래시 시퀀스 분석
        const escapeSequences = this.pattern.match(/\\[dwsWDS]/g) || [];
        escapeSequences.forEach(seq => {
            components.push({ 
                type: 'escape', 
                value: seq, 
                description: this.getEscapeDescription(seq) 
            });
            complexity += 1;
        });

        // 제안사항 생성
        if (quantifiers.length > 5) {
            suggestions.push('수량자가 많아 성능에 영향을 줄 수 있습니다.');
        }
        if (groups.length > 3) {
            suggestions.push('그룹이 너무 많습니다. 비캡처링 그룹(?:) 사용을 고려해보세요.');
        }
        if (this.pattern.includes('.*.*')) {
            suggestions.push('중첩된 와일드카드는 성능 문제를 일으킬 수 있습니다.');
        }
        if (this.isPatternDangerous(this.pattern)) {
            suggestions.push('ReDoS 공격에 취약할 수 있는 패턴입니다.');
        }

        return {
            complexity: Math.round(complexity),
            components: components,
            suggestions: suggestions,
            explanation: this.generateExplanation(components)
        };
    }

    /**
     * 수량자 설명 반환
     */
    getQuantifierDescription(quantifier) {
        const descriptions = {
            '+': '1개 이상',
            '*': '0개 이상',
            '?': '0개 또는 1개',
            '{': '지정된 횟수'
        };
        return descriptions[quantifier] || '수량자';
    }

    /**
     * 이스케이프 시퀀스 설명 반환
     */
    getEscapeDescription(escape) {
        const descriptions = {
            '\\d': '숫자 (0-9)',
            '\\w': '단어 문자 (a-z, A-Z, 0-9, _)',
            '\\s': '공백 문자',
            '\\D': '숫자가 아닌 문자',
            '\\W': '단어 문자가 아닌 문자',
            '\\S': '공백이 아닌 문자'
        };
        return descriptions[escape] || '이스케이프 문자';
    }

    /**
     * 패턴 설명 생성
     */
    generateExplanation(components) {
        if (components.length === 0) {
            return '단순한 문자열 매칭';
        }

        const explanations = [];
        
        const anchors = components.filter(c => c.type === 'anchor');
        if (anchors.length > 0) {
            explanations.push('위치 고정: ' + anchors.map(a => a.description).join(', '));
        }

        const groups = components.filter(c => c.type === 'group');
        if (groups.length > 0) {
            explanations.push(`${groups.length}개의 그룹 사용`);
        }

        const quantifiers = components.filter(c => c.type === 'quantifier');
        if (quantifiers.length > 0) {
            explanations.push('반복 패턴 포함');
        }

        const charClasses = components.filter(c => c.type === 'character_class');
        if (charClasses.length > 0) {
            explanations.push('문자 집합 사용');
        }

        return explanations.join(', ') || '기본 패턴';
    }

    /**
     * 성능 측정
     */
    measurePerformance(text, iterations = 1000) {
        if (!this.compile()) {
            return {
                error: this.lastError,
                averageTime: 0,
                totalTime: 0,
                iterations: 0
            };
        }

        const times = [];
        
        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            try {
                this.regex.test(text);
            } catch (error) {
                return {
                    error: error.message,
                    averageTime: 0,
                    totalTime: 0,
                    iterations: i
                };
            }
            times.push(performance.now() - start);
        }

        const totalTime = times.reduce((a, b) => a + b, 0);
        const averageTime = totalTime / times.length;

        return {
            averageTime: averageTime,
            totalTime: totalTime,
            iterations: times.length,
            minTime: Math.min(...times),
            maxTime: Math.max(...times),
            standardDeviation: this.calculateStandardDeviation(times, averageTime)
        };
    }

    /**
     * 표준 편차 계산
     */
    calculateStandardDeviation(values, mean) {
        const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
        const avgSquaredDiff = squaredDifferences.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(avgSquaredDiff);
    }

    /**
     * 패턴 최적화 제안
     */
    optimizationSuggestions() {
        const suggestions = [];
        
        if (!this.pattern) {
            return suggestions;
        }

        // 비효율적인 패턴 검사
        if (this.pattern.includes('.*')) {
            suggestions.push({
                type: 'performance',
                message: '.* 대신 더 구체적인 패턴을 사용하세요',
                severity: 'medium'
            });
        }

        if (this.pattern.includes('(.)')) {
            suggestions.push({
                type: 'performance',
                message: '단일 문자 그룹 대신 직접 매칭을 사용하세요',
                severity: 'low'
            });
        }

        // 캐릭터 클래스 최적화
        if (this.pattern.includes('[0-9]')) {
            suggestions.push({
                type: 'optimization',
                message: '[0-9] 대신 \\d를 사용하세요',
                severity: 'low'
            });
        }

        // 불필요한 이스케이프
        const unnecessaryEscapes = this.pattern.match(/\\[a-zA-Z0-9]/g) || [];
        if (unnecessaryEscapes.some(esc => !'\\dwsWDS'.includes(esc))) {
            suggestions.push({
                type: 'syntax',
                message: '불필요한 이스케이프를 제거하세요',
                severity: 'low'
            });
        }

        return suggestions;
    }

    /**
     * 디버그 정보
     */
    getDebugInfo() {
        return {
            pattern: this.pattern,
            flags: this.flags,
            compiledRegex: this.regex ? this.regex.toString() : null,
            lastError: this.lastError,
            executionTime: this.executionTime,
            options: this.options,
            analysis: this.analyzePattern(),
            isDangerous: this.isPatternDangerous(this.pattern)
        };
    }
}

// 유틸리티 함수들
export const RegexUtils = {
    /**
     * 정규식 이스케이프
     */
    escape(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\        // 수량자 분석
        const quantifiers = this.pattern.match(/[+*?{}]/g) || [];
        quant');
    },

    /**
     * 플래그 유효성 검사
     */
    validateFlags(flags) {
        const validFlags = 'gimuysd';
        return flags.split('').every(flag => validFlags.includes(flag));
    },

    /**
     * 패턴 난이도 계산
     */
    calculateDifficulty(pattern) {
        let score = 0;
        
        // 길이
        score += Math.min(pattern.length * 0.1, 5);
        
        // 특수 문자
        score += (pattern.match(/[.*+?^${}()|[\]\\]/g) || []).length;
        
        // 그룹
        score += (pattern.match(/\(/g) || []).length * 2;
        
        // 수량자
        score += (pattern.match(/[+*?{}]/g) || []).length;
        
        if (score < 5) return 'easy';
        if (score < 15) return 'medium';
        return 'hard';
    },

    /**
     * 공통 패턴 감지
     */
    detectCommonPatterns(pattern) {
        const patterns = {
            email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            url: /^https?:\/\//,
            phone: /^\+?[\d\s\-\(\)]+$/,
            date: /^\d{4}-\d{2}-\d{2}$/,
            time: /^\d{2}:\d{2}(:\d{2})?$/,
            ipv4: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
            hexColor: /^#[0-9a-fA-F]{3,6}$/
        };

        for (const [name, regex] of Object.entries(patterns)) {
            if (regex.test(pattern)) {
                return name;
            }
        }

        return null;
    },

    /**
     * 패턴 유사도 계산
     */
    calculateSimilarity(pattern1, pattern2) {
        const len1 = pattern1.length;
        const len2 = pattern2.length;
        const matrix = Array(len2 + 1).fill().map(() => Array(len1 + 1).fill(0));

        for (let i = 0; i <= len1; i++) matrix[0][i] = i;
        for (let j = 0; j <= len2; j++) matrix[j][0] = j;

        for (let j = 1; j <= len2; j++) {
            for (let i = 1; i <= len1; i++) {
                const cost = pattern1[i - 1] === pattern2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j - 1][i] + 1,     // deletion
                    matrix[j][i - 1] + 1,     // insertion
                    matrix[j - 1][i - 1] + cost // substitution
                );
            }
        }

        const maxLen = Math.max(len1, len2);
        return maxLen === 0 ? 1 : 1 - matrix[len2][len1] / maxLen;
    }
};

// Export default
export default RegexEngine;