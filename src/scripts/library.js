// NEO Regex Library - 패턴 라이브러리 관리

class RegexLibrary {
    constructor() {
        this.patterns = [];
        this.filteredPatterns = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.favorites = this.loadFavorites();
        this.currentSort = 'title';
        this.currentOrder = 'asc';
        
        this.init();
    }

    init() {
        console.log('Initializing RegexLibrary...');
        
        try {
            this.bindElements();
            this.bindEvents();
            this.loadPatterns();
            this.renderCategories();
            this.renderPatterns();
            this.updateStats();
            
            console.log('RegexLibrary initialized successfully');
        } catch (error) {
            console.error('Error initializing RegexLibrary:', error);
            
            // Show error message if pattern grid exists
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
        this.searchInput = document.getElementById('library-search');
        this.clearSearchBtn = document.getElementById('clear-search');
        this.searchResults = document.getElementById('search-results');
        
        // Filter elements
        this.filterTabs = document.querySelectorAll('.filter-tab');
        this.activeFilter = document.getElementById('active-filter');
        this.sortSelect = document.getElementById('sort-select');
        this.orderToggle = document.getElementById('order-toggle');
        
        // Pattern grid - 여러 가능한 ID 시도
        this.patternGrid = document.getElementById('pattern-grid') || 
                          document.getElementById('patterns-grid') ||
                          document.querySelector('.pattern-grid') ||
                          document.querySelector('.patterns-container');
        
        // Debug: 찾은 엘리먼트들 로깅
        console.log('Pattern grid element:', this.patternGrid);
        if (!this.patternGrid) {
            console.error('Pattern grid element not found! Available elements with "pattern" in ID:');
            const patternElements = Array.from(document.querySelectorAll('[id*="pattern"]'));
            patternElements.forEach(el => console.log('-', el.id, el.className));
        }
        
        this.patternCount = document.getElementById('pattern-count');
        this.loadingIndicator = document.getElementById('loading-indicator');
        
        // Modals
        this.patternModal = document.getElementById('pattern-modal');
        this.modalOverlay = document.querySelector('.modal-overlay');
        
        // Stats elements
        this.totalPatternsCount = document.getElementById('total-patterns');
        this.favoritesCount = document.getElementById('favorites-count');
        this.categoriesCount = document.getElementById('categories-count');
        
        // Quick actions
        this.favoriteAllBtn = document.getElementById('favorite-all');
        this.exportPatternsBtn = document.getElementById('export-patterns');
        this.importPatternsBtn = document.getElementById('import-patterns');
    }

    bindEvents() {
        // Search events
        this.searchInput?.addEventListener('input', (e) => this.handleSearch());
        this.clearSearchBtn?.addEventListener('click', () => this.clearSearch());
        
        // Filter events
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', () => this.handleCategoryFilter(tab));
        });
        
        // Sort events
        this.sortSelect?.addEventListener('change', (e) => this.handleSort(e.target.value));
        this.orderToggle?.addEventListener('click', () => this.toggleSortOrder());
        
        // Modal events
        this.modalOverlay?.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.closeModal();
            }
        });
        
        // Quick action events
        this.favoriteAllBtn?.addEventListener('click', () => this.favoriteCurrentPatterns());
        this.exportPatternsBtn?.addEventListener('click', () => this.exportPatterns());
        this.importPatternsBtn?.addEventListener('click', () => this.importPatterns());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    loadPatterns() {
        // RegexPatterns가 정의되어 있다면 사용, 아니면 기본 패턴 사용
        if (typeof RegexPatterns !== 'undefined' && RegexPatterns.getAll) {
            this.patterns = RegexPatterns.getAll();
        } else if (typeof window.RegexPatterns !== 'undefined' && window.RegexPatterns.getAll) {
            this.patterns = window.RegexPatterns.getAll();
        } else {
            console.warn('RegexPatterns not found, using default patterns');
            this.patterns = this.getDefaultPatterns();
        }
        
        this.filteredPatterns = [...this.patterns];
        
        // Debug log
        console.log('Loaded patterns:', this.patterns.length);
        if (this.patterns.length === 0) {
            console.error('No patterns loaded! Check patterns.js');
        }
    }

    getDefaultPatterns() {
        // Fallback patterns if RegexPatterns is not available
        return [
            {
                id: 'email',
                title: '이메일 주소',
                pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                category: 'basic',
                description: '유효한 이메일 주소 형식을 검증합니다.',
                examples: {
                    valid: ['user@example.com', 'test@domain.org'],
                    invalid: ['invalid-email', '@domain.com']
                },
                icon: 'fa-envelope'
            },
            {
                id: 'phone',
                title: '전화번호',
                pattern: '^\\d{2,3}-\\d{3,4}-\\d{4}$',
                category: 'basic',
                description: '한국 전화번호 형식을 검증합니다.',
                examples: {
                    valid: ['02-123-4567', '010-1234-5678'],
                    invalid: ['1234-5678', '010-12345-678']
                },
                icon: 'fa-phone'
            },
            {
                id: 'url',
                title: 'URL',
                pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
                category: 'basic',
                description: 'HTTP/HTTPS URL을 매칭합니다.',
                examples: {
                    valid: ['https://example.com', 'http://www.site.org'],
                    invalid: ['ftp://example.com', 'not-a-url']
                },
                icon: 'fa-link'
            },
            {
                id: 'password-strong',
                title: '강한 비밀번호',
                pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
                category: 'validation',
                description: '8자 이상, 대문자, 소문자, 숫자, 특수문자 포함',
                examples: {
                    valid: ['Password123!', 'MySecure@Pass1'],
                    invalid: ['password', '12345678', 'Password123']
                },
                icon: 'fa-shield-alt'
            },
            {
                id: 'date-iso',
                title: 'ISO 날짜',
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
            }
        ];
    }

    renderCategories() {
        const categories = this.getCategoryStats();
        
        // Update category tabs with counts
        this.filterTabs.forEach(tab => {
            const category = tab.getAttribute('data-category');
            const countElement = tab.querySelector('.category-count');
            
            if (countElement) {
                const count = category === 'all' ? this.patterns.length : 
                             category === 'favorites' ? this.favorites.length :
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
            icon.className = this.currentOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
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
            console.error('Pattern grid element not found. Creating fallback container.');
            
            // Try to find a container to create the pattern grid in
            const container = document.querySelector('.library-container') || 
                            document.querySelector('.main-content') ||
                            document.querySelector('main') ||
                            document.body;
            
            if (container) {
                // Create a fallback pattern grid
                const fallbackGrid = document.createElement('div');
                fallbackGrid.id = 'pattern-grid';
                fallbackGrid.className = 'pattern-grid fallback-grid';
                fallbackGrid.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    padding: 20px;
                    margin: 20px 0;
                `;
                
                container.appendChild(fallbackGrid);
                this.patternGrid = fallbackGrid;
                
                console.log('Created fallback pattern grid');
            } else {
                console.error('No suitable container found for pattern grid');
                return;
            }
        }
        
        console.log('Rendering patterns:', this.filteredPatterns.length);
        
        if (this.filteredPatterns.length === 0) {
            this.patternGrid.innerHTML = this.renderEmptyState();
            return;
        }

        try {
            const patternsHtml = this.filteredPatterns.map(pattern => this.renderPatternCard(pattern)).join('');
            this.patternGrid.innerHTML = patternsHtml;
            
            // Bind card events
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
            const isFavorite = this.favorites.includes(pattern.id);
            const categoryColor = this.getCategoryColor(pattern.category);
            const difficultyClass = pattern.difficulty ? `difficulty-${pattern.difficulty}` : 'difficulty-medium';

            return `
                <div class="pattern-card ${difficultyClass}" data-pattern-id="${pattern.id}">
                    <div class="pattern-header">
                        <div class="pattern-icon" style="color: ${categoryColor}">
                            <i class="fas ${pattern.icon || 'fa-code'}"></i>
                        </div>
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                                onclick="regexLibrary.toggleFavorite('${pattern.id}')"
                                title="${isFavorite ? '즐겨찾기 제거' : '즐겨찾기 추가'}">
                            <i class="fas ${isFavorite ? 'fa-heart' : 'fa-heart-o'}"></i>
                        </button>
                    </div>
                    
                    <div class="pattern-content">
                        <h3 class="pattern-title">${this.escapeHtml(pattern.title || 'Untitled')}</h3>
                        <p class="pattern-description">${this.escapeHtml(pattern.description || 'No description')}</p>
                        
                        <div class="pattern-preview">
                            <code class="pattern-code">${this.escapeHtml(pattern.pattern || '')}</code>
                        </div>
                        
                        <div class="pattern-meta">
                            <span class="category-badge" style="background-color: ${categoryColor}">
                                ${this.getCategoryName(pattern.category)}
                            </span>
                            ${pattern.difficulty ? `<span class="difficulty-badge ${difficultyClass}">${this.getDifficultyName(pattern.difficulty)}</span>` : ''}
                            ${pattern.tags ? pattern.tags.slice(0, 2).map(tag => `<span class="tag-badge">${this.escapeHtml(tag)}</span>`).join('') : ''}
                        </div>
                    </div>
                    
                    <div class="pattern-actions">
                        <button class="action-btn test-btn" 
                                onclick="regexLibrary.testPattern('${pattern.id}')"
                                title="테스트">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="action-btn copy-btn" 
                                onclick="regexLibrary.copyPattern('${pattern.id}')"
                                title="복사">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn detail-btn" 
                                onclick="regexLibrary.showPatternDetail('${pattern.id}')"
                                title="상세보기">
                            <i class="fas fa-info"></i>
                        </button>
                    </div>
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
        
        if (isFiltered && this.currentCategory === 'favorites') {
            return `
                <div class="empty-state">
                    <i class="fas fa-heart empty-icon"></i>
                    <h3>즐겨찾기가 비어있습니다</h3>
                    <p>패턴을 즐겨찾기에 추가해보세요.</p>
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
                <p>이 카테고리에는 패턴이 없습니다.</p>
            </div>
        `;
    }

    bindPatternCardEvents() {
        // Double-click to open detail
        document.querySelectorAll('.pattern-card').forEach(card => {
            card.addEventListener('dblclick', () => {
                const patternId = card.getAttribute('data-pattern-id');
                this.showPatternDetail(patternId);
            });
        });
    }

    showPatternDetail(id) {
        const pattern = this.patterns.find(p => p.id === id);
        if (!pattern) return;

        const modal = this.createPatternModal(pattern);
        document.body.appendChild(modal);
    }

    createPatternModal(pattern) {
        const isFavorite = this.favorites.includes(pattern.id);
        const categoryColor = this.getCategoryColor(pattern.category);

        const modal = document.createElement('div');
        modal.className = 'modal-overlay pattern-detail-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="pattern-info">
                        <div class="pattern-icon" style="color: ${categoryColor}">
                            <i class="fas ${pattern.icon || 'fa-code'}"></i>
                        </div>
                        <div>
                            <h3>${pattern.title}</h3>
                            <p>${pattern.description}</p>
                        </div>
                    </div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="pattern-detail-section">
                        <h4>정규식 패턴</h4>
                        <div class="pattern-display">
                            <code class="pattern-code">${this.escapeHtml(pattern.pattern)}</code>
                            <button class="copy-pattern-btn" onclick="regexLibrary.copyPatternText('${pattern.id}')">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    
                    ${pattern.examples ? `
                    <div class="pattern-detail-section">
                        <h4>예제</h4>
                        <div class="examples-container">
                            <div class="examples-valid">
                                <h5><i class="fas fa-check text-success"></i> 유효한 예제</h5>
                                <ul>
                                    ${pattern.examples.valid.map(example => 
                                        `<li><code>${this.escapeHtml(example)}</code></li>`
                                    ).join('')}
                                </ul>
                            </div>
                            <div class="examples-invalid">
                                <h5><i class="fas fa-times text-error"></i> 무효한 예제</h5>
                                <ul>
                                    ${pattern.examples.invalid.map(example => 
                                        `<li><code>${this.escapeHtml(example)}</code></li>`
                                    ).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="pattern-detail-section">
                        <h4>테스트</h4>
                        <div class="test-section">
                            <div class="test-input-group">
                                <input type="text" id="test-input-${pattern.id}" 
                                       placeholder="테스트할 텍스트를 입력하세요..." 
                                       class="test-input">
                                <button onclick="regexLibrary.testPatternInModal('${pattern.id}')" 
                                        class="btn btn-primary">
                                    테스트
                                </button>
                            </div>
                            <div id="test-result-${pattern.id}" class="test-result"></div>
                        </div>
                    </div>
                    
                    <div class="pattern-meta-detail">
                        <div class="meta-item">
                            <strong>카테고리:</strong>
                            <span class="category-badge" style="background-color: ${categoryColor}">
                                ${this.getCategoryName(pattern.category)}
                            </span>
                        </div>
                        ${pattern.difficulty ? `
                        <div class="meta-item">
                            <strong>난이도:</strong>
                            <span class="difficulty-badge difficulty-${pattern.difficulty}">
                                ${this.getDifficultyName(pattern.difficulty)}
                            </span>
                        </div>
                        ` : ''}
                        ${pattern.tags ? `
                        <div class="meta-item">
                            <strong>태그:</strong>
                            ${pattern.tags.map(tag => `<span class="tag-badge">${tag}</span>`).join('')}
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="regexLibrary.toggleFavorite('${pattern.id}'); this.querySelector('span').textContent = regexLibrary.favorites.includes('${pattern.id}') ? '즐겨찾기 제거' : '즐겨찾기 추가'">
                        <i class="fas ${isFavorite ? 'fa-heart' : 'fa-heart-o'}"></i>
                        <span>${isFavorite ? '즐겨찾기 제거' : '즐겨찾기 추가'}</span>
                    </button>
                    <button class="btn btn-secondary" onclick="regexLibrary.useInTester('${pattern.id}')">
                        <i class="fas fa-flask"></i>
                        테스터에서 사용
                    </button>
                    <button class="btn btn-primary" onclick="regexLibrary.copyPattern('${pattern.id}')">
                        <i class="fas fa-copy"></i>
                        패턴 복사
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    // Pattern actions
    toggleFavorite(id) {
        const index = this.favorites.indexOf(id);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showNotification('즐겨찾기에서 제거되었습니다', 'info');
        } else {
            this.favorites.push(id);
            this.showNotification('즐겨찾기에 추가되었습니다', 'success');
        }
        
        this.saveFavorites();
        this.renderPatterns();
        this.renderCategories();
    }

    copyPattern(id) {
        const pattern = this.patterns.find(p => p.id === id);
        if (!pattern) return;

        navigator.clipboard.writeText(pattern.pattern).then(() => {
            this.showNotification('패턴이 클립보드에 복사되었습니다', 'success');
        }).catch(() => {
            this.showNotification('복사에 실패했습니다', 'error');
        });
    }

    copyPatternText(id) {
        this.copyPattern(id);
    }

    testPattern(id) {
        const pattern = this.patterns.find(p => p.id === id);
        if (!pattern) return;

        // Redirect to tester with pattern
        const testerUrl = `./tester.html?pattern=${encodeURIComponent(pattern.pattern)}`;
        window.open(testerUrl, '_blank');
    }

    testPatternInModal(id) {
        const pattern = this.patterns.find(p => p.id === id);
        const testInput = document.getElementById(`test-input-${id}`);
        const testResult = document.getElementById(`test-result-${id}`);
        
        if (!pattern || !testInput || !testResult) return;

        const testText = testInput.value;
        if (!testText) {
            testResult.innerHTML = '<p class="test-empty">테스트할 텍스트를 입력해주세요.</p>';
            return;
        }

        try {
            const regex = new RegExp(pattern.pattern, 'g');
            const matches = [...testText.matchAll(regex)];

            if (matches.length === 0) {
                testResult.innerHTML = '<p class="test-no-match">매칭된 결과가 없습니다.</p>';
            } else {
                const highlightedText = this.highlightMatches(testText, matches);
                testResult.innerHTML = `
                    <div class="test-success">
                        <p><strong>${matches.length}개의 매칭 발견</strong></p>
                        <div class="highlighted-result">${highlightedText}</div>
                    </div>
                `;
            }
        } catch (error) {
            testResult.innerHTML = `<p class="test-error">오류: ${error.message}</p>`;
        }
    }

    highlightMatches(text, matches) {
        let result = text;
        let offset = 0;

        matches.forEach((match, index) => {
            const start = match.index + offset;
            const end = start + match[0].length;
            const matchText = result.slice(start, end);
            
            const highlighted = `<mark class="match-highlight" title="매칭 #${index + 1}">${this.escapeHtml(matchText)}</mark>`;
            
            result = result.slice(0, start) + highlighted + result.slice(end);
            offset += highlighted.length - matchText.length;
        });

        return result;
    }

    useInTester(id) {
        const pattern = this.patterns.find(p => p.id === id);
        if (!pattern) return;

        // Save to localStorage for tester to pick up
        localStorage.setItem('selectedPattern', JSON.stringify(pattern));
        
        // Navigate to tester
        window.location.href = './tester.html';
    }

    // Utility methods
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

    updatePatternCount() {
        if (this.patternCount) {
            this.patternCount.textContent = this.filteredPatterns.length;
        }
    }

    updateStats() {
        if (this.totalPatternsCount) {
            this.totalPatternsCount.textContent = this.patterns.length;
        }
        if (this.favoritesCount) {
            this.favoritesCount.textContent = this.favorites.length;
        }
        if (this.categoriesCount) {
            const categories = new Set(this.patterns.map(p => p.category));
            this.categoriesCount.textContent = categories.size;
        }
    }

    // Data management
    loadFavorites() {
        try {
            const saved = localStorage.getItem('regexFavorites');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem('regexFavorites', JSON.stringify(this.favorites));
        } catch (e) {
            console.warn('Failed to save favorites:', e);
        }
    }

    // Quick actions
    favoriteCurrentPatterns() {
        let added = 0;
        this.filteredPatterns.forEach(pattern => {
            if (!this.favorites.includes(pattern.id)) {
                this.favorites.push(pattern.id);
                added++;
            }
        });
        
        if (added > 0) {
            this.saveFavorites();
            this.renderPatterns();
            this.renderCategories();
            this.showNotification(`${added}개 패턴이 즐겨찾기에 추가되었습니다`, 'success');
        } else {
            this.showNotification('이미 모든 패턴이 즐겨찾기에 있습니다', 'info');
        }
    }

    exportPatterns() {
        const dataStr = JSON.stringify(this.patterns, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'neo-regex-patterns.json';
        link.click();
        
        this.showNotification('패턴이 내보내기되었습니다', 'success');
    }

    importPatterns() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedPatterns = JSON.parse(e.target.result);
                    this.patterns = [...this.patterns, ...importedPatterns];
                    this.applyFilters();
                    this.renderCategories();
                    this.updateStats();
                    this.showNotification('패턴이 가져오기되었습니다', 'success');
                } catch (error) {
                    this.showNotification('파일 형식이 올바르지 않습니다', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + F: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            this.searchInput?.focus();
        }
        
        // Escape: Close modal
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
        }
    }

    closeModal() {
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info', duration = 3000) {
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
        }, duration);
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing RegexLibrary...');
    
    // Wait a bit for patterns.js to load if it's loaded separately
    setTimeout(() => {
        try {
            window.regexLibrary = new RegexLibrary();
            console.log('📚 NEO Regex Library initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize RegexLibrary:', error);
            
            // Show error message in the main container
            const mainContainer = document.querySelector('.main-content') || 
                                document.querySelector('main') || 
                                document.body;
            
            if (mainContainer) {
                const errorDiv = document.createElement('div');
                errorDiv.innerHTML = `
                    <div style="padding: 40px; text-align: center; background: #fee; border: 1px solid #fcc; border-radius: 8px; margin: 20px;">
                        <h2 style="color: #c00;">라이브러리 초기화 실패</h2>
                        <p>정규식 라이브러리를 초기화하는 중 오류가 발생했습니다.</p>
                        <button onclick="location.reload()" style="padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            페이지 새로고침
                        </button>
                        <details style="margin-top: 20px; text-align: left;">
                            <summary>기술적 세부사항</summary>
                            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; font-size: 12px;">
                                ${error.message}
                                ${error.stack}
                            </pre>
                        </details>
                    </div>
                `;
                mainContainer.insertBefore(errorDiv, mainContainer.firstChild);
            }
        }
    }, 200);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RegexLibrary };
}