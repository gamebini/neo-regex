// frontend/src/components/common/footer.js

export class Footer {
    constructor() {
        this.currentYear = new Date().getFullYear();
    }

    render() {
        return `
            <div class="container-wide">
                <div class="grid md:grid-cols-4 gap-8 py-12">
                    <!-- Brand Section -->
                    <div class="md:col-span-1">
                        <div class="flex items-center space-x-2 mb-4">
                            <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <span class="text-white font-bold text-sm">NR</span>
                            </div>
                            <span class="text-lg font-bold text-white">NEO Regex</span>
                        </div>
                        <p class="text-gray-400 text-sm mb-4">
                            개발자를 위한 가장 직관적이고 강력한 정규식 도구
                        </p>
                        <div class="flex space-x-3">
                            <a href="#" class="text-gray-400 hover:text-white transition-colors" title="GitHub">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                                </svg>
                            </a>
                            <a href="#" class="text-gray-400 hover:text-white transition-colors" title="Twitter">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                            </a>
                            <a href="#" class="text-gray-400 hover:text-white transition-colors" title="Discord">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <!-- Product Links -->
                    <div>
                        <h3 class="text-white font-semibold mb-4">제품</h3>
                        <ul class="space-y-2">
                            <li><a href="#tester" class="text-gray-400 hover:text-white transition-colors text-sm">정규식 테스터</a></li>
                            <li><a href="#library" class="text-gray-400 hover:text-white transition-colors text-sm">패턴 라이브러리</a></li>
                            <li><a href="#builder" class="text-gray-400 hover:text-white transition-colors text-sm">시각적 빌더</a></li>
                            <li><a href="#ai" class="text-gray-400 hover:text-white transition-colors text-sm">AI 어시스턴트</a></li>
                            <li><a href="#api" class="text-gray-400 hover:text-white transition-colors text-sm">API</a></li>
                        </ul>
                    </div>

                    <!-- Resources Links -->
                    <div>
                        <h3 class="text-white font-semibold mb-4">자료</h3>
                        <ul class="space-y-2">
                            <li><a href="#docs" class="text-gray-400 hover:text-white transition-colors text-sm">사용 가이드</a></li>
                            <li><a href="#tutorial" class="text-gray-400 hover:text-white transition-colors text-sm">튜토리얼</a></li>
                            <li><a href="#examples" class="text-gray-400 hover:text-white transition-colors text-sm">예제 모음</a></li>
                            <li><a href="#blog" class="text-gray-400 hover:text-white transition-colors text-sm">블로그</a></li>
                            <li><a href="#changelog" class="text-gray-400 hover:text-white transition-colors text-sm">변경사항</a></li>
                        </ul>
                    </div>

                    <!-- Support Links -->
                    <div>
                        <h3 class="text-white font-semibold mb-4">지원</h3>
                        <ul class="space-y-2">
                            <li><a href="#help" class="text-gray-400 hover:text-white transition-colors text-sm">도움말</a></li>
                            <li><a href="#contact" class="text-gray-400 hover:text-white transition-colors text-sm">문의하기</a></li>
                            <li><a href="#community" class="text-gray-400 hover:text-white transition-colors text-sm">커뮤니티</a></li>
                            <li><a href="#status" class="text-gray-400 hover:text-white transition-colors text-sm">서비스 상태</a></li>
                            <li><a href="#feedback" class="text-gray-400 hover:text-white transition-colors text-sm">피드백</a></li>
                        </ul>
                    </div>
                </div>

                <!-- Bottom Bar -->
                <div class="border-t border-gray-800 pt-8 pb-4">
                    <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div class="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                            <p class="text-gray-400 text-sm">
                                © ${this.currentYear} NEO Regex. All rights reserved.
                            </p>
                            <div class="flex items-center space-x-4 text-sm">
                                <a href="#privacy" class="text-gray-400 hover:text-white transition-colors">개인정보처리방침</a>
                                <a href="#terms" class="text-gray-400 hover:text-white transition-colors">이용약관</a>
                                <a href="#cookies" class="text-gray-400 hover:text-white transition-colors">쿠키 정책</a>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <!-- Language Selector -->
                            <div class="relative">
                                <button id="language-selector" class="text-gray-400 hover:text-white transition-colors text-sm flex items-center space-x-1">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                                    </svg>
                                    <span>한국어</span>
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                                
                                <!-- Language Dropdown -->
                                <div id="language-dropdown" class="hidden absolute bottom-full right-0 mb-2 w-32 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1">
                                    <button class="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors" data-lang="ko">한국어</button>
                                    <button class="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors" data-lang="en">English</button>
                                    <button class="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors" data-lang="ja">日本語</button>
                                </div>
                            </div>

                            <!-- Theme in footer indication -->
                            <div class="flex items-center text-gray-400 text-xs">
                                <span class="mr-1">Made with</span>
                                <svg class="w-3 h-3 text-red-500 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                                </svg>
                                <span>by NEO Team</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Additional Info Bar -->
                <div class="border-t border-gray-800 pt-4">
                    <div class="text-center">
                        <p class="text-gray-500 text-xs">
                            서버 상태: <span id="server-status" class="text-green-400">●</span> 정상 운영 중 |
                            버전: <span class="text-gray-400">v1.0.0</span> |
                            마지막 업데이트: <span class="text-gray-400">${this.formatDate(new Date())}</span>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Language selector
        const languageSelector = document.getElementById('language-selector');
        const languageDropdown = document.getElementById('language-dropdown');

        if (languageSelector && languageDropdown) {
            languageSelector.addEventListener('click', () => {
                languageDropdown.classList.toggle('hidden');
            });

            // Language options
            languageDropdown.querySelectorAll('[data-lang]').forEach(option => {
                option.addEventListener('click', () => {
                    const lang = option.dataset.lang;
                    this.changeLanguage(lang);
                    languageDropdown.classList.add('hidden');
                });
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (languageSelector && languageDropdown && 
                !languageSelector.contains(e.target) && 
                !languageDropdown.contains(e.target)) {
                languageDropdown.classList.add('hidden');
            }
        });

        // Footer links with smooth scrolling
        const footerLinks = document.querySelectorAll('footer a[href^="#"]');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('href');
                if (target && target !== '#') {
                    const element = document.querySelector(target);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // Check server status periodically
        this.checkServerStatus();
        setInterval(() => this.checkServerStatus(), 60000); // Check every minute

        console.log('✅ Footer event listeners attached');
    }

    changeLanguage(lang) {
        // TODO: Implement language change functionality
        const languageNames = {
            ko: '한국어',
            en: 'English',
            ja: '日本語'
        };

        const selector = document.getElementById('language-selector');
        if (selector) {
            const span = selector.querySelector('span');
            if (span) span.textContent = languageNames[lang] || '한국어';
        }

        // Store language preference
        localStorage.setItem('language', lang);
        
        // Dispatch language change event
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lang }
        }));

        console.log(`🌐 Language changed to: ${lang}`);
    }

    async checkServerStatus() {
        const statusIndicator = document.getElementById('server-status');
        if (!statusIndicator) return;

        try {
            const response = await fetch('/health', { 
                method: 'GET',
                cache: 'no-cache'
            });
            
            if (response.ok) {
                statusIndicator.className = 'text-green-400';
                statusIndicator.title = '서버 정상 운영 중';
            } else {
                statusIndicator.className = 'text-yellow-400';
                statusIndicator.title = '서버 응답 지연';
            }
        } catch (error) {
            statusIndicator.className = 'text-red-400';
            statusIndicator.title = '서버 연결 실패';
        }
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    }

    // Newsletter subscription (future feature)
    subscribeNewsletter(email) {
        // TODO: Implement newsletter subscription
        console.log('Newsletter subscription:', email);
    }

    // Feedback submission (future feature)
    submitFeedback(feedback) {
        // TODO: Implement feedback submission
        console.log('Feedback submitted:', feedback);
    }

    init() {
        // Initialize any footer-specific functionality
        console.log('🦶 Footer component initialized');
    }
}