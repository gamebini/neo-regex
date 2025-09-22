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
                matches: []
            };
        }

        try {
            const startTime = performance.now();
            
            // 정규식 생성
            const regex = new RegExp(this.pattern, this.flags);
            
            // 매칭 실행
            const matches = this._findMatches(regex, this.testText);
            
            const endTime = performance.now();
            this.performance.executionTime = endTime - startTime;
            
            // 복잡도 계산
            this.performance.complexity = this._calculateComplexity(this.pattern);
            
            // 백트래킹 위험도 평가
            this.performance.backtrackingRisk = this._assessBacktrackingRisk(this.pattern);

            const result = {
                success: true,
                pattern: this.pattern,
                flags: this.flags,
                testText: this.testText,
                matches: matches,
                performance: { ...this.performance },
                groups: this._extractGroups(matches),
                statistics: this._generateStatistics(matches)
            };

            this.lastResult = result;
            return result;

        } catch (error) {
            return {
                success: false,
                error: error.message,
                matches: [],
                suggestions: this._getErrorSuggestions(error.message)
            };
        }
    }

    /**
     * 매치 찾기 (내부 메서드)
     * @param {RegExp} regex - 정규식 객체
     * @param {string} text - 테스트 텍스트
     * @returns {Array} 매치 배열
     */
    _findMatches(regex, text) {
        const matches = [];
        
        if (this.flags.includes('g')) {
            // 전역 검색
            let match;
            while ((match = regex.exec(text)) !== null) {
                matches.push({
                    match: match[0],
                    index: match.index,
                    groups: match.slice(1),
                    namedGroups: match.groups || {},
                    input: match.input
                });
                
                // 무한 루프 방지
                if (match[0].length === 0) {
                    regex.lastIndex++;
                }
            }
        } else {
            // 단일 검색
            const match = regex.exec(text);
            if (match) {
                matches.push({
                    match: match[0],
                    index: match.index,
                    groups: match.slice(1),
                    namedGroups: match.groups || {},
                    input: match.input
                });
            }
        }
        
        return matches;
    }

    /**
     * 복잡도 계산
     * @param {string} pattern - 정규식 패턴
     * @returns {number} 복잡도 점수 (1-10)
     */
    _calculateComplexity(pattern) {
        let score = 1;
        
        // 기본 복잡도 요소들
        const complexityFactors = {
            quantifiers: /[*+?{]/g,
            characterClasses: /\[[^\]]+\]/g,
            groups: /\([^)]*\)/g,
            alternatives: /\|/g,
            anchors: /[\^$]/g,
            lookaround: /\(\?[=!<]/g,
            backref: /\\[1-9]/g,
            escapes: /\\[dwsWDS]/g
        };

        for (const [factor, regex] of Object.entries(complexityFactors)) {
            const matches = pattern.match(regex);
            if (matches) {
                switch (factor) {
                    case 'quantifiers':
                        score += matches.length * 0.5;
                        break;
                    case 'characterClasses':
                        score += matches.length * 0.3;
                        break;
                    case 'groups':
                        score += matches.length * 0.4;
                        break;
                    case 'alternatives':
                        score += matches.length * 0.6;
                        break;
                    case 'lookaround':
                        score += matches.length * 1.0;
                        break;
                    case 'backref':
                        score += matches.length * 0.8;
                        break;
                    default:
                        score += matches.length * 0.2;
                }
            }
        }

        // 중첩된 수량자 검사 (재앙적 백트래킹 위험)
        if (pattern.match(/\([^)]*[*+]\)[*+?]|\([^)]*[*+]\{/)) {
            score += 3;
        }

        return Math.min(Math.round(score), 10);
    }

    /**
     * 백트래킹 위험도 평가
     * @param {string} pattern - 정규식 패턴
     * @returns {string} 위험도 ('low', 'medium', 'high', 'critical')
     */
    _assessBacktrackingRisk(pattern) {
        // 재앙적 백트래킹 패턴들
        const catastrophicPatterns = [
            /\([^)]*\*\)[*+]/,  // (a*)*
            /\([^)]*\+\)[*+]/,  // (a+)+
            /\([^)]*[*+]\)[*+]\?/,  // (a+)+?
        ];

        for (const dangerousPattern of catastrophicPatterns) {
            if (pattern.match(dangerousPattern)) {
                return 'critical';
            }
        }

        // 높은 위험 패턴들
        const highRiskPatterns = [
            /\.\*\.\*/,  // .*.*
            /\.\+\.\+/,  // .+.+
            /\([^)]*\.\*[^)]*\)[*+]/,  // (.*)+ 같은 패턴
        ];

        for (const highRisk of highRiskPatterns) {
            if (pattern.match(highRisk)) {
                return 'high';
            }
        }

        // 중간 위험 패턴들
        const mediumRiskPatterns = [
            /\.\*/,  // .*
            /\.\+/,  // .+
            /\([^)]*[*+][^)]*\)/,  // 그룹 내 수량자
        ];

        for (const mediumRisk of mediumRiskPatterns) {
            if (pattern.match(mediumRisk)) {
                return 'medium';
            }
        }

        return 'low';
    }

    /**
     * 그룹 정보 추출
     * @param {Array} matches - 매치 배열
     * @returns {Object} 그룹 정보
     */
    _extractGroups(matches) {
        if (!matches.length) return {};

        const groups = {};
        const namedGroups = {};

        // 각 매치에서 그룹 정보 수집
        matches.forEach((match, matchIndex) => {
            match.groups.forEach((group, groupIndex) => {
                if (group !== undefined) {
                    const groupKey = groupIndex + 1;
                    if (!groups[groupKey]) {
                        groups[groupKey] = [];
                    }
                    groups[groupKey].push({
                        value: group,
                        matchIndex: matchIndex,
                        startIndex: match.input.indexOf(group, match.index)
                    });
                }
            });

            // 명명된 그룹 처리
            Object.entries(match.namedGroups).forEach(([name, value]) => {
                if (value !== undefined) {
                    if (!namedGroups[name]) {
                        namedGroups[name] = [];
                    }
                    namedGroups[name].push({
                        value: value,
                        matchIndex: matchIndex
                    });
                }
            });
        });

        return { numbered: groups, named: namedGroups };
    }

    /**
     * 통계 정보 생성
     * @param {Array} matches - 매치 배열
     * @returns {Object} 통계 정보
     */
    _generateStatistics(matches) {
        if (!matches.length) {
            return {
                totalMatches: 0,
                averageLength: 0,
                coverage: 0,
                positions: []
            };
        }

        const totalLength = matches.reduce((sum, match) => sum + match.match.length, 0);
        const positions = matches.map(match => ({
            start: match.index,
            end: match.index + match.match.length
        }));

        // 텍스트 커버리지 계산
        const coveredChars = new Set();
        matches.forEach(match => {
            for (let i = match.index; i < match.index + match.match.length; i++) {
                coveredChars.add(i);
            }
        });

        const coverage = this.testText.length > 0 
            ? (coveredChars.size / this.testText.length) * 100 
            : 0;

        return {
            totalMatches: matches.length,
            averageLength: totalLength / matches.length,
            coverage: Math.round(coverage * 100) / 100,
            positions: positions,
            totalCoveredChars: coveredChars.size
        };
    }

    /**
     * 에러 제안 생성
     * @param {string} errorMessage - 에러 메시지
     * @returns {Array} 제안 배열
     */
    _getErrorSuggestions(errorMessage) {
        const suggestions = [];
        
        if (errorMessage.includes('Unterminated character class')) {
            suggestions.push('문자 클래스 [...]를 올바르게 닫아주세요.');
            suggestions.push('예시: [a-z]처럼 대괄호를 정확히 닫아야 합니다.');
        }
        
        if (errorMessage.includes('Unterminated group')) {
            suggestions.push('그룹 (...)을 올바르게 닫아주세요.');
            suggestions.push('예시: (abc)처럼 괄호를 정확히 닫아야 합니다.');
        }
        
        if (errorMessage.includes('Invalid escape sequence')) {
            suggestions.push('잘못된 이스케이프 시퀀스입니다.');
            suggestions.push('유효한 이스케이프: \\n, \\t, \\r, \\s, \\d, \\w 등');
        }
        
        if (errorMessage.includes('Nothing to repeat')) {
            suggestions.push('수량자(*, +, ?) 앞에 반복할 요소가 있어야 합니다.');
            suggestions.push('예시: a+ (a를 1번 이상), (abc)* (abc를 0번 이상)');
        }
        
        if (errorMessage.includes('Invalid quantifier')) {
            suggestions.push('수량자 형태를 확인해주세요.');
            suggestions.push('올바른 형태: {3}, {1,5}, {2,} 등');
        }

        return suggestions;
    }

    /**
     * 패턴 최적화 제안
     * @returns {Array} 최적화 제안 배열
     */
    getOptimizationSuggestions() {
        const suggestions = [];
        
        if (!this.pattern) return suggestions;

        // 재앙적 백트래킹 검사
        if (this._assessBacktrackingRisk(this.pattern) === 'critical') {
            suggestions.push({
                type: 'critical',
                issue: '재앙적 백트래킹 위험',
                current: this.pattern,
                suggestion: '원자 그룹이나 소유적 수량자를 사용하세요',
                priority: 'high'
            });
        }

        // 비효율적인 패턴 검사
        if (this.pattern.includes('.*.*')) {
            suggestions.push({
                type: 'performance',
                issue: '중복된 .* 패턴',
                current: '.*.*',
                suggestion: '.*',
                priority: 'medium'
            });
        }

        // 불필요한 캡처 그룹
        const groups = this.pattern.match(/\([^?][^)]*\)/g);
        if (groups && groups.length > 3) {
            suggestions.push({
                type: 'optimization',
                issue: '많은 캡처 그룹이 성능에 영향을 줄 수 있습니다',
                suggestion: '필요없는 그룹은 (?:...)로 변경하세요',
                priority: 'low'
            });
        }

        // 앵커 사용 권장
        if (!this.pattern.startsWith('^') && !this.pattern.endsWith('$')) {
            if (this.pattern.length > 10) {
                suggestions.push({
                    type: 'optimization',
                    issue: '앵커(^, $) 사용으로 성능을 향상시킬 수 있습니다',
                    suggestion: '문자열 전체 매칭시 ^패턴$을 사용하세요',
                    priority: 'low'
                });
            }
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
            explanations.push('(): 그룹 - 괄호 안의 패턴을 하나의 단위로 처리하고 결과를 캡처');
        }

        return explanations.join('\n');
    }

    /**
     * 코드 생성
     * @param {string} language - 대상 언어
     * @returns {string} 생성된 코드
     */
    generateCode(language = 'javascript') {
        const pattern = this.pattern;
        const flags = this.flags;
        
        const codeTemplates = {
            javascript: `// JavaScript 정규식 코드
const pattern = /${pattern}/${flags};
const text = "${this.testText.replace(/"/g, '\\"')}";

// 매칭 테스트
if (pattern.test(text)) {
    console.log('매칭됨');
}

// 모든 매치 찾기
const matches = text.match(pattern);
console.log('매치 결과:', matches);`,

            python: `# Python 정규식 코드
import re

pattern = r"${pattern}"
text = "${this.testText.replace(/"/g, '\\"')}"
flags = ${this._convertFlagsToPython(flags)}

# 매칭 테스트
if re.search(pattern, text, flags):
    print("매칭됨")

# 모든 매치 찾기
matches = re.findall(pattern, text, flags)
print("매치 결과:", matches)`,

            java: `// Java 정규식 코드
import java.util.regex.Pattern;
import java.util.regex.Matcher;

String pattern = "${pattern.replace(/"/g, '\\"')}";
String text = "${this.testText.replace(/"/g, '\\"')}";
int flags = ${this._convertFlagsToJava(flags)};

Pattern p = Pattern.compile(pattern, flags);
Matcher m = p.matcher(text);

// 매칭 테스트
if (m.find()) {
    System.out.println("매칭됨");
}

// 모든 매치 찾기
m.reset();
while (m.find()) {
    System.out.println("매치: " + m.group());
}`,

            csharp: `// C# 정규식 코드
using System;
using System.Text.RegularExpressions;

string pattern = @"${pattern.replace(/"/g, '\\"')}";
string text = @"${this.testText.replace(/"/g, '\\"')}";
RegexOptions options = ${this._convertFlagsToCSharp(flags)};

Regex regex = new Regex(pattern, options);

// 매칭 테스트
if (regex.IsMatch(text)) {
    Console.WriteLine("매칭됨");
}

// 모든 매치 찾기
MatchCollection matches = regex.Matches(text);
foreach (Match match in matches) {
    Console.WriteLine($"매치: {match.Value}");
}`,

            php: `<?php
// PHP 정규식 코드
$pattern = '/${pattern.replace(/\//g, '\\/')}/${flags}';
$text = "${this.testText.replace(/"/g, '\\"')}";

// 매칭 테스트
if (preg_match($pattern, $text)) {
    echo "매칭됨\\n";
}

// 모든 매치 찾기
if (preg_match_all($pattern, $text, $matches)) {
    print_r($matches[0]);
}
?>`
        };

        return codeTemplates[language] || codeTemplates.javascript;
    }

    /**
     * Python 플래그 변환
     * @param {string} flags - JavaScript 플래그
     * @returns {string} Python 플래그
     */
    _convertFlagsToPython(flags) {
        const flagMap = {
            'i': 're.IGNORECASE',
            'm': 're.MULTILINE',
            's': 're.DOTALL',
            'x': 're.VERBOSE'
        };
        
        const pythonFlags = [];
        for (const flag of flags) {
            if (flagMap[flag]) {
                pythonFlags.push(flagMap[flag]);
            }
        }
        
        return pythonFlags.length > 0 ? pythonFlags.join(' | ') : '0';
    }

    /**
     * Java 플래그 변환
     * @param {string} flags - JavaScript 플래그
     * @returns {string} Java 플래그
     */
    _convertFlagsToJava(flags) {
        const flagMap = {
            'i': 'Pattern.CASE_INSENSITIVE',
            'm': 'Pattern.MULTILINE',
            's': 'Pattern.DOTALL'
        };
        
        const javaFlags = [];
        for (const flag of flags) {
            if (flagMap[flag]) {
                javaFlags.push(flagMap[flag]);
            }
        }
        
        return javaFlags.length > 0 ? javaFlags.join(' | ') : '0';
    }

    /**
     * C# 플래그 변환
     * @param {string} flags - JavaScript 플래그
     * @returns {string} C# 플래그
     */
    _convertFlagsToCSharp(flags) {
        const flagMap = {
            'i': 'RegexOptions.IgnoreCase',
            'm': 'RegexOptions.Multiline',
            's': 'RegexOptions.Singleline'
        };
        
        const csharpFlags = [];
        for (const flag of flags) {
            if (flagMap[flag]) {
                csharpFlags.push(flagMap[flag]);
            }
        }
        
        return csharpFlags.length > 0 ? csharpFlags.join(' | ') : 'RegexOptions.None';
    }

    /**
     * 성능 벤치마크
     * @param {number} iterations - 반복 횟수
     * @returns {Object} 벤치마크 결과
     */
    benchmark(iterations = 1000) {
        if (!this.pattern || !this.testText) {
            return { error: '패턴과 테스트 텍스트가 필요합니다.' };
        }

        const results = [];
        const regex = new RegExp(this.pattern, this.flags);

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            regex.test(this.testText);
            const end = performance.now();
            results.push(end - start);
        }

        const totalTime = results.reduce((sum, time) => sum + time, 0);
        const averageTime = totalTime / iterations;
        const minTime = Math.min(...results);
        const maxTime = Math.max(...results);

        return {
            iterations,
            totalTime: totalTime.toFixed(3),
            averageTime: averageTime.toFixed(3),
            minTime: minTime.toFixed(3),
            maxTime: maxTime.toFixed(3),
            complexity: this.performance.complexity,
            backtrackingRisk: this.performance.backtrackingRisk
        };
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
            backtrackingRisk: this.performance.backtrackingRisk
        };
    }

    /**
     * 패턴 유효성 검증
     * @param {string} pattern - 검증할 패턴
     * @returns {Object} 검증 결과
     */
    static validatePattern(pattern) {
        try {
            new RegExp(pattern);
            return { 
                valid: true, 
                error: null,
                complexity: new RegexEngine()._calculateComplexity(pattern)
            };
        } catch (error) {
            return { 
                valid: false, 
                error: error.message,
                suggestions: new RegexEngine()._getErrorSuggestions(error.message)
            };
        }
    }

    /**
     * 일반적인 패턴 라이브러리
     * @returns {Object} 패턴 라이브러리
     */
    static getCommonPatterns() {
        return {
            email: {
                pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                description: '기본 이메일 패턴'
            },
            phone: {
                pattern: '^\\+?[1-9]\\d{1,14}$',
                description: '국제 전화번호 패턴'
            },
            url: {
                pattern: '^https?:\\/\\/[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
                description: 'URL 패턴'
            },
            ipv4: {
                pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
                description: 'IPv4 주소 패턴'
            },
            date: {
                pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
                description: 'YYYY-MM-DD 날짜 패턴'
            }
        };
    }
}

// =========================
// 전역 함수들
// =========================

/**
 * 빠른 정규식 테스트
 * @param {string} pattern - 정규식 패턴
 * @param {string} text - 테스트 텍스트
 * @param {string} flags - 플래그 (선택)
 * @returns {boolean} 매칭 여부
 */
function quickTest(pattern, text, flags = '') {
    try {
        const regex = new RegExp(pattern, flags);
        return regex.test(text);
    } catch (error) {
        console.error('정규식 오류:', error.message);
        return false;
    }
}

/**
 * 정규식에서 모든 매치 찾기
 * @param {string} pattern - 정규식 패턴
 * @param {string} text - 테스트 텍스트
 * @param {string} flags - 플래그 (선택)
 * @returns {Array} 매치 배열
 */
function findAllMatches(pattern, text, flags = 'g') {
    try {
        const regex = new RegExp(pattern, flags);
        return [...text.matchAll(regex)];
    } catch (error) {
        console.error('정규식 오류:', error.message);
        return [];
    }
}

/**
 * 문자열에서 정규식으로 치환
 * @param {string} text - 원본 텍스트
 * @param {string} pattern - 정규식 패턴
 * @param {string} replacement - 치환할 문자열
 * @param {string} flags - 플래그 (선택)
 * @returns {string} 치환된 텍스트
 */
function regexReplace(text, pattern, replacement, flags = 'g') {
    try {
        const regex = new RegExp(pattern, flags);
        return text.replace(regex, replacement);
    } catch (error) {
        console.error('정규식 오류:', error.message);
        return text;
    }
}

/**
 * 정규식 이스케이프
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// =========================
// 내보내기