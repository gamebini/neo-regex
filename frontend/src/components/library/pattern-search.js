// frontend/src/components/library/pattern-search.js
import { regexPatterns, patternCategories, searchPatterns, getPatternsByCategory } from '../../data/patterns.js';
import { copyToClipboard, showNotification, debounce } from '../../utils/helpers.js';

export class PatternLibrary {
    constructor() {
        this.patterns = regexPatterns;
        this.filteredPatterns = regexPatterns;
        this.currentCategory = 'all';
        this.currentSearch = '';
        this.currentDifficulty = 'all';
        
        // Debounced search function
        this.debouncedSearch = debounce((query) => this.performSearch(query), 300);
    }

    render() {
        return `
            <div class="pattern-library">
                <!-- Header -->
                <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">패턴 라이브러리</h2>
                        <p class="text-gray-600 dark:text-gray-400">검증된 정규식 패턴을 찾아보세요</p>
                    </div>
                    <div class="flex items-center space-x-2 mt-4 lg:mt-0">
                        <span class="text-sm text-gray-500">총 ${this.patterns.length}개 패턴</span>
                        <button id="refresh-patterns" class="btn btn-sm btn-secondary">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="grid lg:grid-cols-4 gap-4 mb-6">
                    <!-- Search -->
                    <div class="lg:col-span-2">
                        <div class="relative">
                            <input 
                                type="text" 
                                id="pattern-search" 
                                class="input pl-10 w-full"
                                placeholder="패턴, 제목, 태그로 검색..."
                                value="${this.currentSearch}"
                            >
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            ${this.currentSearch ? `
                                <button id="clear-search" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg class="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Category Filter -->
                    <div>
                        <select id="category-filter" class="input w-full">
                            <option value="all">모든 카테고리</option>
                            ${Object.entries(patternCategories).map(([id, category]) => 
                                `<option value="${id}" ${this.currentCategory === id ? 'selected' : ''}>${category.name}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <!-- Difficulty Filter -->
                    <div>
                        <select id="difficulty-filter" class="input w-full">
                            <option value="all">모든 난이도</option>
                            <option value="beginner" ${this.currentDifficulty === 'beginner' ? 'selected' : ''}>초급</option>
                            <option value="intermediate" ${this.currentDifficulty === 'intermediate' ? 'selected' : ''}>중급</option>
                            <option value="advanced" ${this.currentDifficulty === 'advanced' ? 'selected' : ''}>고급</option>
                        </select>
                    </div>
                </div>

                <!-- Category Stats -->
                <div class="flex flex-wrap gap-2 mb-6">
                    ${Object.entries(patternCategories).map(([id, category]) => {
                        const count = getPatternsByCategory(id).length;
                        const isActive = this.currentCategory === id;
                        return `
                            <button class="category-chip ${isActive ? 'active' : ''}" data-category="${id}">
                                <span class="text-sm">${category.icon}</span>
                                <span>${category.name}</span>
                                <span class="badge badge-secondary ml-1">${count}</span>
                            </button>
                        `;
                    }).join('')}
                </div>

                <!-- Results Count -->
                <div class="flex items-center justify-between mb-4">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        ${this.filteredPatterns.length}개 패턴 ${this.filteredPatterns.length !== this.patterns.length ? `(${this.patterns.length}개 중)` : ''}
                    </p>
                    <div class="flex items-center space-x-2">
                        <button id="grid-view" class="view-toggle active" data-view="grid" title="그리드 보기">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                            </svg>
                        </button>
                        <button id="list-view" class="view-toggle" data-view="list" title="리스트 보기">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Pattern Grid -->
                <div id="patterns-container" class="patterns-grid">
                    ${this.renderPatterns()}
                </div>

                <!-- Empty State -->
                ${this.filteredPatterns.length === 0 ? this.renderEmptyState() : ''}

                <!-- Pattern Detail Modal -->
                <div id="pattern-modal" class="modal hidden">
                    <div class="modal-overlay"></div>
                    <div class="modal-content max-w-4xl">
                        <div id="pattern-modal-content">
                            <!-- Modal content will be inserted here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPatterns() {
        return this.filteredPatterns.map(pattern => this.renderPatternCard(pattern)).join('');
    }

    renderPatternCard(pattern) {
        const category = patternCategories[pattern.category];
        const difficultyColors = {
            beginner: 'text-green-600 bg-green-100',
            intermediate: 'text-yellow-600 bg-yellow-100',
            advanced: 'text-red-600 bg-red-100'
        };

        return `
            <div class="pattern-card" data-pattern-id="${pattern.id}">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center space-x-2">
                        <span class="text-lg">${category.icon}</span>
                        <h3 class="font-semibold text-gray-900 dark:text-white">${pattern.title}</h3>
                    </div>
                    <div class="flex items-center space-x-1">
                        <span class="badge ${difficultyColors[pattern.difficulty]}">${pattern.difficulty}</span>
                        <button class="pattern-menu" data-pattern-id="${pattern.id}">
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="mb-3">
                    <code class="inline-code text-sm break-all">${pattern.pattern}</code>
                    ${pattern.flags ? `<span class="text-xs text-gray-500 ml-1">/${pattern.flags}</span>` : ''}
                </div>

                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">${pattern.description}</p>

                <div class="flex flex-wrap gap-1 mb-3">
                    ${pattern.tags.slice(0, 3).map(tag => 
                        `<span class="badge badge-secondary text-xs">${tag}</span>`
                    ).join('')}
                    ${pattern.tags.length > 3 ? `<span class="text-xs text-gray-500">+${pattern.tags.length - 3}</span>` : ''}
                </div>

                <div class="flex justify-between items-center">
                    <button class="try-pattern btn btn-sm btn-primary" data-pattern-id="${pattern.id}">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        테스트
                    </button>
                    <div class="flex space-x-1">
                        <button class="copy-pattern p-1 text-gray-400 hover:text-gray-600" data-pattern="${pattern.pattern}" title="복사">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                        </button>
                        <button class="view-pattern p-1 text-gray-400 hover:text-gray-600" data-pattern-id="${pattern.id}" title="자세히 보기">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="col-span-full text-center py-12">
                <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">패턴을 찾을 수 없습니다</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">검색 조건을 변경하거나 필터를 초기화해보세요.</p>
                <button id="clear-filters" class="btn btn-primary">필터 초기화</button>
            </div>
        `;
    }

    renderPreview() {
        // Render a preview version for the homepage
        const popularPatterns = this.patterns.slice(0, 6);
        
        return `
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${popularPatterns.map(pattern => this.renderPatternCard(pattern)).join('')}
            </div>
            <div class="text-center mt-6">
                <button class="btn btn-outline" onclick="window.location.hash = 'library'">
                    모든 패턴 보기
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
            </div>
        `;
    }

    attachEventListeners() {
        // Search input
        const searchInput = document.getElementById('pattern-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.debouncedSearch(e.target.value);
            });
        }

        // Clear search
        const clearSearch = document.getElementById('clear-search');
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                this.currentSearch = '';
                searchInput.value = '';
                this.applyFilters();
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.applyFilters();
            });
        }

        // Difficulty filter
        const difficultyFilter = document.getElementById('difficulty-filter');
        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', (e) => {
                this.currentDifficulty = e.target.value;
                this.applyFilters();
            });
        }

        // Category chips
        const categoryChips = document.querySelectorAll('.category-chip');
        categoryChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const category = chip.dataset.category;
                this.currentCategory = this.currentCategory === category ? 'all' : category;
                this.applyFilters();
            });
        });

        // View toggles
        const viewToggles = document.querySelectorAll('.view-toggle');
        viewToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const view = toggle.dataset.view;
                this.setView(view);
            });
        });

        // Pattern actions
        this.attachPatternEventListeners();

        // Clear filters
        const clearFilters = document.getElementById('clear-filters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        // Refresh patterns
        const refreshButton = document.getElementById('refresh-patterns');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.refreshPatterns();
            });
        }

        console.log('✅ Pattern library event listeners attached');
    }

    attachPatternEventListeners() {
        // Try pattern buttons
        const tryButtons = document.querySelectorAll('.try-pattern');
        tryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const patternId = btn.dataset.patternId;
                this.tryPattern(patternId);
            });
        });

        // Copy pattern buttons
        const copyButtons = document.querySelectorAll('.copy-pattern');
        copyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const pattern = btn.dataset.pattern;
                copyToClipboard(pattern);
                showNotification('패턴이 복사되었습니다', 'success');
            });
        });

        // View pattern details
        const viewButtons = document.querySelectorAll('.view-pattern');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const patternId = btn.dataset.patternId;
                this.showPatternDetails(patternId);
            });
        });

        // Pattern cards (click to view details)
        const patternCards = document.querySelectorAll('.pattern-card');
        patternCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on buttons
                if (e.target.closest('button')) return;
                
                const patternId = card.dataset.patternId;
                this.showPatternDetails(patternId);
            });
        });
    }

    performSearch(query) {
        this.currentSearch = query;
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.patterns];

        // Apply search filter
        if (this.currentSearch) {
            filtered = searchPatterns(this.currentSearch);
        }

        // Apply category filter
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(pattern => pattern.category === this.currentCategory);
        }

        // Apply difficulty filter
        if (this.currentDifficulty !== 'all') {
            filtered = filtered.filter(pattern => pattern.difficulty === this.currentDifficulty);
        }

        this.filteredPatterns = filtered;
        this.updateDisplay();
    }

    updateDisplay() {
        const container = document.getElementById('patterns-container');
        if (container) {
            container.innerHTML = this.renderPatterns();
            this.attachPatternEventListeners();
        }

        // Update category chips
        this.updateCategoryChips();

        // Update results count
        this.updateResultsCount();
    }

    updateCategoryChips() {
        const chips = document.querySelectorAll('.category-chip');
        chips.forEach(chip => {
            const category = chip.dataset.category;
            chip.classList.toggle('active', this.currentCategory === category);
        });
    }

    updateResultsCount() {
        const resultsText = document.querySelector('.flex.items-center.justify-between p');
        if (resultsText) {
            resultsText.textContent = `${this.filteredPatterns.length}개 패턴 ${this.filteredPatterns.length !== this.patterns.length ? `(${this.patterns.length}개 중)` : ''}`;
        }
    }

    setView(view) {
        const container = document.getElementById('patterns-container');
        const toggles = document.querySelectorAll('.view-toggle');

        // Update active toggle
        toggles.forEach(toggle => {
            toggle.classList.toggle('active', toggle.dataset.view === view);
        });

        // Update container class
        if (container) {
            container.className = view === 'grid' ? 'patterns-grid' : 'patterns-list';
        }
    }

    clearAllFilters() {
        this.currentSearch = '';
        this.currentCategory = 'all';
        this.currentDifficulty = 'all';

        // Reset UI
        const searchInput = document.getElementById('pattern-search');
        const categoryFilter = document.getElementById('category-filter');
        const difficultyFilter = document.getElementById('difficulty-filter');

        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (difficultyFilter) difficultyFilter.value = 'all';

        this.applyFilters();
        showNotification('필터가 초기화되었습니다', 'info');
    }

    tryPattern(patternId) {
        const pattern = this.patterns.find(p => p.id === patternId);
        if (!pattern) return;

        // Navigate to tester with pattern
        const params = new URLSearchParams({
            p: pattern.pattern,
            f: pattern.flags || '',
            t: pattern.testText || ''
        });

        window.location.hash = `tester?${params.toString()}`;
        showNotification('테스터로 패턴을 전송했습니다', 'success');
    }

    showPatternDetails(patternId) {
        const pattern = this.patterns.find(p => p.id === patternId);
        if (!pattern) return;

        const modal = document.getElementById('pattern-modal');
        const content = document.getElementById('pattern-modal-content');

        if (modal && content) {
            content.innerHTML = this.renderPatternModal(pattern);
            modal.classList.remove('hidden');

            // Attach modal event listeners
            this.attachModalEventListeners(pattern);
        }
    }

    renderPatternModal(pattern) {
        const category = patternCategories[pattern.category];
        
        return `
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">${pattern.title}</h2>
                <button id="close-modal" class="p-2 text-gray-400 hover:text-gray-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <div class="space-y-4">
                <!-- Pattern Info -->
                <div class="flex items-center space-x-4">
                    <span class="text-2xl">${category.icon}</span>
                    <div>
                        <span class="badge badge-secondary">${category.name}</span>
                        <span class="badge ${pattern.difficulty === 'beginner' ? 'badge-success' : pattern.difficulty === 'intermediate' ? 'badge-warning' : 'badge-error'} ml-2">${pattern.difficulty}</span>
                    </div>
                </div>

                <!-- Pattern -->
                <div class="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="font-medium text-gray-900 dark:text-white">정규식 패턴</h3>
                        <button class="copy-modal-pattern btn btn-sm btn-secondary" data-pattern="${pattern.pattern}">복사</button>
                    </div>
                    <code class="block font-mono text-lg break-all">${pattern.pattern}</code>
                    ${pattern.flags ? `<div class="text-sm text-gray-500 mt-1">플래그: ${pattern.flags}</div>` : ''}
                </div>

                <!-- Description -->
                <div>
                    <h3 class="font-medium text-gray-900 dark:text-white mb-2">설명</h3>
                    <p class="text-gray-600 dark:text-gray-400">${pattern.description}</p>
                </div>

                <!-- Examples -->
                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-medium text-gray-900 dark:text-white mb-2 text-sm">✅ 유효한 예시</h4>
                        <div class="space-y-1">
                            ${pattern.examples.valid.map(example => 
                                `<code class="block inline-code text-sm">${example}</code>`
                            ).join('')}
                        </div>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-900 dark:text-white mb-2 text-sm">❌ 무효한 예시</h4>
                        <div class="space-y-1">
                            ${pattern.examples.invalid.map(example => 
                                `<code class="block inline-code text-sm opacity-60">${example}</code>`
                            ).join('')}
                        </div>
                    </div>
                </div>

                <!-- Test Text -->
                ${pattern.testText ? `
                    <div>
                        <h3 class="font-medium text-gray-900 dark:text-white mb-2">테스트 텍스트</h3>
                        <div class="bg-gray-50 dark:bg-slate-800 p-3 rounded">
                            <code class="text-sm">${pattern.testText}</code>
                        </div>
                    </div>
                ` : ''}

                <!-- Explanation -->
                ${pattern.explanation ? `
                    <div>
                        <h3 class="font-medium text-gray-900 dark:text-white mb-2">패턴 설명</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${pattern.explanation}</p>
                    </div>
                ` : ''}

                <!-- Tags -->
                <div>
                    <h3 class="font-medium text-gray-900 dark:text-white mb-2">태그</h3>
                    <div class="flex flex-wrap gap-1">
                        ${pattern.tags.map(tag => 
                            `<span class="badge badge-secondary text-xs">${tag}</span>`
                        ).join('')}
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex space-x-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <button class="try-modal-pattern btn btn-primary flex-1" data-pattern-id="${pattern.id}">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        테스터에서 사용
                    </button>
                    <button class="save-modal-pattern btn btn-secondary" data-pattern-id="${pattern.id}">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        저장
                    </button>
                </div>
            </div>
        `;
    }

    attachModalEventListeners(pattern) {
        // Close modal
        const closeBtn = document.getElementById('close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('pattern-modal').classList.add('hidden');
            });
        }

        // Modal overlay close
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                document.getElementById('pattern-modal').classList.add('hidden');
            });
        }

        // Copy pattern
        const copyBtn = document.querySelector('.copy-modal-pattern');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                copyToClipboard(pattern.pattern);
                showNotification('패턴이 복사되었습니다', 'success');
            });
        }

        // Try pattern
        const tryBtn = document.querySelector('.try-modal-pattern');
        if (tryBtn) {
            tryBtn.addEventListener('click', () => {
                this.tryPattern(pattern.id);
                document.getElementById('pattern-modal').classList.add('hidden');
            });
        }

        // Save pattern
        const saveBtn = document.querySelector('.save-modal-pattern');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.savePattern(pattern.id);
            });
        }
    }

    savePattern(patternId) {
        // TODO: Implement pattern saving
        showNotification('패턴 저장 기능은 곧 출시됩니다', 'info');
    }

    refreshPatterns() {
        // TODO: Refresh patterns from server
        showNotification('패턴이 새로고침되었습니다', 'success');
    }
}