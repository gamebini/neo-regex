// frontend/src/components/init.js
import { regexTester, patternLibrary } from '../core/regex.js';
import { api, handleApiError, startConnectionMonitoring } from '../utils/api.js';

/**
 * 정규식 테스터 컴포넌트 초기화
 */
export function initRegexTester() {
  const patternInput = document.querySelector('#regex-pattern');
  const testTextArea = document.querySelector('#test-text');
  const testButton = document.querySelector('#test-regex');
  const clearButton = document.querySelector('#clear-all');
  const saveButton = document.querySelector('#save-pattern');
  const resultsContainer = document.querySelector('#test-results');
  const matchResults = document.querySelector('#match-results');
  const flagCheckboxes = document.querySelectorAll('input[type="checkbox"][value]');
  const flagsDisplay = document.querySelector('#pattern-flags');

  if (!patternInput || !testTextArea) return;

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
      <div class="mb-3 p-3 bg-white rounded border border-gray-200">
        <div class="flex justify-between items-start mb-2">
          <span class="badge badge-primary">매칭 ${index + 1}</span>
          <span class="text-sm text-gray-500">위치: ${match.index}</span>
        </div>
        <div class="font-mono text-sm bg-gray-100 p-2 rounded">
          "${match.match}"
        </div>
        ${match.groups && match.groups.length > 0 ? `
          <div class="mt-2">
            <span class="text-sm font-medium text-gray-600">그룹:</span>
            <div class="mt-1">
              ${match.groups.map((group, i) => `
                <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1 mb-1">
                  ${i + 1}: "${group || ''}"
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `).join('');

    matchResults.innerHTML = stats + matchList;

    // 테스트 텍스트에 하이라이트 적용
    const highlightedText = regexTester.highlightMatches();
    if (testTextArea && highlightedText !== testTextArea.value) {
      // 결과 미리보기 영역 생성
      let preview = document.querySelector('#text-preview');
      if (!preview) {
        preview = document.createElement('div');
        preview.id = 'text-preview';
        preview.className = 'mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded font-mono text-sm';
        testTextArea.parentNode.appendChild(preview);
      }
      preview.innerHTML = `<strong>매칭 결과:</strong><br>${highlightedText}`;
    }
  }

  // 테스트 실행 (로컬 + 서버)
  async function runTest() {
    const pattern = patternInput.value.trim();
    const text = testTextArea.value;
    const flags = updateFlags();

    if (!pattern) {
      utils.notify('정규식 패턴을 입력해주세요.', 'warning');
      return;
    }

    // 로딩 상태 표시
    utils.loading.show(testButton);

    try {
      // 1. 로컬 테스트 (빠른 응답)
      regexTester.setPattern(pattern, flags).setText(text);
      const localResult = regexTester.test();
      displayResults(localResult);

      if (localResult.success) {
        utils.notify(`${localResult.totalMatches}개 매칭 완료`, 'success');
      } else {
        utils.notify('정규식 오류: ' + localResult.error, 'error');
      }

      // 2. 서버 테스트 (추가 검증, 실패해도 괜찮음)
      try {
        const serverResult = await api.testRegex(pattern, text, flags);
        console.log('📡 서버 검증 결과:', serverResult);
        
        // 서버 결과와 로컬 결과가 다르면 경고
        if (serverResult.success && serverResult.totalMatches !== localResult.totalMatches) {
          console.warn('⚠️ 서버와 클라이언트 결과가 다릅니다.');
        }
      } catch (serverError) {
        console.log('📡 서버 검증 실패 (로컬 결과 사용):', serverError.message);
        // 서버 오류는 무시하고 로컬 결과만 사용
      }

    } catch (error) {
      handleApiError(error, '정규식 테스트 중 오류가 발생했습니다.');
    } finally {
      utils.loading.hide(testButton);
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
    
    const preview = document.querySelector('#text-preview');
    if (preview) {
      preview.remove();
    }
    
    utils.notify('초기화 완료', 'info');
  }

  // 패턴 저장
  async function savePattern() {
    const pattern = patternInput.value.trim();
    const flags = updateFlags();
    
    if (!pattern) {
      utils.notify('저장할 패턴이 없습니다.', 'warning');
      return;
    }

    const title = prompt('패턴 이름을 입력하세요:');
    if (!title) return;

    const description = prompt('패턴 설명을 입력하세요:');
    
    const customPattern = {
      title,
      pattern,
      flags,
      description: description || '',
      category: 'custom',
      tags: ['사용자정의'],
      examples: { valid: [], invalid: [] }
    };

    // 로컬 저장
    patternLibrary.addCustomPattern(customPattern);
    utils.notify('패턴이 저장되었습니다.', 'success');
    
    // 서버 저장 시도 (실패해도 괜찮음)
    try {
      await api.savePattern(customPattern);
      console.log('📡 서버에도 저장 완료');
    } catch (error) {
      console.log('📡 서버 저장 실패 (로컬 저장은 완료):', error.message);
    }
    
    // 패턴 라이브러리 새로고침
    refreshPatternLibrary();
  }

  // 이벤트 리스너
  if (testButton) {
    testButton.addEventListener('click', runTest);
  }

  if (clearButton) {
    clearButton.addEventListener('click', clearAll);
  }

  if (saveButton) {
    saveButton.addEventListener('click', savePattern);
  }

  if (patternInput) {
    patternInput.addEventListener('input', updateFlags);
    patternInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') runTest();
    });
  }

  if (testTextArea) {
    testTextArea.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) runTest();
    });
  }

  flagCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateFlags);
  });

  // 초기 플래그 설정
  updateFlags();
}

/**
 * 패턴 라이브러리 컴포넌트 초기화
 */
export function initPatternLibrary() {
  const libraryContainer = document.querySelector('#library .grid');
  
  if (!libraryContainer) return;

  async function refreshPatternLibrary() {
    try {
      // 서버에서 패턴 가져오기 시도
      const serverResponse = await api.getPatterns();
      if (serverResponse.success && serverResponse.patterns) {
        console.log('📡 서버에서 패턴 로드 성공');
        // 서버 패턴을 로컬 패턴과 병합
        const serverPatterns = serverResponse.patterns;
        const localPatterns = patternLibrary.patterns.filter(p => p.category === 'custom');
        patternLibrary.patterns = [...serverPatterns, ...localPatterns];
      }
    } catch (error) {
      console.log('📡 서버 패턴 로드 실패, 로컬 패턴만 사용:', error.message);
      // 서버 실패시 로컬 패턴만 사용
    }

    const patterns = patternLibrary.patterns;
    
    libraryContainer.innerHTML = patterns.map(pattern => `
      <div class="pattern-card" data-pattern-id="${pattern.id}">
        <div class="mb-4">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-semibold text-gray-900">${pattern.title}</h3>
            <span class="badge badge-${getCategoryColor(pattern.category)}">${pattern.category}</span>
          </div>
          <code class="inline-code">${pattern.pattern}</code>
          ${pattern.flags ? `<span class="ml-2 badge badge-secondary">${pattern.flags}</span>` : ''}
        </div>
        <p class="text-gray-600 text-sm mb-4">${pattern.description}</p>
        <div class="flex gap-2">
          <button class="btn btn-sm btn-primary use-pattern-btn" data-pattern-id="${pattern.id}">
            사용하기
          </button>
          <button class="btn btn-sm btn-ghost copy-pattern-btn" data-pattern="${pattern.pattern}">
            복사
          </button>
          ${pattern.category === 'custom' ? `
            <button class="btn btn-sm btn-error delete-pattern-btn" data-pattern-id="${pattern.id}">
              삭제
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');

    // 이벤트 리스너 추가
    addPatternCardListeners();
  }

  function getCategoryColor(category) {
    const colors = {
      'validation': 'primary',
      'web': 'secondary',
      'korean': 'success',
      'security': 'warning',
      'custom': 'error'
    };
    return colors[category] || 'secondary';
  }

  function addPatternCardListeners() {
    // 패턴 사용하기
    document.querySelectorAll('.use-pattern-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const patternId = e.target.dataset.patternId;
        const pattern = patternLibrary.getById(patternId);
        
        if (pattern) {
          const patternInput = document.querySelector('#regex-pattern');
          if (patternInput) {
            patternInput.value = pattern.pattern;
            
            // 플래그 설정
            const flagCheckboxes = document.querySelectorAll('input[type="checkbox"][value]');
            flagCheckboxes.forEach(cb => {
              cb.checked = pattern.flags.includes(cb.value);
            });
            
            utils.notify(`패턴 "${pattern.title}" 적용됨`, 'success');
            
            // 테스터 섹션으로 스크롤
            document.querySelector('#tester')?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // 패턴 복사
    document.querySelectorAll('.copy-pattern-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pattern = e.target.dataset.pattern;
        
        if (navigator.clipboard) {
          navigator.clipboard.writeText(pattern).then(() => {
            utils.notify('패턴이 클립보드에 복사되었습니다.', 'success');
          });
        } else {
          // 폴백
          const textArea = document.createElement('textarea');
          textArea.value = pattern;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          utils.notify('패턴이 클립보드에 복사되었습니다.', 'success');
        }
      });
    });

    // 사용자 정의 패턴 삭제
    document.querySelectorAll('.delete-pattern-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const patternId = e.target.dataset.patternId;
        
        if (confirm('이 패턴을 삭제하시겠습니까?')) {
          patternLibrary.patterns = patternLibrary.patterns.filter(p => p.id !== patternId);
          patternLibrary.saveToStorage();
          refreshPatternLibrary();
          utils.notify('패턴이 삭제되었습니다.', 'info');
        }
      });
    });
  }

  // 전역 함수로 등록 (다른 곳에서 호출 가능)
  window.refreshPatternLibrary = refreshPatternLibrary;

  // 초기 렌더링
  refreshPatternLibrary();
}

/**
 * 네비게이션 초기화
 */
export function initNavigation() {
  const nav = document.querySelector('#navigation');
  if (!nav) return;

  nav.innerHTML = `
    <div class="container">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center space-x-4">
          <div class="logo">NEO Regex</div>
          <button id="connection-test" class="btn btn-sm btn-ghost" title="연결 상태 테스트">
            🔗
          </button>
        </div>
        
        <div class="nav-menu">
          <a href="#tester">테스터</a>
          <a href="#library">패턴 라이브러리</a>
          <a href="#builder">빌더</a>
          <a href="#docs">문서</a>
          
          <button id="dark-mode-toggle" class="dark-mode-toggle">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        
        <button class="mobile-menu-button">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
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

  // 연결 테스트 버튼
  const connectionTestBtn = nav.querySelector('#connection-test');
  if (connectionTestBtn) {
    connectionTestBtn.addEventListener('click', async () => {
      utils.loading.show(connectionTestBtn);
      try {
        const testResult = await api.testConnection();
        console.log('🔍 연결 테스트 결과:', testResult);
        
        const results = [];
        if (testResult.direct) results.push('✅ 직접 연결');
        if (testResult.proxy) results.push('✅ 프록시 연결');
        if (testResult.api) results.push('✅ API 연결');
        
        if (results.length === 0) {
          results.push('❌ 모든 연결 실패');
          if (testResult.error) results.push(`오류: ${testResult.error}`);
        }
        
        utils.notify(results.join(' | '), testResult.direct ? 'success' : 'error');
      } catch (error) {
        handleApiError(error, '연결 테스트 실패');
      } finally {
        utils.loading.hide(connectionTestBtn);
      }
    });
  }

  // 부드러운 스크롤 네비게이션
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
}

/**
 * 모든 컴포넌트 초기화
 */
export async function initializeComponents() {
  console.log('🎯 컴포넌트 초기화 시작...');
  
  // 네비게이션 초기화
  initNavigation();
  
  // 연결 모니터링 시작
  startConnectionMonitoring();
  
  // 서버 연결 확인
  try {
    const healthCheck = await api.health();
    console.log('✅ 서버 연결 성공:', healthCheck);
    utils.notify('서버 연결 완료', 'success');
  } catch (error) {
    console.warn('⚠️ 서버 연결 실패, 오프라인 모드로 동작:', error.message);
    utils.notify('오프라인 모드로 동작합니다', 'warning');
  }
  
  // 컴포넌트 초기화
  initRegexTester();
  initPatternLibrary();
  
  console.log('🎯 모든 컴포넌트가 초기화되었습니다.');
}// frontend/src/components/init.js
import { regexTester, patternLibrary } from '../core/regex.js';

/**
 * 정규식 테스터 컴포넌트 초기화
 */
export function initRegexTester() {
  const patternInput = document.querySelector('#regex-pattern');
  const testTextArea = document.querySelector('#test-text');
  const testButton = document.querySelector('#test-regex');
  const clearButton = document.querySelector('#clear-all');
  const saveButton = document.querySelector('#save-pattern');
  const resultsContainer = document.querySelector('#test-results');
  const matchResults = document.querySelector('#match-results');
  const flagCheckboxes = document.querySelectorAll('input[type="checkbox"][value]');
  const flagsDisplay = document.querySelector('#pattern-flags');

  if (!patternInput || !testTextArea) return;

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
            <span class="font-semibold">${result.executionTime.toFixed(2)}ms</span>
          </div>
        </div>
      </div>
    `;

    const matchList = result.matches.map((match, index) => `
      <div class="mb-3 p-3 bg-white rounded border border-gray-200">
        <div class="flex justify-between items-start mb-2">
          <span class="badge badge-primary">매칭 ${index + 1}</span>
          <span class="text-sm text-gray-500">위치: ${match.index}</span>
        </div>
        <div class="font-mono text-sm bg-gray-100 p-2 rounded">
          "${match.match}"
        </div>
        ${match.groups.length > 0 ? `
          <div class="mt-2">
            <span class="text-sm font-medium text-gray-600">그룹:</span>
            <div class="mt-1">
              ${match.groups.map((group, i) => `
                <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1 mb-1">
                  ${i + 1}: "${group || ''}"
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `).join('');

    matchResults.innerHTML = stats + matchList;

    // 테스트 텍스트에 하이라이트 적용
    const highlightedText = regexTester.highlightMatches();
    if (testTextArea && highlightedText !== testTextArea.value) {
      // 결과 미리보기 영역 생성
      let preview = document.querySelector('#text-preview');
      if (!preview) {
        preview = document.createElement('div');
        preview.id = 'text-preview';
        preview.className = 'mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded font-mono text-sm';
        testTextArea.parentNode.appendChild(preview);
      }
      preview.innerHTML = `<strong>매칭 결과:</strong><br>${highlightedText}`;
    }
  }

  // 테스트 실행
  function runTest() {
    const pattern = patternInput.value.trim();
    const text = testTextArea.value;
    const flags = updateFlags();

    if (!pattern) {
      utils.notify('정규식 패턴을 입력해주세요.', 'warning');
      return;
    }

    regexTester.setPattern(pattern, flags).setText(text);
    const result = regexTester.test();
    displayResults(result);

    if (result.success) {
      utils.notify(`${result.totalMatches}개 매칭 완료`, 'success');
    } else {
      utils.notify('정규식 오류: ' + result.error, 'error');
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
    
    const preview = document.querySelector('#text-preview');
    if (preview) {
      preview.remove();
    }
    
    utils.notify('초기화 완료', 'info');
  }

  // 패턴 저장
  function savePattern() {
    const pattern = patternInput.value.trim();
    const flags = updateFlags();
    
    if (!pattern) {
      utils.notify('저장할 패턴이 없습니다.', 'warning');
      return;
    }

    const title = prompt('패턴 이름을 입력하세요:');
    if (!title) return;

    const description = prompt('패턴 설명을 입력하세요:');
    
    const customPattern = {
      title,
      pattern,
      flags,
      description: description || '',
      category: 'custom',
      tags: ['사용자정의'],
      examples: { valid: [], invalid: [] }
    };

    patternLibrary.addCustomPattern(customPattern);
    utils.notify('패턴이 저장되었습니다.', 'success');
    
    // 패턴 라이브러리 새로고침
    refreshPatternLibrary();
  }

  // 이벤트 리스너
  if (testButton) {
    testButton.addEventListener('click', runTest);
  }

  if (clearButton) {
    clearButton.addEventListener('click', clearAll);
  }

  if (saveButton) {
    saveButton.addEventListener('click', savePattern);
  }

  if (patternInput) {
    patternInput.addEventListener('input', updateFlags);
    patternInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') runTest();
    });
  }

  if (testTextArea) {
    testTextArea.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) runTest();
    });
  }

  flagCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateFlags);
  });

  // 초기 플래그 설정
  updateFlags();
}

/**
 * 패턴 라이브러리 컴포넌트 초기화
 */
export function initPatternLibrary() {
  const libraryContainer = document.querySelector('#library .grid');
  
  if (!libraryContainer) return;

  function refreshPatternLibrary() {
    const patterns = patternLibrary.patterns;
    
    libraryContainer.innerHTML = patterns.map(pattern => `
      <div class="pattern-card" data-pattern-id="${pattern.id}">
        <div class="mb-4">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-semibold text-gray-900">${pattern.title}</h3>
            <span class="badge badge-${getCategoryColor(pattern.category)}">${pattern.category}</span>
          </div>
          <code class="inline-code">${pattern.pattern}</code>
          ${pattern.flags ? `<span class="ml-2 badge badge-secondary">${pattern.flags}</span>` : ''}
        </div>
        <p class="text-gray-600 text-sm mb-4">${pattern.description}</p>
        <div class="flex gap-2">
          <button class="btn btn-sm btn-primary use-pattern-btn" data-pattern-id="${pattern.id}">
            사용하기
          </button>
          <button class="btn btn-sm btn-ghost copy-pattern-btn" data-pattern="${pattern.pattern}">
            복사
          </button>
          ${pattern.category === 'custom' ? `
            <button class="btn btn-sm btn-error delete-pattern-btn" data-pattern-id="${pattern.id}">
              삭제
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');

    // 이벤트 리스너 추가
    addPatternCardListeners();
  }

  function getCategoryColor(category) {
    const colors = {
      'validation': 'primary',
      'web': 'secondary',
      'korean': 'success',
      'security': 'warning',
      'custom': 'error'
    };
    return colors[category] || 'secondary';
  }

  function addPatternCardListeners() {
    // 패턴 사용하기
    document.querySelectorAll('.use-pattern-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const patternId = e.target.dataset.patternId;
        const pattern = patternLibrary.getById(patternId);
        
        if (pattern) {
          const patternInput = document.querySelector('#regex-pattern');
          if (patternInput) {
            patternInput.value = pattern.pattern;
            
            // 플래그 설정
            const flagCheckboxes = document.querySelectorAll('input[type="checkbox"][value]');
            flagCheckboxes.forEach(cb => {
              cb.checked = pattern.flags.includes(cb.value);
            });
            
            utils.notify(`패턴 "${pattern.title}" 적용됨`, 'success');
            
            // 테스터 섹션으로 스크롤
            document.querySelector('#tester')?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // 패턴 복사
    document.querySelectorAll('.copy-pattern-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pattern = e.target.dataset.pattern;
        
        if (navigator.clipboard) {
          navigator.clipboard.writeText(pattern).then(() => {
            utils.notify('패턴이 클립보드에 복사되었습니다.', 'success');
          });
        } else {
          // 폴백
          const textArea = document.createElement('textarea');
          textArea.value = pattern;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          utils.notify('패턴이 클립보드에 복사되었습니다.', 'success');
        }
      });
    });

    // 사용자 정의 패턴 삭제
    document.querySelectorAll('.delete-pattern-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const patternId = e.target.dataset.patternId;
        
        if (confirm('이 패턴을 삭제하시겠습니까?')) {
          patternLibrary.patterns = patternLibrary.patterns.filter(p => p.id !== patternId);
          patternLibrary.saveToStorage();
          refreshPatternLibrary();
          utils.notify('패턴이 삭제되었습니다.', 'info');
        }
      });
    });
  }

  // 전역 함수로 등록 (다른 곳에서 호출 가능)
  window.refreshPatternLibrary = refreshPatternLibrary;

  // 초기 렌더링
  refreshPatternLibrary();
}

/**
 * 네비게이션 초기화
 */
export function initNavigation() {
  const nav = document.querySelector('#navigation');
  if (!nav) return;

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
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        
        <button class="mobile-menu-button">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
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

  // 부드러운 스크롤 네비게이션
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
}

/**
 * 모든 컴포넌트 초기화
 */
export function initializeComponents() {
  initNavigation();
  initRegexTester();
  initPatternLibrary();
  
  console.log('🎯 모든 컴포넌트가 초기화되었습니다.');
}