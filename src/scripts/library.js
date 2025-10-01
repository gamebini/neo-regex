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
            this.showError('초기화 오류', '라이브러리 초기화 중 오류가 발생했습니다.');
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

    async loadPatterns() {
        try {
            console.log('Loading patterns from JSON...');
            
            // JSON 파일 경로를 명확하게 지정
            const jsonPath = './src/data/patterns.json';
            
            // fetch로 JSON 파일 로드
            const response = await fetch(jsonPath);
            
            // HTTP 응답 상태 확인
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // JSON 파싱
            const data = await response.json();
            
            console.log('JSON loaded successfully:', data);
            
            // JSON 구조 확인 및 패턴 추출
            if (data && data.patterns && Array.isArray(data.patterns)) {
                this.patterns = data.patterns;
            } else if (Array.isArray(data)) {
                this.patterns = data;
            } else {
                throw new Error('Invalid JSON structure');
            }
            
            console.log(`Loaded ${this.patterns.length} patterns`);
            
            // 초기 필터링 및 렌더링
            this.filteredPatterns = [...this.patterns];
            this.updateStats();
            this.hideLoading();
            this.sortPatterns();
            this.renderPatterns();
            
        } catch (error) {
            console.error('Failed to load patterns:', error);
            this.hideLoading();
            
            // 오류 타입에 따른 메시지 처리
            let errorMessage = '패턴 데이터를 불러올 수 없습니다.';
            let errorDetails = error.message;
            
            if (error.message.includes('404')) {
                errorMessage = 'JSON 파일을 찾을 수 없습니다.';
                errorDetails = 'src/data/patterns.json 파일이 존재하는지 확인해주세요.';
            } else if (error.message.includes('JSON')) {
                errorMessage = 'JSON 파일 파싱 오류';
                errorDetails = 'JSON 파일의 형식이 올바르지 않습니다.';
            } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                errorMessage = '네트워크 오류';
                errorDetails = '로컬 파일 시스템에서는 Live Server를 사용해야 합니다.';
            }
            
            this.showError(errorMessage, errorDetails);
        }
    }

    updateStats() {
        const totalCount = this.patterns.length;
        const filteredCount = this.filteredPatterns.length;
        
        if (this.totalPatternsCount) {
            this.totalPatternsCount.textContent = totalCount;
        }
        
        if (this.resultsCount) {
            this.resultsCount.textContent = `${filteredCount}개의 패턴`;
        }
    }

    handleSearch() {
        this.searchQuery = this.searchInput?.value.toLowerCase() || '';
        this.applyFilters();
        
        if (this.clearSearchBtn) {
            this.clearSearchBtn.style.display = this.searchQuery ? 'flex' : 'none';
        }
    }

    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
            this.searchQuery = '';
            this.applyFilters();
            
            if (this.clearSearchBtn) {
                this.clearSearchBtn.style.display = 'none';
            }
        }
    }

    handleCategoryFilter(tab) {
        this.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        this.currentCategory = tab.getAttribute('data-category');
        
        if (this.activeFilter) {
            const categoryNames = {
                'all': '전체',
                'basic': '기본 패턴',
                'validation': '검증 패턴',
                'korean': '한국어 패턴',
                'developer': '개발자 패턴'
            };
            this.activeFilter.textContent = categoryNames[this.currentCategory] || '전체';
        }
        
        this.applyFilters();
    }

    applyFilters() {
        this.filteredPatterns = this.patterns.filter(pattern => {
            // Category filter
            const categoryMatch = this.currentCategory === 'all' || 
                                 pattern.category === this.currentCategory;
            
            // Search filter
            const searchMatch = !this.searchQuery || 
                              pattern.title.toLowerCase().includes(this.searchQuery) ||
                              pattern.description.toLowerCase().includes(this.searchQuery) ||
                              (pattern.tags && pattern.tags.some(tag => 
                                  tag.toLowerCase().includes(this.searchQuery)));
            
            return categoryMatch && searchMatch;
        });
        
        this.updateStats();
        this.sortPatterns();
        this.renderPatterns();
    }

    handleViewChange(btn) {
        this.viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.currentView = btn.getAttribute('data-view');
        
        if (this.patternGrid) {
            this.patternGrid.classList.toggle('list-view', this.currentView === 'list');
            this.patternGrid.classList.toggle('grid-view', this.currentView === 'grid');
        }
    }

    handleSort(sortType) {
        this.currentSort = sortType;
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
            this.showError('패턴 로딩 오류', '패턴을 불러오는 중 오류가 발생했습니다.');
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
                    
                    <button class="pattern-card-open-btn" title="상세보기">
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

    renderEmptyState() {
        const message = this.searchQuery ? 
            '검색 결과가 없습니다' : 
            '이 카테고리에 패턴이 없습니다';
        
        return `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>${message}</h3>
                <p>다른 검색어나 카테고리를 시도해보세요</p>
            </div>
        `;
    }

    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'flex';
        }
        if (this.patternGrid) {
            this.patternGrid.style.display = 'none';
        }
    }

    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
        if (this.patternGrid) {
            this.patternGrid.style.display = 'grid';
        }
    }

    showError(title, message) {
        if (this.patternGrid) {
            this.patternGrid.style.display = 'block';
            this.patternGrid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>${title}</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">새로고침</button>
                </div>
            `;
        }
    }

    bindPatternCardEvents() {
        document.querySelectorAll('.pattern-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // 상세보기 버튼 클릭 시에는 이벤트 중복 방지
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

        // 기존 모달 제거
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
                                    복사하기
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

        // 배경 클릭 시 모달 닫기
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // ESC 키로 모달 닫기
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
            
            // 복사 버튼 피드백
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

    darkenColor(color) {
        const colorMap = {
            '#3b82f6': '#2563eb',
            '#10b981': '#059669',
            '#f59e0b': '#d97706',
            '#8b5cf6': '#7c3aed'
        };
        return colorMap[color] || color;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Pattern actions
    testPattern(patternId) {
        const pattern = this.patterns.find(p => p.id === patternId);
        if (pattern) {
            // Store pattern in sessionStorage and redirect to tester
            sessionStorage.setItem('testPattern', JSON.stringify(pattern));
            window.location.href = './tester.html';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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