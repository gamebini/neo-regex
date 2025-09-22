/**
 * NEO Regex - Main JavaScript File
 * 전문적이고 현대적인 정규식 도구를 위한 메인 스크립트
 */

// =========================
// Global State Management
// =========================
const AppState = {
  theme: localStorage.getItem('neo-regex-theme') || 'light',
  currentPage: 'home',
  isMenuOpen: false,
  notifications: [],
  userPreferences: JSON.parse(localStorage.getItem('neo-regex-preferences')) || {
    autoSave: true,
    showTips: true,
    animationsEnabled: true
  }
};

// =========================
// DOM Ready Event
// =========================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 NEO Regex 초기화 중...');
  
  initializeApp();
  initializeNavigation();
  initializeTheme();
  initializeScrollEffects();
  initializeHeroDemo();
  initializeStatsAnimation();
  initializeKeyboardNavigation();
  
  console.log('✅ NEO Regex 초기화 완료!');
});

// =========================
// App Initialization
// =========================
function initializeApp() {
  // Performance monitoring
  const startTime = performance.now();
  
  // Apply theme
  applyTheme(AppState.theme);
  
  // Setup error handling
  setupErrorHandling();
  
  // Initialize service worker if available
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.warn);
  }
  
  const endTime = performance.now();
  console.log(`⚡ 앱 초기화 완료: ${(endTime - startTime).toFixed(2)}ms`);
}

// =========================
// Navigation System
// =========================
function initializeNavigation() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Hamburger menu toggle
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', toggleMobileMenu);
  }
  
  // Smooth scrolling for anchor links
  navLinks.forEach(link => {
    if (link.getAttribute('href')?.startsWith('#')) {
      link.addEventListener('click', handleSmoothScroll);
    }
  });
  
  // Update active navigation
  updateActiveNavigation();
  
  // Handle page navigation
  document.addEventListener('click', handlePageNavigation);
}

function toggleMobileMenu() {
  AppState.isMenuOpen = !AppState.isMenuOpen;
  const navMenu = document.getElementById('nav-menu');
  const hamburger = document.getElementById('hamburger');
  
  if (navMenu) {
    navMenu.classList.toggle('active', AppState.isMenuOpen);
  }
  
  if (hamburger) {
    hamburger.classList.toggle('active', AppState.isMenuOpen);
  }
  
  // Update hamburger animation
  updateHamburgerAnimation(AppState.isMenuOpen);
}

function updateHamburgerAnimation(isOpen) {
  const bars = document.querySelectorAll('.hamburger .bar');
  bars.forEach((bar, index) => {
    if (isOpen) {
      if (index === 0) {
        bar.style.transform = 'rotate(45deg) translate(5px, 5px)';
      } else if (index === 1) {
        bar.style.opacity = '0';
      } else if (index === 2) {
        bar.style.transform = 'rotate(-45deg) translate(7px, -6px)';
      }
    } else {
      bar.style.transform = '';
      bar.style.opacity = '';
    }
  });
}

function handleSmoothScroll(e) {
  e.preventDefault();
  const targetId = e.target.getAttribute('href');
  const targetElement = document.querySelector(targetId);
  
  if (targetElement) {
    const headerOffset = 80;
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
    
    // Close mobile menu if open
    if (AppState.isMenuOpen) {
      toggleMobileMenu();
    }
  }
}

function updateActiveNavigation() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  
  window.addEventListener('scroll', debounce(() => {
    let current = '';
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, 100));
}

function handlePageNavigation(e) {
  const link = e.target.closest('a[href]');
  if (!link) return;
  
  const href = link.getAttribute('href');
  
  // Track page navigation
  if (href && !href.startsWith('#') && !href.startsWith('http')) {
    trackPageNavigation(href);
  }
}

// =========================
// Theme System
// =========================
function initializeTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    updateThemeButton();
  }
}

function toggleTheme() {
  AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
  applyTheme(AppState.theme);
  localStorage.setItem('neo-regex-theme', AppState.theme);
  updateThemeButton();
  
  showNotification(
    `${AppState.theme === 'dark' ? '다크' : '라이트'} 모드로 변경되었습니다.`,
    'success'
  );
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  
  if (theme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}

function updateThemeButton() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  const icon = themeToggle.querySelector('i');
  if (icon) {
    icon.className = AppState.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
  
  themeToggle.setAttribute('title', 
    AppState.theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'
  );
}

// =========================
// Scroll Effects & Animations
// =========================
function initializeScrollEffects() {
  // Navbar background effect
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', debounce(() => {
    const scrollY = window.scrollY;
    
    if (navbar) {
      if (scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '';
      }
    }
  }, 16));
  
  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        
        // Animate stats numbers
        if (entry.target.classList.contains('stat-card')) {
          animateStatNumber(entry.target);
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe elements with data-aos attributes
  const animatedElements = document.querySelectorAll('[data-aos]');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// =========================
// Hero Demo Animation
// =========================
function initializeHeroDemo() {
  const demoPattern = document.getElementById('demo-pattern');
  if (!demoPattern) return;
  
  const patterns = [
    '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    '^\\+?[1-9]\\d{1,14}$',
    '^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$',
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$'
  ];
  
  const descriptions = [
    '이메일 주소 검증',
    '국제 전화번호 형식',
    'URL 주소 매칭',
    '강력한 비밀번호 정책'
  ];
  
  let currentIndex = 0;
  
  setInterval(() => {
    currentIndex = (currentIndex + 1) % patterns.length;
    
    // Fade out
    demoPattern.style.opacity = '0';
    
    setTimeout(() => {
      demoPattern.textContent = patterns[currentIndex];
      demoPattern.style.opacity = '1';
      
      // Update demo description if element exists
      const demoDesc = document.querySelector('.demo-description');
      if (demoDesc) {
        demoDesc.textContent = descriptions[currentIndex];
      }
    }, 300);
  }, 3000);
}

// =========================
// Stats Animation
// =========================
function initializeStatsAnimation() {
  // This will be called when stats come into view
}

function animateStatNumber(statCard) {
  const numberElement = statCard.querySelector('.stat-number');
  if (!numberElement) return;
  
  const target = parseInt(numberElement.getAttribute('data-target'));
  const isDecimal = target.toString().includes('.');
  
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    
    if (isDecimal) {
      numberElement.textContent = current.toFixed(1);
    } else {
      numberElement.textContent = Math.floor(current).toLocaleString();
    }
  }, 40);
}

// =========================
// Keyboard Navigation
// =========================
function initializeKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // ESC key closes mobile menu
    if (e.key === 'Escape' && AppState.isMenuOpen) {
      toggleMobileMenu();
    }
    
    // Ctrl/Cmd + K opens search (if implemented)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      // TODO: Open search modal
    }
    
    // Theme toggle with Ctrl/Cmd + Shift + L
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
      e.preventDefault();
      toggleTheme();
    }
  });
  
  // Focus management for accessibility
  document.addEventListener('focusin', (e) => {
    if (e.target.matches('.nav-dropdown')) {
      document.body.classList.add('keyboard-navigation');
    }
  });
  
  document.addEventListener('focusout', (e) => {
    setTimeout(() => {
      if (!document.activeElement.matches('.nav-dropdown, .dropdown-content a')) {
        document.body.classList.remove('keyboard-navigation');
      }
    }, 100);
  });
}

// =========================
// Notification System
// =========================
function showNotification(message, type = 'info', duration = 5000) {
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
      <div class="notification-message">${escapeHtml(message)}</div>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  container.appendChild(notification);
  
  // Auto remove
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }
  }, duration);
  
  // Track notification
  AppState.notifications.push({
    message,
    type,
    timestamp: Date.now()
  });
}

// =========================
// Utility Functions
// =========================
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

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      showNotification('클립보드에 복사되었습니다!', 'success');
    } else {
      fallbackCopyTextToClipboard(text);
    }
  } catch (err) {
    console.error('클립보드 복사 실패:', err);
    showNotification('복사에 실패했습니다.', 'error');
  }
}

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

// =========================
// Analytics & Tracking
// =========================
function trackPageNavigation(page) {
  // Basic page tracking (can be enhanced with analytics services)
  console.log(`📊 페이지 이동: ${page}`);
  
  // Store in local analytics
  const analytics = JSON.parse(localStorage.getItem('neo-regex-analytics')) || {};
  analytics.pageViews = analytics.pageViews || {};
  analytics.pageViews[page] = (analytics.pageViews[page] || 0) + 1;
  analytics.lastVisit = Date.now();
  
  localStorage.setItem('neo-regex-analytics', JSON.stringify(analytics));
}

function trackFeatureUsage(feature, action = 'used') {
  console.log(`📊 기능 사용: ${feature} - ${action}`);
  
  const analytics = JSON.parse(localStorage.getItem('neo-regex-analytics')) || {};
  analytics.features = analytics.features || {};
  analytics.features[feature] = analytics.features[feature] || {};
  analytics.features[feature][action] = (analytics.features[feature][action] || 0) + 1;
  
  localStorage.setItem('neo-regex-analytics', JSON.stringify(analytics));
}

// =========================
// Error Handling
// =========================
function setupErrorHandling() {
  window.addEventListener('error', (e) => {
    console.error('🔥 JavaScript 오류:', e.error);
    
    if (e.error && e.error.stack) {
      console.error('스택 트레이스:', e.error.stack);
    }
    
    // Show user-friendly error message
    showNotification(
      '예상치 못한 오류가 발생했습니다. 페이지를 새로고침해주세요.',
      'error'
    );
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    console.error('🔥 처리되지 않은 Promise 거부:', e.reason);
    e.preventDefault();
    
    showNotification(
      '네트워크 오류가 발생했습니다. 연결을 확인해주세요.',
      'warning'
    );
  });
}

// =========================
// Service Worker Support
// =========================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker 등록 성공:', registration.scope);
      })
      .catch(registrationError => {
        console.log('❌ Service Worker 등록 실패:', registrationError);
      });
  });
}

// =========================
// Performance Monitoring
// =========================
function logPerformanceMetrics() {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      console.log('⚡ 성능 메트릭스:', {
        pageLoadTime: `${navigation.loadEventEnd - navigation.fetchStart}ms`,
        domContentLoaded: `${navigation.domContentLoadedEventEnd - navigation.fetchStart}ms`,
        firstPaint: `${performance.getEntriesByName('first-paint')[0]?.startTime || 0}ms`
      });
    }
  }
}

// Performance logging after page load
window.addEventListener('load', () => {
  setTimeout(logPerformanceMetrics, 1000);
});

// =========================
// Global API
// =========================
window.NeoRegex = {
  // Core functions
  showNotification,
  copyToClipboard,
  toggleTheme,
  
  // State management
  getState: () => ({ ...AppState }),
  updatePreferences: (prefs) => {
    AppState.userPreferences = { ...AppState.userPreferences, ...prefs };
    localStorage.setItem('neo-regex-preferences', JSON.stringify(AppState.userPreferences));
  },
  
  // Analytics
  trackFeatureUsage,
  
  // Utility
  debounce,
  throttle,
  escapeHtml
};

// =========================
// Backwards Compatibility
// =========================
// Support for old function names
window.copyToClipboard = copyToClipboard;
window.showNotification = showNotification;

console.log('🎉 NEO Regex JavaScript 로드 완료!');
console.log('💡 전역 API 사용 가능: window.NeoRegex');