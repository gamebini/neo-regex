/**
 * NEO Regex - Pattern Library Page
 * 정규식 패턴 라이브러리 페이지
 * 경로: src/pages/library.js
 */

// =========================
// 라이브러리 상태 관리
// =========================
const LibraryState = {
    patterns: [],
    filteredPatterns: [],
    currentCategory: 'all',
    searchQuery: '',
    selectedPattern: null,
    sortBy: 'name', // name, category, complexity, usage
    sortOrder: 'asc' // asc, desc
};

// =========================
// 초기화
// =========================
document.addEventListener('DOMContentLoaded', function() {
    initializeLibrary();
});

async function initializeLibrary() {
    try {
        // 패턴 데이터 로드
        LibraryState.patterns = await loadPatterns();
        LibraryState.filteredPatterns = [...LibraryState.patterns];
        
        // UI 초기화
        initializeSearchAndFilters();
        initializeCategoryTabs();
        initializeSorting();
        initializeModal();
        
        // 패턴 렌더링
        renderPatterns();
        
        // 통계 업데이트
        updateStatistics();
        
        // 키보드 단축키 설정
        setupKeyboardShortcuts();
        
        console.log('✅ 라이브러리 초기화 완료');
        
    } catch (error) {
        console.error('❌ 라이브러리 초기화 실패:', error);
        showErrorMessage('라이브러리 로드에 실패했습니다.');
    }
}

// =========================
// 패턴 데이터 로드
// =========================
async function loadPatterns() {
    // 실제 환경에서는 API에서 로드
    return getDefaultPatterns();
}

function getDefaultPatterns() {
    return [
        // 기본 패턴
        {
            id: 'email',
            title: '이메일 주소',
            category: 'basic',
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            description: '일반적인 이메일 주소 형식을 검증합니다.',
            complexity: 'easy',
            tags: ['email', '이메일', 'validation', '검증'],
            examples: {
                valid: ['user@example.com', 'test.email@domain.org', 'name+tag@company.co.kr'],
                invalid: ['invalid-email', 'user@', '@domain.com', 'user.domain.com']
            },
            usage: 1250,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-15'
        },
        {
            id: 'phone-kr',
            title: '한국 전화번호',
            category: 'basic',
            pattern: '^(\\+82|0)([1-9][0-9]{1,2})([0-9]{3,4})([0-9]{4})$',
            description: '한국 휴대폰 및 일반 전화번호를 검증합니다.',
            complexity: 'medium',
            tags: ['phone', '전화번호', '한국', 'korea'],
            examples: {
                valid: ['010-1234-5678', '+82-10-1234-5678', '02-123-4567'],
                invalid: ['010-12-34', '123-456-7890', '010-1234-567']
            },
            usage: 890,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-10'
        },
        {
            id: 'url',
            title: 'URL 주소',
            category: 'basic',
            pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
            description: 'HTTP 및 HTTPS URL을 검증합니다.',
            complexity: 'medium',
            tags: ['url', 'http', 'https', 'web'],
            examples: {
                valid: ['https://www.example.com', 'http://test.com/path?query=1'],
                invalid: ['not-a-url', 'ftp://invalid', 'https://']
            },
            usage: 1100,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-12'
        },
        
        // 검증 패턴
        {
            id: 'strong-password',
            title: '강력한 비밀번호',
            category: 'validation',
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
            description: '대소문자, 숫자, 특수문자를 포함한 8자 이상의 강력한 비밀번호를 검증합니다.',
            complexity: 'hard',
            tags: ['password', '비밀번호', 'security', '보안'],
            examples: {
                valid: ['Password123!', 'MyP@ssw0rd', 'Secure#2024'],
                invalid: ['password', '12345678', 'Password123', 'PASSWORD!']
            },
            usage: 756,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-08'
        },
        {
            id: 'credit-card',
            title: '신용카드 번호',
            category: 'validation',
            pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$',
            description: 'Visa, MasterCard, American Express 등 주요 신용카드 번호를 검증합니다.',
            complexity: 'hard',
            tags: ['credit card', '신용카드', 'payment', '결제'],
            examples: {
                valid: ['4111111111111111', '5555555555554444', '378282246310005'],
                invalid: ['1234567890123456', '4111-1111-1111-1111', '411111111111111']
            },
            usage: 432,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-05'
        },
        {
            id: 'ssn-kr',
            title: '주민등록번호',
            category: 'validation',
            pattern: '^(?:[0-9]{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[1,2][0-9]|3[0,1]))-?[1-4]-?[0-9]{6}$',
            description: '한국 주민등록번호 형식을 검증합니다.',
            complexity: 'hard',
            tags: ['ssn', '주민등록번호', '한국', 'korea'],
            examples: {
                valid: ['901201-1234567', '850315-2123456', '990229-4567890'],
                invalid: ['901301-1234567', '850230-1234567', '991301-1234567']
            },
            usage: 234,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-03'
        },
        
        // 개발자 패턴
        {
            id: 'hex-color',
            title: 'HEX 색상 코드',
            category: 'developer',
            pattern: '^#(?:[0-9a-fA-F]{3}){1,2}$',
            description: 'CSS HEX 색상 코드를 검증합니다.',
            complexity: 'easy',
            tags: ['hex', 'color', '색상', 'css'],
            examples: {
                valid: ['#fff', '#ffffff', '#123ABC', '#a0b1c2'],
                invalid: ['#gg', '#12345', 'ffffff', '#1234567']
            },
            usage: 678,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-07'
        },
        {
            id: 'ipv4',
            title: 'IPv4 주소',
            category: 'developer',
            pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
            description: 'IPv4 IP 주소를 검증합니다.',
            complexity: 'medium',
            tags: ['ip', 'ipv4', 'network', '네트워크'],
            examples: {
                valid: ['192.168.1.1', '10.0.0.1', '255.255.255.255'],
                invalid: ['999.999.999.999', '192.168.1', '192.168.1.1.1']
            },
            usage: 543,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-06'
        },
        {
            id: 'html-tag',
            title: 'HTML 태그',
            category: 'developer',
            pattern: '<([a-z][a-z0-9]*)\\b[^>]*>(.*?)</\\1>',
            description: 'HTML 태그와 내용을 매칭합니다.',
            complexity: 'hard',
            tags: ['html', 'tag', 'web', '웹'],
            examples: {
                valid: ['<div>내용</div>', '<p class="text">문단</p>', '<span id="test">텍스트</span>'],
                invalid: ['<div>내용</span>', '<div>내용', '<>내용</>']
            },
            usage: 321,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-04'
        },
        
        // 한국어 패턴
        {
            id: 'korean-name',
            title: '한국 이름',
            category: 'korean',
            pattern: '^[가-힣]{2,4}$',
            description: '한국 사람의 이름을 검증합니다 (2-4자).',
            complexity: 'easy',
            tags: ['korean', '한국어', 'name', '이름'],
            examples: {
                valid: ['김철수', '이영희', '박지성', '홍길동'],
                invalid: ['김', '김철수영희박', 'Kim', 'hong123']
            },
            usage: 445,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-09'
        },
        {
            id: 'korean-only',
            title: '한글만',
            category: 'korean',
            pattern: '^[가-힣\\s]+$',
            description: '한글과 공백만 허용합니다.',
            complexity: 'easy',
            tags: ['korean', '한국어', 'hangul', '한글'],
            examples: {
                valid: ['안녕하세요', '한글 텍스트', '정규식 패턴'],
                invalid: ['Hello', '한글123', '한글!@#']
            },
            usage: 267,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-11'
        }
    ];
}

// =========================
// 검색 및 필터링
// =========================
function initializeSearchAndFilters() {
    const searchInput = document.getElementById('pattern-search');
    const clearButton = document.getElementById('clear-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                clearSearch();
            }
        });
    }
    
    if (clearButton) {
        clearButton.addEventListener('click', clearSearch);
    }
}

function handleSearch(e) {
    LibraryState.searchQuery = e.target.value.toLowerCase().trim();
    filterAndRenderPatterns();
    updateURL();
}

function clearSearch() {
    const searchInput = document.getElementById('pattern-search');
    if (searchInput) {
        searchInput.value = '';
        LibraryState.searchQuery = '';
        filterAndRenderPatterns();
        updateURL();
        searchInput.focus();
    }
}

// =========================
// 카테고리 탭
// =========================
function initializeCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 모든 탭에서 active 클래스 제거
            categoryTabs.forEach(t => t.classList.remove('active'));
            
            // 클릭된 탭에 active 클래스 추가
            tab.classList.add('active');
            
            // 카테고리 업데이트
            LibraryState.currentCategory = tab.dataset.category || 'all';
            
            // 필터링 및 렌더링
            filterAndRenderPatterns();
            updateURL();
            
            // 사용량 추적
            trackCategoryUsage(LibraryState.currentCategory);
        });
    });
}

// =========================
// 정렬
// =========================
function initializeSorting() {
    const sortSelect = document.getElementById('sort-select');
    const sortOrderButton = document.getElementById('sort-order');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            LibraryState.sortBy = e.target.value;
            filterAndRenderPatterns();
            updateURL();
        });
    }
    
    if (sortOrderButton) {
        sortOrderButton.addEventListener('click', () => {
            LibraryState.sortOrder = LibraryState.sortOrder === 'asc' ? 'desc' : 'asc';
            updateSortOrderButton();
            filterAndRenderPatterns();
            updateURL();
        });
    }
    
    updateSortOrderButton();
}

function updateSortOrderButton() {
    const button = document.getElementById('sort-order');
    if (button) {
        const icon = button.querySelector('i');
        if (icon) {
            icon.className = LibraryState.sortOrder === 'asc' ? 'fas fa-sort-alpha-down' : 'fas fa-sort-alpha-up';
        }
        button.title = LibraryState.sortOrder === 'asc' ? '오름차순' : '내림차순';
    }
}

// =========================
// 패턴 필터링 및 정렬
// =========================
function filterAndRenderPatterns() {
    // 필터링
    LibraryState.filteredPatterns = LibraryState.patterns.filter(pattern => {
        // 카테고리 필터
        const categoryMatch = LibraryState.currentCategory === 'all' || 
                             pattern.category === LibraryState.currentCategory;
        
        // 검색 필터
        const searchMatch = !LibraryState.searchQuery || 
                           pattern.title.toLowerCase().includes(LibraryState.searchQuery) ||
                           pattern.description.toLowerCase().includes(LibraryState.searchQuery) ||
                           pattern.tags.some(tag => tag.toLowerCase().includes(LibraryState.searchQuery));
        
        return categoryMatch && searchMatch;
    });
    
    // 정렬
    LibraryState.filteredPatterns.sort((a, b) => {
        let aValue, bValue;
        
        switch (LibraryState.sortBy) {
            case 'name':
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
                break;
            case 'category':
                aValue = a.category;
                bValue = b.category;
                break;
            case 'complexity':
                const complexityOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
                aValue = complexityOrder[a.complexity];
                bValue = complexityOrder[b.complexity];
                break;
            case 'usage':
                aValue = a.usage || 0;
                bValue = b.usage || 0;
                break;
            default:
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
        }
        
        if (typeof aValue === 'string') {
            return LibraryState.sortOrder === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        } else {
            return LibraryState.sortOrder === 'asc' 
                ? aValue - bValue 
                : bValue - aValue;
        }
    });
    
    // 렌더링
    renderPatterns();
    updateStat