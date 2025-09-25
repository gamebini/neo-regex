// NEO Regex - Main JavaScript
// 공통 기능 및 유틸리티

class NeoRegexApp {
    constructor() {
        this.init();
    }

    init() {
        this.initNavigation();
        this.initThemeToggle();
        this.initNotifications();
        this.initAnimations();
        this.initUtils();
    }

    // =========================
    // Navigation
    // =========================
    initNavigation() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const navDropdowns = document.querySelectorAll('.nav-dropdown');

        // Mobile menu toggle
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            });
        }

        // Dropdown menus
        navDropdowns.forEach(dropdown => {
            const dropdownContent = dropdown.querySelector('.dropdown-content');
            let timeoutId;

            dropdown.addEventListener('mouseenter', () => {
                clearTimeout(timeoutId);
                dropdownContent.style.opacity = '1';
                dropdownContent.style.visibility = 'visible';
                dropdownContent.style.transform = 'translateY(0)';
            });

            dropdown.addEventListener('mouseleave', () => {
                timeoutId = setTimeout(() => {
                    dropdownContent.style.opacity = '0';
                    dropdownContent.style.visibility = 'hidden';
                    dropdownContent.style.transform = 'translateY(-8px)';
                }, 100);
            });
        });

        // Active page highlighting
        this.highlightActivePage();
    }

    highlightActivePage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(currentPage)) {
                link.classList.add('active');
            }
        });
    }

    // =========================
    // Theme Toggle
    // =========================
    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = themeToggle?.querySelector('i');
        
        // Load saved theme
        const savedTheme = localStorage.getItem('neo-regex-theme') || 'light';
        this.applyTheme(savedTheme);

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                
                this.applyTheme(newTheme);
                localStorage.setItem('neo-regex-theme', newTheme);

                // Button animation
                themeToggle.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    themeToggle.style.transform = 'rotate(0deg)';
                }, 300);
            });
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.querySelector('#theme-toggle i');
        
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.className = 'fas fa-sun';
            } else {
                themeIcon.className = 'fas fa-moon';
            }
        }
    }

    // =========================
    // Notifications
    // =========================
    initNotifications() {
        this.notificationContainer = document.getElementById('notification-container');
        if (!this.notificationContainer) {
            this.createNotificationContainer();
        }
    }

    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'notification-container';
        this.notificationContainer.className = 'notification-container';
        document.body.appendChild(this.notificationContainer);
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        this.notificationContainer.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);

        return notification;
    }

    removeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        };
        return icons[type] || icons.info;
    }

    // =========================
    // Animations
    // =========================
    initAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Counter animation
                    if (entry.target.hasAttribute('data-target')) {
                        this.animateCounter(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe elements with animation classes
        const animateElements = document.querySelectorAll('[data-aos], .stat-number[data-target]');
        animateElements.forEach(el => observer.observe(el));
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        };

        updateCounter();
    }

    // =========================
    // Utilities
    // =========================
    initUtils() {
        // Copy to clipboard
        this.initCopyButtons();
        
        // Smooth scrolling
        this.initSmoothScrolling();
        
        // Back to top
        this.initBackToTop();
    }

    initCopyButtons() {
        document.addEventListener('click', async (e) => {
            const copyBtn = e.target.closest('.copy-btn, .copy-code-btn');
            if (!copyBtn) return;

            const textToCopy = this.getTextToCopy(copyBtn);
            if (textToCopy) {
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    this.showNotification('클립보드에 복사되었습니다!', 'success', 2000);
                    
                    // Visual feedback
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> 복사됨!';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                    }, 1000);
                } catch (err) {
                    this.showNotification('복사에 실패했습니다.', 'error');
                }
            }
        });
    }

    getTextToCopy(button) {
        // Try different methods to get text to copy
        const codeBlock = button.parentElement.querySelector('code');
        if (codeBlock) {
            return codeBlock.textContent;
        }

        const pre = button.parentElement.querySelector('pre');
        if (pre) {
            return pre.textContent;
        }

        // Check for data attribute
        const dataCopy = button.getAttribute('data-copy');
        if (dataCopy) {
            return dataCopy;
        }

        return null;
    }

    initSmoothScrolling() {
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href^="#"]');
            if (!anchor) return;

            const targetId = anchor.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    initBackToTop() {
        const scrollTopBtn = document.getElementById('scroll-top');
        if (!scrollTopBtn) return;

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // =========================
    // API Methods
    // =========================
    testRegex(pattern, testString, flags = '') {
        try {
            const regex = new RegExp(pattern, flags);
            const matches = [...testString.matchAll(regex)];
            
            return {
                isValid: true,
                matches: matches.map(match => ({
                    text: match[0],
                    index: match.index,
                    groups: match.slice(1)
                })),
                matchCount: matches.length
            };
        } catch (error) {
            return {
                isValid: false,
                error: error.message,
                matches: [],
                matchCount: 0
            };
        }
    }

    highlightMatches(text, pattern, flags = '') {
        try {
            const regex = new RegExp(pattern, flags);
            let highlightedText = text;
            let matchIndex = 0;

            highlightedText = text.replace(regex, (match) => {
                return `<mark class="match-highlight" data-match="${matchIndex++}">${match}</mark>`;
            });

            return highlightedText;
        } catch (error) {
            return text;
        }
    }

    // =========================
    // Local Storage Helpers
    // =========================
    saveToStorage(key, value) {
        try {
            localStorage.setItem(`neo-regex-${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage save failed:', error);
            return false;
        }
    }

    loadFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`neo-regex-${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage load failed:', error);
            return defaultValue;
        }
    }

    removeFromStorage(key) {
        try {
            localStorage.removeItem(`neo-regex-${key}`);
            return true;
        } catch (error) {
            console.error('Storage remove failed:', error);
            return false;
        }
    }
}

// =========================
// Utility Functions
// =========================
const Utils = {
    debounce(func, wait) {
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

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },

    formatRegexPattern(pattern) {
        // Format regex pattern for display
        return pattern.replace(/\\/g, '\\\\')
                     .replace(/\n/g, '\\n')
                     .replace(/\r/g, '\\r')
                     .replace(/\t/g, '\\t');
    },

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    },

    generateRandomId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.NeoRegex = new NeoRegexApp();
    console.log('🚀 NEO Regex initialized!');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NeoRegexApp, Utils };
}