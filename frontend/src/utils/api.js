// frontend/src/utils/api.js
/**
 * API 통신 헬퍼 모듈
 */

// API 기본 설정
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 10000,
  retries: 3
};

/**
 * 기본 fetch 래퍼
 */
async function fetchWithConfig(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const fullUrl = url.startsWith('http') ? url : `${API_CONFIG.baseURL}${url}`;
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal,
      ...options
    };

    console.log(`🌐 API 요청: ${defaultOptions.method} ${fullUrl}`);
    
    const response = await fetch(fullUrl, defaultOptions);
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API 응답:`, data);
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다.');
    }
    
    console.error(`❌ API 오류:`, error);
    throw error;
  }
}

/**
 * 재시도 로직이 포함된 fetch
 */
async function fetchWithRetry(url, options = {}, retries = API_CONFIG.retries) {
  try {
    return await fetchWithConfig(url, options);
  } catch (error) {
    if (retries > 0 && !error.message.includes('400') && !error.message.includes('404')) {
      console.log(`🔄 재시도 중... (${API_CONFIG.retries - retries + 1}/${API_CONFIG.retries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (API_CONFIG.retries - retries + 1)));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

/**
 * API 메서드들
 */
export const api = {
  // 서버 상태 확인
  async health() {
    return await fetchWithRetry('/health');
  },

  // 정규식 테스트
  async testRegex(pattern, text, flags = '') {
    return await fetchWithRetry('/api/regex/test', {
      method: 'POST',
      body: JSON.stringify({ pattern, text, flags })
    });
  },

  // 패턴 목록 가져오기
  async getPatterns() {
    return await fetchWithRetry('/api/patterns');
  },

  // 패턴 저장
  async savePattern(pattern) {
    return await fetchWithRetry('/api/patterns', {
      method: 'POST',
      body: JSON.stringify(pattern)
    });
  },

  // 직접 URL 테스트 (디버깅용)
  async testConnection() {
    try {
      // 1. 백엔드 직접 연결 테스트
      const directTest = await fetch('http://localhost:3001/health');
      console.log('🔍 직접 연결 테스트:', directTest.status);

      // 2. 프록시를 통한 연결 테스트  
      const proxyTest = await fetch('/health');
      console.log('🔍 프록시 연결 테스트:', proxyTest.status);

      // 3. API 엔드포인트 테스트
      const apiTest = await fetch('/api/patterns');
      console.log('🔍 API 엔드포인트 테스트:', apiTest.status);

      return {
        direct: directTest.ok,
        proxy: proxyTest.ok,
        api: apiTest.ok
      };
    } catch (error) {
      console.error('🔍 연결 테스트 실패:', error);
      return {
        direct: false,
        proxy: false,
        api: false,
        error: error.message
      };
    }
  }
};

/**
 * 연결 상태 모니터링
 */
export function startConnectionMonitoring() {
  let isOnline = navigator.onLine;
  
  function updateConnectionStatus() {
    const wasOnline = isOnline;
    isOnline = navigator.onLine;
    
    if (!wasOnline && isOnline) {
      console.log('🌐 인터넷 연결이 복원되었습니다.');
      if (window.utils) {
        window.utils.notify('인터넷 연결이 복원되었습니다.', 'success');
      }
    } else if (wasOnline && !isOnline) {
      console.log('🚫 인터넷 연결이 끊어졌습니다.');
      if (window.utils) {
        window.utils.notify('인터넷 연결이 끊어졌습니다.', 'warning');
      }
    }
  }
  
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
}

/**
 * API 오류 핸들링
 */
export function handleApiError(error, fallbackMessage = '서버 오류가 발생했습니다.') {
  let message = fallbackMessage;
  
  if (error.message.includes('Failed to fetch')) {
    message = '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.';
  } else if (error.message.includes('시간이 초과')) {
    message = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
  } else if (error.message.includes('404')) {
    message = '요청한 리소스를 찾을 수 없습니다.';
  } else if (error.message.includes('500')) {
    message = '서버 내부 오류가 발생했습니다.';
  }
  
  if (window.utils) {
    window.utils.notify(message, 'error');
  }
  
  return message;
}