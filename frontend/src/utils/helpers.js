// frontend/src/utils/helpers.js

/**
 * Debounce function - delays function execution until after wait time
 */
export function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle function - limits function execution to once per time period
 */
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            // Use modern clipboard API
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'absolute';
            textArea.style.left = '-999999px';
            document.body.prepend(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
            } finally {
                textArea.remove();
            }
            return true;
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Show notification to user
 */
export function showNotification(message, type = 'info', duration = 4000) {
    const container = document.getElementById('notification-container') || createNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} animate-slide-up`;
    
    const iconMap = {
        success: `<svg class="w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>`,
        error: `<svg class="w-5 h-5 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`,
        warning: `<svg class="w-5 h-5 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`,
        info: `<svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`
    };
    
    notification.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
                ${iconMap[type] || iconMap.info}
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">${message}</p>
            </div>
            <button class="notification-close flex-shrink-0 p-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => removeNotification(notification));
    
    container.appendChild(notification);
    
    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => removeNotification(notification), duration);
    }
    
    return notification;
}

/**
 * Remove notification with animation
 */
function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    notification.style.transition = 'all 0.3s ease-in-out';
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

/**
 * Create notification container if it doesn't exist
 */
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full';
    document.body.appendChild(container);
    return container;
}

/**
 * Show loading spinner
 */
export function showLoading(message = '로딩중...') {
    const existingSpinner = document.getElementById('loading-spinner');
    if (existingSpinner) {
        existingSpinner.classList.remove('hidden');
        const messageEl = existingSpinner.querySelector('span');
        if (messageEl) messageEl.textContent = message;
    }
}

/**
 * Hide loading spinner
 */
export function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Unescape HTML
 */
export function unescapeHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format date in a readable format
 */
export function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    if (typeof date === 'string' || typeof date === 'number') {
        date = new Date(date);
    }
    
    return new Intl.DateTimeFormat('ko-KR', formatOptions).format(date);
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    const intervals = [
        { label: '년', seconds: 31536000 },
        { label: '개월', seconds: 2592000 },
        { label: '일', seconds: 86400 },
        { label: '시간', seconds: 3600 },
        { label: '분', seconds: 60 },
        { label: '초', seconds: 1 }
    ];
    
    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
            return `${count}${interval.label} 전`;
        }
    }
    
    return '방금 전';
}

/**
 * Generate random ID
 */
export function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Deep clone an object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Check if object is empty
 */
export function isEmpty(obj) {
    if (obj === null || obj === undefined) return true;
    if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str) {
    if (!str || typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str, length = 50, suffix = '...') {
    if (!str || typeof str !== 'string') return str;
    if (str.length <= length) return str;
    return str.slice(0, length) + suffix;
}

/**
 * Parse query string parameters
 */
export function parseQueryString(queryString = window.location.search) {
    const params = new URLSearchParams(queryString);
    const result = {};
    
    for (const [key, value] of params.entries()) {
        result[key] = value;
    }
    
    return result;
}

/**
 * Build query string from object
 */
export function buildQueryString(params) {
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            urlParams.append(key, String(value));
        }
    });
    
    return urlParams.toString();
}

/**
 * Check if user is on mobile device
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if user prefers dark mode
 */
export function prefersDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Smooth scroll to element
 */
export function scrollToElement(element, offset = 0) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    
    if (!element) return;
    
    const elementTop = element.offsetTop - offset;
    
    window.scrollTo({
        top: elementTop,
        behavior: 'smooth'
    });
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Wait for specified time
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry(fn, maxAttempts = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxAttempts) {
                throw lastError;
            }
            
            await sleep(delay * Math.pow(2, attempt - 1));
        }
    }
}

/**
 * Simple event emitter
 */
export class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        // Return unsubscribe function
        return () => this.off(event, callback);
    }
    
    off(event, callback) {
        if (!this.events[event]) return;
        
        const index = this.events[event].indexOf(callback);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
    }
    
    emit(event, ...args) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error('Error in event listener:', error);
            }
        });
    }
    
    once(event, callback) {
        const onceCallback = (...args) => {
            this.off(event, onceCallback);
            callback(...args);
        };
        
        return this.on(event, onceCallback);
    }
}

/**
 * Local storage wrapper with JSON support
 */
export const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('Error writing to localStorage:', error);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Error removing from localStorage:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.warn('Error clearing localStorage:', error);
            return false;
        }
    },
    
    has(key) {
        return localStorage.getItem(key) !== null;
    }
};

/**
 * URL utilities
 */
export const url = {
    getCurrentUrl() {
        return window.location.href;
    },
    
    getCurrentPath() {
        return window.location.pathname;
    },
    
    getCurrentHash() {
        return window.location.hash;
    },
    
    setHash(hash) {
        window.location.hash = hash;
    },
    
    removeHash() {
        window.history.replaceState('', document.title, window.location.pathname + window.location.search);
    }
};

/**
 * Performance utilities
 */
export const perf = {
    mark(name) {
        if (window.performance && window.performance.mark) {
            window.performance.mark(name);
        }
    },
    
    measure(name, startMark, endMark) {
        if (window.performance && window.performance.measure) {
            window.performance.measure(name, startMark, endMark);
            const measure = window.performance.getEntriesByName(name)[0];
            return measure ? measure.duration : 0;
        }
        return 0;
    },
    
    now() {
        return window.performance && window.performance.now 
            ? window.performance.now() 
            : Date.now();
    }
};

console.log('✅ Helper utilities loaded');

export default {
    debounce,
    throttle,
    copyToClipboard,
    showNotification,
    showLoading,
    hideLoading,
    escapeHtml,
    unescapeHtml,
    formatFileSize,
    formatDate,
    formatRelativeTime,
    generateId,
    deepClone,
    isEmpty,
    capitalize,
    truncate,
    parseQueryString,
    buildQueryString,
    isMobile,
    prefersDarkMode,
    scrollToElement,
    isInViewport,
    sleep,
    retry,
    EventEmitter,
    storage,
    url,
    perf
};