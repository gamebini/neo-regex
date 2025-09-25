// NEO Regex Library - 패턴 라이브러리 기능

class PatternLibrary {
    constructor() {
        this.patterns = [];
        this.filteredPatterns = [];
        this.currentCategory = 'all';
        this.currentView = 'grid';
        this.favorites = [];
        this.searchQuery = '';
        
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.loadPatterns();
        this.loadFavorites();
        this.updateDisplay();
    }

    bindElements() {
        // Search and filter elements
        this.searchInput = document.getElementById('pattern-search');
        this.clearSearchBtn = document.getElementById('clear-search');
        this.filterTabs = document.querySelectorAll('.filter-tab');
        
        // View controls
        this.viewButtons = document.querySelectorAll('.view-btn');
        this.patternsGrid = document.getElementById('patterns-grid');
        this.resultsCount = document.getElementById('results-count');
        this.activeFilter = document.getElementById('active-filter');
        this.noResults = document.getElementById('no-results');
        this.loadingState = document.getElementById('loading-state');
        this.resetFiltersBtn = document.getElementById('reset-filters');
        
        // Modal elements
        this.patternModal = document.getElementById('pattern-modal');
        this.modalClose = document.getElementById('modal-close');
        this.modalTitle = document.getElementById('modal-title');
        this.modalCategory = document.getElementById('modal-category');
        this.modalFavorite = document.getElementById('modal-favorite');
        this.modalName = document.getElementById('modal-name');
        this.modalDescription = document.getElementById('modal-description');
        this.modalPattern = document.getElementById('modal-pattern');
        this.validExamples = document.getElementById('valid-examples');
        this.invalidExamples = document.getElementById('invalid-examples');
        this.copyPatternBtn = document.getElementById('copy-pattern-btn');
        this.testPatternBtn = document.getElementById('test-pattern-btn');
        this.copyJsBtn = document.getElementById('copy-js-btn');
        this.copyPythonBtn = document.getElementById('copy-python-btn');
        
        // Quick actions
        this.quickTester = document.getElementById('quick-tester');
        this.quickFavorites = document.getElementById('quick-favorites');
        this.scrollTopBtn = document.getElementById('scroll-top');
    }

    bindEvents() {
        // Search functionality
        this.searchInput?.addEventListener('input', 
            Utils.debounce(() => this.handleSearch(), 300)
        );
        
        this.clearSearchBtn?.addEventListener('click', () => this.clearSearch());

        // Filter tabs
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', () => this.handleCategoryFilter(tab));
        });

        // View controls
        this.viewButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleViewChange(btn));
        });

        // Reset filters
        this.resetFiltersBtn?.addEventListener('click', () => this.resetFilters());

        // Modal events
        this.modalClose?.addEventListener('click', () => this.closeModal());
        this.patternModal?.addEventListener('click', (e) => {
            if (e.target === this.patternModal) this.closeModal();
        });

        // Modal actions
        this.copyPatternBtn?.addEventListener('click', () => this.copyCurrentPattern());
        this.testPatternBtn?.addEventListener('click', () => this.testCurrentPattern());
        this.copyJsBtn?.addEventListener('click', () => this.copyJavaScriptCode());
        this.copyPythonBtn?.addEventListener('click', () => this.copyPythonCode());

        // Quick actions
        this.quickTester?.addEventListener('click', () => {
            window.location.href = './tester.html';
        });

        this.quickFavorites?.addEventListener('click', () => this.showFavorites());
        
        // Scroll to top
        this.scrollTopBtn?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Show/hide scroll button
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset > 300;
            this.scrollTopBtn?.classList.toggle('visible', scrolled);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    loadPatterns() {
        // Load built-in patterns
        this.patterns = this.getBuiltInPatterns();
        
        // Load user saved patterns
        const savedPatterns = NeoRegex.loadFromStorage('user-patterns', []);
        this.patterns = this.patterns.concat(savedPatterns.map(p => ({
            ...p,
            category: 'user',
            isUserPattern: true
        })));
        
        this.filteredPatterns = [...this.patterns];
    }

    getBuiltInPatterns() {
        return [
            // Basic patterns
            {
                id: 'email-basic',
                title: '이메일 주소',
                pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                category: 'basic',
                description: '기본적인 이메일 주소 형식을 검증합니다.',
                examples: {
                    valid: ['user@example.com', 'test.email+tag@domain.org', 'admin@company.co.kr'],
                    invalid: ['invalid-email', 'user@', '@domain.com', 'user.domain.com']
                },
                icon: 'fa-envelope'
            },
            {
                id: 'phone-korean',
                title: '한국 전화번호',
                pattern: '^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$',
                category: 'korean',
                description: '한국 휴대폰 번호 형식을 검증합니다.',
                examples: {
                    valid: ['010-1234-5678', '01012345678', '011-123-4567'],
                    invalid: ['02-123-4567', '010-12345-678', '010-abc-defg']
                },
                icon: 'fa-phone'
            },
            {
                id: 'url-basic',
                title: 'URL 주소',
                pattern: '^https?:\\/\\/[^\\s]+$',
                category: 'basic',
                description: 'HTTP/HTTPS URL 형식을 검증합니다.',
                examples: {
                    valid: ['https://www.example.com', 'http://subdomain.site.org/path', 'https://api.service.com/v1/users'],
                    invalid: ['ftp://files.com', 'www.example.com', 'https://']
                },
                icon: 'fa-link'
            },
            {
                id: 'ip-address',
                title: 'IP 주소',
                pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
                category: 'basic',
                description: 'IPv4 주소 형식을 검증합니다.',
                examples: {
                    valid: ['192.168.1.1', '10.0.0.1', '255.255.255.0'],
                    invalid: ['256.1.1.1', '192.168', '192.168.1']
                },
                icon: 'fa-network-wired'
            },
            {
                id: 'password-strong',
                title: '강력한 비밀번호',
                pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
                category: 'validation',
                description: '8자 이상, 대소문자, 숫자, 특수문자 포함 비밀번호를 검증합니다.',
                examples: {
                    valid: ['Password123!', 'MySecure@Pass1', 'StrongP@ss99'],
                    invalid: ['password', 'PASSWORD', '12345678', 'Password123']
                },
                icon: 'fa-lock'
            },
            {
                id: 'date-iso',
                title: 'ISO 날짜 형식',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                category: 'validation',
                description: 'YYYY-MM-DD 형식의 날짜를 검증합니다.',
                examples: {
                    valid: ['2024-01-15', '2024-12-31', '2000-02-29'],
                    invalid: ['24-01-15', '2024/01/15', '2024-13-01', '2024-01-32']
                },
                icon: 'fa-calendar'
            },
            {
                id: 'korean-name',
                title: '한국어 이름',
                pattern: '^[가-힣]{2,4}$',
                category: 'korean',
                description: '2-4글자 한글 이름을 검증합니다.',
                examples: {
                    valid: ['김철수', '박영희', '이서준', '최도윤'],
                    invalid: ['김', '김철수영', 'KIM', '김철수123']
                },
                icon: 'fa-user'
            },
            {
                id: 'credit-card',
                title: '신용카드 번호',
                pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$',
                category: 'validation',
                description: '주요 신용카드 번호 형식을 검증합니다.',
                examples: {
                    valid: ['4111111111111111', '5555555555554444', '378282246310005'],
                    invalid: ['1234567890123456', '4111-1111-1111-1111', '411111111111111']
                },
                icon: 'fa-credit-card'
            },
            {
                id: 'hex-color',
                title: 'HEX 색상 코드',
                pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
                category: 'developer',
                description: 'HEX 색상 코드를 검증합니다.',
                examples: {
                    valid: ['#FF0000', '#ff0000', '#F00', '#123ABC'],
                    invalid: ['FF0000', '#GG0000', '#FF', '#FFFF']
                },
                icon: 'fa-palette'
            },
            {
                id: 'html-tag',
                title: 'HTML 태그',
                pattern: '<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)',
                category: 'developer',
                description: 'HTML 태그를 매칭합니다.',
                examples: {
                    valid: ['<div>content</div>', '<img src="image.jpg" />', '<p class="text">Hello</p>'],
                    invalid: ['<div>content', '<>content</>', '<div></span>']
                },
                icon: 'fa-code'
            },
            // Add more patterns as needed...
        ];
    }

    handleSearch() {
        this.searchQuery = this.searchInput.value.toLowerCase();
        this.applyFilters();
        this.updateClearButton();
    }

    clearSearch() {
        this.searchQuery = '';
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        this.applyFilters();
        this.updateClearButton();
    }

    updateClearButton() {
        if (this.clearSearchBtn) {
            this.clearSearchBtn.classList.toggle('active', this.searchQuery.length > 0);
        }
    }

    handleCategoryFilter(tab) {
        // Update active tab
        this.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        this.currentCategory = tab.getAttribute('data-category');
        this.applyFilters();
        this.updateActiveFilter();
    }

    updateActiveFilter() {
        if (this.activeFilter) {
            const categoryNames = {
                'all': '전체',
                'basic': '기본',
                'validation': '검증',
                'korean': '한국어',
                'developer': '개발자',
                'favorites': '즐겨찾기'
            };
            
            this.activeFilter.textContent = categoryNames[this.currentCategory] || '전체';
        }
    }

    applyFilters() {
        let filtered = [...this.patterns];

        // Category filter
        if (this.currentCategory !== 'all') {
            if (this.currentCategory === 'favorites') {
                filtered = filtered.filter(p => this.favorites.includes(p.id));
            } else {
                filtered = filtered.filter(p => p.category === this.currentCategory);
            }
        }

        // Search filter
        if (this.searchQuery) {
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(this.searchQuery) ||
                p.description.toLowerCase().includes(this.searchQuery) ||
                p.pattern.toLowerCase().includes(this.searchQuery)
            );
        }

        this.filteredPatterns = filtered;
        this.renderPatterns();
    }

    renderPatterns() {
        if (!this.patternsGrid) return;

        // Show loading state
        this.showLoading(true);

        // Simulate loading delay for better UX
        setTimeout(() => {
            if (this.filteredPatterns.length === 0) {
                this.showNoResults(true);
                this.showLoading(false);
                this.updateResultsCount(0);
                return;
            }

            this.showNoResults(false);
            this.showLoading(false);

            const patternsHtml = this.filteredPatterns.map(pattern => 
                this.createPatternCard(pattern)
            ).join('');

            this.patternsGrid.innerHTML = patternsHtml;
            this.patternsGrid.className = `patterns-grid ${this.currentView}-view`;

            this.updateResultsCount(this.filteredPatterns.length);
            this.bindPatternEvents();

            // Animate in
            this.animatePatternCards();
        }, 200);
    }

    createPatternCard(pattern) {
        const isFavorited = this.favorites.includes(pattern.id);
        
        return `
            <div class="pattern-card ${isFavorited ? 'favorited' : ''}" data-pattern-id="${pattern.id}">
                <div class="pattern-header">
                    <div class="pattern-category ${pattern.category}">${this.getCategoryName(pattern.category)}</div>
                    <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-pattern-id="${pattern.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                
                <div class="pattern-icon">
                    <i class="fas ${pattern.icon || 'fa-code'}"></i>
                </div>
                
                <div class="pattern-content">
                    <h3 class="pattern-title">${pattern.title}</h3>
                    <p class="pattern-description">${pattern.description}</p>
                    <div class="pattern-code">${this.formatPattern(pattern.pattern)}</div>
                </div>
                
                <div class="pattern-actions">
                    <button class="action-btn primary" data-action="view" data-pattern-id="${pattern.id}">
                        <i class="fas fa-eye"></i>
                        보기
                    </button>
                    <button class="action-btn" data-action="test" data-pattern-id="${pattern.id}">
                        <i class="fas fa-flask"></i>
                        테스트
                    </button>
                    <button class="action-btn" data-action="copy" data-pattern-id="${pattern.id}">
                        <i class="fas fa-copy"></i>
                        복사
                    </button>
                </div>
            </div>
        `;
    }

    bindPatternEvents() {
        // Pattern card click events
        document.querySelectorAll('.pattern-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.favorite-btn, .action-btn')) {
                    const patternId = card.getAttribute('data-pattern-id');
                    this.showPatternModal(patternId);
                }
            });
        });

        // Favorite buttons
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const patternId = btn.getAttribute('data-pattern-id');
                this.toggleFavorite(patternId);
            });
        });

        // Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                const patternId = btn.getAttribute('data-pattern-id');
                this.handlePatternAction(action, patternId);
            });
        });
    }

    handlePatternAction(action, patternId) {
        const pattern = this.patterns.find(p => p.id === patternId);
        if (!pattern) return;

        switch (action) {
            case 'view':
                this.showPatternModal(patternId);
                break;
            case 'test':
                this.testPattern(pattern);
                break;
            case 'copy':
                this.copyPattern(pattern);
                break;
        }
    }

    showPatternModal(patternId) {
        const pattern = this.patterns.find(p => p.id === patternId);
        if (!pattern || !this.patternModal) return;

        this.currentPattern = pattern;

        // Update modal content
        if (this.modalName) this.modalName.textContent = pattern.title;
        if (this.modalDescription) this.modalDescription.textContent = pattern.description;
        if (this.modalCategory) {
            this.modalCategory.textContent = this.getCategoryName(pattern.category);
            this.modalCategory.className = `pattern-category ${pattern.category}`;
        }
        if (this.modalPattern) this.modalPattern.textContent = pattern.pattern;
        
        // Update favorite button
        if (this.modalFavorite) {
            const isFavorited = this.favorites.includes(pattern.id);
            this.modalFavorite.classList.toggle('favorited', isFavorited);
            this.modalFavorite.onclick = () => this.toggleFavorite(pattern.id);
        }

        // Update examples
        this.updateModalExamples(pattern.examples);

        // Show modal
        this.patternModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Focus trap for accessibility
        setTimeout(() => {
            this.modalClose?.focus();
        }, 100);
    }

    updateModalExamples(examples) {
        if (this.validExamples) {
            this.validExamples.innerHTML = examples.valid.map(example => 
                `<div class="example-item">${this.escapeHtml(example)}</div>`
            ).join('');
        }

        if (this.invalidExamples) {
            this.invalidExamples.innerHTML = examples.invalid.map(example => 
                `<div class="example-item">${this.escapeHtml(example)}</div>`
            ).join('');
        }
    }

    closeModal() {
        if (this.patternModal) {
            this.patternModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        this.currentPattern = null;
    }

    async copyCurrentPattern() {
        if (!this.currentPattern) return;
        await this.copyPattern(this.currentPattern);
    }

    testCurrentPattern() {
        if (!this.currentPattern) return;
        this.testPattern(this.currentPattern);
        this.closeModal();
    }

    copyJavaScriptCode() {
        if (!this.currentPattern) return;
        
        const jsCode = `// ${this.currentPattern.title}
const pattern = /${this.currentPattern.pattern}/g;
const text = "your test text here";
const matches = text.match(pattern);

console.log(matches);`;

        this.copyToClipboard(jsCode, 'JavaScript 코드가 복사되었습니다!');
    }

    copyPythonCode() {
        if (!this.currentPattern) return;
        
        const pythonCode = `# ${this.currentPattern.title}
import re

pattern = r'${this.currentPattern.pattern}'
text = "your test text here"
matches = re.findall(pattern, text)

print(matches)`;

        this.copyToClipboard(pythonCode, 'Python 코드가 복사되었습니다!');
    }

    async copyPattern(pattern) {
        await this.copyToClipboard(pattern.pattern, '패턴이 복사되었습니다!');
    }

    async copyToClipboard(text, successMessage) {
        try {
            await navigator.clipboard.writeText(text);
            NeoRegex.showNotification(successMessage, 'success', 2000);
        } catch (error) {
            NeoRegex.showNotification('복사에 실패했습니다.', 'error');
        }
    }

    testPattern(pattern) {
        const params = new URLSearchParams({
            pattern: pattern.pattern,
            text: pattern.examples.valid.join('\n') + '\n' + pattern.examples.invalid.join('\n')
        });
        
        window.open(`./tester.html?${params.toString()}`, '_blank');
    }

    toggleFavorite(patternId) {
        const index = this.favorites.indexOf(patternId);
        
        if (index === -1) {
            this.favorites.push(patternId);
            NeoRegex.showNotification('즐겨찾기에 추가되었습니다!', 'success', 2000);
        } else {
            this.favorites.splice(index, 1);
            NeoRegex.showNotification('즐겨찾기에서 제거되었습니다!', 'info', 2000);
        }
        
        this.saveFavorites();
        
        // Update UI
        this.updateFavoriteButtons(patternId);
        
        // If currently showing favorites, re-render
        if (this.currentCategory === 'favorites') {
            this.applyFilters();
        }
    }

    updateFavoriteButtons(patternId) {
        const isFavorited = this.favorites.includes(patternId);
        
        // Update card favorite button
        const cardBtn = document.querySelector(`.pattern-card[data-pattern-id="${patternId}"] .favorite-btn`);
        if (cardBtn) {
            cardBtn.classList.toggle('favorited', isFavorited);
        }
        
        // Update modal favorite button
        if (this.modalFavorite && this.currentPattern && this.currentPattern.id === patternId) {
            this.modalFavorite.classList.toggle('favorited', isFavorited);
        }
        
        // Update card styling
        const card = document.querySelector(`.pattern-card[data-pattern-id="${patternId}"]`);
        if (card) {
            card.classList.toggle('favorited', isFavorited);
        }
    }

    loadFavorites() {
        this.favorites = NeoRegex.loadFromStorage('favorites', []);
    }

    saveFavorites() {
        NeoRegex.saveToStorage('favorites', this.favorites);
    }

    showFavorites() {
        // Switch to favorites tab
        const favoritesTab = document.querySelector('.filter-tab[data-category="favorites"]');
        if (favoritesTab) {
            this.handleCategoryFilter(favoritesTab);
        }
    }

    handleViewChange(button) {
        // Update active view button
        this.viewButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        this.currentView = button.getAttribute('data-view');
        
        // Update grid class
        if (this.patternsGrid) {
            this.patternsGrid.className = `patterns-grid ${this.currentView}-view`;
        }
        
        // Save view preference
        NeoRegex.saveToStorage('preferred-view', this.currentView);
    }

    resetFilters() {
        this.searchQuery = '';
        this.currentCategory = 'all';
        
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        // Reset active tab
        this.filterTabs.forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-category') === 'all');
        });
        
        this.applyFilters();
        this.updateClearButton();
        this.updateActiveFilter();
        
        NeoRegex.showNotification('필터가 초기화되었습니다.', 'info', 2000);
    }

    updateResultsCount(count) {
        if (this.resultsCount) {
            this.resultsCount.textContent = `${count}개의 패턴`;
        }
    }

    showLoading(show) {
        if (this.loadingState) {
            this.loadingState.style.display = show ? 'block' : 'none';
        }
        if (this.patternsGrid) {
            this.patternsGrid.style.display = show ? 'none' : 'grid';
        }
    }

    showNoResults(show) {
        if (this.noResults) {
            this.noResults.style.display = show ? 'block' : 'none';
        }
    }

    animatePatternCards() {
        const cards = document.querySelectorAll('.pattern-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    handleKeyboardShortcuts(e) {
        // Escape: Close modal
        if (e.key === 'Escape' && this.patternModal?.style.display === 'flex') {
            this.closeModal();
        }
        
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.searchInput?.focus();
        }
        
        // Ctrl/Cmd + F: Show favorites
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            this.showFavorites();
        }
        
        // Number keys 1-5: Switch categories
        if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.metaKey) {
            const categories = ['all', 'basic', 'validation', 'korean', 'developer'];
            const categoryIndex = parseInt(e.key) - 1;
            if (categories[categoryIndex]) {
                const tab = document.querySelector(`.filter-tab[data-category="${categories[categoryIndex]}"]`);
                if (tab) this.handleCategoryFilter(tab);
            }
        }
    }

    updateDisplay() {
        // Load saved view preference
        const savedView = NeoRegex.loadFromStorage('preferred-view', 'grid');
        this.currentView = savedView;
        
        // Update view button
        const viewBtn = document.querySelector(`.view-btn[data-view="${savedView}"]`);
        if (viewBtn) {
            this.viewButtons.forEach(btn => btn.classList.remove('active'));
            viewBtn.classList.add('active');
        }
        
        // Update active filter display
        this.updateActiveFilter();
        
        // Initial render
        this.renderPatterns();
    }

    // Utility methods
    getCategoryName(category) {
        const categoryNames = {
            'basic': '기본',
            'validation': '검증',
            'korean': '한국어',
            'developer': '개발자',
            'user': '사용자'
        };
        return categoryNames[category] || category;
    }

    formatPattern(pattern) {
        // Truncate long patterns for card display
        if (pattern.length > 50) {
            return pattern.substring(0, 50) + '...';
        }
        return pattern;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Export functionality
    exportPatterns(format = 'json') {
        const dataToExport = {
            patterns: this.patterns.filter(p => p.isUserPattern),
            favorites: this.favorites,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        let content, filename, mimeType;

        switch (format) {
            case 'json':
                content = JSON.stringify(dataToExport, null, 2);
                filename = 'neo-regex-patterns.json';
                mimeType = 'application/json';
                break;
            case 'csv':
                content = this.convertToCSV(dataToExport.patterns);
                filename = 'neo-regex-patterns.csv';
                mimeType = 'text/csv';
                break;
            default:
                return;
        }

        this.downloadFile(content, filename, mimeType);
    }

    convertToCSV(patterns) {
        const headers = ['ID', 'Title', 'Pattern', 'Category', 'Description'];
        const rows = patterns.map(p => [
            p.id,
            p.title,
            p.pattern,
            p.category,
            p.description
        ]);

        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        NeoRegex.showNotification(`${filename} 다운로드가 시작되었습니다.`, 'success');
    }

    // Import functionality
    importPatterns(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.patterns && Array.isArray(data.patterns)) {
                    const userPatterns = NeoRegex.loadFromStorage('user-patterns', []);
                    const newPatterns = data.patterns.filter(p => 
                        !userPatterns.some(existing => existing.id === p.id)
                    );
                    
                    if (newPatterns.length > 0) {
                        userPatterns.push(...newPatterns);
                        NeoRegex.saveToStorage('user-patterns', userPatterns);
                        
                        // Reload patterns
                        this.loadPatterns();
                        this.applyFilters();
                        
                        NeoRegex.showNotification(
                            `${newPatterns.length}개의 새로운 패턴을 가져왔습니다.`, 
                            'success'
                        );
                    } else {
                        NeoRegex.showNotification('새로운 패턴이 없습니다.', 'info');
                    }
                }
                
                if (data.favorites && Array.isArray(data.favorites)) {
                    // Merge favorites
                    const newFavorites = [...new Set([...this.favorites, ...data.favorites])];
                    this.favorites = newFavorites;
                    this.saveFavorites();
                }
                
            } catch (error) {
                NeoRegex.showNotification('파일을 읽는 중 오류가 발생했습니다.', 'error');
                console.error('Import error:', error);
            }
        };
        
        reader.readAsText(file);
    }
}

// Pattern search and recommendation engine
class PatternRecommendationEngine {
    constructor(patterns) {
        this.patterns = patterns;
        this.userHistory = NeoRegex.loadFromStorage('pattern-usage-history', []);
    }

    recommend(query, limit = 5) {
        const scores = this.patterns.map(pattern => ({
            pattern,
            score: this.calculateRelevanceScore(pattern, query)
        }));

        return scores
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.pattern);
    }

    calculateRelevanceScore(pattern, query) {
        let score = 0;
        const queryLower = query.toLowerCase();

        // Title match
        if (pattern.title.toLowerCase().includes(queryLower)) {
            score += 10;
        }

        // Description match
        if (pattern.description.toLowerCase().includes(queryLower)) {
            score += 5;
        }

        // Category match
        if (pattern.category.toLowerCase().includes(queryLower)) {
            score += 3;
        }

        // Usage history boost
        const usageCount = this.userHistory.filter(h => h.patternId === pattern.id).length;
        score += usageCount * 2;

        // Recent usage boost
        const recentUsage = this.userHistory
            .filter(h => h.patternId === pattern.id)
            .filter(h => Date.now() - h.timestamp < 7 * 24 * 60 * 60 * 1000); // Last 7 days
        score += recentUsage.length * 3;

        return score;
    }

    recordUsage(patternId) {
        this.userHistory.push({
            patternId,
            timestamp: Date.now()
        });

        // Keep only recent history (last 1000 items)
        if (this.userHistory.length > 1000) {
            this.userHistory = this.userHistory.slice(-1000);
        }

        NeoRegex.saveToStorage('pattern-usage-history', this.userHistory);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the library page
    if (document.getElementById('patterns-grid')) {
        window.PatternLibraryInstance = new PatternLibrary();
        
        // Initialize recommendation engine
        setTimeout(() => {
            window.RecommendationEngine = new PatternRecommendationEngine(
                window.PatternLibraryInstance.patterns
            );
        }, 500);
        
        console.log('📚 Pattern Library initialized!');
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PatternLibrary, PatternRecommendationEngine };
}