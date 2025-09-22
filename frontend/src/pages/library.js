/**
 * NEO Regex - Pattern Library JavaScript
 * 패턴 라이브러리 페이지의 모든 기능을 관리합니다.
 */

// =========================
// Library State Management
// =========================
const LibraryState = {
  allPatterns: [],
  filteredPatterns: [],
  currentCategory: 'all',
  currentSearch: '',
  currentDifficulty: '',
  currentSort: 'popular',
  currentPage: 1,
  patternsPerPage: 12,
  selectedPattern: null,
  isLoading: false,
  favorites: JSON.parse(localStorage.getItem('neo-regex-favorites')) || []
};

// =========================
// DOM Ready Event
// =========================
document.addEventListener('DOMContentLoaded', function() {
  console.log('📚 패턴 라이브러리 초기화 중...');
  
  initializeLibrary();
  initializeEventListeners();
  loadPatterns();
  
  console.log('✅ 패턴 라이브러리 초기화 완료!');
});

// =========================
// Library Initialization
// =========================
function initializeLibrary() {
  // Initialize search functionality
  setupSearch();
  
  // Initialize filters
  setupFilters();
  
  // Initialize category tabs
  setupCategoryTabs();
  
  // Initialize modal
  setupModal();
  
  // Initialize keyboard shortcuts
  setupKeyboardShortcuts();
}

function initializeEventListeners() {
  // Search input
  const searchInput = document.getElementById('pattern-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    searchInput.addEventListener('keydown', handleSearchKeydown);
  }
  
  // Search clear button
  const searchClear = document.getElementById('search-clear');
  if (searchClear) {
    searchClear.addEventListener('click', clearSearch);
  }
  
  // Filter controls
  const difficultyFilter = document.getElementById('difficulty-filter');
  if (difficultyFilter) {
    difficultyFilter.addEventListener('change', handleDifficultyFilter);
  }
  
  const sortControl = document.getElementById('sort-control');
  if (sortControl) {
    sortControl.addEventListener('change', handleSortChange);
  }
  
  const filterReset = document.getElementById('filter-reset');
  if (filterReset) {
    filterReset.addEventListener('click', resetFilters);
  }
  
  // Load more button
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', loadMorePatterns);
  }
  
  // Modal close events
  const modalOverlay = document.getElementById('pattern-modal-overlay');
  const modalClose = document.getElementById('modal-close');
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
}

// =========================
// Pattern Data Loading
// =========================
async function loadPatterns() {
  try {
    setLoading(true);
    
    // In a real app, this would be an API call
    // For now, we'll use the patterns from the data file
    LibraryState.allPatterns = window.RegexPatterns || await loadPatternsFromFile();
    
    // Apply initial filters and display
    filterAndDisplayPatterns();
    
    setLoading(false);
    
    if (window.NeoRegex) {
      window.NeoRegex.trackFeatureUsage('pattern-library', 'loaded');
    }
    
  } catch (error) {
    console.error('패턴 로딩 오류:', error);
    showPatternLoadingError();
    setLoading(false);
  }
}

async function loadPatternsFromFile() {
  // Fallback pattern data if the external file isn't available
  return [
    {
      id: 'email_basic',
      title: '이메일 주소 (기본)',
      category: 'basic',
      difficulty: 'beginner',
      description: '일반적인 이메일 주소 형식을 검증합니다.',
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      flags: '',
      explanation: '이메일 형식의 기본적인 검증 패턴입니다. 로컬 부분(@앞)과 도메인 부분(@뒤)으로 구성됩니다.',
      examples: {
        valid: ['user@example.com', 'test.email@domain.org', 'user.name+tag@example.com'],
        invalid: ['invalid-email', 'user@', '@domain.com', 'user..name@domain.com']
      },
      tags: ['이메일', 'email', '검증', '기본'],
      usage_count: 15420,
      created_date: '2024-01-01',
      updated_date: '2024-01-01'
    },
    {
      id: 'phone_korean',
      title: '한국 전화번호',
      category: 'korean',
      difficulty: 'beginner',
      description: '한국의 휴대폰 번호와 일반 전화번호를 검증합니다.',
      pattern: '^(01[016789]|02|0[3-9][0-9])-?[0-9]{3,4}-?[0-9]{4}$',
      flags: '',
      explanation: '한국의 휴대폰(010, 011, 016, 017, 018, 019)과 지역번호를 포함한 일반 전화번호를 매칭합니다.',
      examples: {
        valid: ['010-1234-5678', '02-123-4567', '031-123-4567', '01012345678'],
        invalid: ['010-123-456', '020-1234-5678', '010-12-5678']
      },
      tags: ['전화번호', 'phone', '한국', '휴대폰'],
      usage_count: 12890,
      created_date: '2024-01-01',
      updated_date: '2024-01-01'
    },
    {
      id: 'url_http',
      title: 'URL 주소',
      category: 'web',
      difficulty: 'intermediate',
      description: 'HTTP, HTTPS URL 주소를 검증합니다.',
      pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
      flags: '',
      explanation: 'HTTP 또는 HTTPS 프로토콜을 사용하는 URL을 검증합니다. 선택적으로 www 서브도메인을 포함할 수 있습니다.',
      examples: {
        valid: ['https://www.example.com', 'http://example.com/path', 'https://sub.domain.com/path?query=1'],
        invalid: ['www.example.com', 'example', 'ftp://example.com']
      },
      tags: ['URL', 'HTTP', 'HTTPS', '웹주소'],
      usage_count: 9876,
      created_date: '2024-01-01',
      updated_date: '2024-01-01'
    },
    {
      id: 'password_strong',
      title: '강력한 비밀번호',
      category: 'security',
      difficulty: 'advanced',
      description: '대소문자, 숫자, 특수문자를 포함한 8자 이상의 강력한 비밀번호를 검증합니다.',
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
      flags: '',
      explanation: '최소 8자 이상, 소문자, 대문자, 숫자, 특수문자를 각각 최소 1개씩 포함해야 합니다.',
      examples: {
        valid: ['Password123!', 'MyStr0ng@Pass', 'Secure$Pass1'],
        invalid: ['password', 'PASSWORD123', 'Pass123', 'Password!']
      },
      tags: ['비밀번호', 'password', '보안', '검증'],
      usage_count: 8765,
      created_date: '2024-01-01',
      updated_date: '2024-01-01'
    },
    {
      id: 'ip_address',
      title: 'IP 주소 (IPv4)',
      category: 'development',
      difficulty: 'intermediate',
      description: 'IPv4 형식의 IP 주소를 검증합니다.',
      pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
      flags: '',
      explanation: '0.0.0.0부터 255.255.255.255까지의 유효한 IPv4 주소를 매칭합니다.',
      examples: {
        valid: ['192.168.1.1', '127.0.0.1', '255.255.255.255', '0.0.0.0'],
        invalid: ['256.1.1.1', '192.168.1', '192.168.1.1.1', '192.168.01.1']
      },
      tags: ['IP', 'IPv4', '네트워크', '개발'],
      usage_count: 7654,
      created_date: '2024-01-01',
      updated_date: '2024-01-01'
    }
  ];
}

// =========================
// Search Functionality
// =========================
function setupSearch() {
  const searchInput = document.getElementById('pattern-search');
  if (searchInput) {
    // Focus search on Ctrl/Cmd + K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }
}

function handleSearch(e) {
  const searchTerm = e.target.value.trim().toLowerCase();
  LibraryState.currentSearch = searchTerm;
  LibraryState.currentPage = 1;
  
  // Show/hide clear button
  const clearBtn = document.getElementById('search-clear');
  if (clearBtn) {
    clearBtn.style.display = searchTerm ? 'block' : 'none';
  }
  
  filterAndDisplayPatterns();
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('pattern-library', 'search');
  }
}

function handleSearchKeydown(e) {
  if (e.key === 'Escape') {
    clearSearch();
  } else if (e.key === 'Enter') {
    // Focus first pattern card
    const firstCard = document.querySelector('.pattern-card');
    if (firstCard) {
      firstCard.focus();
    }
  }
}

function clearSearch() {
  const searchInput = document.getElementById('pattern-search');
  const clearBtn = document.getElementById('search-clear');
  
  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }
  
  if (clearBtn) {
    clearBtn.style.display = 'none';
  }
  
  LibraryState.currentSearch = '';
  LibraryState.currentPage = 1;
  filterAndDisplayPatterns();
}

// =========================
// Filter Functionality
// =========================
function setupFilters() {
  // Initialize filter states
  updateFilterCounts();
}

function handleDifficultyFilter(e) {
  LibraryState.currentDifficulty = e.target.value;
  LibraryState.currentPage = 1;
  filterAndDisplayPatterns();
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('pattern-library', 'filter-difficulty');
  }
}

function handleSortChange(e) {
  LibraryState.currentSort = e.target.value;
  LibraryState.currentPage = 1;
  filterAndDisplayPatterns();
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('pattern-library', 'sort');
  }
}

function resetFilters() {
  // Reset all filter states
  LibraryState.currentCategory = 'all';
  LibraryState.currentSearch = '';
  LibraryState.currentDifficulty = '';
  LibraryState.currentSort = 'popular';
  LibraryState.currentPage = 1;
  
  // Reset UI elements
  const searchInput = document.getElementById('pattern-search');
  const difficultyFilter = document.getElementById('difficulty-filter');
  const sortControl = document.getElementById('sort-control');
  const clearBtn = document.getElementById('search-clear');
  
  if (searchInput) searchInput.value = '';
  if (difficultyFilter) difficultyFilter.value = '';
  if (sortControl) sortControl.value = 'popular';
  if (clearBtn) clearBtn.style.display = 'none';
  
  // Reset category tabs
  const categoryTabs = document.querySelectorAll('.category-tab');
  categoryTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === 'all');
  });
  
  filterAndDisplayPatterns();
  
  showNotification('필터가 초기화되었습니다.', 'success');
}

// =========================
// Category Management
// =========================
function setupCategoryTabs() {
  const categoryTabs = document.querySelectorAll('.category-tab');
  
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.category;
      selectCategory(category);
    });
  });
}

function selectCategory(category) {
  LibraryState.currentCategory = category;
  LibraryState.currentPage = 1;
  
  // Update active tab
  const categoryTabs = document.querySelectorAll('.category-tab');
  categoryTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === category);
  });
  
  filterAndDisplayPatterns();
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('pattern-library', `category-${category}`);
  }
}

function updateFilterCounts() {
  const categoryTabs = document.querySelectorAll('.category-tab');
  
  categoryTabs.forEach(tab => {
    const category = tab.dataset.category;
    const count = category === 'all' 
      ? LibraryState.allPatterns.length 
      : LibraryState.allPatterns.filter(p => p.category === category).length;
    
    const countSpan = tab.querySelector('.count');
    if (countSpan) {
      countSpan.textContent = count;
    }
  });
}

// =========================
// Pattern Filtering and Display
// =========================
function filterAndDisplayPatterns() {
  // Apply all filters
  let filtered = [...LibraryState.allPatterns];
  
  // Category filter
  if (LibraryState.currentCategory !== 'all') {
    filtered = filtered.filter(pattern => pattern.category === LibraryState.currentCategory);
  }
  
  // Search filter
  if (LibraryState.currentSearch) {
    const searchTerm = LibraryState.currentSearch.toLowerCase();
    filtered = filtered.filter(pattern => 
      pattern.title.toLowerCase().includes(searchTerm) ||
      pattern.description.toLowerCase().includes(searchTerm) ||
      pattern.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  // Difficulty filter
  if (LibraryState.currentDifficulty) {
    filtered = filtered.filter(pattern => pattern.difficulty === LibraryState.currentDifficulty);
  }
  
  // Sort patterns
  filtered = sortPatterns(filtered, LibraryState.currentSort);
  
  LibraryState.filteredPatterns = filtered;
  
  // Display patterns
  displayPatterns();
}

function sortPatterns(patterns, sortBy) {
  switch (sortBy) {
    case 'popular':
      return patterns.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
    case 'name':
      return patterns.sort((a, b) => a.title.localeCompare(b.title));
    case 'newest':
      return patterns.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    case 'difficulty':
      const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
      return patterns.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    default:
      return patterns;
  }
}

function displayPatterns() {
  const grid = document.getElementById('patterns-grid');
  if (!grid) return;
  
  const startIndex = (LibraryState.currentPage - 1) * LibraryState.patternsPerPage;
  const endIndex = startIndex + LibraryState.patternsPerPage;
  const patternsToShow = LibraryState.filteredPatterns.slice(0, endIndex);
  
  if (patternsToShow.length === 0) {
    displayNoPatterns();
    return;
  }
  
  const patternsHTML = patternsToShow.map(pattern => createPatternCard(pattern)).join('');
  grid.innerHTML = patternsHTML;
  
  // Update load more button
  updateLoadMoreButton();
  
  // Add event listeners to pattern cards
  addPatternCardListeners();
}

function createPatternCard(pattern) {
  const difficultyColors = {
    beginner: 'success',
    intermediate: 'warning', 
    advanced: 'error'
  };
  
  const difficultyLabels = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급'
  };
  
  const categoryIcons = {
    basic: 'fas fa-star',
    validation: 'fas fa-shield-alt',
    korean: 'fas fa-flag',
    development: 'fas fa-code',
    web: 'fas fa-globe',
    data: 'fas fa-database',
    security: 'fas fa-lock'
  };
  
  const isFavorite = LibraryState.favorites.includes(pattern.id);
  
  return `
    <div class="pattern-card" data-pattern-id="${pattern.id}" tabindex="0">
      <div class="pattern-header">
        <div class="pattern-meta">
          <span class="pattern-category">
            <i class="${categoryIcons[pattern.category] || 'fas fa-code'}"></i>
            ${pattern.category}
          </span>
          <span class="pattern-difficulty ${difficultyColors[pattern.difficulty]}">
            ${difficultyLabels[pattern.difficulty]}
          </span>
        </div>
        <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${pattern.id}', event)">
          <i class="fas fa-heart"></i>
        </button>
      </div>
      
      <div class="pattern-content">
        <h3 class="pattern-title">${escapeHtml(pattern.title)}</h3>
        <p class="pattern-description">${escapeHtml(pattern.description)}</p>
        
        <div class="pattern-code-preview">
          <code>${escapeHtml(pattern.pattern)}</code>
        </div>
        
        <div class="pattern-tags">
          ${pattern.tags.slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
          ${pattern.tags.length > 3 ? `<span class="tag-more">+${pattern.tags.length - 3}</span>` : ''}
        </div>
      </div>
      
      <div class="pattern-footer">
        <div class="pattern-stats">
          <span class="usage-count">
            <i class="fas fa-download"></i>
            ${formatNumber(pattern.usage_count || 0)}
          </span>
        </div>
        
        <div class="pattern-actions">
          <button class="action-btn" onclick="copyPattern('${pattern.id}', event)" title="복사">
            <i class="fas fa-copy"></i>
          </button>
          <button class="action-btn" onclick="testPattern('${pattern.id}', event)" title="테스트">
            <i class="fas fa-play"></i>
          </button>
          <button class="action-btn primary" onclick="openPatternModal('${pattern.id}', event)" title="상세보기">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function displayNoPatterns() {
  const grid = document.getElementById('patterns-grid');
  if (!grid) return;
  
  grid.innerHTML = `
    <div class="no-patterns">
      <div class="no-patterns-icon">
        <i class="fas fa-search"></i>
      </div>
      <h3>검색 결과가 없습니다</h3>
      <p>다른 검색어나 필터를 시도해보세요.</p>
      <div class="no-patterns-actions">
        <button class="btn btn-primary" onclick="resetFilters()">
          <i class="fas fa-undo"></i>
          필터 초기화
        </button>
        <a href="./tester.html" class="btn btn-secondary">
          <i class="fas fa-plus"></i>
          직접 패턴 만들기
        </a>
      </div>
    </div>
  `;
}

function addPatternCardListeners() {
  const patternCards = document.querySelectorAll('.pattern-card');
  
  patternCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on action buttons
      if (e.target.closest('.action-btn, .favorite-btn')) return;
      
      const patternId = card.dataset.patternId;
      openPatternModal(patternId);
    });
    
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const patternId = card.dataset.patternId;
        openPatternModal(patternId);
      }
    });
  });
}

// =========================
// Load More Functionality
// =========================
function updateLoadMoreButton() {
  const loadMoreSection = document.getElementById('load-more-section');
  const loadMoreBtn = document.getElementById('load-more-btn');
  
  if (!loadMoreSection || !loadMoreBtn) return;
  
  const currentlyShowing = LibraryState.currentPage * LibraryState.patternsPerPage;
  const hasMore = currentlyShowing < LibraryState.filteredPatterns.length;
  
  loadMoreSection.style.display = hasMore ? 'block' : 'none';
  
  if (hasMore) {
    const remaining = LibraryState.filteredPatterns.length - currentlyShowing;
    loadMoreBtn.innerHTML = `
      <i class="fas fa-plus"></i>
      ${remaining}개 더 보기
    `;
  }
}

function loadMorePatterns() {
  LibraryState.currentPage++;
  displayPatterns();
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('pattern-library', 'load-more');
  }
}

// =========================
// Pattern Actions
// =========================
function toggleFavorite(patternId, event) {
  if (event) event.stopPropagation();
  
  const index = LibraryState.favorites.indexOf(patternId);
  
  if (index === -1) {
    LibraryState.favorites.push(patternId);
    showNotification('즐겨찾기에 추가되었습니다.', 'success');
  } else {
    LibraryState.favorites.splice(index, 1);
    showNotification('즐겨찾기에서 제거되었습니다.', 'info');
  }
  
  localStorage.setItem('neo-regex-favorites', JSON.stringify(LibraryState.favorites));
  
  // Update UI
  const favoriteBtn = event.target.closest('.favorite-btn');
  if (favoriteBtn) {
    favoriteBtn.classList.toggle('active', LibraryState.favorites.includes(patternId));
  }
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('pattern-library', 'favorite');
  }
}

function copyPattern(patternId, event) {
  if (event) event.stopPropagation();
  
  const pattern = LibraryState.allPatterns.find(p => p.id === patternId);
  if (!pattern) return;
  
  copyToClipboard(pattern.pattern);
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('pattern-library', 'copy');
  }
}

function testPattern(patternId, event) {
  if (event) event.stopPropagation();
  
  const pattern = LibraryState.allPatterns.find(p => p.id === patternId);
  if (!pattern) return;
  
  // Store pattern for tester page
  sessionStorage.setItem('neo-regex-test-pattern', JSON.stringify(pattern));
  
  // Navigate to tester
  window.location.href = './tester.html';
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('pattern-library', 'test');
  }
}

// =========================
// Pattern Modal
// =========================
function setupModal() {
  // ESC key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && LibraryState.selectedPattern) {
      closeModal();
    }
  });
}

function openPatternModal(patternId, event) {
  if (event) event.stopPropagation();
  
  const pattern = LibraryState.allPatterns.find(p => p.id === patternId);
  if (!pattern) return;
  
  LibraryState.selectedPattern = pattern;
  
  // Update modal content
  updateModalContent(pattern);
  
  // Show modal
  const modalOverlay = document.getElementById('pattern-modal-overlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Focus trap
    const modal = document.getElementById('pattern-modal');
    if (modal) {
      modal.focus();
    }
  }
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('pattern-library', 'modal-open');
  }
}

function updateModalContent(pattern) {
  const difficultyLabels = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급'
  };
  
  // Update basic info
  const modalTitle = document.getElementById('modal-title');
  const modalCategory = document.getElementById('modal-category');
  const modalDifficulty = document.getElementById('modal-difficulty');
  const modalUsage = document.getElementById('modal-usage');
  const modalDescription = document.getElementById('modal-description');
  const modalPattern = document.getElementById('modal-pattern');
  const modalExplanation = document.getElementById('modal-explanation');
  
  if (modalTitle) modalTitle.textContent = pattern.title;
  if (modalCategory) modalCategory.textContent = pattern.category;
  if (modalDifficulty) modalDifficulty.textContent = difficultyLabels[pattern.difficulty];
  if (modalUsage) modalUsage.textContent = `${formatNumber(pattern.usage_count || 0)}회 사용`;
  if (modalDescription) modalDescription.textContent = pattern.description;
  if (modalPattern) modalPattern.textContent = pattern.pattern;
  if (modalExplanation) modalExplanation.textContent = pattern.explanation || '설명이 없습니다.';
  
  // Update examples
  const validExamples = document.getElementById('modal-valid-examples');
  const invalidExamples = document.getElementById('modal-invalid-examples');
  
  if (validExamples && pattern.examples?.valid) {
    validExamples.innerHTML = pattern.examples.valid
      .map(example => `<code class="example valid">${escapeHtml(example)}</code>`)
      .join('');
  }
  
  if (invalidExamples && pattern.examples?.invalid) {
    invalidExamples.innerHTML = pattern.examples.invalid
      .map(example => `<code class="example invalid">${escapeHtml(example)}</code>`)
      .join('');
  }
}

function closeModal() {
  const modalOverlay = document.getElementById('pattern-modal-overlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }
  
  LibraryState.selectedPattern = null;
}

// =========================
// Modal Actions (Global Functions)
// =========================
function copyPatternCode() {
  if (!LibraryState.selectedPattern) return;
  
  copyToClipboard(LibraryState.selectedPattern.pattern);
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('pattern-library', 'modal-copy');
  }
}

function testInTester() {
  if (!LibraryState.selectedPattern) return;
  
  sessionStorage.setItem('neo-regex-test-pattern', JSON.stringify(LibraryState.selectedPattern));
  window.location.href = './tester.html';
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('pattern-library', 'modal-test');
  }
}

function openInBuilder() {
  if (!LibraryState.selectedPattern) return;
  
  sessionStorage.setItem('neo-regex-builder-pattern', JSON.stringify(LibraryState.selectedPattern));
  window.location.href = './builder.html';
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('pattern-library', 'modal-builder');
  }
}

// =========================
// Keyboard Shortcuts
// =========================
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Only when not in input fields
    if (e.target.matches('input, textarea, select')) return;
    
    switch (e.key) {
      case '/':
        e.preventDefault();
        document.getElementById('pattern-search')?.focus();
        break;
      case 'c':
        if (LibraryState.selectedPattern) {
          copyPatternCode();
        }
        break;
      case 't':
        if (LibraryState.selectedPattern) {
          testInTester();
        }
        break;
      case 'b':
        if (LibraryState.selectedPattern) {
          openInBuilder();
        }
        break;
      case 'f':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          document.getElementById('pattern-search')?.focus();
        }
        break;
    }
  });
}

// =========================
// Utility Functions
// =========================
function setLoading(loading) {
  LibraryState.isLoading = loading;
  
  const loadingElement = document.querySelector('.pattern-loading');
  const grid = document.getElementById('patterns-grid');
  
  if (loading) {
    if (grid && !loadingElement) {
      grid.innerHTML = `
        <div class="pattern-loading">
          <div class="loading-spinner lg"></div>
          <p>패턴을 불러오는 중...</p>
        </div>
      `;
    }
  }
}

function showPatternLoadingError() {
  const grid = document.getElementById('patterns-grid');
  if (!grid) return;
  
  grid.innerHTML = `
    <div class="error-state">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h3>패턴을 불러올 수 없습니다</h3>
      <p>네트워크 연결을 확인하고 다시 시도해주세요.</p>
      <button class="btn btn-primary" onclick="loadPatterns()">
        <i class="fas fa-redo"></i>
        다시 시도
      </button>
    </div>
  `;
}

function formatNumber(num) {
  if (num >= 1000000) {
    return Math.floor(num / 1000000) + 'M';
  } else if (num >= 1000) {
    return Math.floor(num / 1000) + 'K';
  }
  return num.toString();
}

// =========================
// Export for Global Access
// =========================
window.LibraryActions = {
  toggleFavorite,
  copyPattern,
  testPattern,
  openPatternModal,
  copyPatternCode,
  testInTester,
  openInBuilder,
  closeModal
};

console.log('📚 패턴 라이브러리 스크립트 로드 완료!');