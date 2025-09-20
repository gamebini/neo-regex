// frontend/src/components/common/navigation.js

export class Navigation {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.isMenuOpen = false;
    }

    render() {
        return `
            <div class="container-wide">
                <div class="flex items-center justify-between h-16">
                    <!-- Logo -->
                    <div class="flex items-center">
                        <a href="/" class="flex items-center space-x-2">
                            <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <span class="text-white font-bold text-sm">NR</span>
                            </div>
                            <span class="text-xl font-bold text-gray-900 dark:text-white">NEO Regex</span>
                        </a>
                    </div>

                    <!-- Desktop Navigation -->
                    <nav class="hidden md:block">
                        <ul class="flex items-center space-x-1">
                            <li>
                                <a href="#home" class="nav-link active" data-page="home">홈</a>
                            </li>
                            <li>
                                <a href="#tester" class="nav-link" data-page="tester">테스터</a>
                            </li>
                            <li>
                                <a href="#library" class="nav-link" data-page="library">패턴 라이브러리</a>
                            </li>
                            <li>
                                <a href="#builder" class="nav-link" data-page="builder">시각적 빌더</a>
                            </li>
                            <li>
                                <a href="#docs" class="nav-link" data-page="docs">가이드</a>
                            </li>
                        </ul>
                    </nav>

                    <!-- Right side buttons -->
                    <div class="flex items-center space-x-3">
                        <!-- Theme Toggle -->
                        <button id="theme-toggle" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors" title="테마 변경">
                            <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path class="sun-icon ${this.currentTheme === 'dark' ? 'hidden' : ''}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                <path class="moon-icon ${this.currentTheme === 'light' ? 'hidden' : ''}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                            </svg>
                        </button>

                        <!-- Quick Test Button -->
                        <button class="btn btn-primary btn-sm hidden sm:inline-flex" onclick="app.focusRegexTester()">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            빠른 테스트
                        </button>

                        <!-- User Menu (when logged in) -->
                        <div class="relative">
                            <button id="user-menu-toggle" class="hidden items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                <div class="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                                    <span class="text-white text-xs font-medium">U</span>
                                </div>
                                <span class="text-sm text-gray-700 dark:text-gray-300">사용자</span>
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>

                            <!-- User Dropdown -->
                            <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-large border border-gray-200 dark:border-slate-700 py-1 z-50">
                                <a href="#profile" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">프로필</a>
                                <a href="#settings" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">설정</a>
                                <div class="border-t border-gray-100 dark:border-slate-700 my-1"></div>
                                <button class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">로그아웃</button>
                            </div>
                        </div>

                        <!-- Login Button (when not logged in) -->
                        <button class="btn btn-outline btn-sm">로그인</button>

                        <!-- Mobile menu button -->
                        <button id="mobile-menu-toggle" class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                            <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path class="menu-icon ${this.isMenuOpen ? 'hidden' : ''}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                <path class="close-icon ${this.isMenuOpen ? '' : 'hidden'}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Mobile Navigation -->
                <div id="mobile-menu" class="md:hidden ${this.isMenuOpen ? 'block' : 'hidden'} border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <nav class="px-4 py-4 space-y-2">
                        <a href="#home" class="block nav-link active" data-page="home">홈</a>
                        <a href="#tester" class="block nav-link" data-page="tester">테스터</a>
                        <a href="#library" class="block nav-link" data-page="library">패턴 라이브러리</a>
                        <a href="#builder" class="block nav-link" data-page="builder">시각적 빌더</a>
                        <a href="#docs" class="block nav-link" data-page="docs">가이드</a>
                        
                        <div class="border-t border-gray-200 dark:border-slate-700 pt-2 mt-4">
                            <button class="w-full btn btn-primary">빠른 테스트 시작</button>
                        </div>
                    </nav>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // User menu toggle
        const userMenuToggle = document.getElementById('user-menu-toggle');
        if (userMenuToggle) {
            userMenuToggle.addEventListener('click', () => this.toggleUserMenu());
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        console.log('✅ Navigation event listeners attached');
    }

    toggleTheme() {
        const body = document.body;
        const sunIcon = document.querySelector('.sun-icon');
        const moonIcon = document.querySelector('.moon-icon');

        if (this.currentTheme === 'light') {
            this.currentTheme = 'dark';
            body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            if (sunIcon) sunIcon.classList.add('hidden');
            if (moonIcon) moonIcon.classList.remove('hidden');
        } else {
            this.currentTheme = 'light';
            body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            if (sunIcon) sunIcon.classList.remove('hidden');
            if (moonIcon) moonIcon.classList.add('hidden');
        }

        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: this.currentTheme }
        }));

        console.log(`🎨 Theme changed to: ${this.currentTheme}`);
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.querySelector('.menu-icon');
        const closeIcon = document.querySelector('.close-icon');

        if (mobileMenu) {
            if (this.isMenuOpen) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('animate-slide-down');
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('animate-slide-down');
            }
        }

        if (menuIcon && closeIcon) {
            menuIcon.classList.toggle('hidden', this.isMenuOpen);
            closeIcon.classList.toggle('hidden', !this.isMenuOpen);
        }
    }

    toggleUserMenu() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }

    handleNavigation(e) {
        e.preventDefault();
        
        const target = e.target;
        const page = target.dataset.page;
        
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to clicked link
        target.classList.add('active');
        
        // Update URL hash
        window.location.hash = page;
        
        // Close mobile menu if open
        if (this.isMenuOpen) {
            this.toggleMobileMenu();
        }

        console.log(`📍 Navigation to: ${page}`);
    }

    handleOutsideClick(e) {
        // Close user dropdown if clicking outside
        const userMenu = document.getElementById('user-menu-toggle');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (userMenu && userDropdown && !userMenu.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.add('hidden');
        }

        // Close mobile menu if clicking outside
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (this.isMenuOpen && mobileMenuToggle && mobileMenu && 
            !mobileMenuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
            this.toggleMobileMenu();
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Shift + T: Toggle theme
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            this.toggleTheme();
        }

        // Escape: Close all dropdowns
        if (e.key === 'Escape') {
            const userDropdown = document.getElementById('user-dropdown');
            if (userDropdown && !userDropdown.classList.contains('hidden')) {
                userDropdown.classList.add('hidden');
            }
            
            if (this.isMenuOpen) {
                this.toggleMobileMenu();
            }
        }
    }

    updateActiveLink(page) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });
    }

    setUserStatus(isLoggedIn, userData = null) {
        const loginButton = document.querySelector('.btn-outline');
        const userMenuToggle = document.getElementById('user-menu-toggle');

        if (isLoggedIn && userData) {
            // Hide login button, show user menu
            if (loginButton) loginButton.classList.add('hidden');
            if (userMenuToggle) {
                userMenuToggle.classList.remove('hidden');
                userMenuToggle.classList.add('flex');
                
                // Update user info
                const userInitial = userMenuToggle.querySelector('span');
                const userName = userMenuToggle.querySelector('.text-xs');
                if (userInitial) userInitial.textContent = userData.name?.[0] || 'U';
                if (userName) userName.textContent = userData.name || '사용자';
            }
        } else {
            // Show login button, hide user menu
            if (loginButton) loginButton.classList.remove('hidden');
            if (userMenuToggle) {
                userMenuToggle.classList.add('hidden');
                userMenuToggle.classList.remove('flex');
            }
        }
    }

    // Initialize theme on component creation
    init() {
        // Set initial theme
        if (this.currentTheme === 'dark') {
            document.body.classList.add('dark');
        }

        // Apply system theme if no preference set
        if (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.currentTheme = 'dark';
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }

        console.log('🚀 Navigation component initialized');
    }
}