// NEO Regex Docs - JavaScript

class DocsManager {
    constructor() {
        this.currentSection = 'terms';
        this.init();
    }

    init() {
        console.log('Initializing DocsManager...');
        this.bindElements();
        this.bindEvents();
        this.handleInitialHash();
        console.log('DocsManager initialized successfully');
    }

    bindElements() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.docSections = document.querySelectorAll('.doc-section');
    }

    bindEvents() {
        // Navigation items click
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.navigateToSection(section);
            });
        });

        // Handle browser back/forward
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });

        // Smooth scroll for anchor links within sections
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href.startsWith('#') && href.length > 1) {
                    const section = href.substring(1);
                    // Check if it's a section link
                    const sectionElement = document.getElementById(section);
                    if (sectionElement && sectionElement.classList.contains('doc-section')) {
                        e.preventDefault();
                        this.navigateToSection(section);
                    }
                }
            });
        });
    }

    handleInitialHash() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            this.navigateToSection(hash);
        } else {
            this.navigateToSection(this.currentSection);
        }
    }

    handleHashChange() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            this.activateSection(hash);
        }
    }

    navigateToSection(sectionId) {
        // Update URL hash
        history.pushState(null, null, `#${sectionId}`);
        
        // Activate section
        this.activateSection(sectionId);
        
        // Scroll to top smoothly
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    activateSection(sectionId) {
        this.currentSection = sectionId;

        // Update navigation
        this.navItems.forEach(item => {
            const itemSection = item.getAttribute('data-section');
            if (itemSection === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update sections
        this.docSections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Update page title
        this.updatePageTitle(sectionId);
    }

    updatePageTitle(sectionId) {
        const titles = {
            'terms': '이용약관',
            'privacy': '개인정보처리방침',
            'guide': '사용 가이드',
            'faq': '자주 묻는 질문'
        };
        
        const sectionTitle = titles[sectionId] || '문서';
        document.title = `${sectionTitle} | NEO Regex`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing DocsManager...');
    
    try {
        window.docsManager = new DocsManager();
        console.log('📚 NEO Regex Docs initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize DocsManager:', error);
    }
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DocsManager };
}