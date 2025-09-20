// frontend/src/components/tester/regex-tester.js
import { RegexEngine } from '../../core/regex-engine.js';
import { copyToClipboard, showNotification, debounce } from '../../utils/helpers.js';

export class RegexTester {
    constructor() {
        this.engine = new RegexEngine();
        this.currentResult = null;
        this.testHistory = [];
        
        // Debounced test function for real-time testing
        this.debouncedTest = debounce(() => this.runTest(), 300);
    }

    render() {
        return `
            <div class="grid lg:grid-cols-2 gap-6">
                <!-- Left Panel: Input -->
                <div class="space-y-4">
                    <!-- Regex Pattern Input -->
                    <div class="card">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">정규식 패턴</h3>
                            <div class="flex items-center space-x-2">
                                <button id="clear-pattern" class="btn btn-sm btn-secondary" title="패턴 지우기">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                                <button id="pattern-help" class="btn btn-sm btn-secondary" title="도움말">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div class="space-y-3">
                            <!-- Pattern Input with delimiters -->
                            <div class="relative">
                                <div class="flex items-center">
                                    <span class="text-gray-400 font-mono text-lg select-none">/</span>
                                    <input 
                                        type="text" 
                                        id="regex-pattern" 
                                        class="regex-input input flex-1 border-none focus:ring-0 px-2"
                                        placeholder="정규식 패턴을 입력하세요 (예: \\d{3}-\\d{3}-\\d{4})"
                                        spellcheck="false"
                                        autocomplete="off"
                                    >
                                    <span class="text-gray-400 font-mono text-lg select-none">/</span>
                                    <input 
                                        type="text" 
                                        id="regex-flags" 
                                        class="input w-16 border-none focus:ring-0 px-2 font-mono"
                                        placeholder="gim"
                                        maxlength="6"
                                        spellcheck="false"
                                    >
                                </div>
                                
                                <!-- Pattern validation status -->
                                <div id="pattern-status" class="mt-2 text-sm hidden">
                                    <div class="flex items-center space-x-2">
                                        <div class="status-icon"></div>
                                        <span class="status-message"></span>
                                    </div>
                                </div>
                            </div>

                            <!-- Flags explanation -->
                            <div class="text-xs text-gray-500 space-y-1">
                                <div class="flex flex-wrap gap-4">
                                    <span><code class="inline-code">g</code> - 전역 매치</span>
                                    <span><code class="inline-code">i</code> - 대소문자 무시</span>
                                    <span><code class="inline-code">m</code> - 멀티라인</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Test Text Input -->
                    <div class="card">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">테스트 텍스트</h3>
                            <div class="flex items-center space-x-2">
                                <button id="clear-text" class="btn btn-sm btn-secondary" title="텍스트 지우기">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                                <button id="load-sample" class="btn btn-sm btn-secondary" title="샘플 텍스트 불러오기">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <textarea 
                            id="test-text" 
                            class="input w-full h-32 resize-none font-mono"
                            placeholder="여기에 테스트할 텍스트를 입력하세요...&#10;&#10;예시:&#10;이메일: user@example.com&#10;전화번호: 010-1234-5678&#10;URL: https://neoregex.com"
                            spellcheck="false"
                        ></textarea>
                        
                        <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
                            <span id="text-stats">0 characters</span>
                            <span class="flex items-center space-x-2">
                                <kbd class="px-1 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">Ctrl+Enter</kbd>
                                <span>테스트 실행</span>
                            </span>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="flex flex-wrap gap-2">
                        <button id="test-button" class="btn btn-primary">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            테스트 실행
                        </button>
                        <button id="save-pattern" class="btn btn-secondary">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            패턴 저장
                        </button>
                        <button id="share-pattern" class="btn btn-secondary">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                            </svg>
                            공유
                        </button>
                    </div>
                </div>

                <!-- Right Panel: Results -->
                <div class="space-y-4">
                    <!-- Test Results -->
                    <div class="card">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">테스트 결과</h3>
                        
                        <!-- Results Summary -->
                        <div id="results-summary" class="hidden mb-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span class="text-gray-600 dark:text-gray-400">매치 수:</span>
                                    <span id="match-count" class="font-semibold ml-2">-</span>
                                </div>
                                <div>
                                    <span class="text-gray-600 dark:text-gray-400">실행 시간:</span>
                                    <span id="execution-time" class="font-semibold ml-2">-</span>
                                </div>
                            </div>
                        </div>

                        <!-- Highlighted Text -->
                        <div class="mb-4">
                            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">하이라이트된 텍스트</h4>
                            <div id="highlighted-text" class="code-block min-h-[100px] font-mono text-sm whitespace-pre-wrap">
                                패턴을 입력하고 테스트를 실행해보세요.
                            </div>
                        </div>

                        <!-- Match Details -->
                        <div id="match-details" class="hidden">
                            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">매치 상세정보</h4>
                            <div id="match-list" class="space-y-2 max-h-60 overflow-y-auto">
                                <!-- Match items will be inserted here -->
                            </div>
                        </div>

                        <!-- No Results -->
                        <div id="no-results" class="hidden text-center py-8">
                            <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            <p class="text-gray-600 dark:text-gray-400">매치되는 결과가 없습니다.</p>
                        </div>

                        <!-- Error Display -->
                        <div id="error-display" class="hidden p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
                            <div class="flex">
                                <svg class="w-5 h-5 text-error-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <div>
                                    <h4 class="text-error-800 dark:text-error-200 font-medium">정규식 오류</h4>
                                    <p id="error-message" class="text-error-700 dark:text-error-300 text-sm mt-1"></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Pattern Explanation -->
                    <div class="card">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">패턴 설명</h3>
                        <div id="pattern-explanation" class="text-sm text-gray-600 dark:text-gray-400">
                            정규식 패턴을 입력하면 자동으로 설명이 생성됩니다.
                        </div>
                    </div>

                    <!-- Quick Pattern Suggestions -->
                    <div class="card">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">빠른 패턴</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button class="quick-pattern text-left p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" 
                                    data-pattern="\\d+" data-desc="숫자">
                                <code class="inline-code">\\d+</code>
                                <span class="text-xs text-gray-500 ml-2">숫자</span>
                            </button>
                            <button class="quick-pattern text-left p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                    data-pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" data-desc="이메일">
                                <code class="inline-code text-xs">이메일 패턴</code>
                            </button>
                            <button class="quick-pattern text-left p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                    data-pattern="\\d{3}-\\d{3}-\\d{4}" data-desc="전화번호">
                                <code class="inline-code">전화번호</code>
                            </button>
                            <button class="quick-pattern text-left p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                    data-pattern="https?://[\\w.-]+\\.[a-zA-Z]{2,}" data-desc="URL">
                                <code class="inline-code">URL</code>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Pattern input
        const patternInput = document.getElementById('regex-pattern');
        const flagsInput = document.getElementById('regex-flags');
        const testTextArea = document.getElementById('test-text');
        
        if (patternInput) {
            patternInput.addEventListener('input', () => this.debouncedTest());
            patternInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        }
        
        if (flagsInput) {
            flagsInput.addEventListener('input', () => this.debouncedTest());
        }
        
        if (testTextArea) {
            testTextArea.addEventListener('input', () => {
                this.updateTextStats();
                this.debouncedTest();
            });
            testTextArea.addEventListener('keydown', (e) => this.handleKeydown(e));
        }

        // Buttons
        const testButton = document.getElementById('test-button');
        if (testButton) {
            testButton.addEventListener('click', () => this.runTest());
        }

        const clearPatternBtn = document.getElementById('clear-pattern');
        if (clearPatternBtn) {
            clearPatternBtn.addEventListener('click', () => this.clearPattern());
        }

        const clearTextBtn = document.getElementById('clear-text');
        if (clearTextBtn) {
            clearTextBtn.addEventListener('click', () => this.clearText());
        }

        const loadSampleBtn = document.getElementById('load-sample');
        if (loadSampleBtn) {
            loadSampleBtn.addEventListener('click', () => this.loadSampleText());
        }

        const savePatternBtn = document.getElementById('save-pattern');
        if (savePatternBtn) {
            savePatternBtn.addEventListener('click', () => this.savePattern());
        }

        const sharePatternBtn = document.getElementById('share-pattern');
        if (sharePatternBtn) {
            sharePatternBtn.addEventListener('click', () => this.sharePattern());
        }

        // Quick patterns
        const quickPatterns = document.querySelectorAll('.quick-pattern');
        quickPatterns.forEach(btn => {
            btn.addEventListener('click', () => this.applyQuickPattern(btn));
        });

        console.log('✅ Regex tester event listeners attached');
    }

    runTest() {
        const patternInput = document.getElementById('regex-pattern');
        const flagsInput = document.getElementById('regex-flags');
        const testTextArea = document.getElementById('test-text');

        if (!patternInput || !testTextArea) return;

        const pattern = patternInput.value.trim();
        const flags = flagsInput ? flagsInput.value.trim() : '';
        const text = testTextArea.value;

        // Clear previous results
        this.hideAllResults();

        if (!pattern) {
            this.showPatternStatus('error', '패턴을 입력해주세요.');
            return;
        }

        // Set up engine and run test
        this.engine.setPattern(pattern, flags);
        const result = this.engine.test(text);

        this.currentResult = result;

        if (result.success) {
            this.displayResults(result);
            this.updatePatternExplanation(pattern);
            this.showPatternStatus('success', '유효한 정규식입니다.');
        } else {
            this.displayError(result.error);
            this.showPatternStatus('error', result.error);
        }

        // Add to history
        this.addToHistory(pattern, flags, text, result);
    }

    displayResults(result) {
        const summary = document.getElementById('results-summary');
        const matchCount = document.getElementById('match-count');
        const executionTime = document.getElementById('execution-time');
        const highlightedText = document.getElementById('highlighted-text');
        const matchDetails = document.getElementById('match-details');
        const matchList = document.getElementById('match-list');
        const noResults = document.getElementById('no-results');

        if (result.matches === 0) {
            if (noResults) noResults.classList.remove('hidden');
            return;
        }

        // Update summary
        if (summary && matchCount && executionTime) {
            summary.classList.remove('hidden');
            matchCount.textContent = result.matches;
            executionTime.textContent = `${result.executionTime.toFixed(2)}ms`;
        }

        // Update highlighted text
        if (highlightedText) {
            const testText = document.getElementById('test-text').value;
            const highlighted = this.highlightMatches(testText, result.results);
            highlightedText.innerHTML = highlighted || testText;
        }

        // Update match details
        if (matchDetails && matchList) {
            matchDetails.classList.remove('hidden');
            matchList.innerHTML = '';

            result.results.forEach((match, index) => {
                const matchItem = document.createElement('div');
                matchItem.className = 'p-3 bg-gray-50 dark:bg-slate-700 rounded border-l-2 border-l-primary-500';
                
                matchItem.innerHTML = `
                    <div class="flex items-start justify-between">
                        <div>
                            <div class="font-mono text-sm font-semibold text-primary-700 dark:text-primary-300">
                                "${match.match}"
                            </div>
                            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                위치: ${match.index}-${match.lastIndex}
                                ${match.groups.length > 0 ? `| 그룹: ${match.groups.length}개` : ''}
                            </div>
                        </div>
                        <button class="copy-match text-gray-400 hover:text-gray-600 p-1" 
                                data-match="${match.match}" title="복사">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                        </button>
                    </div>
                    
                    ${match.groups.length > 0 ? `
                        <div class="mt-2 space-y-1">
                            ${match.groups.map((group, i) => 
                                `<div class="text-xs">
                                    <span class="text-gray-500">그룹 ${i + 1}:</span> 
                                    <code class="inline-code">${group || '(empty)'}</code>
                                </div>`
                            ).join('')}
                        </div>
                    ` : ''}
                `;

                matchList.appendChild(matchItem);
            });

            // Attach copy listeners
            matchList.querySelectorAll('.copy-match').forEach(btn => {
                btn.addEventListener('click', () => {
                    copyToClipboard(btn.dataset.match);
                    showNotification('매치된 텍스트가 복사되었습니다.', 'success');
                });
            });
        }
    }

    displayError(error) {
        const errorDisplay = document.getElementById('error-display');
        const errorMessage = document.getElementById('error-message');

        if (errorDisplay && errorMessage) {
            errorDisplay.classList.remove('hidden');
            errorMessage.textContent = error;
        }
    }

    hideAllResults() {
        const elements = [
            'results-summary', 'match-details', 'no-results', 
            'error-display', 'pattern-status'
        ];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.classList.add('hidden');
        });

        // Reset highlighted text
        const highlightedText = document.getElementById('highlighted-text');
        if (highlightedText) {
            highlightedText.textContent = '패턴을 입력하고 테스트를 실행해보세요.';
        }
    }

    highlightMatches(text, results) {
        if (!results || results.length === 0) return text;

        let highlightedText = text;
        let offset = 0;

        // Sort results by index to highlight in order
        const sortedResults = results.sort((a, b) => a.index - b.index);

        sortedResults.forEach((result, index) => {
            const start = result.index + offset;
            const end = start + result.match.length;
            const colorClass = `match-highlight-${index % 3}`;
            
            const before = highlightedText.slice(0, start);
            const match = highlightedText.slice(start, end);
            const after = highlightedText.slice(end);
            
            const highlightSpan = `<span class="match-highlight ${colorClass}" title="매치 #${index + 1}: ${result.index}-${result.lastIndex}">${match}</span>`;
            
            highlightedText = before + highlightSpan + after;
            offset += highlightSpan.length - match.length;
        });

        return highlightedText;
    }

    updatePatternExplanation(pattern) {
        const explanation = document.getElementById('pattern-explanation');
        if (!explanation) return;

        const explained = this.engine.explainPattern();
        explanation.innerHTML = `
            <div class="space-y-2">
                ${explained.split('\n').map(line => 
                    `<div class="flex items-start space-x-2">
                        <code class="inline-code">${line.split(':')[0]}</code>
                        <span>${line.split(':').slice(1).join(':')}</span>
                    </div>`
                ).join('')}
            </div>
        `;
    }

    showPatternStatus(type, message) {
        const status = document.getElementById('pattern-status');
        const icon = status?.querySelector('.status-icon');
        const messageEl = status?.querySelector('.status-message');

        if (!status || !icon || !messageEl) return;

        status.classList.remove('hidden');
        status.className = `mt-2 text-sm flex items-center space-x-2`;

        if (type === 'success') {
            status.classList.add('text-success-600');
            icon.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>`;
        } else if (type === 'error') {
            status.classList.add('text-error-600');
            icon.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`;
        }

        messageEl.textContent = message;
    }

    updateTextStats() {
        const testTextArea = document.getElementById('test-text');
        const textStats = document.getElementById('text-stats');

        if (testTextArea && textStats) {
            const text = testTextArea.value;
            const charCount = text.length;
            const lineCount = text.split('\n').length;
            
            textStats.textContent = `${charCount} characters, ${lineCount} lines`;
        }
    }

    handleKeydown(e) {
        // Ctrl+Enter or Cmd+Enter: Run test
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.runTest();
        }
    }

    clearPattern() {
        const patternInput = document.getElementById('regex-pattern');
        const flagsInput = document.getElementById('regex-flags');
        
        if (patternInput) patternInput.value = '';
        if (flagsInput) flagsInput.value = '';
        
        this.hideAllResults();
        showNotification('패턴이 지워졌습니다.', 'info');
    }

    clearText() {
        const testTextArea = document.getElementById('test-text');
        
        if (testTextArea) testTextArea.value = '';
        
        this.updateTextStats();
        this.hideAllResults();
        showNotification('텍스트가 지워졌습니다.', 'info');
    }

    loadSampleText() {
        const sampleText = `이메일: user@example.com, admin@neoregex.com
전화번호: 010-1234-5678, 02-987-6543
URL: https://www.example.com, http://neoregex.com/docs
날짜: 2024-01-15, 2024/03/20
숫자: 12345, 67.89, -123.45
한글: 안녕하세요, 정규식을 테스트합니다.`;

        const testTextArea = document.getElementById('test-text');
        if (testTextArea) {
            testTextArea.value = sampleText;
            this.updateTextStats();
            showNotification('샘플 텍스트가 로드되었습니다.', 'success');
        }
    }

    applyQuickPattern(button) {
        const pattern = button.dataset.pattern;
        const patternInput = document.getElementById('regex-pattern');
        
        if (patternInput && pattern) {
            patternInput.value = pattern;
            this.debouncedTest();
            showNotification('빠른 패턴이 적용되었습니다.', 'success');
        }
    }

    savePattern() {
        const patternInput = document.getElementById('regex-pattern');
        const flagsInput = document.getElementById('regex-flags');
        
        if (!patternInput?.value.trim()) {
            showNotification('저장할 패턴이 없습니다.', 'warning');
            return;
        }

        // TODO: Implement pattern saving to local storage or server
        const pattern = {
            pattern: patternInput.value,
            flags: flagsInput?.value || '',
            timestamp: Date.now(),
            id: Date.now().toString()
        };

        // Save to localStorage for now
        const savedPatterns = JSON.parse(localStorage.getItem('savedPatterns') || '[]');
        savedPatterns.unshift(pattern);
        localStorage.setItem('savedPatterns', JSON.stringify(savedPatterns.slice(0, 100))); // Keep only last 100

        showNotification('패턴이 저장되었습니다.', 'success');
    }

    sharePattern() {
        const patternInput = document.getElementById('regex-pattern');
        const flagsInput = document.getElementById('regex-flags');
        const testTextArea = document.getElementById('test-text');
        
        if (!patternInput?.value.trim()) {
            showNotification('공유할 패턴이 없습니다.', 'warning');
            return;
        }

        const shareData = {
            pattern: patternInput.value,
            flags: flagsInput?.value || '',
            text: testTextArea?.value || ''
        };

        const shareUrl = this.generateShareUrl(shareData);
        
        copyToClipboard(shareUrl);
        showNotification('공유 링크가 클립보드에 복사되었습니다.', 'success');
    }

    generateShareUrl(data) {
        const params = new URLSearchParams({
            p: data.pattern,
            f: data.flags,
            t: data.text
        });
        
        return `${window.location.origin}${window.location.pathname}#tester?${params.toString()}`;
    }

    addToHistory(pattern, flags, text, result) {
        const historyItem = {
            pattern,
            flags,
            text: text.substring(0, 100), // Truncate for storage
            result: {
                matches: result.matches,
                executionTime: result.executionTime,
                success: result.success
            },
            timestamp: Date.now()
        };

        this.testHistory.unshift(historyItem);
        this.testHistory = this.testHistory.slice(0, 50); // Keep only last 50 tests
    }

    // Initialize from URL parameters
    initFromUrl() {
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
        
        const pattern = urlParams.get('p');
        const flags = urlParams.get('f');
        const text = urlParams.get('t');

        if (pattern) {
            const patternInput = document.getElementById('regex-pattern');
            if (patternInput) patternInput.value = decodeURIComponent(pattern);
        }

        if (flags) {
            const flagsInput = document.getElementById('regex-flags');
            if (flagsInput) flagsInput.value = flags;
        }

        if (text) {
            const testTextArea = document.getElementById('test-text');
            if (testTextArea) testTextArea.value = decodeURIComponent(text);
        }

        if (pattern || flags || text) {
            setTimeout(() => this.runTest(), 100); // Small delay to ensure DOM is ready
        }
    }
}