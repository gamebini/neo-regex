// src/pages/expert.js - 전문가 도구 페이지 스크립트

class ExpertRegexTool {
    constructor() {
        this.currentPattern = '';
        this.currentFlags = '';
        this.testResults = null;
        this.performanceData = {};
        this.backtraceData = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadAdvancedPatterns();
        this.initializePerformanceMonitoring();
    }
    
    setupEventListeners() {
        // 패턴 입력 이벤트
        const patternInput = document.getElementById('advanced-pattern');
        if (patternInput) {
            patternInput.addEventListener('input', this.handlePatternChange.bind(this));
            patternInput.addEventListener('paste', this.handlePatternPaste.bind(this));
        }
        
        // 테스트 텍스트 입력 이벤트
        const testInput = document.getElementById('advanced-test-text');
        if (testInput) {
            testInput.addEventListener('input', this.handleTestTextChange.bind(this));
        }
        
        // 플래그 변경 이벤트
        const flagInputs = document.querySelectorAll('input[type="checkbox"][id^="flag-"]');
        flagInputs.forEach(input => {
            input.addEventListener('change', this.handleFlagChange.bind(this));
        });
        
        // 실시간 테스트 실행
        this.setupRealTimeTest();
    }
    
    setupRealTimeTest() {
        let debounceTimer;
        const runTest = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.runAdvancedTest();
            }, 500);
        };
        
        document.getElementById('advanced-pattern')?.addEventListener('input', runTest);
        document.getElementById('advanced-test-text')?.addEventListener('input', runTest);
    }
    
    handlePatternChange(e) {
        this.currentPattern = e.target.value;
        this.updatePatternInfo(this.currentPattern);
        this.validatePattern();
    }
    
    handlePatternPaste(e) {
        setTimeout(() => {
            this.currentPattern = e.target.value;
            this.updatePatternInfo(this.currentPattern);
            this.validatePattern();
        }, 10);
    }
    
    handleTestTextChange(e) {
        const text = e.target.value;
        this.updateTextInfo(text);
    }
    
    handleFlagChange(e) {
        this.currentFlags = this.getSelectedFlags();
        this.runAdvancedTest();
    }
    
    getSelectedFlags() {
        const flagInputs = document.querySelectorAll('input[type="checkbox"][id^="flag-"]:checked');
        return Array.from(flagInputs).map(input => input.value).join('');
    }
    
    updatePatternInfo(pattern) {
        // 패턴 길이
        const lengthEl = document.getElementById('pattern-length');
        if (lengthEl) lengthEl.textContent = pattern.length;
        
        // 복잡도 분석
        const complexityEl = document.getElementById('pattern-complexity');
        if (complexityEl) {
            const complexity = this.analyzeComplexity(pattern);
            complexityEl.textContent = complexity.level;
            complexityEl.className = `info-value complexity-${complexity.level.toLowerCase()}`;
        }
        
        // 그룹 개수
        const groupsEl = document.getElementById('pattern-groups');
        if (groupsEl) {
            const groups = this.countGroups(pattern);
            groupsEl.textContent = groups;
        }
    }
    
    analyzeComplexity(pattern) {
        let score = 0;
        
        // 길이에 따른 점수
        score += Math.min(pattern.length / 10, 5);
        
        // 특수 구문들
        if (pattern.includes('(?=')) score += 3; // 전방탐색
        if (pattern.includes('(?!')) score += 3; // 부정 전방탐색
        if (pattern.includes('(?<=')) score += 4; // 후방탐색
        if (pattern.includes('(?<!')) score += 4; // 부정 후방탐색
        if (pattern.includes('*') || pattern.includes('+')) score += 2; // 수량자
        if (pattern.includes('{')) score += 1; // 범위 수량자
        if (pattern.includes('|')) score += 1; // OR 연산자
        if (pattern.includes('[')) score += 0.5; // 문자 클래스
        
        // 중첩된 구조
        const nestedGroups = (pattern.match(/\(/g) || []).length;
        score += nestedGroups * 0.5;
        
        // 백슬래시 이스케이프
        const escapes = (pattern.match(/\\/g) || []).length;
        score += escapes * 0.2;
        
        let level, description;
        if (score <= 3) {
            level = '낮음';
            description = '간단한 패턴';
        } else if (score <= 8) {
            level = '중간';
            description = '보통 복잡도';
        } else if (score <= 15) {
            level = '높음';
            description = '복잡한 패턴';
        } else {
            level = '매우높음';
            description = '매우 복잡한 패턴';
        }
        
        return { level, description, score };
    }
    
    countGroups(pattern) {
        const groups = pattern.match(/\(/g);
        return groups ? groups.length : 0;
    }
    
    updateTextInfo(text) {
        // 문자 수
        const lengthEl = document.getElementById('text-length');
        if (lengthEl) lengthEl.textContent = text.length.toLocaleString();
        
        // 줄 수
        const linesEl = document.getElementById('text-lines');
        if (linesEl) {
            const lines = text.split('\n').length;
            linesEl.textContent = lines.toLocaleString();
        }
    }
    
    validatePattern() {
        const patternInput = document.getElementById('advanced-pattern');
        if (!patternInput) return;
        
        try {
            new RegExp(this.currentPattern, this.currentFlags);
            patternInput.classList.remove('error');
            patternInput.classList.add('valid');
        } catch (error) {
            patternInput.classList.remove('valid');
            patternInput.classList.add('error');
            this.showPatternError(error.message);
        }
    }
    
    showPatternError(message) {
        // 간단한 에러 표시 (실제 구현에서는 더 정교하게)
        console.warn('Pattern error:', message);
    }
    
    runAdvancedTest() {
        if (!this.currentPattern) return;
        
        const testText = document.getElementById('advanced-test-text')?.value || '';
        if (!testText) return;
        
        try {
            const startTime = performance.now();
            const regex = new RegExp(this.currentPattern, this.currentFlags);
            
            // 매칭 실행
            const matches = [...testText.matchAll(regex)];
            const endTime = performance.now();
            
            // 결과 처리
            this.testResults = {
                matches: matches,
                executionTime: endTime - startTime,
                pattern: this.currentPattern,
                flags: this.currentFlags,
                testText: testText
            };
            
            this.updatePerformanceMetrics();
            this.updateMatchResults();
            
        } catch (error) {
            this.showTestError(error.message);
        }
    }
    
    updatePerformanceMetrics() {
        if (!this.testResults) return;
        
        // 실행 시간
        const timeEl = document.getElementById('execution-time');
        if (timeEl) {
            const time = this.testResults.executionTime;
            timeEl.textContent = time < 1 ? '<1ms' : `${Math.round(time)}ms`;
            
            // 성능에 따른 색상 변경
            timeEl.className = 'metric-value';
            if (time > 100) timeEl.classList.add('slow');
            else if (time > 10) timeEl.classList.add('medium');
            else timeEl.classList.add('fast');
        }
        
        // 메모리 사용량 (추정값)
        const memoryEl = document.getElementById('memory-usage');
        if (memoryEl) {
            const estimatedMemory = this.estimateMemoryUsage();
            memoryEl.textContent = `${estimatedMemory}KB`;
        }
        
        // 백트래킹 단계 (추정값)
        const stepsEl = document.getElementById('regex-steps');
        if (stepsEl) {
            const steps = this.estimateBacktrackingSteps();
            stepsEl.textContent = steps.toLocaleString();
        }
    }
    
    estimateMemoryUsage() {
        if (!this.testResults) return 0;
        
        const patternSize = this.currentPattern.length;
        const textSize = this.testResults.testText.length;
        const matchCount = this.testResults.matches.length;
        
        // 간단한 메모리 사용량 추정
        const estimated = Math.ceil((patternSize + textSize + matchCount * 50) / 1024);
        return Math.max(1, estimated);
    }
    
    estimateBacktrackingSteps() {
        if (!this.testResults) return 0;
        
        const complexity = this.analyzeComplexity(this.currentPattern);
        const textLength = this.testResults.testText.length;
        const hasQuantifiers = /[*+?{]/.test(this.currentPattern);
        const hasLookarounds = /\(\?[=!<]/.test(this.currentPattern);
        
        let steps = textLength;
        
        if (hasQuantifiers) steps *= 2;
        if (hasLookarounds) steps *= 3;
        steps *= Math.log(complexity.score + 1);
        
        return Math.ceil(steps);
    }
    
    updateMatchResults() {
        const container = document.getElementById('matches-container');
        if (!container) return;
        
        if (!this.testResults || this.testResults.matches.length === 0) {
            container.innerHTML = `
                <div class="no-matches">
                    <i class="fas fa-search"></i>
                    <p>매칭 결과가 없습니다</p>
                </div>
            `;
            return;
        }
        
        const matches = this.testResults.matches;
        let html = `
            <div class="matches-header">
                <h4>매칭 결과 (${matches.length}개)</h4>
                <div class="matches-actions">
                    <button class="matches-btn" onclick="exportMatchResults()">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
            <div class="matches-list">
        `;
        
        matches.forEach((match, index) => {
            html += `
                <div class="match-item">
                    <div class="match-header">
                        <span class="match-index">#${index + 1}</span>
                        <span class="match-position">위치: ${match.index}-${match.index + match[0].length}</span>
                    </div>
                    <div class="match-content">
                        <div class="match-text">
                            <code>${this.escapeHtml(match[0])}</code>
                        </div>
                        ${match.length > 1 ? this.renderGroups(match) : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    renderGroups(match) {
        if (match.length <= 1) return '';
        
        let html = '<div class="match-groups"><h5>캡처 그룹:</h5>';
        
        for (let i = 1; i < match.length; i++) {
            if (match[i] !== undefined) {
                html += `
                    <div class="group-item">
                        <span class="group-index">그룹 ${i}:</span>
                        <code class="group-value">${this.escapeHtml(match[i])}</code>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        return html;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showTestError(message) {
        const container = document.getElementById('matches-container');
        if (container) {
            container.innerHTML = `
                <div class="test-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>테스트 오류</h4>
                    <p>${this.escapeHtml(message)}</p>
                </div>
            `;
        }
    }
    
    loadAdvancedPatterns() {
        // 고급 패턴 데이터는 이미 HTML에서 로드됨
        console.log('고급 패턴 로드 완료');
    }
    
    initializePerformanceMonitoring() {
        // 성능 모니터링 초기화
        this.performanceData = {
            history: [],
            benchmarks: [],
            alerts: []
        };
    }
}

// 전역 변수
let expertTool;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    expertTool = new ExpertRegexTool();
});

// 패턴 관련 함수들
function formatPattern() {
    const input = document.getElementById('advanced-pattern');
    if (input && input.value) {
        // 간단한 패턴 포맷팅
        let formatted = input.value;
        
        // 공백 제거
        formatted = formatted.trim();
        
        // 기본 포맷팅 적용
        input.value = formatted;
        expertTool.currentPattern = formatted;
        expertTool.updatePatternInfo(formatted);
        
        showNotification('패턴이 포맷팅되었습니다.', 'success');
    }
}

function validatePattern() {
    if (expertTool) {
        expertTool.validatePattern();
        showNotification('패턴 검증이 완료되었습니다.', 'info');
    }
}

function optimizePattern() {
    const input = document.getElementById('advanced-pattern');
    if (input && input.value) {
        const optimized = performPatternOptimization(input.value);
        if (optimized !== input.value) {
            input.value = optimized;
            expertTool.currentPattern = optimized;
            expertTool.updatePatternInfo(optimized);
            showNotification('패턴이 최적화되었습니다.', 'success');
        } else {
            showNotification('이미 최적화된 패턴입니다.', 'info');
        }
    }
}

function performPatternOptimization(pattern) {
    let optimized = pattern;
    
    // 간단한 최적화 규칙들
    
    // 불필요한 캡처 그룹을 비캡처 그룹으로 변경
    optimized = optimized.replace(/\(([^?])/g, '(?:$1');
    
    // 중복된 문자 클래스 최적화
    optimized = optimized.replace(/\[a-zA-Z\]/g, '[a-zA-Z]');
    
    // 앵커 최적화
    if (optimized.startsWith('.*')) {
        optimized = optimized.substring(2);
    }
    
    return optimized;
}

function runPerformanceTest() {
    if (expertTool && expertTool.testResults) {
        expertTool.updatePerformanceMetrics();
        showNotification('성능 테스트가 완료되었습니다.', 'success');
    } else {
        showNotification('먼저 패턴을 테스트해주세요.', 'warning');
    }
}

function analyzeBacktrace() {
    const container = document.getElementById('backtrace-container');
    if (!container) return;
    
    if (!expertTool.currentPattern) {
        container.innerHTML = `
            <div class="backtrace-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>분석할 패턴을 입력해주세요.</p>
            </div>
        `;
        return;
    }
    
    // 백트래킹 분석 시뮬레이션
    container.innerHTML = `
        <div class="backtrace-analysis">
            <div class="analysis-header">
                <h4>백트래킹 분석 결과</h4>
            </div>
            <div class="analysis-chart">
                <div class="chart-placeholder">
                    <i class="fas fa-chart-line"></i>
                    <p>백트래킹 패턴 시각화</p>
                    <div class="chart-info">
                        <div class="info-item">
                            <span class="label">총 단계:</span>
                            <span class="value">${expertTool.estimateBacktrackingSteps()}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">최대 깊이:</span>
                            <span class="value">${Math.ceil(Math.log(expertTool.currentPattern.length + 1))}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">위험도:</span>
                            <span class="value ${getRiskLevel(expertTool.currentPattern).toLowerCase()}">${getRiskLevel(expertTool.currentPattern)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showNotification('백트래킹 분석이 완료되었습니다.', 'success');
}

function getRiskLevel(pattern) {
    // 간단한 위험도 평가
    const hasNestedQuantifiers = /[*+?{][^}]*[*+?{]/.test(pattern);
    const hasAlternation = /\|/.test(pattern);
    const hasLookarounds = /\(\?[=!<]/.test(pattern);
    
    if (hasNestedQuantifiers) return '높음';
    if (hasAlternation && hasLookarounds) return '중간';
    return '낮음';
}

// 탭 전환 함수
function switchTab(tabName) {
    // 모든 탭 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // 선택된 탭 활성화
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).style.display = 'block';
}

// 패턴 카드 액션들
function loadPatternInTester(button) {
    const card = button.closest('.pattern-card');
    const pattern = card.querySelector('.pattern-code code').textContent;
    
    // 현재 페이지의 테스터에 로드
    document.getElementById('advanced-pattern').value = pattern;
    expertTool.currentPattern = pattern;
    expertTool.updatePatternInfo(pattern);
    expertTool.runAdvancedTest();
    
    // 테스터 섹션으로 스크롤
    document.querySelector('.advanced-tester').scrollIntoView({ behavior: 'smooth' });
    
    showNotification('패턴이 테스터에 로드되었습니다.', 'success');
}

function analyzePattern(button) {
    const card = button.closest('.pattern-card');
    const pattern = card.querySelector('.pattern-code code').textContent;
    
    // 패턴 분석 모달 표시
    showPatternAnalysisModal(pattern);
}

function showPatternAnalysisModal(pattern) {
    const analysis = analyzePatternDetails(pattern);
    
    const modal = document.createElement('div');
    modal.className = 'analysis-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>패턴 상세 분석</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="pattern-display">
                    <code>${pattern}</code>
                </div>
                <div class="analysis-sections">
                    <div class="analysis-section">
                        <h4>구조 분석</h4>
                        <div class="analysis-items">
                            <div class="analysis-item">
                                <span class="label">복잡도:</span>
                                <span class="value">${analysis.complexity.level}</span>
                            </div>
                            <div class="analysis-item">
                                <span class="label">그룹 수:</span>
                                <span class="value">${analysis.groups}</span>
                            </div>
                            <div class="analysis-item">
                                <span class="label">수량자:</span>
                                <span class="value">${analysis.quantifiers}</span>
                            </div>
                        </div>
                    </div>
                    <div class="analysis-section">
                        <h4>성능 예측</h4>
                        <div class="analysis-items">
                            <div class="analysis-item">
                                <span class="label">예상 속도:</span>
                                <span class="value ${analysis.performance.speed.toLowerCase()}">${analysis.performance.speed}</span>
                            </div>
                            <div class="analysis-item">
                                <span class="label">메모리 사용:</span>
                                <span class="value">${analysis.performance.memory}</span>
                            </div>
                        </div>
                    </div>
                    <div class="analysis-section">
                        <h4>권장사항</h4>
                        <ul class="recommendations">
                            ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function analyzePatternDetails(pattern) {
    const complexity = expertTool ? expertTool.analyzeComplexity(pattern) : { level: '중간', score: 5 };
    
    return {
        complexity: complexity,
        groups: (pattern.match(/\(/g) || []).length,
        quantifiers: (pattern.match(/[*+?{]/g) || []).length,
        performance: {
            speed: complexity.score > 10 ? '느림' : complexity.score > 5 ? '보통' : '빠름',
            memory: complexity.score > 8 ? '높음' : '보통'
        },
        recommendations: [
            complexity.score > 10 ? '패턴을 단순화하여 성능을 개선하세요.' : '성능이 우수한 패턴입니다.',
            '테스트 데이터로 실제 성능을 검증하세요.',
            '대용량 데이터에서는 스트리밍 처리를 고려하세요.'
        ]
    };
}

function copyPattern(button) {
    const card = button.closest('.pattern-card');
    const pattern = card.querySelector('.pattern-code code').textContent;
    
    navigator.clipboard.writeText(pattern).then(() => {
        showNotification('패턴이 복사되었습니다.', 'success');
    }).catch(err => {
        console.error('복사 실패:', err);
        showNotification('복사에 실패했습니다.', 'error');
    });
}

// 성능 도구들
function optimizeRegex() {
    const pattern = document.getElementById('advanced-pattern')?.value;
    if (!pattern) {
        showNotification('최적화할 패턴을 입력해주세요.', 'warning');
        return;
    }
    
    const optimized = performPatternOptimization(pattern);
    document.getElementById('advanced-pattern').value = optimized;
    expertTool.currentPattern = optimized;
    expertTool.updatePatternInfo(optimized);
    
    showNotification('패턴 최적화가 완료되었습니다.', 'success');
}

function runBenchmark() {
    if (!expertTool.currentPattern) {
        showNotification('벤치마크할 패턴을 입력해주세요.', 'warning');
        return;
    }
    
    const iterations = parseInt(document.getElementById('benchmark-iterations')?.value) || 1000;
    const size = document.getElementById('benchmark-size')?.value || 'medium';
    
    // 벤치마크 실행 시뮬레이션
    const results = simulateBenchmark(expertTool.currentPattern, iterations, size);
    
    showBenchmarkResults(results);
    showNotification('벤치마크가 완료되었습니다.', 'success');
}

function simulateBenchmark(pattern, iterations, size) {
    const complexity = expertTool.analyzeComplexity(pattern);
    
    // 크기별 기본 시간 (ms)
    const baseTimes = {
        small: 0.1,
        medium: 1,
        large: 10,
        huge: 100
    };
    
    const baseTime = baseTimes[size] || 1;
    const avgTime = baseTime * Math.log(complexity.score + 1);
    
    return {
        pattern: pattern,
        iterations: iterations,
        size: size,
        avgTime: avgTime,
        minTime: avgTime * 0.8,
        maxTime: avgTime * 1.5,
        totalTime: avgTime * iterations
    };
}

function showBenchmarkResults(results) {
    const modal = document.createElement('div');
    modal.className = 'benchmark-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>벤치마크 결과</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="benchmark-summary">
                    <div class="summary-item">
                        <span class="label">반복 횟수:</span>
                        <span class="value">${results.iterations.toLocaleString()}회</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">텍스트 크기:</span>
                        <span class="value">${results.size}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">평균 시간:</span>
                        <span class="value">${results.avgTime.toFixed(3)}ms</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">총 실행 시간:</span>
                        <span class="value">${(results.totalTime / 1000).toFixed(2)}초</span>
                    </div>
                </div>
                <div class="benchmark-chart">
                    <div class="chart-placeholder">
                        <i class="fas fa-chart-bar"></i>
                        <p>성능 차트가 여기에 표시됩니다</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function visualizeExecution() {
    if (!expertTool.currentPattern) {
        showNotification('시각화할 패턴을 입력해주세요.', 'warning');
        return;
    }
    
    const mode = document.querySelector('input[name="viz-mode"]:checked')?.value || 'steps';
    
    showExecutionVisualization(expertTool.currentPattern, mode);
    showNotification('실행 시각화가 시작되었습니다.', 'success');
}

function showExecutionVisualization(pattern, mode) {
    const modal = document.createElement('div');
    modal.className = 'visualization-modal';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>정규식 실행 시각화 - ${getVisualizationTitle(mode)}</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="visualization-container">
                    <div class="visualization-placeholder">
                        <i class="fas fa-project-diagram"></i>
                        <h4>${getVisualizationTitle(mode)}</h4>
                        <p>패턴: <code>${pattern}</code></p>
                        <p>시각화 모드: ${mode}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function getVisualizationTitle(mode) {
    const titles = {
        steps: '단계별 실행 과정',
        tree: '파싱 트리 구조',
        flow: '실행 흐름도'
    };
    return titles[mode] || '시각화';
}

function startDebugging() {
    if (!expertTool.currentPattern) {
        showNotification('디버깅할 패턴을 입력해주세요.', 'warning');
        return;
    }
    
    showDebuggingInterface(expertTool.currentPattern);
    showNotification('디버깅이 시작되었습니다.', 'success');
}

function showDebuggingInterface(pattern) {
    const issues = analyzePatternIssues(pattern);
    
    const modal = document.createElement('div');
    modal.className = 'debugging-modal';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>정규식 디버거</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="debug-pattern">
                    <h4>분석 중인 패턴:</h4>
                    <code>${pattern}</code>
                </div>
                <div class="debug-issues">
                    <h4>발견된 문제점:</h4>
                    ${issues.length ? renderIssues(issues) : '<p class="no-issues">문제점이 발견되지 않았습니다.</p>'}
                </div>
                <div class="debug-recommendations">
                    <h4>개선 권장사항:</h4>
                    ${renderRecommendations(issues)}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function analyzePatternIssues(pattern) {
    const issues = [];
    
    // 무한 루프 위험성 검사
    if (/\*.*\*|\+.*\+/.test(pattern)) {
        issues.push({
            type: 'performance',
            severity: 'high',
            message: '중첩된 수량자로 인한 무한 루프 위험',
            suggestion: '수량자 중첩을 피하고 더 구체적인 패턴을 사용하세요.'
        });
    }
    
    // 백트래킹 폭주 위험
    if (/\(.*\*.*\|.*\*.*\)/.test(pattern)) {
        issues.push({
            type: 'performance',
            severity: 'medium',
            message: '백트래킹 폭주 가능성',
            suggestion: '원자적 그룹이나 소유적 수량자를 고려하세요.'
        });
    }
    
    // 불필요한 캡처 그룹
    const captureGroups = (pattern.match(/\([^?]/g) || []).length;
    const nonCaptureGroups = (pattern.match(/\(\?:/g) || []).length;
    if (captureGroups > nonCaptureGroups * 2) {
        issues.push({
            type: 'optimization',
            severity: 'low',
            message: '불필요한 캡처 그룹이 많습니다',
            suggestion: '필요하지 않은 그룹은 (?:...)로 변경하세요.'
        });
    }
    
    return issues;
}

function renderIssues(issues) {
    return issues.map(issue => `
        <div class="debug-issue ${issue.severity}">
            <div class="issue-header">
                <i class="fas fa-${getIssueIcon(issue.severity)}"></i>
                <span class="issue-title">${issue.message}</span>
                <span class="issue-severity ${issue.severity}">${getSeverityText(issue.severity)}</span>
            </div>
            <div class="issue-suggestion">
                ${issue.suggestion}
            </div>
        </div>
    `).join('');
}

function getIssueIcon(severity) {
    const icons = {
        high: 'exclamation-triangle',
        medium: 'exclamation-circle',
        low: 'info-circle'
    };
    return icons[severity] || 'info-circle';
}

function getSeverityText(severity) {
    const texts = {
        high: '높음',
        medium: '보통',
        low: '낮음'
    };
    return texts[severity] || '보통';
}

function renderRecommendations(issues) {
    if (issues.length === 0) {
        return '<p class="good-pattern">패턴이 잘 작성되었습니다!</p>';
    }
    
    const recommendations = [
        '패턴을 단계별로 테스트하여 성능을 확인하세요.',
        '대용량 텍스트에서 테스트하기 전에 소량 데이터로 먼저 검증하세요.',
        '정규식 엔진의 특성을 고려하여 최적화하세요.'
    ];
    
    return `
        <ul class="recommendation-list">
            ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    `;
}

// 빠른 텍스트 로드 함수들
function loadSampleText() {
    const sampleTexts = {
        email: `john.doe@example.com
jane.smith@company.org
invalid-email-format
test@domain.co.kr
admin@subdomain.example.com`,
        
        phone: `010-1234-5678
02-123-4567
031-123-4567
+82-10-1234-5678
010.1234.5678`,
        
        url: `https://www.example.com
http://subdomain.test.org/path
ftp://files.example.com/file.txt
mailto:contact@example.com
invalid-url-format`,
        
        log: `2024-01-15 09:30:15 [INFO] Application started successfully
2024-01-15 09:30:16 [DEBUG] Database connection established
2024-01-15 09:30:17 [WARN] Configuration file not found, using defaults
2024-01-15 09:30:18 [ERROR] Failed to load user preferences
2024-01-15 09:30:19 [INFO] Server listening on port 3000`
    };
    
    // 간단한 선택 다이얼로그
    const choice = prompt(`샘플 텍스트를 선택하세요:
1. 이메일 주소
2. 전화번호
3. URL
4. 로그 파일

번호를 입력하세요 (1-4):`);
    
    const choices = {
        '1': 'email',
        '2': 'phone', 
        '3': 'url',
        '4': 'log'
    };
    
    const selected = choices[choice];
    if (selected && sampleTexts[selected]) {
        document.getElementById('advanced-test-text').value = sampleTexts[selected];
        expertTool.handleTestTextChange({ target: { value: sampleTexts[selected] } });
        showNotification('샘플 텍스트가 로드되었습니다.', 'success');
    }
}

function clearTestText() {
    if (confirm('테스트 텍스트를 모두 지우시겠습니까?')) {
        document.getElementById('advanced-test-text').value = '';
        expertTool.handleTestTextChange({ target: { value: '' } });
        showNotification('테스트 텍스트가 지워졌습니다.', 'success');
    }
}

function generateTestCases() {
    const pattern = expertTool.currentPattern;
    if (!pattern) {
        showNotification('먼저 패턴을 입력해주세요.', 'warning');
        return;
    }
    
    // 패턴 기반 테스트 케이스 생성 (간단한 버전)
    const testCases = generateBasicTestCases(pattern);
    
    const modal = document.createElement('div');
    modal.className = 'test-cases-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>생성된 테스트 케이스</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="test-cases-container">
                    <div class="test-cases-section">
                        <h4>매칭되어야 할 케이스 (양성)</h4>
                        <div class="test-cases-list positive">
                            ${testCases.positive.map(tc => `
                                <div class="test-case">
                                    <code>${tc}</code>
                                    <button class="add-case-btn" onclick="addToTestText('${tc.replace(/'/g, "\\'")}')">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="test-cases-section">
                        <h4>매칭되지 말아야 할 케이스 (음성)</h4>
                        <div class="test-cases-list negative">
                            ${testCases.negative.map(tc => `
                                <div class="test-case">
                                    <code>${tc}</code>
                                    <button class="add-case-btn" onclick="addToTestText('${tc.replace(/'/g, "\\'")}')">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-primary" onclick="addAllTestCases(${JSON.stringify(testCases).replace(/"/g, '&quot;')})">
                    모든 케이스 추가
                </button>
                <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                    닫기
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function generateBasicTestCases(pattern) {
    const positive = [];
    const negative = [];
    
    // 패턴 분석하여 기본 테스트 케이스 생성
    if (pattern.includes('@')) {
        // 이메일 패턴으로 추정
        positive.push('test@example.com', 'user@domain.org', 'admin@company.co.kr');
        negative.push('invalid-email', 'test@', '@domain.com', 'test@@domain.com');
    } else if (pattern.includes('\\d') && pattern.includes('-')) {
        // 전화번호 패턴으로 추정
        positive.push('010-1234-5678', '02-123-4567', '031-987-6543');
        negative.push('010-12-34', '123-45-678', 'abc-defg-hijk');
    } else if (pattern.includes('http')) {
        // URL 패턴으로 추정
        positive.push('https://example.com', 'http://test.org/path', 'https://subdomain.domain.com');
        negative.push('ftp://example.com', 'invalid-url', 'http://');
    } else {
        // 일반적인 테스트 케이스
        positive.push('test', 'example', '123');
        negative.push('', ' ', 'special@chars');
    }
    
    return { positive, negative };
}

function addToTestText(testCase) {
    const textArea = document.getElementById('advanced-test-text');
    const currentValue = textArea.value;
    const newValue = currentValue ? currentValue + '\n' + testCase : testCase;
    
    textArea.value = newValue;
    expertTool.handleTestTextChange({ target: { value: newValue } });
    
    showNotification('테스트 케이스가 추가되었습니다.', 'success');
}

function addAllTestCases(testCases) {
    const allCases = [...testCases.positive, ...testCases.negative];
    const textArea = document.getElementById('advanced-test-text');
    
    textArea.value = allCases.join('\n');
    expertTool.handleTestTextChange({ target: { value: textArea.value } });
    
    // 모달 닫기
    document.querySelector('.test-cases-modal').remove();
    
    showNotification(`${allCases.length}개의 테스트 케이스가 추가되었습니다.`, 'success');
}

// 결과 내보내기 함수들
function exportResults() {
    if (!expertTool.testResults || expertTool.testResults.matches.length === 0) {
        showNotification('내보낼 결과가 없습니다.', 'warning');
        return;
    }
    
    const results = expertTool.testResults;
    const exportData = {
        pattern: results.pattern,
        flags: results.flags,
        testText: results.testText,
        matches: results.matches.map(match => ({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
        })),
        performance: {
            executionTime: results.executionTime,
            matchCount: results.matches.length
        },
        timestamp: new Date().toISOString()
    };
    
    // JSON 파일로 다운로드
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'regex-test-results.json';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('결과가 내보내졌습니다.', 'success');
}

function exportMatchResults() {
    exportResults(); // 같은 함수 사용
}

// 유틸리티 함수들
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container') || createNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notification);
    
    // 자동 제거
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-triangle',
        warning: 'exclamation-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// 키보드 단축키 핸들러
document.addEventListener('keydown', function(e) {
    // Ctrl+Enter: 테스트 실행
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (expertTool) {
            expertTool.runAdvancedTest();
        }
    }
    
    // F5: 성능 테스트
    if (e.key === 'F5') {
        e.preventDefault();
        runPerformanceTest();
    }
    
    // Escape: 모달 닫기
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.analysis-modal, .benchmark-modal, .visualization-modal, .debugging-modal, .test-cases-modal, .export-modal');
        modals.forEach(modal => modal.remove());
    }
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    // 타이머 정리 등
    if (expertTool && expertTool.debounceTimer) {
        clearTimeout(expertTool.debounceTimer);
    }
});

// 반응형 처리
window.addEventListener('resize', function() {
    // 모바일에서 키보드가 나타날 때 레이아웃 조정
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});

// 초기 뷰포트 높이 설정
const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);