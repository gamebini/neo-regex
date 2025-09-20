// frontend/src/components/init.js
import { regexTester, patternLibrary } from '../core/regex.js';
import { api, handleApiError, startConnectionMonitoring } from '../utils/api.js';

/**
 * 정규식 테스터 컴포넌트 초기화
 */
export function initRegexTester() {
  console.log('📝 정규식 테스터 초기화 시작...');
  
  const patternInput = document.querySelector('#regex-pattern');
  const testTextArea = document.querySelector('#test-text');
  const testButton = document.querySelector('#test-regex');
  const clearButton = document.querySelector('#clear-all');
  const saveButton = document.querySelector('#save-pattern');
  const resultsContainer = document.querySelector('#test-results');
  const matchResults = document.querySelector('#match-results');
  const flagCheckboxes = document.querySelectorAll('input[type="checkbox"][value]');
  const flagsDisplay = document.querySelector('#pattern-flags');

  if (!patternInput || !testTextArea) {
    console.log('⚠️ 정규식 테스터 요소를 찾을 수 없습니다.');
    return;
  }

  // 플래그 업데이트
  function updateFlags() {
    const flags = Array.from(flagCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value)
      .join('');
    
    if (flagsDisplay) {
      flagsDisplay.textContent = flags || 'none';
    }
    return flags;
  }

  // 결과 표시
  function displayResults(result) {
    if (!resultsContainer || !matchResults) return;

    resultsContainer.classList.remove('hidden');
    matchResults.innerHTML = '';

    if (!result.success) {
      matchResults.innerHTML = `
        <div class="alert alert-error">
          <h4>오류</h4>
          <p>${result.error}</p>
        </div>
      `;
      return;
    }

    if (result.totalMatches === 0) {
      matchResults.innerHTML = `
        <div class="alert alert-warning">
          <h4>매칭 결과 없음</h4>
          <p>입력한 패턴과 일치하는 텍스트가 없습니다.</p>
        </div>
      `;
      return;
    }

    // 성공 결과 표시
    const stats = `
      <div class="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 class="text-green-800 font-semibold mb-2">매칭 성공</h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-green-600">총 매칭:</span>
            <span class="font-semibold">${result.totalMatches}개</span>
          </div>
          <div>
            <span class="text-green-600">실행 시간:</span>
            <span class="font-semibold">${result.executionTime ? result.executionTime.toFixed(2) : '0.00'}ms</span>
          </div>
        </div>
      </div>
    `;

    const matchList = result.matches.map((match, index) => `
      <div class="match-item">
        <div class="match-header">
          <span class="match-index">매칭 ${index + 1}</span>
          <span class="match-position">위치: ${match.index}</span>
        </div>
        <div class="match-text">"${match.match}"</div>
        ${match.groups && match.groups.length > 0 ? `
          <div class="match-groups">
            ${match.groups.map((group, i) => `
              <span class="match-group">$${i + 1}: "${group || ''}"</span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');

    matchResults.innerHTML = stats + matchList;
  }

  // 테스트 실행
  async function runTest() {
    const pattern = patternInput.value.trim();
    const text = testTextArea.value;
    const flags = updateFlags();

    if (!pattern) {
      if (window.utils) {
        window.utils.notify('정규식 패턴을 입력해주세요.', 'warning');
      }
      return;
    }

    if (window.utils) {
      window.utils.loading.show(testButton);
    }

    try {
      regexTester.setPattern(pattern, flags).setText(text);
      const localResult = regexTester.test();
      displayResults(localResult);

      if (localResult.success && window.utils) {
        window.utils.notify(`${localResult.totalMatches}개 매칭 완료`, 'success');
      } else if (!localResult.success && window.utils) {
        window.utils.notify('정규식 오류: ' + localResult.error, 'error');
      }
    } catch (error) {
      console.error('테스트 실행 오류:', error);
      if (window.utils) {
        window.utils.notify('테스트 중 오류가 발생했습니다.', 'error');
      }
    } finally {
      if (window.utils) {
        window.utils.loading.hide(testButton);
      }
    }
  }

  // 초기화
  function clearAll() {
    patternInput.value = '';
    testTextArea.value = '';
    flagCheckboxes.forEach(cb => cb.checked = cb.value === 'g');
    updateFlags();
    
    if (resultsContainer) {
      resultsContainer.classList.add('hidden');
    }
    
    if (window.utils) {
      window.utils.notify('초기화 완료', 'info');
    }
  }

  // 이벤트 리스너 설정
  if (testButton) {
    testButton.addEventListener('click', runTest);
  }

  if (clearButton) {
    clearButton.addEventListener('click', clearAll);
  }

  if (patternInput) {
    patternInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') runTest();
    });
  }

  flagCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateFlags);
  });

  updateFlags();
  console.log('✅ 정규식 테스터 초기화 완료');
}

/**
 * 패턴 라이브러리 초기화
 */
export function initPatternLibrary() {
  console.log('📚 패턴 라이브러리 초기화 시작...');
  
  const libraryContainer = document.querySelector('#library .grid');
  
  if (!libraryContainer) {
    console.log('⚠️ 패턴 라이브러리 컨테이너를 찾을 수 없습니다.');
    return;
  }

  function refreshPatternLibrary() {
    const patterns = patternLibrary.patterns;
    
    libraryContainer.innerHTML = patterns.map(pattern => `
      <div class="pattern-card" data-pattern-id="${pattern.id}">
        <div class="pattern-header">
          <h3 class="pattern-title">${pattern.title}</h3>
          <span class="pattern-category-badge ${pattern.category}">${pattern.category}</span>
        </div>
        <code class="pattern-code">${pattern.pattern}</code>
        ${pattern.flags ? `<span class="pattern-flags">${pattern.flags}</span>` : ''}
        <p class="pattern-description">${pattern.description}</p>
        <div class="pattern-actions">
          <button class="pattern-action-btn primary use-pattern-btn" data-pattern-id="${pattern.id}">
            사용하기
          </button>
          <button class="pattern-action-btn secondary copy-pattern-btn" data-pattern="${pattern.pattern}">
            복사
          </button>
        </div>
      </div>
    `).join('');

    addPatternCardListeners();
  }

  function addPatternCardListeners() {
    document.querySelectorAll('.use-pattern-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const patternId = e.target.dataset.patternId;
        const pattern = patternLibrary.getById(patternId);
        
        if (pattern) {
          const patternInput = document.querySelector('#regex-pattern');
          if (patternInput) {
            patternInput.value = pattern.pattern;
            
            if (window.utils) {
              window.utils.notify(`패턴 "${pattern.title}" 적용됨`, 'success');
            }
            
            document.querySelector('#tester')?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    document.querySelectorAll('.copy-pattern-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pattern = e.target.dataset.pattern;
        
        if (navigator.clipboard) {
          navigator.clipboard.writeText(pattern).then(() => {
            if (window.utils) {
              window.utils.notify('패턴이 클립보드에 복사되었습니다.', 'success');
            }
          });
        }
      });
    });
  }

  window.refreshPatternLibrary = refreshPatternLibrary;
  refreshPatternLibrary();
  console.log('✅ 패턴 라이브러리 초기화 완료');
}

/**
 * 네비게이션 초기화
 */
export function initNavigation() {
  console.log('🧭 네비게이션 초기화 시작...');
  
  const nav = document.querySelector('#navigation');
  if (!nav) {
    console.log('⚠️ 네비게이션 요소를 찾을 수 없습니다.');
    return;
  }

  nav.innerHTML = `
    <div class="container">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-4">
          <div class="logo">NEO Regex</div>
        </div>
        
        <div class="nav-menu">
          <a href="#tester">테스터</a>
          <a href="#library">패턴 라이브러리</a>
          <a href="#builder">빌더</a>
          <a href="#docs">문서</a>
          
          <button id="dark-mode-toggle" class="dark-mode-toggle">
            🌙
          </button>
        </div>
        
        <button class="mobile-menu-button">
          ☰
        </button>
      </div>
      
      <div class="mobile-menu hidden">
        <div class="space-y-2">
          <a href="#tester">테스터</a>
          <a href="#library">패턴 라이브러리</a>
          <a href="#builder">빌더</a>
          <a href="#docs">문서</a>
        </div>
      </div>
    </div>
  `;

  nav.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  console.log('✅ 네비게이션 초기화 완료');
}

/**
 * 모든 컴포넌트 초기화
 */
export function initializeComponents() {
  console.log('🎯 컴포넌트 초기화 시작...');
  
  try {
    initNavigation();
    initRegexTester();
    initPatternLibrary();
    
    console.log('🎯 모든 컴포넌트가 초기화되었습니다.');
  } catch (error) {
    console.error('컴포넌트 초기화 오류:', error);
  }
}