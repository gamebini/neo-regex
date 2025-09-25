// NEO Regex Tester - 정규식 테스터 로직

class RegexTester {
    constructor() {
        this.pattern = '';
        this.flags = '';
        this.testText = '';
        this.history = [];
        this.maxHistory = 50;
        
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.loadSavedData();
        this.updateDisplay();
    }

    bindElements() {
        // Input elements
        this.patternInput = document.getElementById('pattern-input');
        this.flagsInput = document.getElementById('flags-input');
        this.testTextarea = document.getElementById('test-text');
        
        // Flag checkboxes
        this.flagCheckboxes = {
            g: document.getElementById('flag-g'),
            i: document.getElementById('flag-i'),
            m: document.getElementById('flag-m')
        };

        // Result elements
        this.highlightedResult = document.getElementById('highlighted-result');
        this.matchStats = document.getElementById('match-stats');
        this.matchDetails = document.getElementById('match-details');
        this.patternInfo = document.getElementById('pattern-info');
        this.patternValidity = document.getElementById('pattern-validity');
        this.patternFlags = document.getElementById('pattern-flags');
        this.matchCount = document.getElementById('match-count');

        // Tool buttons
        this.copyPatternBtn = document.getElementById('copy-pattern');
        this.savePatternBtn = document.getElementById('save-pattern');
        this.sharePatternBtn = document.getElementById('share-pattern');
        this.resetAllBtn = document.getElementById('reset-all');
        this.clearTextBtn = document.getElementById('clear-text');
        this.sampleTextBtn = document.getElementById('sample-text');

        // Quick pattern chips
        this.patternChips = document.querySelectorAll('.pattern-chip');
    }

    bindEvents() {
        // Main input events with debouncing
        this.patternInput?.addEventListener('input', 
            Utils.debounce(() => this.handlePatternChange(), 300)
        );
        
        this.flagsInput?.addEventListener('input', 
            Utils.debounce(() => this.handleFlagsChange(), 300)
        );
        
        this.testTextarea?.addEventListener('input', 
            Utils.debounce(() => this.handleTestTextChange(), 300)
        );

        // Flag checkbox events
        Object.entries(this.flagCheckboxes).forEach(([flag, checkbox]) => {
            checkbox?.addEventListener('change', () => this.handleFlagCheckboxChange());
        });

        // Tool button events
        this.copyPatternBtn?.addEventListener('click', () => this.copyPattern());
        this.savePatternBtn?.addEventListener('click', () => this.savePattern());
        this.sharePatternBtn?.addEventListener('click', () => this.sharePattern());
        this.resetAllBtn?.addEventListener('click', () => this.resetAll());
        this.clearTextBtn?.addEventListener('click', () => this.clearText());
        this.sampleTextBtn?.addEventListener('click', () => this.loadSampleText());

        // Quick pattern events
        this.patternChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const pattern = chip.getAttribute('data-pattern');
                this.setPattern(pattern);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    handlePatternChange() {
        this.pattern = this.patternInput.value;
        this.updateFlags();
        this.testPattern();
        this.saveToHistory();
    }

    handleFlagsChange() {
        this.flags = this.flagsInput.value;
        this.updateFlagCheckboxes();
        this.testPattern();
    }

    handleTestTextChange() {
        this.testText = this.testTextarea.value;
        this.testPattern();
    }

    handleFlagCheckboxChange() {
        this.updateFlagsFromCheckboxes();
        this.testPattern();
    }

    updateFlags() {
        // Extract flags from pattern if it's in /pattern/flags format
        const regexMatch = this.pattern.match(/^\/(.+)\/([gimuy]*)$/);
        if (regexMatch) {
            this.pattern = regexMatch[1];
            this.flags = regexMatch[2];
            this.patternInput.value = this.pattern;
            this.flagsInput.value = this.flags;
            this.updateFlagCheckboxes();
        }
    }

    updateFlagCheckboxes() {
        Object.entries(this.flagCheckboxes).forEach(([flag, checkbox]) => {
            if (checkbox) {
                checkbox.checked = this.flags.includes(flag);
            }
        });
    }

    updateFlagsFromCheckboxes() {
        this.flags = Object.entries(this.flagCheckboxes)
            .filter(([flag, checkbox]) => checkbox?.checked)
            .map(([flag]) => flag)
            .join('');
        
        if (this.flagsInput) {
            this.flagsInput.value = this.flags;
        }
    }

    testPattern() {
        if (!this.pattern || !this.testText) {
            this.clearResults();
            return;
        }

        try {
            const regex = new RegExp(this.pattern, this.flags);
            const matches = this.flags.includes('g') ? 
                [...this.testText.matchAll(regex)] : 
                [this.testText.match(regex)].filter(Boolean);

            this.displayResults(matches, true);
        } catch (error) {
            this.displayError(error.message);
        }
    }

    displayResults(matches, isValid) {
        // Update pattern info
        this.updatePatternInfo(isValid, matches.length);

        // Update match stats
        this.updateMatchStats(matches.length);

        // Highlight matches in text
        this.highlightMatches(matches);

        // Display match details
        this.displayMatchDetails(matches);
    }

    updatePatternInfo(isValid, matchCount) {
        if (this.patternValidity) {
            this.patternValidity.textContent = isValid ? '유효' : '무효';
            this.patternValidity.className = `info-value ${isValid ? 'valid' : 'invalid'}`;
        }

        if (this.patternFlags) {
            this.patternFlags.textContent = this.flags || '없음';
        }

        if (this.matchCount) {
            this.matchCount.textContent = matchCount.toString();
        }
    }

    updateMatchStats(count) {
        if (this.matchStats) {
            const statText = count === 0 ? '매칭 없음' : `${count}개 매칭`;
            this.matchStats.innerHTML = `<span class="stat-item">${statText}</span>`;
        }
    }

    highlightMatches(matches) {
        if (!this.highlightedResult) return;

        if (matches.length === 0) {
            this.highlightedResult.innerHTML = `
                <div class="no-result">
                    <i class="fas fa-search"></i>
                    <p>매칭 결과가 없습니다.</p>
                </div>
            `;
            return;
        }

        let highlightedText = this.testText;
        let offset = 0;

        matches.forEach((match, index) => {
            if (match && match.index !== undefined) {
                const start = match.index + offset;
                const end = start + match[0].length;
                
                const beforeText = highlightedText.substring(0, start);
                const matchText = highlightedText.substring(start, end);
                const afterText = highlightedText.substring(end);
                
                const highlightHtml = `<span class="match-highlight" data-match="${index}">${this.escapeHtml(matchText)}</span>`;
                
                highlightedText = beforeText + highlightHtml + afterText;
                offset += highlightHtml.length - matchText.length;
            }
        });

        this.highlightedResult.innerHTML = `<pre>${highlightedText}</pre>`;
    }

    displayMatchDetails(matches) {
        if (!this.matchDetails) return;

        if (matches.length === 0) {
            this.matchDetails.innerHTML = `
                <div class="no-matches">
                    <i class="fas fa-info-circle"></i>
                    <p>매칭된 결과가 없습니다.</p>
                </div>
            `;
            return;
        }

        const detailsHtml = matches.map((match, index) => {
            if (!match) return '';
            
            return `
                <div class="match-item">
                    <div class="match-header">
                        <span class="match-number">매칭 ${index + 1}</span>
                        <span class="match-position">위치: ${match.index}-${match.index + match[0].length}</span>
                    </div>
                    <div class="match-text">${this.escapeHtml(match[0])}</div>
                    ${match.length > 1 ? this.displayGroups(match) : ''}
                </div>
            `;
        }).join('');

        this.matchDetails.innerHTML = detailsHtml;
    }

    displayGroups(match) {
        const groups = match.slice(1);
        if (groups.length === 0) return '';

        const groupsHtml = groups.map((group, index) => {
            return `<div class="match-group">그룹 ${index + 1}: ${this.escapeHtml(group || 'null')}</div>`;
        }).join('');

        return `<div class="match-groups">${groupsHtml}</div>`;
    }

    displayError(errorMessage) {
        this.updatePatternInfo(false, 0);
        this.updateMatchStats(0);

        if (this.highlightedResult) {
            this.highlightedResult.innerHTML = `
                <div class="error-result">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>정규식 오류: ${this.escapeHtml(errorMessage)}</p>
                </div>
            `;
        }

        if (this.matchDetails) {
            this.matchDetails.innerHTML = `
                <div class="no-matches">
                    <i class="fas fa-times-circle"></i>
                    <p>유효하지 않은 정규식입니다.</p>
                </div>
            `;
        }
    }

    clearResults() {
        if (this.highlightedResult) {
            this.highlightedResult.innerHTML = `
                <div class="no-result">
                    <i class="fas fa-search"></i>
                    <p>패턴을 입력하면 매칭 결과가 여기에 표시됩니다.</p>
                </div>
            `;
        }

        if (this.matchDetails) {
            this.matchDetails.innerHTML = `
                <div class="no-matches">
                    <i class="fas fa-info-circle"></i>
                    <p>매칭된 결과가 없습니다.</p>
                </div>
            `;
        }

        this.updatePatternInfo(true, 0);
        this.updateMatchStats(0);
    }

    // Tool functions
    setPattern(pattern) {
        this.pattern = pattern;
        if (this.patternInput) {
            this.patternInput.value = pattern;
        }
        this.testPattern();
        this.saveToHistory();
    }

    async copyPattern() {
        if (!this.pattern) {
            NeoRegex.showNotification('복사할 패턴이 없습니다.', 'warning');
            return;
        }

        const patternWithFlags = this.flags ? `/${this.pattern}/${this.flags}` : this.pattern;
        
        try {
            await navigator.clipboard.writeText(patternWithFlags);
            NeoRegex.showNotification('패턴이 클립보드에 복사되었습니다!', 'success');
        } catch (error) {
            NeoRegex.showNotification('복사에 실패했습니다.', 'error');
        }
    }

    savePattern() {
        if (!this.pattern) {
            NeoRegex.showNotification('저장할 패턴이 없습니다.', 'warning');
            return;
        }

        const patternName = prompt('패턴 이름을 입력하세요:');
        if (!patternName) return;

        const savedPatterns = NeoRegex.loadFromStorage('saved-patterns', []);
        const newPattern = {
            id: Utils.generateRandomId(),
            name: patternName,
            pattern: this.pattern,
            flags: this.flags,
            testText: this.testText,
            createdAt: new Date().toISOString()
        };

        savedPatterns.push(newPattern);
        NeoRegex.saveToStorage('saved-patterns', savedPatterns);
        NeoRegex.showNotification('패턴이 저장되었습니다!', 'success');
    }

    sharePattern() {
        if (!this.pattern) {
            NeoRegex.showNotification('공유할 패턴이 없습니다.', 'warning');
            return;
        }

        const shareUrl = this.generateShareUrl();
        
        if (navigator.share) {
            navigator.share({
                title: 'NEO Regex 패턴',
                text: `정규식 패턴: /${this.pattern}/${this.flags}`,
                url: shareUrl
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareUrl).then(() => {
                NeoRegex.showNotification('공유 링크가 클립보드에 복사되었습니다!', 'success');
            });
        }
    }

    generateShareUrl() {
        const params = new URLSearchParams({
            pattern: this.pattern,
            flags: this.flags,
            text: this.testText.substring(0, 1000) // Limit text length
        });

        return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    }

    resetAll() {
        if (confirm('모든 내용을 초기화하시겠습니까?')) {
            this.pattern = '';
            this.flags = '';
            this.testText = '';
            
            if (this.patternInput) this.patternInput.value = '';
            if (this.flagsInput) this.flagsInput.value = '';
            if (this.testTextarea) this.testTextarea.value = '';
            
            this.updateFlagCheckboxes();
            this.clearResults();
            
            NeoRegex.showNotification('초기화되었습니다.', 'info');
        }
    }

    clearText() {
        this.testText = '';
        if (this.testTextarea) {
            this.testTextarea.value = '';
        }
        this.clearResults();
    }

    loadSampleText() {
        const sampleTexts = [
            `이메일 주소:
user@example.com
test.email+tag@domain.org
invalid-email-format
admin@company.co.kr`,
            `전화번호:
010-1234-5678
02-123-4567
031-987-6543
010-INVALID-NUM`,
            `URL 패턴:
https://www.example.com
http://subdomain.site.org/path
ftp://files.company.com
not-a-valid-url`,
            `날짜 형식:
2024-01-15
2024/12/31
01-15-2024
invalid-date-format`
        ];

        const randomSample = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        this.testText = randomSample;
        
        if (this.testTextarea) {
            this.testTextarea.value = randomSample;
        }
        
        this.testPattern();
        NeoRegex.showNotification('샘플 텍스트가 로드되었습니다.', 'info');
    }

    // History management
    saveToHistory() {
        if (!this.pattern) return;

        const historyItem = {
            pattern: this.pattern,
            flags: this.flags,
            timestamp: Date.now()
        };

        this.history.unshift(historyItem);
        
        // Remove duplicates
        this.history = this.history.filter((item, index, arr) => 
            arr.findIndex(h => h.pattern === item.pattern && h.flags === item.flags) === index
        );

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(0, this.maxHistory);
        }

        NeoRegex.saveToStorage('tester-history', this.history);
    }

    loadHistory() {
        this.history = NeoRegex.loadFromStorage('tester-history', []);
        return this.history;
    }

    // URL parameters
    loadFromUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('pattern')) {
            this.setPattern(urlParams.get('pattern'));
        }
        
        if (urlParams.has('flags')) {
            this.flags = urlParams.get('flags');
            if (this.flagsInput) this.flagsInput.value = this.flags;
            this.updateFlagCheckboxes();
        }
        
        if (urlParams.has('text')) {
            this.testText = urlParams.get('text');
            if (this.testTextarea) this.testTextarea.value = this.testText;
        }

        if (urlParams.has('pattern') || urlParams.has('text')) {
            this.testPattern();
        }
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter: Test pattern
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.testPattern();
        }
        
        // Ctrl/Cmd + S: Save pattern
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.savePattern();
        }
        
        // Ctrl/Cmd + R: Reset (with confirmation)
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            this.resetAll();
        }
        
        // Escape: Clear focus
        if (e.key === 'Escape') {
            document.activeElement?.blur();
        }
    }

    // Data persistence
    loadSavedData() {
        const saved = NeoRegex.loadFromStorage('tester-current', {});
        
        if (saved.pattern) {
            this.pattern = saved.pattern;
            if (this.patternInput) this.patternInput.value = saved.pattern;
        }
        
        if (saved.flags) {
            this.flags = saved.flags;
            if (this.flagsInput) this.flagsInput.value = saved.flags;
            this.updateFlagCheckboxes();
        }
        
        if (saved.testText) {
            this.testText = saved.testText;
            if (this.testTextarea) this.testTextarea.value = saved.testText;
        }

        // Check URL parameters (higher priority)
        this.loadFromUrlParams();
        
        // Load history
        this.loadHistory();
    }

    saveCurrentData() {
        const currentData = {
            pattern: this.pattern,
            flags: this.flags,
            testText: this.testText,
            timestamp: Date.now()
        };
        
        NeoRegex.saveToStorage('tester-current', currentData);
    }

    updateDisplay() {
        // Auto-save current state periodically
        setInterval(() => {
            this.saveCurrentData();
        }, 5000); // Save every 5 seconds

        // Initial test if pattern exists
        if (this.pattern) {
            this.testPattern();
        }
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    measurePerformance(pattern, text, flags) {
        const start = performance.now();
        
        try {
            const regex = new RegExp(pattern, flags);
            const matches = [...text.matchAll(regex)];
            const end = performance.now();
            
            return {
                executionTime: end - start,
                matchCount: matches.length,
                success: true
            };
        } catch (error) {
            const end = performance.now();
            return {
                executionTime: end - start,
                error: error.message,
                success: false
            };
        }
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.measurements = [];
        this.maxMeasurements = 100;
    }

    measure(pattern, text, flags = '') {
        const measurement = this.measureExecution(pattern, text, flags);
        this.measurements.unshift(measurement);
        
        if (this.measurements.length > this.maxMeasurements) {
            this.measurements = this.measurements.slice(0, this.maxMeasurements);
        }
        
        return measurement;
    }

    measureExecution(pattern, text, flags) {
        const start = performance.now();
        let result = null;
        let error = null;
        
        try {
            const regex = new RegExp(pattern, flags);
            result = [...text.matchAll(regex)];
        } catch (e) {
            error = e.message;
        }
        
        const end = performance.now();
        
        return {
            pattern,
            flags,
            textLength: text.length,
            executionTime: end - start,
            matchCount: result ? result.length : 0,
            error,
            timestamp: Date.now(),
            success: !error
        };
    }

    getAverageTime() {
        if (this.measurements.length === 0) return 0;
        
        const total = this.measurements.reduce((sum, m) => sum + m.executionTime, 0);
        return total / this.measurements.length;
    }

    getSlowPatterns(threshold = 10) {
        return this.measurements.filter(m => m.executionTime > threshold);
    }

    generateReport() {
        return {
            totalMeasurements: this.measurements.length,
            averageTime: this.getAverageTime(),
            slowPatterns: this.getSlowPatterns(),
            recentMeasurements: this.measurements.slice(0, 10)
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the tester page
    if (document.getElementById('pattern-input')) {
        window.RegexTesterInstance = new RegexTester();
        window.PerformanceMonitorInstance = new PerformanceMonitor();
        console.log('🧪 Regex Tester initialized!');
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RegexTester, PerformanceMonitor };
}