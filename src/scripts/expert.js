// NEO Regex Expert - 전문가 도구 및 고급 기능

class RegexExpert {
    constructor() {
        this.currentRegex = null;
        this.currentFlags = 'g';
        this.testResults = [];
        this.performanceData = [];
        this.history = [];
        this.maxHistorySize = 100;
        
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.loadSettings();
        this.updateDisplay();
    }

    bindElements() {
        // Advanced Pattern Input
        this.patternInput = document.getElementById('expert-pattern');
        this.flagsContainer = document.getElementById('flags-container');
        this.flagCheckboxes = document.querySelectorAll('.flag-checkbox');
        
        // Test Input
        this.testInput = document.getElementById('expert-test-input');
        this.testFile = document.getElementById('test-file-input');
        this.sampleDataBtn = document.getElementById('load-sample-data');
        
        // Results
        this.resultsContainer = document.getElementById('results-container');
        this.matchesTable = document.getElementById('matches-table');
        this.performancePanel = document.getElementById('performance-panel');
        this.explanationPanel = document.getElementById('explanation-panel');
        
        // Tools
        this.regexGeneratorBtn = document.getElementById('regex-generator');
        this.patternOptimizerBtn = document.getElementById('pattern-optimizer');
        this.performanceAnalyzerBtn = document.getElementById('performance-analyzer');
        this.codeGeneratorBtn = document.getElementById('code-generator');
        
        // Advanced Features
        this.regexDebugger = document.getElementById('regex-debugger');
        this.backtrackingVisualizer = document.getElementById('backtracking-visualizer');
        this.unicodeAnalyzer = document.getElementById('unicode-analyzer');
        
        // Export/Import
        this.exportBtn = document.getElementById('export-results');
        this.importBtn = document.getElementById('import-pattern');
        this.shareBtn = document.getElementById('share-pattern');
        
        // Settings
        this.settingsPanel = document.getElementById('expert-settings');
        this.themeSelect = document.getElementById('theme-select');
        this.timeoutInput = document.getElementById('timeout-input');
    }

    bindEvents() {
        // Pattern input events
        this.patternInput?.addEventListener('input', this.debounce(() => this.handlePatternChange(), 500));
        
        // Flag events
        this.flagCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.handleFlagChange());
        });
        
        // Test input events
        this.testInput?.addEventListener('input', this.debounce(() => this.performAdvancedTest(), 300));
        this.testFile?.addEventListener('change', (e) => this.handleFileUpload(e));
        this.sampleDataBtn?.addEventListener('click', () => this.loadSampleData());
        
        // Tool buttons
        this.regexGeneratorBtn?.addEventListener('click', () => this.openRegexGenerator());
        this.patternOptimizerBtn?.addEventListener('click', () => this.optimizePattern());
        this.performanceAnalyzerBtn?.addEventListener('click', () => this.analyzePerformance());
        this.codeGeneratorBtn?.addEventListener('click', () => this.generateCode());
        
        // Advanced features
        this.regexDebugger?.addEventListener('click', () => this.openDebugger());
        this.backtrackingVisualizer?.addEventListener('click', () => this.visualizeBacktracking());
        this.unicodeAnalyzer?.addEventListener('click', () => this.analyzeUnicode());
        
        // Export/Import
        this.exportBtn?.addEventListener('click', () => this.exportResults());
        this.importBtn?.addEventListener('click', () => this.importPattern());
        this.shareBtn?.addEventListener('click', () => this.sharePattern());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    handlePatternChange() {
        const pattern = this.patternInput?.value || '';
        this.currentRegex = this.validateAndCompileRegex(pattern);
        this.updatePatternAnalysis();
        this.performAdvancedTest();
        this.addToHistory(pattern);
    }

    handleFlagChange() {
        const flags = Array.from(this.flagCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value)
            .join('');
        
        this.currentFlags = flags;
        this.handlePatternChange();
    }

    validateAndCompileRegex(pattern) {
        if (!pattern) return null;
        
        try {
            return new RegExp(pattern, this.currentFlags);
        } catch (error) {
            this.showPatternError(error.message);
            return null;
        }
    }

    performAdvancedTest() {
        if (!this.currentRegex || !this.testInput?.value) {
            this.clearResults();
            return;
        }

        const testText = this.testInput.value;
        const startTime = performance.now();
        
        try {
            // Basic matching
            const matches = [...testText.matchAll(this.currentRegex)];
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            // Advanced analysis
            this.analyzeMatches(matches, testText);
            this.recordPerformance(executionTime, testText.length, matches.length);
            this.updateResultsDisplay(matches, executionTime);
            this.explainPattern();
            
        } catch (error) {
            this.showTestError(error.message);
        }
    }

    analyzeMatches(matches, text) {
        const analysis = {
            matchCount: matches.length,
            totalMatchLength: matches.reduce((sum, match) => sum + match[0].length, 0),
            averageMatchLength: matches.length > 0 ? 
                matches.reduce((sum, match) => sum + match[0].length, 0) / matches.length : 0,
            positions: matches.map(match => ({ start: match.index, end: match.index + match[0].length })),
            uniqueMatches: [...new Set(matches.map(match => match[0]))],
            groups: this.analyzeGroups(matches),
            coverage: matches.length > 0 ? 
                matches.reduce((sum, match) => sum + match[0].length, 0) / text.length * 100 : 0
        };

        this.testResults = analysis;
        return analysis;
    }

    analyzeGroups(matches) {
        const groupAnalysis = {};
        
        matches.forEach((match, matchIndex) => {
            match.forEach((group, groupIndex) => {
                if (groupIndex === 0) return; // Skip full match
                
                if (!groupAnalysis[groupIndex]) {
                    groupAnalysis[groupIndex] = {
                        values: [],
                        count: 0,
                        uniqueValues: new Set()
                    };
                }
                
                if (group !== undefined) {
                    groupAnalysis[groupIndex].values.push(group);
                    groupAnalysis[groupIndex].count++;
                    groupAnalysis[groupIndex].uniqueValues.add(group);
                }
            });
        });

        // Convert Sets to Arrays for serialization
        Object.keys(groupAnalysis).forEach(key => {
            groupAnalysis[key].uniqueValues = Array.from(groupAnalysis[key].uniqueValues);
        });

        return groupAnalysis;
    }

    recordPerformance(executionTime, textLength, matchCount) {
        const performanceRecord = {
            timestamp: Date.now(),
            executionTime,
            textLength,
            matchCount,
            pattern: this.patternInput?.value || '',
            flags: this.currentFlags
        };

        this.performanceData.push(performanceRecord);
        
        // Keep only last 50 records
        if (this.performanceData.length > 50) {
            this.performanceData = this.performanceData.slice(-50);
        }
    }

    updateResultsDisplay(matches, executionTime) {
        if (!this.resultsContainer) return;

        // Update matches table
        this.updateMatchesTable(matches);
        
        // Update performance panel
        this.updatePerformancePanel(executionTime);
        
        // Update statistics
        this.updateStatistics(matches);
        
        // Highlight matches in text
        this.highlightMatchesInText(matches);
    }

    updateMatchesTable(matches) {
        if (!this.matchesTable) return;

        if (matches.length === 0) {
            this.matchesTable.innerHTML = `
                <div class="no-matches">
                    <i class="fas fa-search"></i>
                    <p>매칭된 결과가 없습니다</p>
                </div>
            `;
            return;
        }

        const tableHtml = `
            <div class="matches-header">
                <h4>매칭 결과 (${matches.length}개)</h4>
                <div class="matches-controls">
                    <button onclick="expertTool.exportMatches()" class="btn-sm">
                        <i class="fas fa-download"></i> 내보내기
                    </button>
                </div>
            </div>
            <div class="matches-table-container">
                <table class="matches-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>매칭</th>
                            <th>위치</th>
                            <th>길이</th>
                            ${this.getGroupHeaders(matches)}
                        </tr>
                    </thead>
                    <tbody>
                        ${matches.map((match, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td><code>${this.escapeHtml(match[0])}</code></td>
                                <td>${match.index}-${match.index + match[0].length - 1}</td>
                                <td>${match[0].length}</td>
                                ${this.getGroupCells(match)}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        this.matchesTable.innerHTML = tableHtml;
    }

    getGroupHeaders(matches) {
        const maxGroups = Math.max(...matches.map(match => match.length - 1));
        return Array.from({ length: maxGroups }, (_, i) => `<th>그룹 ${i + 1}</th>`).join('');
    }

    getGroupCells(match) {
        const groups = match.slice(1);
        return groups.map(group => 
            `<td>${group !== undefined ? `<code>${this.escapeHtml(group)}</code>` : '<span class="undefined">undefined</span>'}</td>`
        ).join('');
    }

    updatePerformancePanel(executionTime) {
        if (!this.performancePanel) return;

        const performanceHtml = `
            <div class="performance-metrics">
                <div class="metric">
                    <span class="metric-label">실행 시간</span>
                    <span class="metric-value ${executionTime > 10 ? 'warning' : 'success'}">
                        ${executionTime.toFixed(3)}ms
                    </span>
                </div>
                <div class="metric">
                    <span class="metric-label">텍스트 길이</span>
                    <span class="metric-value">${this.testInput?.value.length || 0}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">매칭 수</span>
                    <span class="metric-value">${this.testResults.matchCount}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">커버리지</span>
                    <span class="metric-value">${this.testResults.coverage.toFixed(1)}%</span>
                </div>
            </div>
            
            ${this.renderPerformanceChart()}
        `;

        this.performancePanel.innerHTML = performanceHtml;
    }

    renderPerformanceChart() {
        if (this.performanceData.length < 2) {
            return '<p class="no-data">성능 데이터가 충분하지 않습니다</p>';
        }

        const recentData = this.performanceData.slice(-10);
        const maxTime = Math.max(...recentData.map(d => d.executionTime));
        
        return `
            <div class="performance-chart">
                <h5>최근 실행 시간</h5>
                <div class="chart-container">
                    ${recentData.map((data, index) => `
                        <div class="chart-bar">
                            <div class="bar" 
                                 style="height: ${(data.executionTime / maxTime) * 100}%"
                                 title="${data.executionTime.toFixed(3)}ms">
                            </div>
                            <span class="bar-label">${index + 1}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    explainPattern() {
        if (!this.explanationPanel || !this.patternInput?.value) return;

        const pattern = this.patternInput.value;
        const explanation = this.generatePatternExplanation(pattern);
        
        this.explanationPanel.innerHTML = `
            <div class="pattern-explanation">
                <h4>패턴 분석</h4>
                <div class="explanation-content">
                    ${explanation}
                </div>
            </div>
        `;
    }

    generatePatternExplanation(pattern) {
        const explanations = [];
        let i = 0;
        
        while (i < pattern.length) {
            const char = pattern[i];
            
            switch (char) {
                case '^':
                    explanations.push('<span class="explain-anchor">^</span> 문자열의 시작');
                    break;
                case '$':
                    explanations.push('<span class="explain-anchor">$</span> 문자열의 끝');
                    break;
                case '.':
                    explanations.push('<span class="explain-wildcard">.</span> 임의의 문자 (줄바꿈 제외)');
                    break;
                case '*':
                    explanations.push('<span class="explain-quantifier">*</span> 0개 이상 반복');
                    break;
                case '+':
                    explanations.push('<span class="explain-quantifier">+</span> 1개 이상 반복');
                    break;
                case '?':
                    explanations.push('<span class="explain-quantifier">?</span> 0개 또는 1개');
                    break;
                case '\\':
                    if (i + 1 < pattern.length) {
                        const nextChar = pattern[i + 1];
                        const escaped = this.explainEscapedCharacter(nextChar);
                        explanations.push(escaped);
                        i++; // Skip next character
                    }
                    break;
                case '[':
                    const charClass = this.extractCharacterClass(pattern, i);
                    explanations.push(this.explainCharacterClass(charClass.content));
                    i = charClass.endIndex;
                    break;
                case '(':
                    const group = this.extractGroup(pattern, i);
                    explanations.push(this.explainGroup(group.content));
                    i = group.endIndex;
                    break;
                case '{':
                    const quantifier = this.extractQuantifier(pattern, i);
                    explanations.push(this.explainQuantifier(quantifier.content));
                    i = quantifier.endIndex;
                    break;
                default:
                    explanations.push(`<span class="explain-literal">${this.escapeHtml(char)}</span> 리터럴 문자`);
            }
            i++;
        }
        
        return explanations.join('<br>');
    }

    explainEscapedCharacter(char) {
        const escapeExplanations = {
            'd': '<span class="explain-escape">\\d</span> 숫자 (0-9)',
            'D': '<span class="explain-escape">\\D</span> 숫자가 아닌 문자',
            'w': '<span class="explain-escape">\\w</span> 단어 문자 (알파벳, 숫자, _)',
            'W': '<span class="explain-escape">\\W</span> 단어 문자가 아닌 문자',
            's': '<span class="explain-escape">\\s</span> 공백 문자',
            'S': '<span class="explain-escape">\\S</span> 공백이 아닌 문자',
            'b': '<span class="explain-escape">\\b</span> 단어 경계',
            'B': '<span class="explain-escape">\\B</span> 단어 경계가 아닌 위치',
            'n': '<span class="explain-escape">\\n</span> 줄바꿈',
            't': '<span class="explain-escape">\\t</span> 탭',
            'r': '<span class="explain-escape">\\r</span> 캐리지 리턴'
        };
        
        return escapeExplanations[char] || `<span class="explain-escape">\\${char}</span> 이스케이프된 ${char}`;
    }

    extractCharacterClass(pattern, startIndex) {
        let i = startIndex + 1;
        let depth = 1;
        
        while (i < pattern.length && depth > 0) {
            if (pattern[i] === '[' && pattern[i-1] !== '\\') depth++;
            if (pattern[i] === ']' && pattern[i-1] !== '\\') depth--;
            i++;
        }
        
        return {
            content: pattern.substring(startIndex, i),
            endIndex: i - 1
        };
    }

    extractGroup(pattern, startIndex) {
        let i = startIndex + 1;
        let depth = 1;
        
        while (i < pattern.length && depth > 0) {
            if (pattern[i] === '(' && pattern[i-1] !== '\\') depth++;
            if (pattern[i] === ')' && pattern[i-1] !== '\\') depth--;
            i++;
        }
        
        return {
            content: pattern.substring(startIndex, i),
            endIndex: i - 1
        };
    }

    extractQuantifier(pattern, startIndex) {
        let i = startIndex + 1;
        
        while (i < pattern.length && pattern[i] !== '}') {
            i++;
        }
        
        return {
            content: pattern.substring(startIndex, i + 1),
            endIndex: i
        };
    }

    explainCharacterClass(content) {
        const isNegated = content.startsWith('[^');
        const inner = content.slice(isNegated ? 2 : 1, -1);
        
        return `<span class="explain-charclass">${content}</span> ${isNegated ? '제외하고' : '포함하여'} [${inner}] 중 하나`;
    }

    explainGroup(content) {
        if (content.startsWith('(?:')) {
            return `<span class="explain-group">${content}</span> 비캡처 그룹`;
        } else if (content.startsWith('(?=')) {
            return `<span class="explain-group">${content}</span> 긍정형 전방탐색`;
        } else if (content.startsWith('(?!')) {
            return `<span class="explain-group">${content}</span> 부정형 전방탐색`;
        } else {
            return `<span class="explain-group">${content}</span> 캡처 그룹`;
        }
    }

    explainQuantifier(content) {
        return `<span class="explain-quantifier">${content}</span> 반복 횟수 지정`;
    }

    // Advanced Tools
    openRegexGenerator() {
        const modal = this.createRegexGeneratorModal();
        document.body.appendChild(modal);
    }

    createRegexGeneratorModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content regex-generator-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-magic"></i> 정규식 생성기</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="generator-options">
                        <div class="option-group">
                            <h4>문자 패턴</h4>
                            <label><input type="checkbox" value="lowercase"> 소문자 (a-z)</label>
                            <label><input type="checkbox" value="uppercase"> 대문자 (A-Z)</label>
                            <label><input type="checkbox" value="digits"> 숫자 (0-9)</label>
                            <label><input type="checkbox" value="symbols"> 특수문자</label>
                        </div>
                        
                        <div class="option-group">
                            <h4>길이 제한</h4>
                            <label>최소: <input type="number" id="min-length" value="1" min="0"></label>
                            <label>최대: <input type="number" id="max-length" value="10" min="1"></label>
                        </div>
                        
                        <div class="option-group">
                            <h4>패턴 유형</h4>
                            <select id="pattern-type">
                                <option value="custom">사용자 정의</option>
                                <option value="email">이메일</option>
                                <option value="phone">전화번호</option>
                                <option value="url">URL</option>
                                <option value="password">비밀번호</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="generated-pattern">
                        <h4>생성된 패턴</h4>
                        <div class="pattern-output">
                            <code id="generated-pattern-output"></code>
                            <button onclick="expertTool.copyGeneratedPattern()" class="btn-sm">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="expertTool.generateCustomPattern()" class="btn btn-primary">
                        패턴 생성
                    </button>
                    <button onclick="expertTool.useGeneratedPattern()" class="btn btn-secondary">
                        패턴 사용
                    </button>
                </div>
            </div>
        `;
        
        return modal;
    }

    generateCustomPattern() {
        const modal = document.querySelector('.regex-generator-modal');
        if (!modal) return;

        const options = {
            lowercase: modal.querySelector('input[value="lowercase"]').checked,
            uppercase: modal.querySelector('input[value="uppercase"]').checked,
            digits: modal.querySelector('input[value="digits"]').checked,
            symbols: modal.querySelector('input[value="symbols"]').checked,
            minLength: parseInt(modal.querySelector('#min-length').value) || 1,
            maxLength: parseInt(modal.querySelector('#max-length').value) || 10,
            type: modal.querySelector('#pattern-type').value
        };

        let pattern = '';

        if (options.type === 'custom') {
            let charClass = '';
            if (options.lowercase) charClass += 'a-z';
            if (options.uppercase) charClass += 'A-Z';
            if (options.digits) charClass += '0-9';
            if (options.symbols) charClass += '!@#$%^&*';

            if (charClass) {
                pattern = `[${charClass}]`;
                if (options.minLength === options.maxLength) {
                    pattern += `{${options.minLength}}`;
                } else {
                    pattern += `{${options.minLength},${options.maxLength}}`;
                }
            }
        } else {
            const presetPatterns = {
                email: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                phone: '^\\d{2,3}-\\d{3,4}-\\d{4}$',
                url: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b',
                password: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
            };
            pattern = presetPatterns[options.type];
        }

        const output = modal.querySelector('#generated-pattern-output');
        if (output) {
            output.textContent = pattern;
        }
    }

    optimizePattern() {
        const pattern = this.patternInput?.value;
        if (!pattern) {
            this.showNotification('최적화할 패턴을 입력해주세요', 'warning');
            return;
        }

        const suggestions = this.analyzePatternForOptimization(pattern);
        this.showOptimizationSuggestions(suggestions);
    }

    analyzePatternForOptimization(pattern) {
        const suggestions = [];
        
        // Check for unnecessary escapes
        if (pattern.includes('\\.') && !pattern.includes('[')) {
            suggestions.push({
                type: 'unnecessary-escape',
                message: '불필요한 이스케이프가 있을 수 있습니다',
                original: '\\.',
                suggested: '.',
                description: '문자 클래스 밖에서는 점을 이스케이프할 필요가 없습니다'
            });
        }

        // Check for greedy quantifiers
        if (pattern.includes('.*') || pattern.includes('.+')) {
            suggestions.push({
                type: 'greedy-quantifier',
                message: '탐욕적 수량자가 성능에 영향을 줄 수 있습니다',
                original: '.*',
                suggested: '.*?',
                description: '비탐욕적 수량자를 사용하면 성능이 개선될 수 있습니다'
            });
        }

        // Check for character class optimization
        if (pattern.includes('[a-zA-Z]')) {
            suggestions.push({
                type: 'char-class-optimization',
                message: '문자 클래스를 단순화할 수 있습니다',
                original: '[a-zA-Z]',
                suggested: '[a-z]',
                description: 'i 플래그를 사용하면 더 간단해집니다'
            });
        }

        return suggestions;
    }

    showOptimizationSuggestions(suggestions) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content optimization-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-wrench"></i> 패턴 최적화 제안</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${suggestions.length > 0 ? 
                        suggestions.map(suggestion => `
                            <div class="optimization-suggestion">
                                <div class="suggestion-header">
                                    <i class="fas fa-lightbulb"></i>
                                    <strong>${suggestion.message}</strong>
                                </div>
                                <div class="suggestion-details">
                                    <p>${suggestion.description}</p>
                                    <div class="suggestion-comparison">
                                        <div class="original">
                                            <label>현재:</label>
                                            <code>${suggestion.original}</code>
                                        </div>
                                        <div class="suggested">
                                            <label>제안:</label>
                                            <code>${suggestion.suggested}</code>
                                        </div>
                                    </div>
                                </div>
                                <button onclick="expertTool.applySuggestion('${suggestion.original}', '${suggestion.suggested}')" 
                                        class="btn-sm btn-primary">적용</button>
                            </div>
                        `).join('') : 
                        '<div class="no-suggestions"><i class="fas fa-check-circle"></i><p>최적화 제안사항이 없습니다. 패턴이 이미 최적화되어 있습니다!</p></div>'
                    }
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    applySuggestion(original, suggested) {
        if (!this.patternInput) return;
        
        const currentPattern = this.patternInput.value;
        const optimizedPattern = currentPattern.replace(original, suggested);
        
        this.patternInput.value = optimizedPattern;
        this.handlePatternChange();
        
        this.showNotification('최적화가 적용되었습니다', 'success');
    }

    // Utility methods
    addToHistory(pattern) {
        if (!pattern || this.history[0] === pattern) return;
        
        this.history.unshift(pattern);
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(0, this.maxHistorySize);
        }
    }

    loadSampleData() {
        const sampleTexts = [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Email: test@example.com, Phone: 010-1234-5678',
            'Visit our website at https://example.com or call us at 02-123-4567 for more information.',
            'User accounts: admin@site.org, user123@domain.co.kr, support@help.net',
            'Dates: 2024-01-15, 2024-12-31. Times: 09:30, 14:45, 23:59',
            'Colors: #FF0000, #00FF00, #0000FF. IPs: 192.168.1.1, 127.0.0.1, 10.0.0.1'
        ];
        
        const randomSample = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        if (this.testInput) {
            this.testInput.value = randomSample;
            this.performAdvancedTest();
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.testInput) {
                this.testInput.value = e.target.result;
                this.performAdvancedTest();
            }
        };
        reader.readAsText(file);
    }

    exportResults() {
        const results = {
            pattern: this.patternInput?.value || '',
            flags: this.currentFlags,
            testText: this.testInput?.value || '',
            matches: this.testResults,
            performance: this.performanceData,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `regex-analysis-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('결과가 내보내기되었습니다', 'success');
    }

    handleKeyboardShortcuts(e) {
        // Ctrl+Enter: Run test
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            this.performAdvancedTest();
        }
        
        // Ctrl+Shift+O: Optimize
        if (e.ctrlKey && e.shiftKey && e.key === 'O') {
            e.preventDefault();
            this.optimizePattern();
        }
        
        // F5: Generate sample
        if (e.key === 'F5') {
            e.preventDefault();
            this.loadSampleData();
        }
    }

    // Helper methods
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

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

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.getElementById('notification-container') || document.body;
        container.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
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

    showPatternError(message) {
        // Implementation for showing pattern errors
        console.error('Pattern Error:', message);
    }

    showTestError(message) {
        // Implementation for showing test errors
        console.error('Test Error:', message);
    }

    clearResults() {
        if (this.matchesTable) {
            this.matchesTable.innerHTML = '<div class="no-matches"><p>결과가 없습니다</p></div>';
        }
    }

    updateStatistics(matches) {
        // Implementation for updating statistics display
    }

    highlightMatchesInText(matches) {
        // Implementation for highlighting matches in the text
    }

    updateDisplay() {
        // Implementation for updating the overall display
    }

    loadSettings() {
        // Implementation for loading user settings
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.expertTool = new RegexExpert();
    console.log('🔬 NEO Regex Expert initialized!');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RegexExpert };
}