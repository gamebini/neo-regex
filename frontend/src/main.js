// frontend/src/main.js
import './styles/main.css';
import { initializeComponents } from './components/init.js';

// 전역 유틸리티 함수들
window.utils = {
  // 요소 선택
  $: (selector) => document.querySelector(selector),
  $$: (selector) => document.querySelectorAll(selector),

  // 이벤트 리스너 추가
  on: (element, event, handler) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.addEventListener(event, handler);
    }
  },

  // 클래스 토글
  toggle: (element, className) => {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.classList.toggle(className);
    }
  },

  // API 호출
  api: async (url, options = {}) => {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  // 알림 표시
  notify: (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="flex-1">
          <p class="text-sm font-medium">${message}</p>
        </div>
        <button class="ml-4 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;
    
    // 알림 컨테이너 생성 또는 가져오기
    let container = document.querySelector('#notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // 3초 후 자동 제거
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  },

  // 로딩 스피너 표시/숨기기
  loading: {
    show: (element) => {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      if (element) {
        element.classList.add('loading');
        element.disabled = true;
      }
    },
    hide: (element) => {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      if (element) {
        element.classList.remove('loading');
        element.disabled = false;
      }
    }
  },

  // 폼 검증
  validate: {
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    phone: (phone) => /^[\d\s\-\+\(\)]+$/.test(phone),
    required: (value) => value && value.trim() !== ''
  },

  // 로컬 스토리지 헬퍼
  storage: {
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Storage set error:', error);
      }
    },
    get: (key) => {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('Storage get error:', error);
        return null;
      }
    },
    remove: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Storage remove error:', error);
      }
    }
  },

  // 디바운스 유틸리티
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // 스로틀 유틸리티
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// 툴팁 기능
function showTooltip(e) {
  const tooltip = document.createElement('div');
  tooltip.className = 'absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg tooltip';
  tooltip.textContent = e.target.dataset.tooltip;
  
  document.body.appendChild(tooltip);
  
  const rect = e.target.getBoundingClientRect();
  tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
  tooltip.style.top = rect.bottom + 5 + 'px';
}

function hideTooltip() {
  const tooltip = document.querySelector('.tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

// 전역으로 사용할 수 있도록 window 객체에 추가
window.showTooltip = showTooltip;
window.hideTooltip = hideTooltip;

// 키보드 단축키 처리
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Enter: 정규식 테스트 실행
    if (e.ctrlKey && e.key === 'Enter') {
      const testButton = document.querySelector('#test-regex');
      if (testButton) {
        testButton.click();
      }
    }
    
    // Ctrl+K: 패턴 입력 필드에 포커스
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      const patternInput = document.querySelector('#regex-pattern');
      if (patternInput) {
        patternInput.focus();
      }
    }
    
    // Escape: 모든 모달/알림 닫기
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.modal-overlay');
      const notifications = document.querySelectorAll('.notification');
      
      modals.forEach(modal => modal.remove());
      notifications.forEach(notification => notification.remove());
    }
  });
}

// 성능 모니터링
function setupPerformanceMonitoring() {
  // 페이지 로드 시간 측정
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`📊 페이지 로드 시간: ${loadTime.toFixed(2)}ms`);
    
    // 리소스 로딩 시간 분석
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources.filter(resource => resource.duration > 100);
    
    if (slowResources.length > 0) {
      console.warn('⚠️ 느린 리소스들:', slowResources);
    }
  });
}

// 에러 처리
function setupGlobalErrorHandling() {
  window.addEventListener('error', (e) => {
    console.error('💥 전역 에러:', e.error);
    utils.notify('예상치 못한 오류가 발생했습니다.', 'error');
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('💥 처리되지 않은 Promise 거부:', e.reason);
    utils.notify('네트워크 오류가 발생했습니다.', 'error');
  });
}

// 서비스 워커 등록 (PWA 준비)
function registerServiceWorker() {
  if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('🔧 Service Worker 등록 성공:', registration);
      })
      .catch(error => {
        console.log('❌ Service Worker 등록 실패:', error);
      });
  }
}

// 다크모드 시스템 감지
function setupDarkModeDetection() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  function handleSystemThemeChange(e) {
    const savedTheme = utils.storage.get('darkMode');
    if (savedTheme === null) { // 사용자가 수동으로 설정하지 않은 경우만
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
  
  mediaQuery.addEventListener('change', handleSystemThemeChange);
  handleSystemThemeChange(mediaQuery); // 초기 설정
}

// 접근성 개선
function setupAccessibility() {
  // 키보드 네비게이션 표시
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });
  
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });
  
  // 스크린 리더를 위한 live region 설정
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.id = 'live-region';
  document.body.appendChild(liveRegion);
}

// DOM이 로드된 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 NEO Regex 애플리케이션이 시작되었습니다.');
  
  // 핵심 기능 초기화
  initializeComponents();
  
  // 유틸리티 기능 초기화
  setupKeyboardShortcuts();
  setupPerformanceMonitoring();
  setupGlobalErrorHandling();
  setupDarkModeDetection();
  setupAccessibility();
  
  // PWA 기능 (HTTPS에서만)
  if (window.location.protocol === 'https:') {
    registerServiceWorker();
  }
  
  // 다크모드 토글 기능
  const darkModeToggle = document.querySelector('#dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      utils.storage.set('darkMode', isDark);
      
      // 접근성을 위한 알림
      const message = isDark ? '다크 모드가 활성화되었습니다.' : '라이트 모드가 활성화되었습니다.';
      const liveRegion = document.querySelector('#live-region');
      if (liveRegion) {
        liveRegion.textContent = message;
      }
    });
  }

  // 저장된 다크모드 설정 로드
  const savedDarkMode = utils.storage.get('darkMode');
  if (savedDarkMode) {
    document.documentElement.classList.add('dark');
  }

  // 네비게이션 모바일 토글
  const mobileMenuButton = document.querySelector('.mobile-menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      
      // 접근성 개선
      mobileMenuButton.setAttribute('aria-expanded', !isHidden);
      mobileMenu.setAttribute('aria-hidden', isHidden);
    });
  }

  // 모든 폼에 기본 검증 추가
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;

      requiredFields.forEach(field => {
        if (!utils.validate.required(field.value)) {
          isValid = false;
          field.classList.add('input-error');
          field.setAttribute('aria-invalid', 'true');
        } else {
          field.classList.remove('input-error');
          field.setAttribute('aria-invalid', 'false');
        }
      });

      if (!isValid) {
        e.preventDefault();
        utils.notify('필수 항목을 모두 입력해주세요.', 'error');
        
        // 첫 번째 오류 필드에 포커스
        const firstErrorField = form.querySelector('.input-error');
        if (firstErrorField) {
          firstErrorField.focus();
        }
      }
    });
  });

  // 툴팁 초기화
  const tooltips = document.querySelectorAll('[data-tooltip]');
  tooltips.forEach(element => {
    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
    element.addEventListener('focus', showTooltip);
    element.addEventListener('blur', hideTooltip);
  });

  // 환영 메시지 표시 (딜레이 후)
  setTimeout(() => {
    utils.notify('NEO Regex에 오신 것을 환영합니다! 🎉', 'success');
    
    // 키보드 단축키 안내
    setTimeout(() => {
      utils.notify('💡 팁: Ctrl+Enter로 정규식 테스트, Ctrl+K로 패턴 입력에 포커스', 'info');
    }, 2000);
  }, 1000);

  // 앱 상태 표시
  console.log('✅ 모든 시스템이 초기화되었습니다.');
  console.log('🎯 사용 가능한 단축키:');
  console.log('   - Ctrl+Enter: 정규식 테스트 실행');
  console.log('   - Ctrl+K: 패턴 입력 포커스');
  console.log('   - Escape: 모달/알림 닫기');
});