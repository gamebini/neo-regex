// NEO Regex Library - 패턴 라이브러리 관리 (페이지네이션 포함)

class RegexLibrary {
    constructor() {
        this.patterns = [];
        this.filteredPatterns = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.currentSort = 'title';
        this.currentOrder = 'asc';
        this.currentView = 'grid';
        
        // 페이지네이션
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.totalPages = 1;
        
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
        
        // Pagination
        this.paginationContainer = document.getElementById('pagination');
        
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
            pagination: !!this.paginationContainer,
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
            
            const jsonPath = '../src/data/patterns.json';
            const response = await fetch(jsonPath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('JSON loaded successfully:', data);
            
            if (data && data.patterns && Array.isArray(data.patterns)) {
                this.patterns = data.patterns;
            } else if (Array.isArray(data)) {
                this.patterns = data;
            } else {
                throw new Error('Invalid JSON structure');
            }
            
            console.log(`Loaded ${this.patterns.length} patterns`);
            
            this.filteredPatterns = [...this.patterns];
            this.updateStats();
            this.calculatePagination();
            this.hideLoading();
            this.sortPatterns();
            this.renderPatterns();
            this.renderPagination();
            
        } catch (error) {
            console.error('Failed to load patterns:', error);
            this.hideLoading();
            
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
        this.currentPage = 1; // 검색 시 첫 페이지로
        this.applyFilters();
        
        if (this.clearSearchBtn) {
            this.clearSearchBtn.style.display = this.searchQuery ? 'flex' : 'none';
        }
    }

    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
            this.searchQuery = '';
            this.currentPage = 1;
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
        this.currentPage = 1; // 카테고리 변경 시 첫 페이지로
        
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
            const categoryMatch = this.currentCategory === 'all' || 
                                 pattern.category === this.currentCategory;
            
            const searchMatch = !this.searchQuery || 
                              pattern.title.toLowerCase().includes(this.searchQuery) ||
                              pattern.description.toLowerCase().includes(this.searchQuery) ||
                              (pattern.tags && pattern.tags.some(tag => 
                                  tag.toLowerCase().includes(this.searchQuery)));
            
            return categoryMatch && searchMatch;
        });
        
        this.updateStats();
        this.calculatePagination();
        this.sortPatterns();
        this.renderPatterns();
        this.renderPagination();
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

    // 페이지네이션 계산
    calculatePagination() {
        this.totalPages = Math.ceil(this.filteredPatterns.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages);
        }
    }

    // 현재 페이지의 패턴만 가져오기
    getCurrentPagePatterns() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredPatterns.slice(startIndex, endIndex);
    }

    renderPatterns() {
        if (!this.patternGrid) {
            console.error('Pattern grid element not found');
            return;
        }
        
        const patternsToRender = this.getCurrentPagePatterns();
        console.log(`Rendering page ${this.currentPage}: ${patternsToRender.length} patterns`);
        
        if (patternsToRender.length === 0) {
            this.patternGrid.innerHTML = this.renderEmptyState();
            return;
        }

        try {
            const patternsHtml = patternsToRender.map(pattern => 
                this.renderPatternCard(pattern)
            ).join('');
            this.patternGrid.innerHTML = patternsHtml;
            
            this.bindPatternCardEvents();
        } catch (error) {
            console.error('Error rendering patterns:', error);
            this.showError('패턴 로딩 오류', '패턴을 불러오는 중 오류가 발생했습니다.');
        }
    }

    // 페이지네이션 렌더링
    renderPagination() {
        if (!this.paginationContainer) return;
        
        if (this.totalPages <= 1) {
            this.paginationContainer.innerHTML = '';
            return;
        }

        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        let paginationHtml = `
            <button class="page-btn page-prev" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="regexLibrary.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // 첫 페이지
        if (startPage > 1) {
            paginationHtml += `
                <button class="page-btn" onclick="regexLibrary.goToPage(1)">1</button>
            `;
            if (startPage > 2) {
                paginationHtml += `<span class="page-ellipsis">...</span>`;
            }
        }

        // 페이지 번호들
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="regexLibrary.goToPage(${i})">${i}</button>
            `;
        }

        // 마지막 페이지
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                paginationHtml += `<span class="page-ellipsis">...</span>`;
            }
            paginationHtml += `
                <button class="page-btn" onclick="regexLibrary.goToPage(${this.totalPages})">${this.totalPages}</button>
            `;
        }

        paginationHtml += `
            <button class="page-btn page-next" ${this.currentPage === this.totalPages ? 'disabled' : ''} 
                    onclick="regexLibrary.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        this.paginationContainer.innerHTML = paginationHtml;
    }

    // 페이지 이동
    goToPage(page) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) {
            return;
        }

        this.currentPage = page;
        this.renderPatterns();
        this.renderPagination();
        
        // 스크롤을 패턴 그리드 상단으로 부드럽게 이동
        const searchSection = document.querySelector('.search-section');
        if (searchSection) {
            const offset = searchSection.offsetTop + searchSection.offsetHeight;
            window.scrollTo({
                top: offset - 20,
                behavior: 'smooth'
            });
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
                                <h3>예제</h3>
                                <div class="examples-content">
                                    <div class="example-group">
                                        <h4><i class="fas fa-check-circle"></i> 매칭되는 예제</h4>
                                        <ul class="example-list valid-examples">
                                            ${pattern.examples.valid.map(ex => 
                                                `<li>${this.escapeHtml(ex)}</li>`
                                            ).join('')}
                                        </ul>
                                    </div>
                                    <div class="example-group">
                                        <h4><i class="fas fa-times-circle"></i> 매칭되지 않는 예제</h4>
                                        <ul class="example-list invalid-examples">
                                            ${pattern.examples.invalid.map(ex => 
                                                `<li>${this.escapeHtml(ex)}</li>`
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
        
        return modal;
    }

    copyPatternText(id) {
        const pattern = this.patterns.find(p => p.id === id);
        if (!pattern) return;

        navigator.clipboard.writeText(pattern.pattern).then(() => {
            this.showNotification('패턴이 클립보드에 복사되었습니다', 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showNotification('복사 실패', 'error');
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
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 20);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 20);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 20);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
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
                </div>
            `;
            
            const mainContainer = document.querySelector('.library-main') || 
                                document.querySelector('main') || 
                                document.body;
            mainContainer.insertBefore(errorDiv, mainContainer.firstChild);
        }
    }, 200);
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RegexLibrary };
}