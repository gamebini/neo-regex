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
            this.debounce(() => this.handlePatternChange(), 300)
        );
        
        this.flagsInput?.addEventListener('input', 
            this.debounce(() => this.handleFlagsChange(), 300)
        );
        
        this.testTextarea?.addEventListener('input', 
            this.debounce(() => this.handleTestTextChange(), 300)
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
        if (!this.patternInput) return;
        
        this.pattern = this.patternInput.value;
        this.validatePattern();
        this.performTest();
        this.saveToHistory();
        this.updateDisplay();
    }

    handleFlagsChange() {
        if (!this.flagsInput) return;
        
        this.flags = this.flagsInput.value;
        this.updateFlagCheckboxes();
        this.performTest();
        this.updateDisplay();
    }

    handleTestTextChange() {
        if (!this.testTextarea) return;
        
        this.testText = this.testTextarea.value;
        this.performTest();
        this.updateDisplay();
    }

    handleFlagCheckboxChange() {
        const selectedFlags = [];
        Object.entries(this.flagCheckboxes).forEach(([flag, checkbox]) => {
            if (checkbox && checkbox.checked) {
                selectedFlags.push(flag);
            }
        });
        
        this.flags = selectedFlags.join('');
        if (this.flagsInput) {
            this.flagsInput.value = this.flags;
        }
        
        // Update pattern validation and test
        this.validatePattern();
        this.performTest();
        this.updateDisplay();
    }

    validatePattern() {
        if (!this.pattern) {
            this.updatePatternValidity(true, '패턴을 입력해주세요');
            return false;
        }

        try {
            new RegExp(this.pattern, this.flags);
            this.updatePatternValidity(true, '유효한 정규식입니다');
            return true;
        } catch (error) {
            this.updatePatternValidity(false, `오류: ${error.message}`);
            return false;
        }
    }

    performTest() {
        if (!this.validatePattern() || !this.testText) {
            this.clearResults();
            return;
        }

        try {
            const regex = new RegExp(this.pattern, this.flags);
            
            // matchAll requires global flag, so ensure it's present for matching
            let matches = [];
            if (regex.global) {
                matches = [...this.testText.matchAll(regex)];
            } else {
                // If no global flag, use alternative approach
                const globalRegex = new RegExp(this.pattern, this.flags + 'g');
                matches = [...this.testText.matchAll(globalRegex)];
            }
            
            this.displayResults(matches);
            this.displayMatchDetails(matches);
            this.highlightMatches(matches);
            
        } catch (error) {
            this.displayError(error.message);
        }
    }

    displayResults(matches) {
        if (!this.matchStats) return;

        const matchCount = matches.length;
        let statsHtml = `<div class="stat-item">
            <span class="stat-label">매칭 수:</span>
            <span class="stat-value ${matchCount > 0 ? 'success' : 'muted'}">${matchCount}</span>
        </div>`;

        if (matchCount > 0) {
            const totalLength = matches.reduce((sum, match) => sum + match[0].length, 0);
            const avgLength = Math.round(totalLength / matchCount);
            
            statsHtml += `
                <div class="stat-item">
                    <span class="stat-label">총 길이:</span>
                    <span class="stat-value">${totalLength}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">평균 길이:</span>
                    <span class="stat-value">${avgLength}</span>
                </div>
            `;
        }

        this.matchStats.innerHTML = statsHtml;
        
        if (this.matchCount) {
            this.matchCount.textContent = matchCount;
        }
    }

    displayMatchDetails(matches) {
        if (!this.matchDetails) return;

        if (matches.length === 0) {
            this.matchDetails.innerHTML = '<p class="no-matches">매칭된 결과가 없습니다.</p>';
            return;
        }

        const detailsHtml = matches.map((match, index) => {
            const groups = match.slice(1).map((group, groupIndex) => 
                group !== undefined ? 
                `<span class="group-item">그룹 ${groupIndex + 1}: <code>${this.escapeHtml(group)}</code></span>` 
                : ''
            ).join('');

            return `
                <div class="match-item">
                    <div class="match-header">
                        <span class="match-index">#${index + 1}</span>
                        <span class="match-position">위치: ${match.index} - ${match.index + match[0].length - 1}</span>
                    </div>
                    <div class="match-content">
                        <code class="match-text">${this.escapeHtml(match[0])}</code>
                    </div>
                    ${groups ? `<div class="match-groups">${groups}</div>` : ''}
                </div>
            `;
        }).join('');

        // Create scrollable container for match details
        this.matchDetails.innerHTML = `
            <div class="match-details-header">
                <h4>상세 매칭 결과 (${matches.length}개)</h4>
            </div>
            <div class="match-details-container" style="max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; background-color: var(--bg-secondary, #f9fafb);">
                ${detailsHtml}
            </div>
        `;

        // Add smooth scrolling behavior
        const container = this.matchDetails.querySelector('.match-details-container');
        if (container) {
            container.style.scrollBehavior = 'smooth';
            
            // Add scroll indicators if content overflows
            this.addScrollIndicators(container);
        }
    }

    highlightMatches(matches) {
        if (!this.highlightedResult) {
            return;
        }
        
        if (matches.length === 0) {
            this.highlightedResult.innerHTML = this.escapeHtml(this.testText);
            return;
        }

        let highlightedText = this.testText;
        let offset = 0;

        // Sort matches by position to handle overlapping correctly
        const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

        sortedMatches.forEach((match, index) => {
            const start = match.index + offset;
            const end = start + match[0].length;
            const matchText = highlightedText.slice(start, end);
            
            const highlighted = `<mark class="match-highlight" data-match="${index + 1}" title="매칭 #${index + 1}: 위치 ${match.index}">${this.escapeHtml(matchText)}</mark>`;
            
            highlightedText = highlightedText.slice(0, start) + highlighted + highlightedText.slice(end);
            offset += highlighted.length - matchText.length;
        });

        this.highlightedResult.innerHTML = highlightedText;
    }

    updatePatternValidity(isValid, message) {
        if (!this.patternValidity) return;

        this.patternValidity.innerHTML = `
            <i class="fas fa-${isValid ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        this.patternValidity.className = `pattern-validity ${isValid ? 'valid' : 'invalid'}`;
    }

    updateFlagCheckboxes() {
        Object.entries(this.flagCheckboxes).forEach(([flag, checkbox]) => {
            if (checkbox) {
                checkbox.checked = this.flags.includes(flag);
            }
        });
    }

    clearResults() {
        if (this.highlightedResult) {
            this.highlightedResult.innerHTML = this.escapeHtml(this.testText);
        }
        if (this.matchStats) {
            this.matchStats.innerHTML = '<div class="stat-item"><span class="stat-label">매칭 수:</span><span class="stat-value muted">0</span></div>';
        }
        if (this.matchDetails) {
            this.matchDetails.innerHTML = '<p class="no-matches">매칭된 결과가 없습니다.</p>';
        }
        if (this.matchCount) {
            this.matchCount.textContent = '0';
        }
    }

    displayError(message) {
        // Provide more user-friendly error messages
        let friendlyMessage = message;
        
        if (message.includes('matchAll')) {
            friendlyMessage = '정규식 처리 중 오류가 발생했습니다. 플래그 설정을 확인해주세요.';
        } else if (message.includes('Invalid regular expression')) {
            friendlyMessage = '유효하지 않은 정규식 패턴입니다. 문법을 확인해주세요.';
        } else if (message.includes('Unterminated')) {
            friendlyMessage = '정규식 패턴이 완성되지 않았습니다. 괄호나 대괄호를 확인해주세요.';
        }
        
        if (this.matchDetails) {
            this.matchDetails.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i> 
                    <div class="error-content">
                        <strong>오류 발생</strong>
                        <p>${friendlyMessage}</p>
                        ${message !== friendlyMessage ? `<details class="error-details"><summary>기술적 세부사항</summary><code>${message}</code></details>` : ''}
                    </div>
                </div>
            `;
        }
        
        // Clear other result areas
        if (this.highlightedResult) {
            this.highlightedResult.innerHTML = this.escapeHtml(this.testText);
        }
        if (this.matchStats) {
            this.matchStats.innerHTML = '<div class="stat-item"><span class="stat-label">매칭 수:</span><span class="stat-value error">오류</span></div>';
        }
    }

    // Utility methods
    setPattern(pattern) {
        this.pattern = pattern;
        if (this.patternInput) {
            this.patternInput.value = pattern;
        }
        this.performTest();
        this.updateDisplay();
    }

    copyPattern() {
        if (!this.pattern) {
            this.showNotification('복사할 패턴이 없습니다', 'warning');
            return;
        }

        navigator.clipboard.writeText(this.pattern).then(() => {
            this.showNotification('패턴이 클립보드에 복사되었습니다', 'success');
        }).catch(() => {
            this.showNotification('복사에 실패했습니다', 'error');
        });
    }

    savePattern() {
        if (!this.pattern) {
            this.showNotification('저장할 패턴이 없습니다', 'warning');
            return;
        }

        const saved = JSON.parse(localStorage.getItem('savedPatterns') || '[]');
        const newPattern = {
            id: Date.now(),
            pattern: this.pattern,
            flags: this.flags,
            testText: this.testText,
            createdAt: new Date().toISOString()
        };

        saved.push(newPattern);
        localStorage.setItem('savedPatterns', JSON.stringify(saved));
        
        this.showNotification('패턴이 저장되었습니다', 'success');
    }

    sharePattern() {
        const shareData = {
            pattern: this.pattern,
            flags: this.flags,
            testText: this.testText
        };
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(btoa(JSON.stringify(shareData)))}`;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
            this.showNotification('공유 링크가 클립보드에 복사되었습니다', 'success');
        }).catch(() => {
            this.showNotification('공유 링크 생성에 실패했습니다', 'error');
        });
    }

    resetAll() {
        this.pattern = '';
        this.flags = '';
        this.testText = '';
        
        if (this.patternInput) this.patternInput.value = '';
        if (this.flagsInput) this.flagsInput.value = '';
        if (this.testTextarea) this.testTextarea.value = '';
        
        Object.values(this.flagCheckboxes).forEach(checkbox => {
            if (checkbox) checkbox.checked = false;
        });
        
        this.clearResults();
        this.updatePatternValidity(true, '패턴을 입력해주세요');
        this.showNotification('모든 입력이 초기화되었습니다', 'info');
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
            'example@email.com, test@domain.org, invalid-email',
            'https://example.com, http://test.org, ftp://files.com',
            '010-1234-5678, 02-123-4567, 1234-5678',
            'Hello World! 안녕하세요 123 ABC',
            'var userName = "johnDoe"; let email = "john@example.com";'
        ];
        
        const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        this.testText = randomText;
        
        if (this.testTextarea) {
            this.testTextarea.value = randomText;
        }
        
        this.performTest();
        this.updateDisplay();
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter: 테스트 실행
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.performTest();
        }
        
        // Ctrl/Cmd + R: 리셋
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            this.resetAll();
        }
        
        // Ctrl/Cmd + S: 저장
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.savePattern();
        }
    }

    saveToHistory() {
        if (!this.pattern) return;

        const historyItem = {
            pattern: this.pattern,
            flags: this.flags,
            testText: this.testText,
            timestamp: Date.now()
        };

        this.history.unshift(historyItem);
        
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(0, this.maxHistory);
        }

        localStorage.setItem('testerHistory', JSON.stringify(this.history));
    }

    loadSavedData() {
        // Load from URL if shared
        const urlParams = new URLSearchParams(window.location.search);
        const sharedData = urlParams.get('data');
        
        if (sharedData) {
            try {
                const data = JSON.parse(atob(sharedData));
                this.pattern = data.pattern || '';
                this.flags = data.flags || '';
                this.testText = data.testText || '';
                
                if (this.patternInput) this.patternInput.value = this.pattern;
                if (this.flagsInput) this.flagsInput.value = this.flags;
                if (this.testTextarea) this.testTextarea.value = this.testText;
                
                this.updateFlagCheckboxes();
                return;
            } catch (e) {
                console.warn('Failed to parse shared data:', e);
            }
        }

        // Load from localStorage
        const saved = localStorage.getItem('lastTesterState');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.pattern = data.pattern || '';
                this.flags = data.flags || '';
                this.testText = data.testText || '';
                
                if (this.patternInput) this.patternInput.value = this.pattern;
                if (this.flagsInput) this.flagsInput.value = this.flags;
                if (this.testTextarea) this.testTextarea.value = this.testText;
                
                this.updateFlagCheckboxes();
            } catch (e) {
                console.warn('Failed to parse saved data:', e);
            }
        }
        
        // Load history
        const history = localStorage.getItem('testerHistory');
        if (history) {
            try {
                this.history = JSON.parse(history);
            } catch (e) {
                this.history = [];
            }
        }
    }

    updateDisplay() {
        this.saveCurrentState();
        
        if (this.patternInfo) {
            this.patternInfo.innerHTML = `
                <div class="pattern-display">
                    <code>/${this.pattern}/${this.flags}</code>
                </div>
            `;
        }
        
        if (this.patternFlags) {
            const flagDescriptions = {
                g: 'Global - 모든 매칭 찾기',
                i: 'Ignore case - 대소문자 무시',
                m: 'Multiline - 다중행 모드'
            };
            
            const activeFlagsHtml = this.flags.split('').map(flag => 
                `<span class="flag-item active" title="${flagDescriptions[flag] || ''}">
                    ${flag}
                </span>`
            ).join('');
            
            this.patternFlags.innerHTML = activeFlagsHtml || '<span class="flag-item inactive">플래그 없음</span>';
        }
    }

    saveCurrentState() {
        const state = {
            pattern: this.pattern,
            flags: this.flags,
            testText: this.testText
        };
        localStorage.setItem('lastTesterState', JSON.stringify(state));
    }

    // Helper methods
    addScrollIndicators(container) {
        // Check if scrolling is needed
        const isScrollable = container.scrollHeight > container.clientHeight;
        
        if (isScrollable) {
            // Add scroll indicator class
            container.classList.add('scrollable');
            
            // Add scroll event listener for fade effects
            container.addEventListener('scroll', () => {
                const { scrollTop, scrollHeight, clientHeight } = container;
                const isAtTop = scrollTop === 0;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
                
                container.classList.toggle('scroll-fade-top', !isAtTop);
                container.classList.toggle('scroll-fade-bottom', !isAtBottom);
            });
            
            // Initial scroll state
            container.classList.add('scroll-fade-bottom');
            
            // Add scroll hint
            const scrollHint = document.createElement('div');
            scrollHint.className = 'scroll-hint';
            scrollHint.innerHTML = '<i class="fas fa-arrows-alt-v"></i> 스크롤하여 더 많은 결과 보기';
            scrollHint.style.cssText = `
                position: absolute;
                right: 16px;
                bottom: 8px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                pointer-events: none;
                z-index: 10;
                animation: fadeInOut 3s ease-in-out;
            `;
            
            container.style.position = 'relative';
            container.appendChild(scrollHint);
            
            // Remove hint after animation
            setTimeout(() => {
                if (scrollHint.parentNode) {
                    scrollHint.remove();
                }
            }, 3000);
            
            // Add CSS for scroll fade effects
            if (!document.querySelector('#scroll-fade-styles')) {
                const styles = document.createElement('style');
                styles.id = 'scroll-fade-styles';
                styles.textContent = `
                    .match-details-container.scrollable {
                        position: relative;
                    }
                    .match-details-container.scroll-fade-top::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 20px;
                        background: linear-gradient(to bottom, var(--bg-secondary, #f9fafb), transparent);
                        pointer-events: none;
                        z-index: 5;
                    }
                    .match-details-container.scroll-fade-bottom::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 20px;
                        background: linear-gradient(to top, var(--bg-secondary, #f9fafb), transparent);
                        pointer-events: none;
                        z-index: 5;
                    }
                    @keyframes fadeInOut {
                        0%, 100% { opacity: 0; }
                        50% { opacity: 1; }
                    }
                `;
                document.head.appendChild(styles);
            }
        }
    }

    exportMatches() {
        if (!this.testResults || this.testResults.matchCount === 0) {
            this.showNotification('내보낼 매칭 결과가 없습니다', 'warning');
            return;
        }

        try {
            const regex = new RegExp(this.pattern, this.flags);
            let matches = [];
            if (regex.global) {
                matches = [...this.testText.matchAll(regex)];
            } else {
                const globalRegex = new RegExp(this.pattern, this.flags + 'g');
                matches = [...this.testText.matchAll(globalRegex)];
            }

            const exportData = {
                pattern: this.pattern,
                flags: this.flags,
                testText: this.testText,
                matchCount: matches.length,
                matches: matches.map((match, index) => ({
                    index: index + 1,
                    text: match[0],
                    position: match.index,
                    length: match[0].length,
                    groups: match.slice(1)
                })),
                exportTime: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `regex-matches-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.showNotification('매칭 결과가 내보내기되었습니다', 'success');
        } catch (error) {
            this.showNotification('내보내기 중 오류가 발생했습니다', 'error');
        }
    }

    // Helper methods
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addScrollIndicators(container) {
        // Check if scrolling is needed
        const isScrollable = container.scrollHeight > container.clientHeight;
        
        if (isScrollable) {
            // Add scroll indicator class
            container.classList.add('scrollable');
            
            // Add scroll event listener for fade effects
            container.addEventListener('scroll', () => {
                const { scrollTop, scrollHeight, clientHeight } = container;
                const isAtTop = scrollTop === 0;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
                
                container.classList.toggle('scroll-fade-top', !isAtTop);
                container.classList.toggle('scroll-fade-bottom', !isAtBottom);
            });
            
            // Initial scroll state
            container.classList.add('scroll-fade-bottom');
            
            // Add scroll hint
            const scrollHint = document.createElement('div');
            scrollHint.className = 'scroll-hint';
            scrollHint.innerHTML = '<i class="fas fa-arrows-alt-v"></i> 스크롤하여 더 많은 결과 보기';
            scrollHint.style.cssText = `
                position: absolute;
                right: 16px;
                bottom: 8px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                pointer-events: none;
                z-index: 10;
                animation: fadeInOut 3s ease-in-out;
            `;
            
            container.style.position = 'relative';
            container.appendChild(scrollHint);
            
            // Remove hint after animation
            setTimeout(() => {
                if (scrollHint.parentNode) {
                    scrollHint.remove();
                }
            }, 3000);
            
            // Add CSS for scroll fade effects
            if (!document.querySelector('#scroll-fade-styles')) {
                const styles = document.createElement('style');
                styles.id = 'scroll-fade-styles';
                styles.textContent = `
                    .match-details-container.scrollable {
                        position: relative;
                    }
                    .match-details-container.scroll-fade-top::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 20px;
                        background: linear-gradient(to bottom, var(--bg-secondary, #f9fafb), transparent);
                        pointer-events: none;
                        z-index: 5;
                    }
                    .match-details-container.scroll-fade-bottom::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 20px;
                        background: linear-gradient(to top, var(--bg-secondary, #f9fafb), transparent);
                        pointer-events: none;
                        z-index: 5;
                    }
                    @keyframes fadeInOut {
                        0%, 100% { opacity: 0; }
                        50% { opacity: 1; }
                    }
                `;
                document.head.appendChild(styles);
            }
        }
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
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to container
        const container = document.getElementById('notification-container') || document.body;
        container.appendChild(notification);

        // Auto remove after 3 seconds
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
}

// Performance monitoring class
class PerformanceMonitor {
    constructor() {
        this.measurements = [];
    }

    start(label) {
        performance.mark(`${label}-start`);
    }

    end(label) {
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);
        
        const measure = performance.getEntriesByName(label).pop();
        if (measure) {
            this.measurements.push({
                label,
                duration: measure.duration,
                timestamp: Date.now()
            });
        }
    }

    getStats() {
        return this.measurements;
    }

    clearStats() {
        this.measurements = [];
        performance.clearMarks();
        performance.clearMeasures();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.regexTester = new RegexTester();
    window.performanceMonitor = new PerformanceMonitor();
    
    console.log('🧪 NEO Regex Tester initialized!');
    
    // Add performance monitoring for regex operations
    const originalTest = window.regexTester.performTest;
    window.regexTester.performTest = function() {
        window.performanceMonitor.start('regex-test');
        originalTest.call(this);
        window.performanceMonitor.end('regex-test');
    };
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RegexTester, PerformanceMonitor };
}