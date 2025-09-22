/**
 * NEO Regex - Tester JavaScript
 * 실시간 정규식 테스터의 모든 기능을 관리합니다.
 */

// =========================
// Tester State Management
// =========================
const TesterState = {
  pattern: '',
  flags: '',
  testText: '',
  lastResults: null,
  currentTab: 'matches',
  isProcessing: false,
  history: JSON.parse(localStorage.getItem('neo-regex-tester-history')) || [],
  maxHistorySize: 50,
  autoSave: true,
  realTimeTest: true
};

// =========================
// DOM Ready Event
// =========================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔬 정규식 테스터 초기화 중...');
  
  initializeTester();
  initializeEventListeners();
  initializeTabs();
  loadFromURL();
  loadStoredPattern();
  
  console.log('✅ 정규식 테스터 초기화 완료!');
});

// =========================
// Tester Initialization
// =========================
function initializeTester() {
  // Initialize regex engine
  if (typeof RegexEngine !== 'undefined') {
    window.testerEngine = new RegexEngine();
  }
  
  // Setup flag buttons
  setupFlagButtons();
  
  // Setup quick patterns
  setupQuickPatterns();
  
  // Setup keyboard shortcuts
  setupKeyboardShortcuts();
  
  // Setup modals
  setupModals();
  
  // Load test pattern from session storage (from library page)
  loadTestPatternFromStorage();
}

function initializeEventListeners() {
  // Pattern input
  const patternInput = document.getElementById('regex-pattern');
  const flagsInput = document.getElementById('regex-flags');
  const testTextArea = document.getElementById('test-text');
  
  if (patternInput) {
    patternInput.addEventListener('input', debounce(handlePatternChange, 300));
    patternInput.addEventListener('keydown', handlePatternKeydown);
  }
  
  if (flagsInput) {
    flagsInput.addEventListener('input', debounce(handleFlagsChange, 300));
  }
  
  if (testTextArea) {
    testTextArea.addEventListener('input', debounce(handleTestTextChange, 300));
    testTextArea.addEventListener('scroll', syncHighlightScroll);
  }
  
  // Tool buttons
  const savePattern = document.getElementById('save-pattern');
  const loadPattern = document.getElementById('load-pattern');
  const clearAll = document.getElementById('clear-all');
  const loadSample = document.getElementById('load-sample');
  const clearText = document.getElementById('clear-text');
  const exportResults = document.getElementById('export-results');
  
  if (savePattern) savePattern.addEventListener('click', saveCurrentPattern);
  if (loadPattern) loadPattern.addEventListener('click', showLoadPatternDialog);
  if (clearAll) clearAll.addEventListener('click', clearAllInputs);
  if (loadSample) loadSample.addEventListener('click', loadSampleText);
  if (clearText) clearText.addEventListener('click', clearTestText);
  if (exportResults) exportResults.addEventListener('click', exportTestResults);
  
  // Advanced tools
  const generateCode = document.getElementById('generate-code');
  const sharePattern = document.getElementById('share-pattern');
  const viewHistory = document.getElementById('view-history');
  
  if (generateCode) generateCode.addEventListener('click', showCodeGenerationModal);
  if (sharePattern) sharePattern.addEventListener('click', showShareModal);
  if (viewHistory) viewHistory.addEventListener('click', showHistoryModal);
  
  // Text stats update
  if (testTextArea) {
    updateTextStats();
  }
}

// =========================
// Tab Management
// =========================
function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  TesterState.currentTab = tabId;
  
  // Update tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  
  // Update tab panes
  const tabPanes = document.querySelectorAll('.tab-pane');
  tabPanes.forEach(pane => {
    pane.classList.toggle('active', pane.id === `${tabId}-pane`);
  });
  
  // Load tab content if needed
  if (TesterState.lastResults) {
    updateTabContent(tabId, TesterState.lastResults);
  }
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('tester', `tab-${tabId}`);
  }
}

// =========================
// Flag Management
// =========================
function setupFlagButtons() {
  const flagButtons = document.querySelectorAll('.flag-btn');
  
  flagButtons.forEach(button => {
    button.addEventListener('click', () => {
      const flag = button.dataset.flag;
      toggleFlag(flag);
    });
  });
}

function toggleFlag(flag) {
  const flagsInput = document.getElementById('regex-flags');
  if (!flagsInput) return;
  
  let flags = flagsInput.value;
  
  if (flags.includes(flag)) {
    flags = flags.replace(flag, '');
  } else {
    flags += flag;
  }
  
  // Remove duplicates and sort
  flags = [...new Set(flags.split(''))].sort().join('');
  
  flagsInput.value = flags;
  updateFlagButtons(flags);
  handleFlagsChange({ target: { value: flags } });
}

function updateFlagButtons(flags) {
  const flagButtons = document.querySelectorAll('.flag-btn');
  
  flagButtons.forEach(button => {
    const flag = button.dataset.flag;
    button.classList.toggle('active', flags.includes(flag));
  });
}

// =========================
// Quick Patterns
// =========================
function setupQuickPatterns() {
  const quickPatternButtons = document.querySelectorAll('.quick-pattern-btn');
  
  quickPatternButtons.forEach(button => {
    button.addEventListener('click', () => {
      const pattern = button.dataset.pattern;
      loadQuickPattern(pattern);
    });
  });
}

function loadQuickPattern(pattern) {
  const patternInput = document.getElementById('regex-pattern');
  if (patternInput) {
    patternInput.value = pattern;
    handlePatternChange({ target: { value: pattern } });
  }
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('tester', 'quick-pattern');
  }
}

// =========================
// Input Handlers
// =========================
function handlePatternChange(e) {
  const pattern = e.target.value;
  TesterState.pattern = pattern;
  
  // Validate pattern
  validatePattern(pattern);
  
  // Run test if real-time testing is enabled
  if (TesterState.realTimeTest && pattern && TesterState.testText) {
    runRegexTest();
  }
  
  // Save to localStorage if auto-save is enabled
  if (TesterState.autoSave) {
    saveToLocalStorage();
  }
}

function handleFlagsChange(e) {
  const flags = e.target.value;
  TesterState.flags = flags;
  
  // Update flag buttons
  updateFlagButtons(flags);
  
  // Run test if real-time testing is enabled
  if (TesterState.realTimeTest && TesterState.pattern && TesterState.testText) {
    runRegexTest();
  }
  
  // Save to localStorage if auto-save is enabled
  if (TesterState.autoSave) {
    saveToLocalStorage();
  }
}

function handleTestTextChange(e) {
  const testText = e.target.value;
  TesterState.testText = testText;
  
  // Update text stats
  updateTextStats();
  
  // Run test if real-time testing is enabled
  if (TesterState.realTimeTest && TesterState.pattern && testText) {
    runRegexTest();
  }
  
  // Save to localStorage if auto-save is enabled
  if (TesterState.autoSave) {
    saveToLocalStorage();
  }
}

function handlePatternKeydown(e) {
  // Ctrl/Cmd + Enter to run test
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    runRegexTest();
  }
  
  // Ctrl/Cmd + S to save pattern
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveCurrentPattern();
  }
}

// =========================
// Pattern Validation
// =========================
function validatePattern(pattern) {
  const validationContainer = document.getElementById('pattern-validation');
  if (!validationContainer) return;
  
  if (!pattern) {
    validationContainer.innerHTML = '';
    return;
  }
  
  try {
    // Try to create regex with current flags
    new RegExp(pattern, TesterState.flags);
    
    // Pattern is valid
    validationContainer.innerHTML = `
      <div class="validation-message success">
        <i class="fas fa-check-circle"></i>
        패턴이 유효합니다
      </div>
    `;
    
  } catch (error) {
    // Pattern is invalid
    const suggestions = getPatternSuggestions(error.message);
    
    validationContainer.innerHTML = `
      <div class="validation-message error">
        <i class="fas fa-exclamation-circle"></i>
        <div class="error-details">
          <div class="error-message">${escapeHtml(error.message)}</div>
          ${suggestions.length > 0 ? `
            <div class="error-suggestions">
              <strong>제안:</strong>
              <ul>
                ${suggestions.map(suggestion => `<li>${escapeHtml(suggestion)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

function getPatternSuggestions(errorMessage) {
  const suggestions = [];
  
  if (errorMessage.includes('Unterminated character class')) {
    suggestions.push('문자 클래스 [...]를 닫아주세요.');
    suggestions.push('예시: [a-z]처럼 올바른 형태로 작성하세요.');
  }
  
  if (errorMessage.includes('Unterminated group')) {
    suggestions.push('그룹 (...)을 닫아주세요.');
    suggestions.push('예시: (abc)처럼 올바른 형태로 작성하세요.');
  }
  
  if (errorMessage.includes('Invalid escape sequence')) {
    suggestions.push('이스케이프 시퀀스를 확인해주세요.');
    suggestions.push('유효한 이스케이프: \\n, \\t, \\r, \\s, \\d, \\w 등');
  }
  
  if (errorMessage.includes('Nothing to repeat')) {
    suggestions.push('*, +, ? 앞에 반복할 문자나 그룹이 있어야 합니다.');
    suggestions.push('예시: a+ (a가 하나 이상), (abc)* (abc가 0개 이상)');
  }
  
  return suggestions;
}

// =========================
// Regex Testing
// =========================
function runRegexTest() {
  if (TesterState.isProcessing) return;
  
  const pattern = TesterState.pattern;
  const flags = TesterState.flags;
  const testText = TesterState.testText;
  
  if (!pattern || !testText) {
    clearResults();
    return;
  }
  
  TesterState.isProcessing = true;
  
  try {
    const startTime = performance.now();
    
    // Create regex
    const regex = new RegExp(pattern, flags);
    
    // Find all matches
    const matches = [];
    let match;
    
    if (flags.includes('g')) {
      // Global flag - find all matches
      let execMatch;
      while ((execMatch = regex.exec(testText)) !== null) {
        matches.push({
          match: execMatch[0],
          index: execMatch.index,
          groups: execMatch.slice(1),
          input: execMatch.input
        });
        
        // Prevent infinite loop
        if (execMatch[0].length === 0) {
          regex.lastIndex++;
        }
      }
    } else {
      // No global flag - find first match only
      match = regex.exec(testText);
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
          input: match.input
        });
      }
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Create results object
    const results = {
      pattern,
      flags,
      testText,
      matches,
      executionTime,
      regex,
      timestamp: Date.now()
    };
    
    TesterState.lastResults = results;
    
    // Update UI
    updateResults(results);
    
    // Add to history
    addToHistory(results);
    
  } catch (error) {
    showTestError(error);
  } finally {
    TesterState.isProcessing = false;
  }
}

function updateResults(results) {
  // Update stats in header
  updateResultStats(results);
  
  // Update current tab content
  updateTabContent(TesterState.currentTab, results);
  
  // Update tab counts
  updateTabCounts(results);
}

function updateResultStats(results) {
  const matchCount = document.getElementById('match-count');
  const executionTime = document.getElementById('execution-time');
  
  if (matchCount) {
    matchCount.textContent = results.matches.length;
  }
  
  if (executionTime) {
    executionTime.textContent = `${results.executionTime.toFixed(2)}ms`;
  }
}

function updateTabCounts(results) {
  const matchesCount = document.getElementById('matches-count');
  const groupsCount = document.getElementById('groups-count');
  
  if (matchesCount) {
    matchesCount.textContent = results.matches.length;
  }
  
  if (groupsCount) {
    const totalGroups = results.matches.reduce((total, match) => {
      return total + match.groups.filter(group => group !== undefined).length;
    }, 0);
    groupsCount.textContent = totalGroups;
  }
}

function updateTabContent(tabId, results) {
  switch (tabId) {
    case 'matches':
      updateMatchesTab(results);
      break;
    case 'groups':
      updateGroupsTab(results);
      break;
    case 'explanation':
      updateExplanationTab(results);
      break;
    case 'performance':
      updatePerformanceTab(results);
      break;
  }
}

// =========================
// Tab Content Updates
// =========================
function updateMatchesTab(results) {
  const highlightedText = document.getElementById('highlighted-text');
  const matchesList = document.getElementById('matches-list');
  
  if (!highlightedText || !matchesList) return;
  
  if (results.matches.length === 0) {
    highlightedText.innerHTML = `
      <div class="no-matches">
        <i class="fas fa-search"></i>
        <p>매칭되는 결과가 없습니다</p>
      </div>
    `;
    matchesList.innerHTML = '';
    return;
  }
  
  // Create highlighted text
  const highlightedHTML = createHighlightedText(results.testText, results.matches);
  highlightedText.innerHTML = `<div class="highlighted-content">${highlightedHTML}</div>`;
  
  // Create matches list
  const matchesHTML = results.matches.map((match, index) => `
    <div class="match-item" data-match-index="${index}">
      <div class="match-header">
        <span class="match-number">매치 ${index + 1}</span>
        <span class="match-position">위치: ${match.index}-${match.index + match.match.length}</span>
      </div>
      <div class="match-content">
        <code class="match-text">${escapeHtml(match.match)}</code>
      </div>
      ${match.groups.some(group => group !== undefined) ? `
        <div class="match-groups">
          ${match.groups.map((group, groupIndex) => 
            group !== undefined ? `
              <div class="group-item">
                <span class="group-label">그룹 ${groupIndex + 1}:</span>
                <code class="group-value">${escapeHtml(group)}</code>
              </div>
            ` : ''
          ).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
  
  matchesList.innerHTML = matchesHTML;
}

function createHighlightedText(text, matches) {
  if (matches.length === 0) return escapeHtml(text);
  
  // Sort matches by index
  const sortedMatches = [...matches].sort((a, b) => a.index - b.index);
  
  let result = '';
  let lastIndex = 0;
  
  sortedMatches.forEach((match, index) => {
    // Add text before this match
    result += escapeHtml(text.substring(lastIndex, match.index));
    
    // Add highlighted match
    result += `<mark class="match-highlight" data-match-index="${index}" title="매치 ${index + 1}: ${escapeHtml(match.match)}">${escapeHtml(match.match)}</mark>`;
    
    lastIndex = match.index + match.match.length;
  });
  
  // Add remaining text
  result += escapeHtml(text.substring(lastIndex));
  
  return result;
}

function updateGroupsTab(results) {
  const groupsContainer = document.getElementById('groups-container');
  if (!groupsContainer) return;
  
  // Collect all unique groups
  const allGroups = new Map();
  
  results.matches.forEach((match, matchIndex) => {
    match.groups.forEach((group, groupIndex) => {
      if (group !== undefined) {
        const groupKey = groupIndex + 1;
        if (!allGroups.has(groupKey)) {
          allGroups.set(groupKey, []);
        }
        allGroups.get(groupKey).push({
          value: group,
          matchIndex: matchIndex + 1
        });
      }
    });
  });
  
  if (allGroups.size === 0) {
    groupsContainer.innerHTML = `
      <div class="no-groups">
        <i class="fas fa-layer-group"></i>
        <p>캡처 그룹이 없습니다</p>
        <small>패턴에 괄호 ()를 사용하여 그룹을 만들어보세요</small>
      </div>
    `;
    return;
  }
  
  const groupsHTML = Array.from(allGroups.entries()).map(([groupNumber, instances]) => `
    <div class="group-section">
      <h4 class="group-title">
        <i class="fas fa-layer-group"></i>
        그룹 ${groupNumber}
        <span class="group-count">${instances.length}개 값</span>
      </h4>
      <div class="group-instances">
        ${instances.map(instance => `
          <div class="group-instance">
            <code class="group-value">${escapeHtml(instance.value)}</code>
            <span class="group-source">매치 ${instance.matchIndex}에서</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
  
  groupsContainer.innerHTML = groupsHTML;
}

function updateExplanationTab(results) {
  const explanationContainer = document.getElementById('explanation-container');
  if (!explanationContainer) return;
  
  const explanation = generatePatternExplanation(results.pattern);
  
  explanationContainer.innerHTML = `
    <div class="explanation-content">
      <div class="pattern-breakdown">
        <h4 class="explanation-title">
          <i class="fas fa-info-circle"></i>
          패턴 분석: <code>${escapeHtml(results.pattern)}</code>
        </h4>
        <div class="pattern-explanation">
          ${explanation}
        </div>
      </div>
      
      ${results.flags ? `
        <div class="flags-breakdown">
          <h4 class="explanation-title">
            <i class="fas fa-flag"></i>
            플래그 설명
          </h4>
          <div class="flags-explanation">
            ${generateFlagsExplanation(results.flags)}
          </div>
        </div>
      ` : ''}
      
      <div class="usage-tips">
        <h4 class="explanation-title">
          <i class="fas fa-lightbulb"></i>
          사용 팁
        </h4>
        <div class="tips-content">
          ${generateUsageTips(results.pattern)}
        </div>
      </div>
    </div>
  `;
}

function updatePerformanceTab(results) {
  const performanceContainer = document.getElementById('performance-container');
  if (!performanceContainer) return;
  
  const complexity = calculatePatternComplexity(results.pattern);
  const risk = assessBacktrackingRisk(results.pattern);
  
  performanceContainer.innerHTML = `
    <div class="performance-content">
      <div class="performance-metrics">
        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-stopwatch"></i>
          </div>
          <div class="metric-info">
            <div class="metric-value">${results.executionTime.toFixed(2)}ms</div>
            <div class="metric-label">실행 시간</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="metric-info">
            <div class="metric-value">${complexity.score}/10</div>
            <div class="metric-label">복잡도</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="metric-info">
            <div class="metric-value">${risk.level}</div>
            <div class="metric-label">백트래킹 위험</div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-bullseye"></i>
          </div>
          <div class="metric-info">
            <div class="metric-value">${results.matches.length}</div>
            <div class="metric-label">매치 수</div>
          </div>
        </div>
      </div>
      
      <div class="performance-analysis">
        <h4 class="analysis-title">성능 분석</h4>
        <div class="analysis-content">
          <div class="analysis-item">
            <strong>복잡도:</strong> ${complexity.description}
          </div>
          <div class="analysis-item">
            <strong>백트래킹 위험:</strong> ${risk.description}
          </div>
          ${risk.suggestions.length > 0 ? `
            <div class="analysis-item">
              <strong>최적화 제안:</strong>
              <ul>
                ${risk.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// =========================
// Pattern Analysis Functions
// =========================
function generatePatternExplanation(pattern) {
  // This is a simplified explanation generator
  // In a real implementation, this would be much more sophisticated
  
  const explanations = [];
  
  // Basic metacharacters
  const metaChars = {
    '^': '문자열의 시작',
    '$': '문자열의 끝',
    '.': '줄바꿈을 제외한 모든 문자',
    '*': '0개 이상 반복',
    '+': '1개 이상 반복',
    '?': '0개 또는 1개',
    '\\d': '숫자 (0-9)',
    '\\w': '단어 문자 (영문자, 숫자, _)',
    '\\s': '공백 문자',
    '\\D': '숫자가 아닌 문자',
    '\\W': '단어 문자가 아닌 문자',
    '\\S': '공백이 아닌 문자'
  };
  
  // Find metacharacters in pattern
  for (const [meta, desc] of Object.entries(metaChars)) {
    if (pattern.includes(meta)) {
      explanations.push(`<div class="explanation-item"><code>${meta}</code>: ${desc}</div>`);
    }
  }
  
  // Character classes
  const charClasses = pattern.match(/\[[^\]]+\]/g);
  if (charClasses) {
    charClasses.forEach(cls => {
      explanations.push(`<div class="explanation-item"><code>${cls}</code>: 문자 클래스 - 괄호 안의 문자 중 하나와 매칭</div>`);
    });
  }
  
  // Groups
  const groups = pattern.match(/\([^)]+\)/g);
  if (groups) {
    explanations.push(`<div class="explanation-item"><code>()</code>: 그룹 - 괄호 안의 패턴을 하나의 단위로 처리하고 결과를 캡처</div>`);
  }
  
  return explanations.length > 0 ? explanations.join('') : '<div class="explanation-item">기본적인 문자열 매칭 패턴입니다.</div>';
}

function generateFlagsExplanation(flags) {
  const flagDescriptions = {
    'g': '전역 검색 - 모든 매치를 찾습니다',
    'i': '대소문자 무시 - 대소문자를 구분하지 않습니다',
    'm': '멀티라인 - ^와 $가 각 줄의 시작과 끝을 의미합니다',
    's': '도트올 - .이 줄바꿈 문자도 매치합니다',
    'u': '유니코드 - 유니코드를 올바르게 처리합니다',
    'y': '고정 - lastIndex 위치부터 정확히 매치해야 합니다'
  };
  
  return flags.split('').map(flag => `
    <div class="flag-explanation">
      <code>${flag}</code>: ${flagDescriptions[flag] || '알 수 없는 플래그'}
    </div>
  `).join('');
}

function generateUsageTips(pattern) {
  const tips = [];
  
  if (pattern.includes('.*')) {
    tips.push('.*는 성능에 영향을 줄 수 있습니다. 더 구체적인 패턴을 사용해보세요.');
  }
  
  if (pattern.includes('+') || pattern.includes('*')) {
    tips.push('수량자를 사용할 때는 백트래킹을 피하기 위해 가능한 한 구체적으로 작성하세요.');
  }
  
  if (!pattern.includes('^') && !pattern.includes('$')) {
    tips.push('문자열 전체를 매칭하려면 ^와 $를 사용하세요.');
  }
  
  if (tips.length === 0) {
    tips.push('좋은 패턴입니다! 다양한 테스트 케이스로 검증해보세요.');
  }
  
  return tips.map(tip => `<div class="tip-item"><i class="fas fa-lightbulb"></i> ${tip}</div>`).join('');
}

function calculatePatternComplexity(pattern) {
  let score = 0;
  let factors = [];
  
  // Basic complexity factors
  if (pattern.includes('*') || pattern.includes('+')) {
    score += 2;
    factors.push('수량자 사용');
  }
  
  if (pattern.includes('.*') || pattern.includes('.+')) {
    score += 3;
    factors.push('와일드카드 수량자');
  }
  
  if ((pattern.match(/\(/g) || []).length > 2) {
    score += 2;
    factors.push('다중 그룹');
  }
  
  if (pattern.includes('|')) {
    score += 1;
    factors.push('교대 패턴');
  }
  
  if (pattern.includes('(?=') || pattern.includes('(?!')) {
    score += 3;
    factors.push('미리보기 어설션');
  }
  
  score = Math.min(score, 10);
  
  let description;
  if (score <= 3) description = '낮음 - 간단한 패턴';
  else if (score <= 6) description = '보통 - 중간 복잡도';
  else description = '높음 - 복잡한 패턴';
  
  return { score, description, factors };
}

function assessBacktrackingRisk(pattern) {
  let risk = '낮음';
  let description = '백트래킹 위험이 낮습니다.';
  let suggestions = [];
  
  // Check for catastrophic backtracking patterns
  if (pattern.includes('(.*)*') || pattern.includes('(.+)+')) {
    risk = '매우 높음';
    description = '재앙적 백트래킹의 위험이 있습니다!';
    suggestions.push('중첩된 수량자를 피하세요.');
    suggestions.push('possessive quantifiers나 atomic groups를 고려하세요.');
  } else if (pattern.includes('.*.*') || pattern.includes('.+.+')) {
    risk = '높음';
    description = '백트래킹이 발생할 수 있습니다.';
    suggestions.push('더 구체적인 패턴을 사용하세요.');
  } else if (pattern.includes('.*') || pattern.includes('.+')) {
    risk = '보통';
    description = '적당한 백트래킹이 예상됩니다.';
    suggestions.push('가능하면 와일드카드 대신 구체적인 문자 클래스를 사용하세요.');
  }
  
  return { level: risk, description, suggestions };
}

// =========================
// Utility Functions
// =========================
function clearResults() {
  const noResultsHTML = `
    <div class="no-results">
      <i class="fas fa-search"></i>
      <p>패턴을 입력하면 결과가 여기에 표시됩니다</p>
    </div>
  `;
  
  // Clear all tabs
  const highlightedText = document.getElementById('highlighted-text');
  const matchesList = document.getElementById('matches-list');
  const groupsContainer = document.getElementById('groups-container');
  const explanationContainer = document.getElementById('explanation-container');
  const performanceContainer = document.getElementById('performance-container');
  
  if (highlightedText) highlightedText.innerHTML = noResultsHTML;
  if (matchesList) matchesList.innerHTML = '';
  if (groupsContainer) groupsContainer.innerHTML = noResultsHTML;
  if (explanationContainer) explanationContainer.innerHTML = noResultsHTML;
  if (performanceContainer) performanceContainer.innerHTML = noResultsHTML;
  
  // Clear stats
  const matchCount = document.getElementById('match-count');
  const executionTime = document.getElementById('execution-time');
  const matchesCount = document.getElementById('matches-count');
  const groupsCount = document.getElementById('groups-count');
  
  if (matchCount) matchCount.textContent = '0';
  if (executionTime) executionTime.textContent = '0ms';
  if (matchesCount) matchesCount.textContent = '0';
  if (groupsCount) groupsCount.textContent = '0';
  
  TesterState.lastResults = null;
}

function showTestError(error) {
  const highlightedText = document.getElementById('highlighted-text');
  if (highlightedText) {
    highlightedText.innerHTML = `
      <div class="test-error">
        <i class="fas fa-exclamation-triangle"></i>
        <h4>테스트 오류</h4>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  }
  
  console.error('Regex test error:', error);
}

function updateTextStats() {
  const testTextArea = document.getElementById('test-text');
  const textLength = document.getElementById('text-length');
  const lineCount = document.getElementById('line-count');
  
  if (!testTextArea || !textLength || !lineCount) return;
  
  const text = testTextArea.value;
  const length = text.length;
  const lines = text ? text.split('\n').length : 0;
  
  textLength.textContent = `글자 수: ${length.toLocaleString()}`;
  lineCount.textContent = `줄 수: ${lines.toLocaleString()}`;
}

function syncHighlightScroll() {
  // Sync scroll between test text and highlighted text if needed
  // This would be implemented for advanced text highlighting
}

// =========================
// Pattern Management
// =========================
function saveCurrentPattern() {
  if (!TesterState.pattern) {
    showNotification('저장할 패턴이 없습니다.', 'warning');
    return;
  }
  
  const patternData = {
    id: `custom_${Date.now()}`,
    pattern: TesterState.pattern,
    flags: TesterState.flags,
    testText: TesterState.testText,
    timestamp: Date.now(),
    title: `Custom Pattern ${new Date().toLocaleString()}`
  };
  
  // Save to localStorage
  const savedPatterns = JSON.parse(localStorage.getItem('neo-regex-saved-patterns')) || [];
  savedPatterns.unshift(patternData);
  
  // Keep only last 20 patterns
  if (savedPatterns.length > 20) {
    savedPatterns.splice(20);
  }
  
  localStorage.setItem('neo-regex-saved-patterns', JSON.stringify(savedPatterns));
  
  showNotification('패턴이 저장되었습니다.', 'success');
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('tester', 'save-pattern');
  }
}

function showLoadPatternDialog() {
  // This would show a dialog with saved patterns
  // For now, just show a simple message
  showNotification('저장된 패턴 불러오기 기능을 준비 중입니다.', 'info');
}

function clearAllInputs() {
  const patternInput = document.getElementById('regex-pattern');
  const flagsInput = document.getElementById('regex-flags');
  const testTextArea = document.getElementById('test-text');
  
  if (patternInput) patternInput.value = '';
  if (flagsInput) flagsInput.value = '';
  if (testTextArea) testTextArea.value = '';
  
  TesterState.pattern = '';
  TesterState.flags = '';
  TesterState.testText = '';
  
  updateFlagButtons('');
  updateTextStats();
  clearResults();
  
  // Clear validation
  const validationContainer = document.getElementById('pattern-validation');
  if (validationContainer) {
    validationContainer.innerHTML = '';
  }
  
  showNotification('모든 입력이 지워졌습니다.', 'info');
}

function loadSampleText() {
  const samples = [
    `John Doe <john@example.com>
Jane Smith <jane.smith@company.org>
Invalid email: notanemail
Bob Wilson <bob.wilson+tag@subdomain.example.com>
Support team: support@help-desk.co.uk`,
    
    `010-1234-5678
02-123-4567
031-987-6543
Invalid: 010-123-45
010 5678 9012`,
    
    `https://www.example.com
http://subdomain.example.org/path?query=value
https://api.service.com/v1/users/123
ftp://invalid.protocol.com
www.missing-protocol.com`,
    
    `Strong123!
WeakPassword
AnotherStrong$Pass1
short
ONLY_UPPERCASE_123!`
  ];
  
  const randomSample = samples[Math.floor(Math.random() * samples.length)];
  const testTextArea = document.getElementById('test-text');
  
  if (testTextArea) {
    testTextArea.value = randomSample;
    handleTestTextChange({ target: { value: randomSample } });
  }
}

function clearTestText() {
  const testTextArea = document.getElementById('test-text');
  if (testTextArea) {
    testTextArea.value = '';
    handleTestTextChange({ target: { value: '' } });
  }
}

// =========================
// History Management
// =========================
function addToHistory(results) {
  const historyItem = {
    pattern: results.pattern,
    flags: results.flags,
    matches: results.matches.length,
    executionTime: results.executionTime,
    timestamp: results.timestamp
  };
  
  // Add to beginning of history
  TesterState.history.unshift(historyItem);
  
  // Keep only recent items
  if (TesterState.history.length > TesterState.maxHistorySize) {
    TesterState.history.splice(TesterState.maxHistorySize);
  }
  
  // Save to localStorage
  localStorage.setItem('neo-regex-tester-history', JSON.stringify(TesterState.history));
}

// =========================
// Storage Functions
// =========================
function saveToLocalStorage() {
  const data = {
    pattern: TesterState.pattern,
    flags: TesterState.flags,
    testText: TesterState.testText,
    timestamp: Date.now()
  };
  
  localStorage.setItem('neo-regex-tester-state', JSON.stringify(data));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem('neo-regex-tester-state');
  if (!data) return;
  
  try {
    const parsed = JSON.parse(data);
    
    const patternInput = document.getElementById('regex-pattern');
    const flagsInput = document.getElementById('regex-flags');
    const testTextArea = document.getElementById('test-text');
    
    if (patternInput && parsed.pattern) {
      patternInput.value = parsed.pattern;
      TesterState.pattern = parsed.pattern;
    }
    
    if (flagsInput && parsed.flags) {
      flagsInput.value = parsed.flags;
      TesterState.flags = parsed.flags;
      updateFlagButtons(parsed.flags);
    }
    
    if (testTextArea && parsed.testText) {
      testTextArea.value = parsed.testText;
      TesterState.testText = parsed.testText;
      updateTextStats();
    }
    
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
}

function loadFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const pattern = urlParams.get('pattern');
  const flags = urlParams.get('flags');
  const text = urlParams.get('text');
  
  if (pattern) {
    const patternInput = document.getElementById('regex-pattern');
    if (patternInput) {
      patternInput.value = pattern;
      TesterState.pattern = pattern;
    }
  }
  
  if (flags) {
    const flagsInput = document.getElementById('regex-flags');
    if (flagsInput) {
      flagsInput.value = flags;
      TesterState.flags = flags;
      updateFlagButtons(flags);
    }
  }
  
  if (text) {
    const testTextArea = document.getElementById('test-text');
    if (testTextArea) {
      testTextArea.value = decodeURIComponent(text);
      TesterState.testText = decodeURIComponent(text);
      updateTextStats();
    }
  }
  
  // Run test if we have pattern and text
  if (pattern && text) {
    setTimeout(() => runRegexTest(), 100);
  }
}

function loadStoredPattern() {
  // Check if there's a pattern from library page
  loadTestPatternFromStorage();
  
  // If no pattern from library, load from localStorage
  if (!TesterState.pattern) {
    loadFromLocalStorage();
  }
}

function loadTestPatternFromStorage() {
  const storedPattern = sessionStorage.getItem('neo-regex-test-pattern');
  if (!storedPattern) return;
  
  try {
    const pattern = JSON.parse(storedPattern);
    
    const patternInput = document.getElementById('regex-pattern');
    const testTextArea = document.getElementById('test-text');
    
    if (patternInput && pattern.pattern) {
      patternInput.value = pattern.pattern;
      TesterState.pattern = pattern.pattern;
    }
    
    if (testTextArea && pattern.examples?.valid) {
      const sampleText = pattern.examples.valid.join('\n') + 
        (pattern.examples.invalid ? '\n' + pattern.examples.invalid.join('\n') : '');
      testTextArea.value = sampleText;
      TesterState.testText = sampleText;
      updateTextStats();
    }
    
    // Clear the session storage
    sessionStorage.removeItem('neo-regex-test-pattern');
    
    // Run test
    setTimeout(() => runRegexTest(), 100);
    
  } catch (error) {
    console.error('Failed to load test pattern:', error);
  }
}

// =========================
// Modal Functions
// =========================
function setupModals() {
  // Setup all modal close events
  const modals = ['code-modal', 'share-modal', 'history-modal'];
  
  modals.forEach(modalId => {
    const overlay = document.getElementById(`${modalId}-overlay`);
    const closeBtn = document.getElementById(`${modalId}-close`);
    
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
      });
    }
  });
  
  // ESC key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(modalId => {
        const overlay = document.getElementById(`${modalId}-overlay`);
        if (overlay && overlay.style.display === 'flex') {
          overlay.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    }
  });
}

function showCodeGenerationModal() {
  const modal = document.getElementById('code-modal-overlay');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    generateCode(); // Generate initial code
  }
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('tester', 'code-generation');
  }
}

function showShareModal() {
  const modal = document.getElementById('share-modal-overlay');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    generateShareURL();
  }
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('tester', 'share');
  }
}

function showHistoryModal() {
  const modal = document.getElementById('history-modal-overlay');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    loadHistoryContent();
  }
  
  if (window.NeoRegex) {
    window.NeoRegex.trackFeatureUsage('tester', 'history');
  }
}

// =========================
// Advanced Features (Placeholder functions)
// =========================
function generateCode() {
  // Code generation would be implemented here
  showNotification('코드 생성 기능을 준비 중입니다.', 'info');
}

function generateShareURL() {
  // Share URL generation would be implemented here
  showNotification('공유 기능을 준비 중입니다.', 'info');
}

function loadHistoryContent() {
  // History content loading would be implemented here
  showNotification('히스토리 기능을 준비 중입니다.', 'info');
}

function exportTestResults() {
  if (!TesterState.lastResults) {
    showNotification('내보낼 결과가 없습니다.', 'warning');
    return;
  }
  
  showNotification('결과 내보내기 기능을 준비 중입니다.', 'info');
}

// =========================
// Keyboard Shortcuts
// =========================
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter: Run test
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runRegexTest();
    }
    
    // Ctrl/Cmd + S: Save pattern
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveCurrentPattern();
    }
    
    // Ctrl/Cmd + Shift + C: Clear all
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      clearAllInputs();
    }
    
    // F1: Show help
    if (e.key === 'F1') {
      e.preventDefault();
      showNotification('도움말: Ctrl+Enter(테스트), Ctrl+S(저장), Ctrl+Shift+C(지우기)', 'info');
    }
  });
}

console.log('🔬 정규식 테스터 스크립트 로드 완료!');