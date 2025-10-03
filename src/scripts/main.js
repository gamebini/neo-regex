// NEO Regex Main - 공통 기능 및 초기화

class NeoRegexApp {
    constructor() {
        this.currentTheme = 'dark';
        this.settings = this.loadSettings();
        this.notifications = [];
        
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.applySettings();
        this.initializeNavigation();
        this.setupTheme();
        this.handleRouting();
    }

    bindElements() {
        // Navigation elements
        this.navbar = document.querySelector('.navbar');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        // Theme toggle
        this.themeToggle = document.getElementById('theme-toggle');
        
        // Quick actions
        this.quickActions = document.querySelectorAll('.quick-btn');
        this.scrollTopBtn = document.getElementById('scroll-top');
        
        // Search elements
        this.searchInput = document.getElementById('search-input');
        this.searchResults = document.getElementById('search-results');
        
        // Settings
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        
        // Notification container
        this.notificationContainer = document.getElementById('notification-container') || this.createNotificationContainer();
    }

    bindEvents() {
        // Navigation toggle (mobile)
        this.navToggle?.addEventListener('click', () => this.toggleNavigation());
        
        // Theme toggle
        this.themeToggle?.addEventListener('click', () => this.toggleTheme());
        
        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e, link));
        });
        
        // Quick actions
        this.quickActions.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e, btn));
        });
        
        // Scroll to top
        this.scrollTopBtn?.addEventListener('click', () => this.scrollToTop());
        
        // Search functionality
        this.searchInput?.addEventListener('input', (e) => this.handleSearch(e));
        
        // Settings
        this.settingsBtn?.addEventListener('click', () => this.openSettings());
        
        // Window events
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('beforeunload', () => this.saveSettings());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    // Navigation methods
    toggleNavigation() {
        if (this.navMenu) {
            this.navMenu.classList.toggle('active');
            this.navToggle?.classList.toggle('active');
        }
    }

    handleNavigation(e, link) {
        const href = link.getAttribute('href');
        
        // Handle dropdown toggles
        if (link.classList.contains('dropdown-toggle')) {
            e.preventDefault();
            const dropdown = link.nextElementSibling;
            if (dropdown) {
                dropdown.classList.toggle('active');
            }
        }
        
        // Close mobile menu
        if (window.innerWidth <= 768) {
            this.navMenu?.classList.remove('active');
            this.navToggle?.classList.remove('active');
        }
        
        // Update active state
        this.updateActiveNavLink(href);
    }

    updateActiveNavLink(href) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === href) {
                link.classList.add('active');
            }
        });
    }

    initializeNavigation() {
        // Set active navigation based on current page
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        this.navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath && linkPath.includes(currentPage)) {
                link.classList.add('active');
            }
        });
    }

    // Theme methods
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.saveSettings();
        
        this.showNotification(`${this.currentTheme === 'dark' ? '다크' : '라이트'} 테마로 변경되었습니다`, 'info');
    }

    setupTheme() {
        this.currentTheme = this.settings.theme || 'dark';
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Update theme toggle icon
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        
        // Update meta theme color
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = 'theme-color';
            document.head.appendChild(metaTheme);
        }
        metaTheme.content = this.currentTheme === 'dark' ? '#1a1a1a' : '#ffffff';
    }

    // Quick action methods
    handleQuickAction(e, btn) {
        const action = btn.id;
        
        switch (action) {
            case 'quick-tester':
                window.location.href = './tester.html';
                break;
            case 'quick-library':
                window.location.href = './library.html';
                break;
            case 'quick-builder':
                window.location.href = './builder.html';
                break;
            case 'quick-favorites':
                this.showFavorites();
                break;
            case 'scroll-top':
                this.scrollToTop();
                break;
            default:
                console.warn('Unknown quick action:', action);
        }
    }

    showFavorites() {
        const favorites = this.getFavorites();
        
        if (favorites.length === 0) {
            this.showNotification('즐겨찾기한 패턴이 없습니다', 'info');
            return;
        }
        
        // Create and show favorites modal
        const modal = this.createFavoritesModal(favorites);
        document.body.appendChild(modal);
    }

    createFavoritesModal(favorites) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content favorites-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-heart"></i> 즐겨찾기 패턴</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="favorites-list">
                        ${favorites.map(fav => `
                            <div class="favorite-item">
                                <div class="favorite-info">
                                    <h4>${fav.title}</h4>
                                    <code>${fav.pattern}</code>
                                    <p>${fav.description}</p>
                                </div>
                                <div class="favorite-actions">
                                    <button onclick="neoRegex.copyToClipboard('${fav.pattern}')" title="복사">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                    <button onclick="neoRegex.removeFavorite('${fav.id}')" title="제거">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    // Search methods
    handleSearch(e) {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            this.hideSearchResults();
            return;
        }
        
        this.performSearch(query);
    }

    performSearch(query) {
        // This would typically search through patterns, documentation, etc.
        const results = this.searchPatterns(query);
        this.displaySearchResults(results);
    }

    searchPatterns(query) {
        // Mock search results - in real implementation, this would search through actual patterns
        const mockResults = [
            { title: '이메일 주소', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', category: 'basic' },
            { title: '전화번호', pattern: '^\\d{3}-\\d{3,4}-\\d{4}$', category: 'korean' },
            { title: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', category: 'basic' }
        ];
        
        return mockResults.filter(result => 
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.pattern.includes(query)
        ).slice(0, 5);
    }

    displaySearchResults(results) {
        if (!this.searchResults) return;
        
        if (results.length === 0) {
            this.searchResults.innerHTML = '<div class="no-results">검색 결과가 없습니다</div>';
        } else {
            this.searchResults.innerHTML = results.map(result => `
                <div class="search-result-item" onclick="neoRegex.selectSearchResult('${result.pattern}')">
                    <h4>${result.title}</h4>
                    <code>${result.pattern}</code>
                    <span class="category-badge">${result.category}</span>
                </div>
            `).join('');
        }
        
        this.searchResults.classList.add('active');
    }

    hideSearchResults() {
        if (this.searchResults) {
            this.searchResults.classList.remove('active');
        }
    }

    selectSearchResult(pattern) {
        this.copyToClipboard(pattern);
        this.hideSearchResults();
        this.showNotification('패턴이 클립보드에 복사되었습니다', 'success');
    }

    // Scroll methods
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Show/hide scroll to top button
        if (this.scrollTopBtn) {
            this.scrollTopBtn.classList.toggle('visible', scrollTop > 300);
        }
        
        // Update navbar on scroll
        if (this.navbar) {
            this.navbar.classList.toggle('scrolled', scrollTop > 100);
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Window resize handler
    handleResize() {
        // Close mobile menu on desktop
        if (window.innerWidth > 768) {
            this.navMenu?.classList.remove('active');
            this.navToggle?.classList.remove('active');
        }
        
        // Hide search results on resize
        this.hideSearchResults();
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Esc: Close modals and dropdowns
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
            document.querySelectorAll('.dropdown-content.active').forEach(dropdown => dropdown.classList.remove('active'));
            this.navMenu?.classList.remove('active');
            this.navToggle?.classList.remove('active');
            this.hideSearchResults();
        }
        
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.searchInput?.focus();
        }
        
        // Ctrl/Cmd + T: Toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            this.toggleTheme();
        }
    }

    // Outside click handler
    handleOutsideClick(e) {
        // Close dropdowns
        if (!e.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.dropdown-content.active').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
        
        // Close search results
        if (!e.target.closest('.search-container')) {
            this.hideSearchResults();
        }
    }

    // Settings methods
    openSettings() {
        // Create settings modal
        const modal = this.createSettingsModal();
        document.body.appendChild(modal);
    }

    createSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content settings-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-cog"></i> 설정</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="settings-group">
                        <h4>테마</h4>
                        <div class="setting-item">
                            <label>
                                <input type="radio" name="theme" value="dark" ${this.currentTheme === 'dark' ? 'checked' : ''}>
                                다크 테마
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>
                                <input type="radio" name="theme" value="light" ${this.currentTheme === 'light' ? 'checked' : ''}>
                                라이트 테마
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-group">
                        <h4>기본 설정</h4>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" ${this.settings.autoSave ? 'checked' : ''} onchange="neoRegex.updateSetting('autoSave', this.checked)">
                                자동 저장
                            </label>
                        </div>
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" ${this.settings.showHints ? 'checked' : ''} onchange="neoRegex.updateSetting('showHints', this.checked)">
                                힌트 표시
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-actions">
                        <button class="btn btn-danger" onclick="neoRegex.resetSettings()">
                            <i class="fas fa-trash"></i> 설정 초기화
                        </button>
                        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">
                            저장
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Bind theme change events
        const themeInputs = modal.querySelectorAll('input[name="theme"]');
        themeInputs.forEach(input => {
            input.addEventListener('change', () => {
                if (input.checked) {
                    this.currentTheme = input.value;
                    this.applyTheme();
                    this.saveSettings();
                }
            });
        });
        
        return modal;
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    resetSettings() {
        if (confirm('모든 설정을 초기화하시겠습니까?')) {
            this.settings = this.getDefaultSettings();
            this.currentTheme = 'dark';
            this.applySettings();
            this.saveSettings();
            this.showNotification('설정이 초기화되었습니다', 'info');
        }
    }

    // Data management methods
    loadSettings() {
        try {
            const saved = localStorage.getItem('neoRegexSettings');
            return saved ? JSON.parse(saved) : this.getDefaultSettings();
        } catch (e) {
            console.warn('Failed to load settings:', e);
            return this.getDefaultSettings();
        }
    }

    saveSettings() {
        try {
            const settings = {
                ...this.settings,
                theme: this.currentTheme
            };
            localStorage.setItem('neoRegexSettings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }

    getDefaultSettings() {
        return {
            theme: 'dark',
            autoSave: true,
            showHints: true,
            language: 'ko'
        };
    }

    applySettings() {
        this.currentTheme = this.settings.theme || 'dark';
        this.applyTheme();
    }

    // Favorites management
    getFavorites() {
        try {
            const saved = localStorage.getItem('regexFavorites');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    addFavorite(pattern) {
        const favorites = this.getFavorites();
        if (!favorites.find(fav => fav.id === pattern.id)) {
            favorites.push(pattern);
            localStorage.setItem('regexFavorites', JSON.stringify(favorites));
            this.showNotification('즐겨찾기에 추가되었습니다', 'success');
        }
    }

    removeFavorite(id) {
        const favorites = this.getFavorites();
        const filtered = favorites.filter(fav => fav.id !== id);
        localStorage.setItem('regexFavorites', JSON.stringify(filtered));
        this.showNotification('즐겨찾기에서 제거되었습니다', 'info');
        
        // Refresh favorites modal if open
        const modal = document.querySelector('.favorites-modal');
        if (modal) {
            modal.remove();
            this.showFavorites();
        }
    }

    // Utility methods
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('클립보드에 복사되었습니다', 'success');
        }).catch(() => {
            this.showNotification('복사에 실패했습니다', 'error');
        });
    }

    handleRouting() {
        // Simple client-side routing for SPA-like behavior
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        
        // Update document title based on page
        const titles = {
            'index.html': 'NEO Regex | 차세대 정규식 도구',
            '.../tester/index.html': '정규식 테스터 | NEO Regex',
            '.../library/index.html': '패턴 라이브러리 | NEO Regex',
            '.../builder/index.html': '시각적 빌더 | NEO Regex',
            '.../expert/index.html': '전문가 도구 | NEO Regex',
            '.../docs/index.html': '문서 | NEO Regex',
        };
        
        document.title = titles[page] || 'NEO Regex';
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
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

        this.notificationContainer.appendChild(notification);

        // Auto remove
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

// Utility functions
const Utils = {
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
    },

    throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    },

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    },

    generateRandomId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    },

    formatDate(date) {
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.neoRegex = new NeoRegexApp();
    console.log('🚀 NEO Regex initialized!');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NeoRegexApp, Utils };
}