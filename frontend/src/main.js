// NEO Regex Frontend - Main Entry Point
import { RegexTester } from './components/tester/regex-tester.js';
import { Navigation } from './components/common/navigation.js';
import { Footer } from './components/common/footer.js';
import { PatternLibrary } from './components/library/pattern-search.js';
import { showNotification, hideLoading, showLoading } from './utils/helpers.js';

// 앱 상태 관리
class App {
    constructor() {
        this.currentPage = 'home';
        this.components = {};
        this.init();
    }

    async init() {
        try {
            showLoading();
            
            // 컴포넌트 초기화
            await this.initializeComponents();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 라우팅 설정
            this.setupRouting();
            
            // 초기 페이지 로드
            this.handleRoute();
            
            hideLoading();
            showNotification('NEO Regex에 오신 것을 환영합니다!', 'success');
            
        } catch (error) {
            console.error('앱 초기화 실패:', error);
            hideLoading();
            showNotification('앱을 로드하는 중 오류가 발생했습니다.', 'error');
        }
    }

    async initializeComponents() {
        // 네비게이션 컴포넌트 초기화
        this.components.navigation = new Navigation();
        const navContainer = document.getElementById('navigation');
        if (navContainer) {
            navContainer.innerHTML = this.components.navigation.render();
        }

        // 푸터 컴포넌트 초기화
        this.components.footer = new Footer();
        const footerContainer = document.getElementById('footer');
        if (footerContainer) {
            footerContainer.innerHTML = this.components.footer.render();
        }

        // 정규식 테스터 컴포넌트 초기화
        this.components.regexTester = new RegexTester();
        const testerContainer = document.getElementById('regex-tester-container');
        if (testerContainer) {
            testerContainer.innerHTML = this.components.regexTester.render();
            this.components.regexTester.attachEventListeners();
        }

        // 패턴 라이브러리 미리보기 초기화
        this.components.patternLibrary = new PatternLibrary();
        const patternPreview = document.getElementById('pattern-library-preview');
        if (patternPreview) {
            patternPreview.innerHTML = this.components.patternLibrary.renderPreview();
        }

        console.log('✅ 모든 컴포넌트가 초기화되었습니다.');
    }

    setupEventListeners() {
        // 히어로 섹션 버튼들
        const startTestingBtn = document.getElementById('start-testing-btn');
        const learnMoreBtn = document.getElementById('learn-more-btn');

        if (startTestingBtn) {
            startTestingBtn.addEventListener('click', () => {
                this.scrollToElement('quick-tester');
            });
        }

        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => {
                this.scrollToElement('features');
            });
        }

        // 키보드 단축키
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K: 빠른 테스터로 포커스
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusRegexTester();
            }
            
            // ESC: 모달 닫기
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });

        // 테마 토글 (다크모드)
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        console.log('✅ 이벤트 리스너가 설정되었습니다.');
    }

    setupRouting() {
        // 간단한 해시 기반 라우팅
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });

        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        const [page, ...params] = hash.split('/');

        switch (page) {
            case 'home':
                this.showHomePage();
                break;
            case 'tester':
                this.showTesterPage();
                break;
            case 'library':
                this.showLibraryPage();
                break;
            case 'builder':
                this.showBuilderPage();
                break;
            default:
                this.showHomePage();
        }

        this.currentPage = page;
        console.log(`📍 페이지 이동: ${page}`);
    }

    showHomePage() {
        // 홈페이지는 이미 로드되어 있으므로 특별한 처리 불필요
        document.title = 'NEO Regex - 차세대 정규식 도구';
    }

    showTesterPage() {
        // 테스터 페이지로 스크롤하거나 전용 페이지 로드
        this.scrollToElement('quick-tester');
        document.title = 'NEO Regex - 정규식 테스터';
    }

    showLibraryPage() {
        // 패턴 라이브러리 페이지 로드 (추후 구현)
        showNotification('패턴 라이브러리 페이지는 곧 출시됩니다!', 'info');
        document.title = 'NEO Regex - 패턴 라이브러리';
    }

    showBuilderPage() {
        // 시각적 빌더 페이지 로드 (추후 구현)
        showNotification('시각적 빌더 기능은 곧 출시됩니다!', 'info');
        document.title = 'NEO Regex - 시각적 빌더';
    }

    // 유틸리티 메서드들
    scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    focusRegexTester() {
        const regexInput = document.querySelector('.regex-input');
        if (regexInput) {
            regexInput.focus();
            this.scrollToElement('quick-tester');
        }
    }

    closeModals() {
        // 모든 모달 닫기
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }

    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark');
        
        if (isDark) {
            body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            showNotification('라이트 모드로 변경되었습니다', 'success');
        } else {
            body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            showNotification('다크 모드로 변경되었습니다', 'success');
        }
    }

    // 컴포넌트 외부에서 접근 가능한 메서드들
    getComponent(name) {
        return this.components[name];
    }

    updateComponent(name, data) {
        if (this.components[name] && this.components[name].update) {
            this.components[name].update(data);
        }
    }
}

// 앱 초기화 및 전역 접근
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});

// 개발 환경에서 디버깅용
if (import.meta.env?.DEV) {
    window.app = app;
    console.log('🔧 개발 모드: window.app으로 앱 인스턴스에 접근 가능합니다.');
}

// 에러 핸들링
window.addEventListener('error', (event) => {
    console.error('전역 에러:', event.error);
    showNotification('예상치 못한 오류가 발생했습니다.', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('처리되지 않은 Promise 거부:', event.reason);
    showNotification('네트워크 오류가 발생했습니다.', 'error');
});

export { app };