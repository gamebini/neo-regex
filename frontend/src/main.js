// frontend/src/main.js - 모듈 오류 수정
import './styles/main.css';
import { RegexTester } from './core/regex.js';

// 전역 변수
let regexTester = new RegexTester();
let activeFlags = new Set();

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 NEO Regex 초기화 시작...');
    
    initializeNavigation();
    initializeQuickTest();
    initializeRegexTester();
    initializePatternLibrary();
    initializeScrollEffects();
    
    // 환영 메시지 표시
    setTimeout(() => {
        showNotification('NEO Regex에 오신 것을 환영합니다! 🎉', 'success');
    }, 1000);
    
    console.log('✅ 초기화 완료');
});

// =========================
// 네비게이션 관련 함수들
// =========================
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // 햄버거 메뉴 토글
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // 네비게이션 링크 클릭 처리
    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 모든 링크에서 active 클래스 제거
                navLinks.forEach(l => l.classList.remove('active'));
                
                // 클릭된 링크에 active 클래스 추가
                link.classList.add('active');
                
                // 해당 섹션으로 스크롤
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // 모바일 메뉴 닫기
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    if (hamburger) hamburger.classList.remove('active');
                }
            });
        });
    }

    // 스크롤에 따른 네비게이션 상태 업데이트
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop && 
            window.pageYOffset < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// =========================
// 빠른 테스트 섹션
// =========================
function initializeQuickTest() {
    const quickRegexInput = document.getElementById('quick-regex');
    const quickTextInput = document.getElementById('quick-text');
    const quickResultContent = document.getElementById('quick-result-content');

    if (!quickRegexInput || !quickTextInput || !quickResultContent) {
        console.log('빠른 테스트 요소를 찾을 수 없습니다.');
        return;
    }

    // 입력 이벤트 리스너
    quickRegexInput.addEventListener('input', debounce(performQuickTest, 300));
    quickTextInput.addEventListener('input', debounce(performQuickTest, 300));

    // 초기 테스트 실행
    performQuickTest();

    function performQuickTest() {
        const pattern = quickRegexInput.value.trim();
        const text = quickTextInput.value;

        if (!pattern) {
            quickResultContent.innerHTML = '정규식을 입력하면 실시간으로 결과가 표시됩니다.';
            return;
        }

        try {
            const regex = new RegExp(pattern, 'g');
            const matches = [...text.matchAll(regex)];
            
            if (matches.length === 0) {
                quickResultContent.innerHTML = '<span style="color: #ef4444;">매치되는 텍스트가 없습니다.</span>';
            } else {
                let highlightedText = text;
                let offset = 0;
                
                matches.forEach(match => {
                    const start = match.index + offset;
                    const end = start + match[0].length;
                    const highlighted = `<span style="background-color: #fef3c7; color: #92400e; padding: 2px 4px; border-radius: 4px; font-weight: 600;">${escapeHtml(match[0])}</span>`;
                    
                    highlightedText = highlightedText.substring(0, start) + 
                                    highlighted + 
                                    highlightedText.substring(end);
                    
                    offset += highlighted.length - match[0].length;
                });
                
                quickResultContent.innerHTML = `<div style="color: #10b981; margin-bottom: 1rem;">${matches.length}개 매치</div><pre style="white-space: pre-wrap; margin: 0;">${highlightedText}</pre>`;
            }
        } catch (error) {
            quickResultContent.innerHTML = `<span style="color: #ef4444;">오류: ${error.message}</span>`;
        }
    }
}

// =========================
// 정규식 테스터 섹션
// =========================
function initializeRegexTester() {
    const regexInput = document.getElementById('regex-pattern');
    const testTextArea = document.getElementById('test-text');
    const flagButtons = document.querySelectorAll('.flag-button');
    const resultsContainer = document.getElementById('results-container');
    const matchCount = document.getElementById('match-count');

    if (!regexInput || !testTextArea || !resultsContainer) {
        console.log('정규식 테스터 요소를 찾을 수 없습니다.');
        return;
    }

    // 플래그 버튼 이벤트
    flagButtons.forEach(button => {
        button.addEventListener('click', () => {
            const flag = button.getAttribute('data-flag');
            
            if (activeFlags.has(flag)) {
                activeFlags.delete(flag);
                button.classList.remove('active');
            } else {
                activeFlags.add(flag);
                button.classList.add('active');
            }
            
            performRegexTest();
        });
    });

    // 입력 이벤트
    regexInput.addEventListener('input', debounce(performRegexTest, 300));
    testTextArea.addEventListener('input', debounce(performRegexTest, 300));

    function performRegexTest() {
        const pattern = regexInput.value.trim();
        const text = testTextArea.value;
        const flags = Array.from(activeFlags).join('');

        if (!pattern) {
            resultsContainer.innerHTML = '<div class="no-matches">정규식을 입력하면 매칭 결과가 여기에 표시됩니다.</div>';
            if (matchCount) matchCount.textContent = '0개 매치';
            return;
        }

        try {
            regexTester.setPattern(pattern, flags).setText(text);
            const result = regexTester.test();

            if (result.success) {
                displayTestResults(result);
                if (matchCount) matchCount.textContent = `${result.totalMatches}개 매치`;
            } else {
                resultsContainer.innerHTML = `<div class="no-matches">오류: ${result.error}</div>`;
                if (matchCount) matchCount.textContent = '오류';
            }
        } catch (error) {
            resultsContainer.innerHTML = `<div class="no-matches">오류: ${error.message}</div>`;
            if (matchCount) matchCount.textContent = '오류';
        }
    }

    function displayTestResults(result) {
        if (result.totalMatches === 0) {
            resultsContainer.innerHTML = '<div class="no-matches">매치되는 텍스트가 없습니다.</div>';
            return;
        }

        let html = '';
        result.matches.forEach((match, index) => {
            html += `
                <div class="match-item">
                    <div class="match-header">
                        <strong>매치 ${index + 1}</strong>
                        <span>위치: ${match.position}-${match.position + match.length}</span>
                    </div>
                    <div class="match-text">
                        <span class="match-highlight">${escapeHtml(match.match)}</span>
                    </div>
                    ${match.groups.length > 0 ? `
                        <div class="match-groups">
                            <strong>그룹:</strong>
                            ${match.groups.map((group, i) => `
                                <span class="match-group">$${i + 1}: ${escapeHtml(group || '')}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });

        resultsContainer.innerHTML = html;
    }
}

// =========================
// 패턴 라이브러리 섹션
// =========================
function initializePatternLibrary() {
    const searchInput = document.getElementById('pattern-search');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const patternsGrid = document.getElementById('patterns-grid');

    if (!patternsGrid) {
        console.log('패턴 라이브러리 요소를 찾을 수 없습니다.');
        return;
    }

    let currentCategory = 'all';

    // 카테고리 탭 이벤트
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 모든 탭에서 active 클래스 제거
            categoryTabs.forEach(t => t.classList.remove('active'));
            
            // 클릭된 탭에 active 클래스 추가
            tab.classList.add('active');
            
            // 현재 카테고리 업데이트
            currentCategory = tab.getAttribute('data-category');
            
            // 패턴 필터링
            filterPatterns();
        });
    });

    // 검색 입력 이벤트
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterPatterns, 300));
    }

    function filterPatterns() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const patternCards = document.querySelectorAll('.pattern-card');

        patternCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const title = card.querySelector('.pattern-title')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.pattern-description')?.textContent.toLowerCase() || '';
            
            const matchesCategory = currentCategory === 'all' || category === currentCategory;
            const matchesSearch = searchTerm === '' || 
                                title.includes(searchTerm) || 
                                description.includes(searchTerm);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.3s ease-out';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // 패턴 카드 클릭 이벤트
    patternsGrid.addEventListener('click', (e) => {
        const patternCard = e.target.closest('.pattern-card');
        if (patternCard) {
            const regexElement = patternCard.querySelector('.pattern-regex');
            if (regexElement) {
                const regex = regexElement.textContent.replace('복사', '').trim();
                
                // 정규식 테스터로 복사
                const regexInput = document.getElementById('regex-pattern');
                if (regexInput) {
                    regexInput.value = regex;
                    
                    // 테스터 섹션으로 스크롤
                    const testerSection = document.getElementById('tester');
                    if (testerSection) {
                        testerSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                    
                    // 테스트 실행
                    setTimeout(() => {
                        regexInput.dispatchEvent(new Event('input'));
                    }, 500);
                    
                    showNotification('패턴이 테스터로 복사되었습니다!', 'success');
                }
            }
        }
    });
}

// =========================
// 스크롤 이벤트 및 애니메이션
// =========================
function initializeScrollEffects() {
    // Intersection Observer로 요소가 뷰포트에 들어올 때 애니메이션
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 애니메이션할 요소들 관찰
    const animateElements = document.querySelectorAll('.feature-card, .pattern-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });

    // 네비게이션 배경 투명도 조절
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        }
    });
}

// =========================
// 유틸리티 함수들
// =========================

// 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 클립보드에 복사
function copyToClipboard(element) {
    const text = element.textContent.replace('복사', '').trim();
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('클립보드에 복사되었습니다!', 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

// 클립보드 복사 폴백
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('클립보드에 복사되었습니다!', 'success');
    } catch (err) {
        showNotification('복사에 실패했습니다.', 'error');
    }
    
    document.body.removeChild(textArea);
}

// 알림 표시
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    notification.innerHTML = `
        <i class="${iconMap[type] || iconMap.info}"></i>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(notification);

    // 5초 후 자동 제거
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// =========================
// 전역 함수들 (HTML에서 호출됨)
// =========================

// 글로벌 스코프에 함수 노출
window.copyToClipboard = copyToClipboard;
window.showNotification = showNotification;

// 에러 핸들링
window.addEventListener('error', (e) => {
    console.error('JavaScript 오류:', e.error);
});

// 언핸들드 프로미스 리젝션 처리
window.addEventListener('unhandledrejection', (e) => {
    console.error('처리되지 않은 Promise 거부:', e.reason);
    e.preventDefault();
});

console.log('🎉 NEO Regex JavaScript 로드 완료!');