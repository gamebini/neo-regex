// NEO Regex Library - 패턴 라이브러리 관리

class RegexLibrary {
    constructor() {
        this.patterns = [];
        this.filteredPatterns = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.currentSort = 'title';
        this.currentOrder = 'asc';
        this.currentView = 'grid';
        
        this.init();
    }

    init() {
        console.log('Initializing RegexLibrary...');
        
        try {
            this.bindElements();
            this.bindEvents();
            this.showLoading();
            this.loadPatterns();
            
            console.log('RegexLibrary initialized successfully');
        } catch (error) {
            console.error('Error initializing RegexLibrary:', error);
            this.hideLoading();
            
            if (this.patternGrid) {
                this.patternGrid.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>초기화 오류</h3>
                        <p>라이브러리 초기화 중 오류가 발생했습니다.</p>
                        <button onclick="location.reload()" class="btn btn-primary">새로고침</button>
                    </div>
                `;
            }
        }
    }

    bindElements() {
        // Search elements
        this.searchInput = document.getElementById('pattern-search');
        this.clearSearchBtn = document.getElementById('clear-search');
        
        // Filter elements
        this.filterTabs = document.querySelectorAll('.filter-tab');
        this.activeFilter = document.getElementById('active-filter');
        this.sortSelect = document.getElementById('sort-select');
        this.orderToggle = document.getElementById('order-toggle');
        
        // Pattern grid
        this.patternGrid = document.getElementById('patterns-grid') || 
                          document.getElementById('pattern-grid');
        
        // Loading element
        this.loadingElement = document.getElementById('loading');
        
        // Stats
        this.resultsCount = document.getElementById('results-count');
        this.totalPatternsCount = document.getElementById('total-patterns');
        
        // View controls
        this.viewBtns = document.querySelectorAll('.view-btn');
        
        console.log('Elements bound:', {
            searchInput: !!this.searchInput,
            patternGrid: !!this.patternGrid,
            loadingElement: !!this.loadingElement,
            filterTabs: this.filterTabs.length
        });
    }

    bindEvents() {
        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.handleSearch());
        }
        
        if (this.clearSearchBtn) {
            this.clearSearchBtn.addEventListener('click', () => this.clearSearch());
        }
        
        // Filter tabs
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', () => this.handleCategoryFilter(tab));
        });
        
        // View controls
        this.viewBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleViewChange(btn));
        });
        
        // Sort
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => this.handleSort(e.target.value));
        }
        
        if (this.orderToggle) {
            this.orderToggle.addEventListener('click', () => this.toggleSortOrder());
        }
    }

    loadPatterns() {
        // Mock patterns data
        this.patterns = [
            {
                id: 'email',
                title: '이메일 주소',
                description: '일반적인 이메일 주소 형식을 검증합니다',
                pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                category: 'basic',
                difficulty: 'easy',
                icon: 'fa-envelope',
                tags: ['validation', 'email', 'contact'],
                examples: {
                    valid: ['user@example.com', 'test.user@domain.co.kr'],
                    invalid: ['invalid-email', '@example.com']
                }
            },
            {
                id: 'phone-kr',
                title: '한국 전화번호',
                description: '한국 휴대폰 및 일반 전화번호 형식을 검증합니다',
                pattern: '^(01[016789]|02|0[3-9]{1}[0-9]{1})-?([0-9]{3,4})-?([0-9]{4})$',
                category: 'korean',
                difficulty: 'easy',
                icon: 'fa-phone',
                tags: ['validation', 'phone', 'korean'],
                examples: {
                    valid: ['010-1234-5678', '02-123-4567'],
                    invalid: ['01012345678', '010-12-34']
                }
            },
            {
                id: 'url',
                title: 'URL 주소',
                description: '웹 URL 형식을 검증합니다 (http, https)',
                pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
                category: 'basic',
                difficulty: 'medium',
                icon: 'fa-link',
                tags: ['validation', 'url', 'web'],
                examples: {
                    valid: ['https://example.com', 'http://www.test.co.kr'],
                    invalid: ['not-a-url', 'ftp://example.com']
                }
            },
            {
                id: 'ipv4',
                title: 'IPv4 주소',
                description: 'IPv4 주소 형식을 검증합니다',
                pattern: '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
                category: 'developer',
                difficulty: 'medium',
                icon: 'fa-network-wired',
                tags: ['network', 'ip', 'validation'],
                examples: {
                    valid: ['192.168.0.1', '10.0.0.1'],
                    invalid: ['256.1.1.1', '192.168.1']
                }
            },
            {
                id: 'password',
                title: '강력한 비밀번호',
                description: '8자 이상, 대소문자, 숫자, 특수문자 포함',
                pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
                category: 'validation',
                difficulty: 'hard',
                icon: 'fa-lock',
                tags: ['security', 'password', 'validation'],
                examples: {
                    valid: ['Pass123!@#', 'MyP@ssw0rd'],
                    invalid: ['password', '12345678']
                }
            },
            {
                id: 'korean-name',
                title: '한글 이름',
                description: '한글 이름 형식을 검증합니다 (2-5자)',
                pattern: '^[가-힣]{2,5}$',
                category: 'korean',
                difficulty: 'easy',
                icon: 'fa-user',
                tags: ['korean', 'name', 'validation'],
                examples: {
                    valid: ['홍길동', '김철수'],
                    invalid: ['김', 'John']
                }
            },
            {
                id: 'date',
                title: '날짜 (YYYY-MM-DD)',
                description: 'ISO 8601 날짜 형식을 검증합니다',
                pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$',
                category: 'validation',
                difficulty: 'medium',
                icon: 'fa-calendar',
                tags: ['date', 'validation', 'iso8601'],
                examples: {
                    valid: ['2024-01-01', '2024-12-31'],
                    invalid: ['2024-13-01', '2024-01-32']
                }
            },
            {
                id: 'hex-color',
                title: 'HEX 색상 코드',
                description: 'HEX 색상 코드를 검증합니다 (#RGB, #RRGGBB)',
                pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
                category: 'developer',
                difficulty: 'easy',
                icon: 'fa-palette',
                tags: ['color', 'hex', 'css'],
                examples: {
                    valid: ['#FFF', '#FFFFFF'],
                    invalid: ['#GGG', '#12345']
                }
            },
            {
                id: 'credit-card',
                title: '신용카드 번호',
                description: '일반적인 신용카드 번호 형식을 검증합니다',
                pattern: '^\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}$',
                category: 'validation',
                difficulty: 'easy',
                icon: 'fa-credit-card',
                tags: ['payment', 'card', 'validation'],
                examples: {
                    valid: ['1234-5678-9012-3456', '1234567890123456'],
                    invalid: ['1234-5678-9012', '1234-5678-9012-345']
                }
            },
            {
                id: 'html-tag',
                title: 'HTML 태그',
                description: 'HTML 태그를 추출합니다',
                pattern: '<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)',
                category: 'developer',
                difficulty: 'hard',
                icon: 'fa-code',
                tags: ['html', 'parsing', 'web'],
                examples: {
                    valid: ['<div>content</div>', '<br />'],
                    invalid: ['<div>', 'plain text']
                }
            }
        ];
        
        this.filteredPatterns = [...this.patterns];
        console.log('Loaded patterns:', this.patterns.length);
    }

    renderCategories() {
        const categories = this.getCategoryStats();
        this.filterTabs.forEach(tab => {
            const category = tab.getAttribute('data-category');
            const countElement = tab.querySelector('.count');
            
            if (countElement) {
                const count = category === 'all' ? 
                             this.patterns.length : 
                             categories[category] || 0;
                countElement.textContent = count;
            }
        });
    }

    getCategoryStats() {
        const stats = {};
        this.patterns.forEach(pattern => {
            stats[pattern.category] = (stats[pattern.category] || 0) + 1;
        });
        return stats;
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
                'developer': '개발자'
            };
            
            this.activeFilter.textContent = categoryNames[this.currentCategory] || '전체';
        }
    }

    applyFilters() {
        let filtered = [...this.patterns];

        // Category filter
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(p => p.category === this.currentCategory);
        }

        // Search filter
        if (this.searchQuery) {
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(this.searchQuery) ||
                p.description.toLowerCase().includes(this.searchQuery) ||
                p.pattern.toLowerCase().includes(this.searchQuery) ||
                (p.tags && p.tags.some(tag => tag.toLowerCase().includes(this.searchQuery)))
            );
        }

        this.filteredPatterns = filtered;
        this.sortPatterns();
        this.renderPatterns();
        this.updatePatternCount();
    }

    handleSort(sortBy) {
        this.currentSort = sortBy;
        this.sortPatterns();
        this.renderPatterns();
    }

    toggleSortOrder() {
        this.currentOrder = this.currentOrder === 'asc' ? 'desc' : 'asc';
        
        if (this.orderToggle) {
            const icon = this.orderToggle.querySelector('i');
            if (icon) {
                icon.className = this.currentOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            }
        }
        
        this.sortPatterns();
        this.renderPatterns();
    }

    sortPatterns() {
        this.filteredPatterns.sort((a, b) => {
            let valueA, valueB;
            
            switch (this.currentSort) {
                case 'title':
                    valueA = a.title.toLowerCase();
                    valueB = b.title.toLowerCase();
                    break;
                case 'category':
                    valueA = a.category;
                    valueB = b.category;
                    break;
                case 'difficulty':
                    const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
                    valueA = difficultyOrder[a.difficulty] || 2;
                    valueB = difficultyOrder[b.difficulty] || 2;
                    break;
                default:
                    valueA = a.title.toLowerCase();
                    valueB = b.title.toLowerCase();
            }
            
            if (valueA < valueB) return this.currentOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return this.currentOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    renderPatterns() {
        if (!this.patternGrid) {
            console.error('Pattern grid element not found');
            return;
        }
        
        console.log('Rendering patterns:', this.filteredPatterns.length);
        
        if (this.filteredPatterns.length === 0) {
            this.patternGrid.innerHTML = this.renderEmptyState();
            return;
        }

        try {
            const patternsHtml = this.filteredPatterns.map(pattern => 
                this.renderPatternCard(pattern)
            ).join('');
            this.patternGrid.innerHTML = patternsHtml;
            
            this.bindPatternCardEvents();
        } catch (error) {
            console.error('Error rendering patterns:', error);
            this.patternGrid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>패턴 로딩 오류</h3>
                    <p>패턴을 불러오는 중 오류가 발생했습니다.</p>
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; overflow: auto;">
                        ${error.message}
                    </pre>
                    <button onclick="location.reload()" class="btn btn-primary">새로고침</button>
                </div>
            `;
        }
    }

    renderPatternCard(pattern) {
        try {
            const categoryColor = this.getCategoryColor(pattern.category);
            const difficultyClass = pattern.difficulty ? 
                `difficulty-${pattern.difficulty}` : 'difficulty-medium';

            return `
                <div class="pattern-card ${difficultyClass}" data-pattern-id="${pattern.id}">
                    <div class="pattern-header">
                        <div class="pattern-header-top">
                            <div class="pattern-icon" style="color: ${categoryColor}">
                                <i class="fas ${pattern.icon || 'fa-code'}"></i>
                            </div>
                        </div>
                        
                        <div class="pattern-badges">
                            <span class="category-badge" style="background: linear-gradient(135deg, ${categoryColor}, ${this.darkenColor(categoryColor)}); color: white; border-color: ${categoryColor};">
                                ${this.getCategoryName(pattern.category)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="pattern-content">
                        <h3 class="pattern-title">${this.escapeHtml(pattern.title || 'Untitled')}</h3>
                        <p class="pattern-description">${this.escapeHtml(pattern.description || 'No description')}</p>
                        
                        <div class="pattern-meta">
                            ${pattern.tags ? pattern.tags.slice(0, 3).map(tag => 
                                `<span class="tag-badge">${this.escapeHtml(tag)}</span>`
                            ).join('') : ''}
                        </div>
                    </div>
                    
                    <button class="pattern-card-open-btn" onclick="regexLibrary.showPatternDetail('${pattern.id}'); event.stopPropagation();" title="상세보기">
                        상세보기
                    </button>
                </div>
            `;
        } catch (error) {
            console.error('Error rendering pattern card for:', pattern, error);
            return `
                <div class="pattern-card error-card">
                    <div class="error-content">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h4>패턴 로딩 오류</h4>
                        <p>ID: ${pattern?.id || 'unknown'}</p>
                    </div>
                </div>
            `;
        }
    }

    darkenColor(color) {
        if (color.includes('primary')) return 'var(--color-primary-700)';
        if (color.includes('success')) return 'var(--color-success-700)';
        if (color.includes('accent')) return 'var(--color-accent-700)';
        if (color === '#7c3aed') return '#6d28d9';
        if (color === '#3b82f6') return '#2563eb';
        if (color === '#10b981') return '#059669';
        if (color === '#f59e0b') return '#d97706';
        if (color === '#8b5cf6') return '#7c3aed';
        return color;
    }

    bindPatternCardEvents() {
        document.querySelectorAll('.pattern-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.pattern-card-open-btn')) {
                    return;
                }
                
                const patternId = card.getAttribute('data-pattern-id');
                this.showPatternDetail(patternId);
            });
        });
    }

    showPatternDetail(id) {
        const pattern = this.patterns.find(p => p.id === id);
        if (!pattern) return;

        const existingModal = document.querySelector('.pattern-detail-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = this.createPatternModal(pattern);
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    createPatternModal(pattern) {
        const categoryColor = this.getCategoryColor(pattern.category);

        const modal = document.createElement('div');
        modal.className = 'modal-overlay pattern-detail-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title-area">
                        <h3 class="modal-title">${this.escapeHtml(pattern.title)}</h3>
                        <p class="modal-subtitle">${this.escapeHtml(pattern.description)}</p>
                    </div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="pattern-details">
                        <div class="detail-section">
                            <h3>정규식 패턴</h3>
                            <div class="pattern-display">
                                <div class="pattern-regex">${this.escapeHtml(pattern.pattern)}</div>
                                <button class="copy-pattern-btn" onclick="regexLibrary.copyPatternText('${pattern.id}')">
                                    <i class="fas fa-copy"></i>
                                    클립보드에 복사
                                </button>
                            </div>
                        </div>
                        
                        ${pattern.examples ? `
                        <div class="detail-section">
                            <h3>사용 예제</h3>
                            <div class="examples-content">
                                <div class="example-group valid-examples">
                                    <h4><i class="fas fa-check-circle"></i> 유효한 예제</h4>
                                    <ul class="example-list">
                                        ${pattern.examples.valid.map(example => 
                                            `<li>${this.escapeHtml(example)}</li>`
                                        ).join('')}
                                    </ul>
                                </div>
                                <div class="example-group invalid-examples">
                                    <h4><i class="fas fa-times-circle"></i> 무효한 예제</h4>
                                    <ul class="example-list">
                                        ${pattern.examples.invalid.map(example => 
                                            `<li>${this.escapeHtml(example)}</li>`
                                        ).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        return modal;
    }

    copyPatternText(patternId) {
        const pattern = this.patterns.find(p => p.id === patternId);
        if (!pattern) return;

        navigator.clipboard.writeText(pattern.pattern).then(() => {
            this.showNotification('패턴이 클립보드에 복사되었습니다!', 'success');
            
            const copyBtns = document.querySelectorAll('.copy-pattern-btn');
            copyBtns.forEach(btn => {
                if (btn.onclick && btn.onclick.toString().includes(patternId)) {
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check"></i> 복사됨!';
                    btn.style.background = 'rgba(16, 185, 129, 0.8)';
                    
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.style.background = '';
                    }, 1500);
                }
            });
        }).catch(err => {
            console.error('복사 실패:', err);
            this.showNotification('복사에 실패했습니다.', 'error');
        });
    }

    renderEmptyState() {
        const isSearching = this.searchQuery.length > 0;
        const isFiltered = this.currentCategory !== 'all';
        
        if (isSearching) {
            return `
                <div class="empty-state">
                    <i class="fas fa-search empty-icon"></i>
                    <h3>검색 결과가 없습니다</h3>
                    <p>"${this.searchQuery}"에 대한 패턴을 찾을 수 없습니다.</p>
                    <button class="btn btn-primary" onclick="regexLibrary.clearSearch()">
                        검색 초기화
                    </button>
                </div>
            `;
        }
        
        if (isFiltered) {
            return `
                <div class="empty-state">
                    <i class="fas fa-filter empty-icon"></i>
                    <h3>패턴이 없습니다</h3>
                    <p>이 카테고리에는 패턴이 없습니다.</p>
                    <button class="btn btn-primary" onclick="regexLibrary.handleCategoryFilter(document.querySelector('[data-category=\\"all\\"]'))">
                        모든 패턴 보기
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="empty-state">
                <i class="fas fa-code empty-icon"></i>
                <h3>패턴이 없습니다</h3>
                <p>등록된 패턴이 없습니다.</p>
            </div>
        `;
    }

    updatePatternCount() {
        if (this.resultsCount) {
            this.resultsCount.textContent = `${this.filteredPatterns.length}개의 패턴`;
        }
    }

    updateStats() {
        if (this.totalPatternsCount) {
            this.totalPatternsCount.textContent = this.patterns.length;
        }
    }

    handleViewChange(btn) {
        this.viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const view = btn.getAttribute('data-view');
        this.currentView = view;
        
        if (this.patternGrid) {
            this.patternGrid.classList.toggle('list-view', view === 'list');
        }
    }

    getCategoryColor(category) {
        const colors = {
            'basic': '#3b82f6',
            'validation': '#10b981',
            'korean': '#f59e0b',
            'developer': '#8b5cf6'
        };
        return colors[category] || '#6b7280';
    }

    getCategoryName(category) {
        const names = {
            'basic': '기본',
            'validation': '검증',
            'korean': '한국어',
            'developer': '개발자'
        };
        return names[category] || category;
    }

    getDifficultyName(difficulty) {
        const names = {
            'easy': '쉬움',
            'medium': '보통',
            'hard': '어려움'
        };
        return names[difficulty] || difficulty;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing RegexLibrary...');
    
    setTimeout(() => {
        try {
            window.regexLibrary = new RegexLibrary();
            console.log('📚 NEO Regex Library initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize RegexLibrary:', error);
            
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
                <div style="padding: 40px; text-align: center; background: #fee; border: 1px solid #fcc; border-radius: 8px; margin: 20px;">
                    <h2 style="color: #c00;">라이브러리 초기화 실패</h2>
                    <p>정규식 라이브러리를 초기화하는 중 오류가 발생했습니다.</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                        페이지 새로고침
                    </button>
                    <details style="margin-top: 20px; text-align: left;">
                        <summary style="cursor: pointer; color: #666;">기술적 세부사항</summary>
                        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; font-size: 12px; margin-top: 10px;">
${error.message}
${error.stack}
                        </pre>
                    </details>
                </div>
            `;
            
            const mainContainer = document.querySelector('.library-main') || 
                                document.querySelector('main') || 
                                document.body;
            mainContainer.insertBefore(errorDiv, mainContainer.firstChild);
        }
    }, 200);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RegexLibrary };
}