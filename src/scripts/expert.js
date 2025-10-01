// NEO Regex Expert - 전문가 도구 완전 구현

class RegexExpert {
    constructor() {
        this.currentRegex = null;
        this.currentFlags = 'g';
        this.testResults = [];
        this.performanceData = [];
        this.history = [];
        this.maxHistorySize = 100;
        this.debugSteps = [];
        this.currentDebugStep = 0;
        
        this.init();
    }

    init() {
        console.log('Initializing RegexExpert...');
        this.bindElements();
        this.bindEvents();
        this.loadSettings();
        this.updateDisplay();
    }

    bindElements() {
        // 고급 분석기
        this.analyzePatternInput = document.getElementById('analyze-pattern');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.analysisResult = document.getElementById('analysis-result');
        
        // 성능 모니터
        this.execTimeEl = document.getElementById('exec-time');
        this.backtrackCountEl = document.getElementById('backtrack-count');
        this.complexityEl = document.getElementById('complexity');
        this.performanceChart = document.getElementById('performance-chart');
        
        // 패턴 디버거
        this.stepBackwardBtn = document.getElementById('step-backward');
        this.stepForwardBtn = document.getElementById('step-forward');
        this.resetDebugBtn = document.getElementById('reset-debug');
        this.debugViz = document.getElementById('debug-viz');
        
        // ReDoS 탐지기
        this.securityStatus = document.getElementById('security-status');
        this.vulnerabilityDetails = document.getElementById('vulnerability-details');
    }

    bindEvents() {
        // 고급 분석기 이벤트
        if (this.analyzeBtn) {
            this.analyzeBtn.addEventListener('click', () => this.analyzePattern());
        }
        
        if (this.analyzePatternInput) {
            this.analyzePatternInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.analyzePattern();
            });
        }
        
        // 패턴 디버거 이벤트
        if (this.stepBackwardBtn) {
            this.stepBackwardBtn.addEventListener('click', () => this.debugStepBackward());
        }
        
        if (this.stepForwardBtn) {
            this.stepForwardBtn.addEventListener('click', () => this.debugStepForward());
        }
        
        if (this.resetDebugBtn) {
            this.resetDebugBtn.addEventListener('click', () => this.resetDebug());
        }
        
        // 복사 버튼 이벤트 바인딩
        this.bindCopyButtons();
        
        // 탭 전환 이벤트 바인딩
        this.bindTabSwitching();
    }

    bindCopyButtons() {
        // 모든 복사 버튼에 이벤트 추가
        document.querySelectorAll('.copy-code-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const codeElement = button.closest('.code-example')?.querySelector('code') ||
                                   button.closest('.technique-card')?.querySelector('code') ||
                                   button.previousElementSibling?.querySelector('code');
                
                if (codeElement) {
                    const codeText = codeElement.textContent;
                    this.copyToClipboard(codeText, button);
                }
            });
        });
    }

    bindTabSwitching() {
        // 탭 버튼 이벤트
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = button.getAttribute('data-tab');
                const tabContainer = button.closest('.example-tabs');
                
                if (tabContainer && tabName) {
                    // 모든 탭 버튼 비활성화
                    tabContainer.querySelectorAll('.tab-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // 모든 탭 컨텐츠 숨기기
                    tabContainer.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    
                    // 선택된 탭 활성화
                    button.classList.add('active');
                    const targetContent = tabContainer.querySelector(`#${tabName}`);
                    if (targetContent) {
                        targetContent.classList.add('active');
                    }
                }
            });
        });
    }

    copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            // 성공 피드백
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> 복사됨!';
            button.style.background = 'rgba(16, 185, 129, 0.8)';
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = '';
            }, 2000);
            
            this.showNotification('클립보드에 복사되었습니다!', 'success');
        }).catch(err => {
            console.error('복사 실패:', err);
            this.showNotification('복사에 실패했습니다.', 'error');
        });
    }

    // ==================== 고급 분석기 ====================
    analyzePattern() {
        const pattern = this.analyzePatternInput?.value;
        
        if (!pattern) {
            this.showNotification('패턴을 입력해주세요', 'warning');
            return;
        }

        try {
            const startTime = performance.now();
            
            // 패턴 파싱 및 분석
            const analysis = {
                complexity: this.calculateComplexity(pattern),
                features: this.extractFeatures(pattern),
                performance: this.estimatePerformance(pattern),
                redosRisk: this.checkReDoSRisk(pattern),
                suggestions: this.generateOptimizations(pattern)
            };
            
            const endTime = performance.now();
            analysis.analysisTime = endTime - startTime;
            
            this.displayAnalysis(analysis);
            this.updatePerformanceMetrics(pattern, analysis);
            this.updateSecurityStatus(analysis.redosRisk);
            
        } catch (error) {
            this.showNotification('패턴 분석 중 오류가 발생했습니다: ' + error.message, 'error');
        }
    }

    calculateComplexity(pattern) {
        let score = 0;
        
        // 기본 점수
        score += pattern.length;
        
        // 특수 문자 가중치
        const specialChars = {
            '*': 5, '+': 5, '?': 3,
            '{': 4, '}': 4,
            '(': 3, ')': 3,
            '[': 2, ']': 2,
            '|': 4,
            '\\': 2,
            '^': 2, '$': 2,
            '.': 1
        };
        
        for (const char of pattern) {
            score += specialChars[char] || 0;
        }
        
        // 중첩 구조 가중치
        const nestingLevel = this.calculateNestingLevel(pattern);
        score += nestingLevel * 10;
        
        // 복잡도 등급 결정
        let level, color, description;
        if (score < 20) {
            level = '낮음';
            color = 'success';
            description = '단순하고 효율적인 패턴입니다.';
        } else if (score < 50) {
            level = '보통';
            color = 'warning';
            description = '적절한 복잡도의 패턴입니다.';
        } else if (score < 100) {
            level = '높음';
            color = 'danger';
            description = '복잡한 패턴입니다. 최적화를 고려하세요.';
        } else {
            level = '매우 높음';
            color = 'danger';
            description = '매우 복잡한 패턴입니다. 리팩토링이 필요합니다.';
        }
        
        return { score, level, color, description };
    }

    calculateNestingLevel(pattern) {
        let maxLevel = 0;
        let currentLevel = 0;
        
        for (let i = 0; i < pattern.length; i++) {
            if (pattern[i] === '(' && pattern[i-1] !== '\\') {
                currentLevel++;
                maxLevel = Math.max(maxLevel, currentLevel);
            } else if (pattern[i] === ')' && pattern[i-1] !== '\\') {
                currentLevel--;
            }
        }
        
        return maxLevel;
    }

    extractFeatures(pattern) {
        const features = [];
        
        // 앵커
        if (pattern.includes('^')) features.push({ name: '시작 앵커', icon: 'anchor', desc: '문자열의 시작을 매칭합니다.' });
        if (pattern.includes('$')) features.push({ name: '끝 앵커', icon: 'anchor', desc: '문자열의 끝을 매칭합니다.' });
        
        // 수량자
        if (/[*+?]/.test(pattern)) features.push({ name: '수량자', icon: 'repeat', desc: '문자의 반복 횟수를 지정합니다.' });
        if (/\{\d+,?\d*\}/.test(pattern)) features.push({ name: '정확한 수량자', icon: 'hashtag', desc: '정확한 반복 횟수를 지정합니다.' });
        
        // 그룹
        if (/\([^?]/.test(pattern)) features.push({ name: '캡처 그룹', icon: 'layer-group', desc: '매칭된 부분을 캡처합니다.' });
        if (/\(\?:/.test(pattern)) features.push({ name: '비캡처 그룹', icon: 'object-ungroup', desc: '캡처하지 않는 그룹입니다.' });
        
        // 전후방탐색
        if (/\(\?=/.test(pattern)) features.push({ name: '긍정 전방탐색', icon: 'eye', desc: '뒤따르는 패턴을 확인합니다.' });
        if (/\(\?!/.test(pattern)) features.push({ name: '부정 전방탐색', icon: 'eye-slash', desc: '뒤따르지 않는 패턴을 확인합니다.' });
        if (/\(\?<=/.test(pattern)) features.push({ name: '긍정 후방탐색', icon: 'eye', desc: '앞선 패턴을 확인합니다.' });
        if (/\(\?<!/.test(pattern)) features.push({ name: '부정 후방탐색', icon: 'eye-slash', desc: '앞서지 않는 패턴을 확인합니다.' });
        
        // 문자 클래스
        if (/\[.*\]/.test(pattern)) features.push({ name: '문자 클래스', icon: 'brackets-curly', desc: '여러 문자 중 하나를 매칭합니다.' });
        if (/\[\^.*\]/.test(pattern)) features.push({ name: '부정 문자 클래스', icon: 'ban', desc: '지정된 문자를 제외합니다.' });
        
        // 특수 클래스
        if (/\\d/.test(pattern)) features.push({ name: '숫자 클래스', icon: 'calculator', desc: '숫자를 매칭합니다 (0-9).' });
        if (/\\w/.test(pattern)) features.push({ name: '단어 클래스', icon: 'font', desc: '단어 문자를 매칭합니다 (a-z, A-Z, 0-9, _).' });
        if (/\\s/.test(pattern)) features.push({ name: '공백 클래스', icon: 'space-bar', desc: '공백 문자를 매칭합니다.' });
        
        // 역참조
        if (/\\[1-9]/.test(pattern)) features.push({ name: '역참조', icon: 'link', desc: '이전에 캡처한 그룹을 참조합니다.' });
        
        // 선택
        if (/\|/.test(pattern)) features.push({ name: '선택 연산자', icon: 'code-branch', desc: '여러 패턴 중 하나를 선택합니다.' });
        
        return features;
    }

    estimatePerformance(pattern) {
        const testString = 'a'.repeat(1000);
        const iterations = 100;
        let totalTime = 0;
        
        try {
            const regex = new RegExp(pattern, 'g');
            
            for (let i = 0; i < iterations; i++) {
                const start = performance.now();
                testString.match(regex);
                totalTime += performance.now() - start;
            }
            
            const avgTime = totalTime / iterations;
            
            let rating, color, recommendation;
            if (avgTime < 0.1) {
                rating = '우수';
                color = 'success';
                recommendation = '매우 빠른 패턴입니다.';
            } else if (avgTime < 1) {
                rating = '양호';
                color = 'info';
                recommendation = '적절한 성능의 패턴입니다.';
            } else if (avgTime < 10) {
                rating = '보통';
                color = 'warning';
                recommendation = '최적화를 고려해보세요.';
            } else {
                rating = '느림';
                color = 'danger';
                recommendation = '성능 개선이 필요합니다.';
            }
            
            return {
                avgTime: avgTime.toFixed(3),
                rating,
                color,
                recommendation
            };
        } catch (error) {
            return {
                avgTime: 'N/A',
                rating: '측정 불가',
                color: 'secondary',
                recommendation: '유효하지 않은 패턴입니다.'
            };
        }
    }

    checkReDoSRisk(pattern) {
        const risks = [];
        
        // 중첩된 수량자 검사
        if (/(\*|\+|\{[^}]+\})\s*(\*|\+|\{[^}]+\})/.test(pattern)) {
            risks.push({
                level: 'high',
                type: '중첩된 수량자',
                description: '중첩된 수량자는 지수적인 백트래킹을 유발할 수 있습니다.',
                example: pattern.match(/(\*|\+|\{[^}]+\})\s*(\*|\+|\{[^}]+\})/)?.[0]
            });
        }
        
        // 교차하는 수량자 검사
        if (/\([^)]*(\*|\+)[^)]*\)(\*|\+)/.test(pattern)) {
            risks.push({
                level: 'high',
                type: '교차하는 수량자',
                description: '그룹 내부와 외부의 수량자가 충돌할 수 있습니다.',
                example: pattern.match(/\([^)]*(\*|\+)[^)]*\)(\*|\+)/)?.[0]
            });
        }
        
        // 과도한 선택지 검사
        const alternations = pattern.split('|');
        if (alternations.length > 10) {
            risks.push({
                level: 'medium',
                type: '과도한 선택지',
                description: `${alternations.length}개의 선택지가 있어 성능에 영향을 줄 수 있습니다.`,
                example: pattern.substring(0, 50) + '...'
            });
        }
        
        // 앵커 없는 긴 패턴 검사
        if (pattern.length > 50 && !pattern.startsWith('^') && !pattern.endsWith('$')) {
            risks.push({
                level: 'low',
                type: '앵커 누락',
                description: '앵커(^, $)가 없어 전체 문자열을 탐색할 수 있습니다.',
                example: '앵커 추가를 고려하세요'
            });
        }
        
        // 백트래킹이 많은 패턴 검사
        if (/\.\*.*\.\*/.test(pattern)) {
            risks.push({
                level: 'medium',
                type: '과도한 와일드카드',
                description: '여러 개의 .*는 많은 백트래킹을 유발할 수 있습니다.',
                example: pattern.match(/\.\*.*\.\*/)?.[0]
            });
        }
        
        // 전체 위험도 평가
        const highRisks = risks.filter(r => r.level === 'high').length;
        const mediumRisks = risks.filter(r => r.level === 'medium').length;
        
        let overallRisk, color, message;
        if (highRisks > 0) {
            overallRisk = '높음';
            color = 'danger';
            message = 'ReDoS 공격에 취약할 수 있습니다. 즉시 수정이 필요합니다.';
        } else if (mediumRisks > 1) {
            overallRisk = '중간';
            color = 'warning';
            message = '일부 성능 문제가 있을 수 있습니다. 검토가 필요합니다.';
        } else if (risks.length > 0) {
            overallRisk = '낮음';
            color = 'info';
            message = '경미한 최적화 여지가 있습니다.';
        } else {
            overallRisk = '안전';
            color = 'success';
            message = '위험한 패턴이 감지되지 않았습니다.';
        }
        
        return {
            overallRisk,
            color,
            message,
            risks
        };
    }

    generateOptimizations(pattern) {
        const suggestions = [];
        
        // 비탐욕적 수량자 제안
        if (/\.\*/.test(pattern) && !/\.\*\?/.test(pattern)) {
            suggestions.push({
                type: '비탐욕적 수량자',
                message: '탐욕적 수량자를 비탐욕적으로 변경',
                description: '불필요한 백트래킹을 줄일 수 있습니다.',
                original: pattern.match(/\.\*/)?.[0],
                suggested: '.*?',
                priority: 'medium'
            });
        }
        
        // 문자 클래스 최적화
        if (/\[a-zA-Z\]/.test(pattern)) {
            suggestions.push({
                type: '문자 클래스 단순화',
                message: '\\w로 대체 가능',
                description: '더 간결하고 읽기 쉬운 패턴입니다.',
                original: '[a-zA-Z]',
                suggested: '\\w',
                priority: 'low'
            });
        }
        
        // 앵커 추가 제안
        if (!pattern.startsWith('^') && !pattern.includes('|')) {
            suggestions.push({
                type: '앵커 추가',
                message: '시작 앵커 추가',
                description: '불필요한 탐색을 방지할 수 있습니다.',
                original: pattern,
                suggested: '^' + pattern,
                priority: 'low'
            });
        }
        
        // 비캡처 그룹 제안
        const captureGroups = pattern.match(/\([^?][^)]*\)/g);
        if (captureGroups && captureGroups.length > 0) {
            suggestions.push({
                type: '비캡처 그룹',
                message: '불필요한 캡처 그룹을 비캡처 그룹으로 변경',
                description: '메모리 사용량을 줄일 수 있습니다.',
                original: captureGroups[0],
                suggested: captureGroups[0].replace('(', '(?:'),
                priority: 'medium'
            });
        }
        
        // 중첩된 수량자 제거
        if (/(\*|\+)\1/.test(pattern)) {
            suggestions.push({
                type: '중복 수량자 제거',
                message: '중첩된 수량자 정리',
                description: 'ReDoS 위험을 줄일 수 있습니다.',
                original: pattern.match(/(\*|\+)\1/)?.[0],
                suggested: pattern.match(/(\*|\+)/)?.[0],
                priority: 'high'
            });
        }
        
        return suggestions;
    }

    displayAnalysis(analysis) {
        if (!this.analysisResult) return;
        
        const html = `
            <div class="analysis-complete">
                <div class="analysis-header">
                    <h4><i class="fas fa-chart-line"></i> 분석 결과</h4>
                    <span class="analysis-time">${analysis.analysisTime.toFixed(2)}ms</span>
                </div>
                
                <!-- 복잡도 -->
                <div class="analysis-section">
                    <h5>복잡도 분석</h5>
                    <div class="complexity-badge ${analysis.complexity.color}">
                        <span class="badge-score">${analysis.complexity.score}</span>
                        <span class="badge-level">${analysis.complexity.level}</span>
                    </div>
                    <p class="complexity-desc">${analysis.complexity.description}</p>
                </div>
                
                <!-- 성능 평가 -->
                <div class="analysis-section">
                    <h5>성능 평가</h5>
                    <div class="performance-rating ${analysis.performance.color}">
                        <i class="fas fa-tachometer-alt"></i>
                        <span class="rating-text">${analysis.performance.rating}</span>
                        <span class="rating-time">(평균 ${analysis.performance.avgTime}ms)</span>
                    </div>
                    <p class="performance-recommendation">${analysis.performance.recommendation}</p>
                </div>
                
                <!-- 기능 분석 -->
                <div class="analysis-section">
                    <h5>사용된 기능 (${analysis.features.length}개)</h5>
                    <div class="features-list">
                        ${analysis.features.map(feature => `
                            <div class="feature-item">
                                <i class="fas fa-${feature.icon}"></i>
                                <div class="feature-info">
                                    <strong>${feature.name}</strong>
                                    <span>${feature.desc}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- 최적화 제안 -->
                ${analysis.suggestions.length > 0 ? `
                    <div class="analysis-section">
                        <h5>최적화 제안 (${analysis.suggestions.length}개)</h5>
                        <div class="suggestions-list">
                            ${analysis.suggestions.map(suggestion => `
                                <div class="suggestion-item priority-${suggestion.priority}">
                                    <div class="suggestion-header">
                                        <span class="suggestion-type">${suggestion.type}</span>
                                        <span class="priority-badge">${suggestion.priority}</span>
                                    </div>
                                    <p class="suggestion-message">${suggestion.message}</p>
                                    <div class="suggestion-comparison">
                                        <div class="comparison-item">
                                            <label>현재:</label>
                                            <code>${this.escapeHtml(suggestion.original)}</code>
                                        </div>
                                        <div class="comparison-arrow">→</div>
                                        <div class="comparison-item">
                                            <label>제안:</label>
                                            <code>${this.escapeHtml(suggestion.suggested)}</code>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.analysisResult.innerHTML = html;
    }

    // ==================== 성능 모니터 ====================
    updatePerformanceMetrics(pattern, analysis) {
        // 실행 시간
        if (this.execTimeEl) {
            this.execTimeEl.textContent = `${analysis.performance.avgTime}ms`;
            this.execTimeEl.className = `metric-value ${analysis.performance.color}`;
        }
        
        // 백트랙 횟수 (추정)
        if (this.backtrackCountEl) {
            const backtrackEstimate = this.estimateBacktracking(pattern);
            this.backtrackCountEl.textContent = backtrackEstimate;
        }
        
        // 복잡도
        if (this.complexityEl) {
            this.complexityEl.textContent = analysis.complexity.level;
            this.complexityEl.className = `metric-value ${analysis.complexity.color}`;
        }
        
        // 성능 차트 업데이트
        this.performanceData.push({
            pattern: pattern.substring(0, 20),
            time: parseFloat(analysis.performance.avgTime),
            complexity: analysis.complexity.score
        });
        
        if (this.performanceData.length > 10) {
            this.performanceData.shift();
        }
        
        this.updatePerformanceChart();
    }

    estimateBacktracking(pattern) {
        let estimate = 0;
        
        // 수량자 검사
        const quantifiers = pattern.match(/[*+?{]/g);
        if (quantifiers) estimate += quantifiers.length * 10;
        
        // 선택 연산자 검사
        const alternations = pattern.match(/\|/g);
        if (alternations) estimate += alternations.length * 5;
        
        // 중첩 구조 검사
        const nestingLevel = this.calculateNestingLevel(pattern);
        estimate += nestingLevel * 20;
        
        if (estimate === 0) return '없음';
        if (estimate < 50) return '낮음';
        if (estimate < 100) return '보통';
        return '높음';
    }

    updatePerformanceChart() {
        if (!this.performanceChart) return;
        
        const canvas = this.performanceChart;
        const ctx = canvas.getContext('2d');
        
        // 캔버스 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.performanceData.length === 0) return;
        
        const width = canvas.width;
        const height = canvas.height;
        const padding = 30;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // 최대값 계산
        const maxTime = Math.max(...this.performanceData.map(d => d.time), 1);
        
        // 배경 그리드
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // 데이터 포인트 그리기
        const barWidth = chartWidth / this.performanceData.length;
        
        this.performanceData.forEach((data, index) => {
            const barHeight = (data.time / maxTime) * chartHeight;
            const x = padding + index * barWidth;
            const y = height - padding - barHeight;
            
            // 막대 그리기
            const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(1, '#8b5cf6');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
            
            // 값 표시
            ctx.fillStyle = '#374151';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${data.time.toFixed(1)}`, x + barWidth / 2, y - 5);
        });
        
        // 축 레이블
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('시간 (ms)', padding, padding - 10);
    }

    // ==================== 패턴 디버거 ====================
    debugStepForward() {
        if (!this.analyzePatternInput?.value) {
            this.showNotification('디버깅할 패턴을 입력해주세요', 'warning');
            return;
        }
        
        if (this.debugSteps.length === 0) {
            this.initializeDebugger();
        }
        
        if (this.currentDebugStep < this.debugSteps.length - 1) {
            this.currentDebugStep++;
            this.renderDebugStep();
        }
    }

    debugStepBackward() {
        if (this.currentDebugStep > 0) {
            this.currentDebugStep--;
            this.renderDebugStep();
        }
    }

    resetDebug() {
        this.debugSteps = [];
        this.currentDebugStep = 0;
        if (this.debugViz) {
            this.debugViz.innerHTML = '<div class="no-debug">패턴을 입력하고 디버깅을 시작하세요</div>';
        }
    }

    initializeDebugger() {
        const pattern = this.analyzePatternInput.value;
        const testString = 'Hello World 123';
        
        this.debugSteps = this.generateDebugSteps(pattern, testString);
        this.currentDebugStep = 0;
    }

    generateDebugSteps(pattern, testString) {
        const steps = [];
        
        try {
            const regex = new RegExp(pattern, 'g');
            let match;
            let position = 0;
            
            steps.push({
                step: 0,
                description: '디버깅 시작',
                pattern: pattern,
                position: 0,
                matched: '',
                remaining: testString
            });
            
            while ((match = regex.exec(testString)) !== null) {
                steps.push({
                    step: steps.length,
                    description: `위치 ${match.index}에서 매칭 발견`,
                    pattern: pattern,
                    position: match.index,
                    matched: match[0],
                    remaining: testString.substring(regex.lastIndex)
                });
                
                if (regex.lastIndex === match.index) {
                    regex.lastIndex++;
                }
            }
            
            steps.push({
                step: steps.length,
                description: '디버깅 완료',
                pattern: pattern,
                position: testString.length,
                matched: '',
                remaining: ''
            });
            
        } catch (error) {
            steps.push({
                step: 0,
                description: '오류: ' + error.message,
                pattern: pattern,
                position: 0,
                matched: '',
                remaining: testString
            });
        }
        
        return steps;
    }

    renderDebugStep() {
        if (!this.debugViz || this.debugSteps.length === 0) return;
        
        const step = this.debugSteps[this.currentDebugStep];
        
        const html = `
            <div class="debug-step">
                <div class="debug-header">
                    <span class="step-number">단계 ${step.step} / ${this.debugSteps.length - 1}</span>
                    <span class="step-description">${step.description}</span>
                </div>
                
                <div class="debug-pattern">
                    <label>패턴:</label>
                    <code>${this.escapeHtml(step.pattern)}</code>
                </div>
                
                <div class="debug-position">
                    <label>현재 위치:</label>
                    <span class="position-value">${step.position}</span>
                </div>
                
                ${step.matched ? `
                    <div class="debug-matched">
                        <label>매칭된 문자열:</label>
                        <code class="matched-text">${this.escapeHtml(step.matched)}</code>
                    </div>
                ` : ''}
                
                ${step.remaining ? `
                    <div class="debug-remaining">
                        <label>남은 문자열:</label>
                        <code>${this.escapeHtml(step.remaining)}</code>
                    </div>
                ` : ''}
                
                <div class="debug-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(this.currentDebugStep / (this.debugSteps.length - 1)) * 100}%"></div>
                    </div>
                </div>
            </div>
        `;
        
        this.debugViz.innerHTML = html;
    }

    // ==================== ReDoS 탐지기 ====================
    updateSecurityStatus(redosRisk) {
        if (!this.securityStatus) return;
        
        const statusHtml = `
            <div class="status-item ${redosRisk.color}">
                <i class="fas ${redosRisk.overallRisk === '안전' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                <div class="status-info">
                    <strong>${redosRisk.overallRisk}</strong>
                    <span>${redosRisk.message}</span>
                </div>
            </div>
        `;
        
        this.securityStatus.innerHTML = statusHtml;
        
        // 취약점 상세 정보
        if (this.vulnerabilityDetails) {
            if (redosRisk.risks.length > 0) {
                const detailsHtml = `
                    <div class="vulnerabilities-list">
                        ${redosRisk.risks.map(risk => `
                            <div class="vulnerability-item ${risk.level}">
                                <div class="vuln-header">
                                    <span class="vuln-type">${risk.type}</span>
                                    <span class="vuln-level">${risk.level}</span>
                                </div>
                                <p class="vuln-description">${risk.description}</p>
                                ${risk.example ? `
                                    <div class="vuln-example">
                                        <label>예시:</label>
                                        <code>${this.escapeHtml(risk.example)}</code>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
                this.vulnerabilityDetails.innerHTML = detailsHtml;
            } else {
                this.vulnerabilityDetails.innerHTML = `
                    <div class="no-vulnerabilities">
                        <i class="fas fa-shield-alt"></i>
                        <p>위험한 패턴이 감지되지 않았습니다</p>
                    </div>
                `;
            }
        }
    }

    // ==================== 유틸리티 메서드 ====================
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        const container = document.getElementById('notification-container') || document.body;
        container.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('expert-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                // 설정 적용
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    saveSettings() {
        try {
            const settings = {
                // 저장할 설정들
            };
            localStorage.setItem('expert-settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    updateDisplay() {
        // 초기 디스플레이 업데이트
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.expertTool = new RegexExpert();
        console.log('🔬 NEO Regex Expert initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize RegexExpert:', error);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RegexExpert };
}