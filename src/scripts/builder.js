// NEO Regex Builder - 시각적 정규식 빌더

class RegexBuilder {
    constructor() {
        this.canvas = [];
        this.selectedComponent = null;
        this.draggedElement = null;
        this.generatedPattern = '';
        
        this.components = {
            basic: [
                { id: 'any-char', name: '임의 문자', symbol: '.', description: '줄바꿈을 제외한 모든 문자' },
                { id: 'digit', name: '숫자', symbol: '\\d', description: '0-9 숫자' },
                { id: 'word-char', name: '단어 문자', symbol: '\\w', description: '알파벳, 숫자, 언더스코어' },
                { id: 'whitespace', name: '공백', symbol: '\\s', description: '공백, 탭, 줄바꿈' },
                { id: 'word-boundary', name: '단어 경계', symbol: '\\b', description: '단어의 시작/끝' },
            ],
            negated: [
                { id: 'not-digit', name: '숫자가 아닌', symbol: '\\D', description: '숫자가 아닌 문자' },
                { id: 'not-word', name: '단어가 아닌', symbol: '\\W', description: '단어 문자가 아닌 문자' },
                { id: 'not-whitespace', name: '공백이 아닌', symbol: '\\S', description: '공백이 아닌 문자' },
            ],
            anchors: [
                { id: 'start', name: '시작', symbol: '^', description: '문자열의 시작' },
                { id: 'end', name: '끝', symbol: '$', description: '문자열의 끝' },
            ],
            quantifiers: [
                { id: 'zero-or-more', name: '0개 이상', symbol: '*', description: '0번 이상 반복' },
                { id: 'one-or-more', name: '1개 이상', symbol: '+', description: '1번 이상 반복' },
                { id: 'zero-or-one', name: '0개 또는 1개', symbol: '?', description: '0번 또는 1번' },
                { id: 'custom-count', name: '사용자 정의', symbol: '{n}', description: '지정된 횟수만큼 반복' },
            ],
            groups: [
                { id: 'capture-group', name: '캡처 그룹', symbol: '()', description: '그룹화 및 캡처' },
                { id: 'non-capture-group', name: '비캡처 그룹', symbol: '(?:)', description: '그룹화만' },
                { id: 'alternation', name: '선택', symbol: '|', description: 'OR 연산' },
            ],
            character_classes: [
                { id: 'char-set', name: '문자 세트', symbol: '[]', description: '지정된 문자 중 하나' },
                { id: 'negated-set', name: '부정 세트', symbol: '[^]', description: '지정된 문자가 아닌 것' },
                { id: 'range', name: '범위', symbol: '[a-z]', description: '문자 범위' },
            ]
        };
        
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.renderComponentPalette();
        this.loadSavedData();
        this.updateDisplay();
    }

    bindElements() {
        // Main areas
        this.componentPalette = document.getElementById('component-palette');
        this.buildCanvas = document.getElementById('build-canvas');
        this.generatedRegex = document.getElementById('generated-regex');
        this.testArea = document.getElementById('test-area');
        
        // Component categories
        this.categoryTabs = document.querySelectorAll('.component-tab');
        this.componentPanels = document.querySelectorAll('.component-panel');
        
        // Canvas controls
        this.clearCanvasBtn = document.getElementById('clear-canvas');
        this.undoBtn = document.getElementById('undo');
        this.redoBtn = document.getElementById('redo');
        
        // Test controls
        this.testInput = document.getElementById('test-input');
        this.testResults = document.getElementById('test-results');
        this.copyRegexBtn = document.getElementById('copy-regex');
        this.exportCodeBtn = document.getElementById('export-code');
        
        // Pattern validation
        this.patternPreview = document.getElementById('pattern-preview');
        this.patternDescription = document.getElementById('pattern-description');
    }

    bindEvents() {
        // Category tab events
        this.categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchCategory(tab));
        });
        
        // Canvas events
        if (this.buildCanvas) {
            this.buildCanvas.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.buildCanvas.addEventListener('drop', (e) => this.handleDrop(e));
            this.buildCanvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        }
        
        // Control button events
        this.clearCanvasBtn?.addEventListener('click', () => this.clearCanvas());
        this.undoBtn?.addEventListener('click', () => this.undo());
        this.redoBtn?.addEventListener('click', () => this.redo());
        this.copyRegexBtn?.addEventListener('click', () => this.copyRegex());
        this.exportCodeBtn?.addEventListener('click', () => this.exportCode());
        
        // Test input events
        this.testInput?.addEventListener('input', () => this.performTest());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    renderComponentPalette() {
        if (!this.componentPalette) return;

        Object.entries(this.components).forEach(([categoryId, components]) => {
            const panel = document.querySelector(`[data-category="${categoryId}"]`);
            if (!panel) return;

            const componentsHtml = components.map(component => `
                <div class="component-item" 
                     draggable="true" 
                     data-component="${component.id}"
                     data-symbol="${component.symbol}"
                     title="${component.description}">
                    <div class="component-symbol">
                        <code>${this.escapeHtml(component.symbol)}</code>
                    </div>
                    <div class="component-name">${component.name}</div>
                    <div class="component-description">${component.description}</div>
                </div>
            `).join('');

            panel.innerHTML = componentsHtml;

            // Bind drag events to components
            const componentItems = panel.querySelectorAll('.component-item');
            componentItems.forEach(item => {
                item.addEventListener('dragstart', (e) => this.handleDragStart(e));
                item.addEventListener('dragend', (e) => this.handleDragEnd(e));
            });
        });
    }

    switchCategory(tab) {
        // Update active tab
        this.categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding panel
        const categoryId = tab.getAttribute('data-category');
        this.componentPanels.forEach(panel => {
            panel.classList.toggle('active', panel.getAttribute('data-category') === categoryId);
        });
    }

    handleDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        
        // Set drag data
        e.dataTransfer.setData('text/plain', e.target.getAttribute('data-component'));
        e.dataTransfer.effectAllowed = 'copy';
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        
        // Visual feedback
        this.buildCanvas.classList.add('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.buildCanvas.classList.remove('drag-over');
        
        const componentId = e.dataTransfer.getData('text/plain');
        if (!componentId) return;
        
        const component = this.findComponent(componentId);
        if (!component) return;
        
        this.addComponentToCanvas(component, e.offsetX, e.offsetY);
    }

    handleCanvasClick(e) {
        if (e.target.classList.contains('canvas-component')) {
            this.selectComponent(e.target);
        } else {
            this.deselectComponent();
        }
    }

    addComponentToCanvas(component, x = null, y = null) {
        const canvasComponent = {
            id: this.generateId(),
            componentId: component.id,
            name: component.name,
            symbol: component.symbol,
            description: component.description,
            x: x || this.canvas.length * 60 + 20,
            y: y || 50,
            properties: this.getDefaultProperties(component)
        };
        
        this.canvas.push(canvasComponent);
        this.renderCanvas();
        this.generatePattern();
        this.saveState();
    }

    renderCanvas() {
        if (!this.buildCanvas) return;

        const componentsHtml = this.canvas.map(component => `
            <div class="canvas-component" 
                 data-id="${component.id}"
                 style="left: ${component.x}px; top: ${component.y}px;">
                <div class="component-header">
                    <span class="component-title">${component.name}</span>
                    <button class="remove-component" onclick="regexBuilder.removeComponent('${component.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="component-body">
                    <code class="component-symbol">${this.escapeHtml(component.symbol)}</code>
                    ${this.renderComponentProperties(component)}
                </div>
            </div>
        `).join('');

        this.buildCanvas.innerHTML = componentsHtml || '<div class="canvas-empty">여기에 컴포넌트를 드래그하세요</div>';
    }

    renderComponentProperties(component) {
        if (!component.properties || Object.keys(component.properties).length === 0) {
            return '';
        }

        const propertiesHtml = Object.entries(component.properties).map(([key, value]) => {
            switch (key) {
                case 'quantifier':
                    return `
                        <div class="property-item">
                            <label>횟수:</label>
                            <select onchange="regexBuilder.updateComponentProperty('${component.id}', 'quantifier', this.value)">
                                <option value="" ${value === '' ? 'selected' : ''}>없음</option>
                                <option value="*" ${value === '*' ? 'selected' : ''}>0개 이상 (*)</option>
                                <option value="+" ${value === '+' ? 'selected' : ''}>1개 이상 (+)</option>
                                <option value="?" ${value === '?' ? 'selected' : ''}>0개 또는 1개 (?)</option>
                                <option value="{custom}" ${value.startsWith('{') ? 'selected' : ''}>사용자 정의</option>
                            </select>
                        </div>
                    `;
                case 'customQuantifier':
                    return `
                        <div class="property-item">
                            <label>사용자 정의:</label>
                            <input type="text" value="${value}" placeholder="{2,5}" 
                                   onchange="regexBuilder.updateComponentProperty('${component.id}', 'customQuantifier', this.value)">
                        </div>
                    `;
                case 'characters':
                    return `
                        <div class="property-item">
                            <label>문자:</label>
                            <input type="text" value="${value}" placeholder="abc" 
                                   onchange="regexBuilder.updateComponentProperty('${component.id}', 'characters', this.value)">
                        </div>
                    `;
                default:
                    return '';
            }
        }).join('');

        return `<div class="component-properties">${propertiesHtml}</div>`;
    }

    selectComponent(element) {
        // Remove previous selection
        document.querySelectorAll('.canvas-component').forEach(comp => {
            comp.classList.remove('selected');
        });
        
        // Select new component
        element.classList.add('selected');
        this.selectedComponent = element.getAttribute('data-id');
    }

    deselectComponent() {
        document.querySelectorAll('.canvas-component').forEach(comp => {
            comp.classList.remove('selected');
        });
        this.selectedComponent = null;
    }

    removeComponent(id) {
        this.canvas = this.canvas.filter(component => component.id !== id);
        this.renderCanvas();
        this.generatePattern();
        this.saveState();
    }

    updateComponentProperty(id, property, value) {
        const component = this.canvas.find(c => c.id === id);
        if (!component) return;

        if (!component.properties) {
            component.properties = {};
        }
        
        component.properties[property] = value;
        this.renderCanvas();
        this.generatePattern();
        this.saveState();
    }

    generatePattern() {
        if (this.canvas.length === 0) {
            this.generatedPattern = '';
            this.updatePatternDisplay();
            return;
        }

        const pattern = this.canvas.map(component => {
            let symbol = component.symbol;
            
            // Handle character sets
            if (component.componentId === 'char-set' && component.properties?.characters) {
                symbol = `[${component.properties.characters}]`;
            } else if (component.componentId === 'negated-set' && component.properties?.characters) {
                symbol = `[^${component.properties.characters}]`;
            }
            
            // Handle quantifiers
            if (component.properties?.quantifier) {
                if (component.properties.quantifier === '{custom}' && component.properties.customQuantifier) {
                    symbol += component.properties.customQuantifier;
                } else if (component.properties.quantifier !== '{custom}') {
                    symbol += component.properties.quantifier;
                }
            }
            
            return symbol;
        }).join('');

        this.generatedPattern = pattern;
        this.updatePatternDisplay();
        this.performTest();
    }

    updatePatternDisplay() {
        if (this.generatedRegex) {
            this.generatedRegex.textContent = this.generatedPattern || '(패턴 없음)';
        }
        
        if (this.patternPreview) {
            this.patternPreview.innerHTML = `
                <code>/${this.generatedPattern || ''}/g</code>
            `;
        }
        
        if (this.patternDescription) {
            this.patternDescription.textContent = this.generatePatternDescription();
        }
    }

    generatePatternDescription() {
        if (this.canvas.length === 0) {
            return '패턴이 없습니다. 컴포넌트를 추가해보세요.';
        }

        const descriptions = this.canvas.map(component => component.description);
        return descriptions.join(' + ');
    }

    performTest() {
        if (!this.testInput || !this.testResults || !this.generatedPattern) {
            return;
        }

        const testText = this.testInput.value;
        if (!testText) {
            this.testResults.innerHTML = '<p class="no-test">테스트할 텍스트를 입력해주세요.</p>';
            return;
        }

        try {
            const regex = new RegExp(this.generatedPattern, 'g');
            const matches = [...testText.matchAll(regex)];

            if (matches.length === 0) {
                this.testResults.innerHTML = '<p class="no-matches">매칭된 결과가 없습니다.</p>';
                return;
            }

            const highlightedText = this.highlightMatches(testText, matches);
            const matchInfo = `<div class="match-info">${matches.length}개의 매칭 발견</div>`;
            
            this.testResults.innerHTML = `
                ${matchInfo}
                <div class="highlighted-text">${highlightedText}</div>
            `;

        } catch (error) {
            this.testResults.innerHTML = `<div class="error">정규식 오류: ${error.message}</div>`;
        }
    }

    highlightMatches(text, matches) {
        let highlightedText = text;
        let offset = 0;

        matches.forEach((match, index) => {
            const start = match.index + offset;
            const end = start + match[0].length;
            const matchText = highlightedText.slice(start, end);
            
            const highlighted = `<mark class="match-highlight" title="매칭 #${index + 1}">${this.escapeHtml(matchText)}</mark>`;
            
            highlightedText = highlightedText.slice(0, start) + highlighted + highlightedText.slice(end);
            offset += highlighted.length - matchText.length;
        });

        return highlightedText;
    }

    // Utility methods
    clearCanvas() {
        this.canvas = [];
        this.renderCanvas();
        this.generatePattern();
        this.saveState();
        this.showNotification('캔버스가 초기화되었습니다', 'info');
    }

    copyRegex() {
        if (!this.generatedPattern) {
            this.showNotification('복사할 패턴이 없습니다', 'warning');
            return;
        }

        navigator.clipboard.writeText(this.generatedPattern).then(() => {
            this.showNotification('정규식이 클립보드에 복사되었습니다', 'success');
        }).catch(() => {
            this.showNotification('복사에 실패했습니다', 'error');
        });
    }

    exportCode() {
        if (!this.generatedPattern) {
            this.showNotification('내보낼 패턴이 없습니다', 'warning');
            return;
        }

        const codeExamples = {
            javascript: `const regex = /${this.generatedPattern}/g;\nconst matches = text.match(regex);`,
            python: `import re\npattern = r'${this.generatedPattern}'\nmatches = re.findall(pattern, text)`,
            java: `Pattern pattern = Pattern.compile("${this.generatedPattern}");\nMatcher matcher = pattern.matcher(text);`,
            csharp: `Regex regex = new Regex(@"${this.generatedPattern}");\nMatchCollection matches = regex.Matches(text);`
        };

        const modal = this.createCodeExportModal(codeExamples);
        document.body.appendChild(modal);
    }

    createCodeExportModal(codeExamples) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content code-export-modal">
                <div class="modal-header">
                    <h3>코드 내보내기</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="code-tabs">
                        ${Object.keys(codeExamples).map((lang, index) => 
                            `<button class="code-tab ${index === 0 ? 'active' : ''}" data-lang="${lang}">${lang}</button>`
                        ).join('')}
                    </div>
                    <div class="code-panels">
                        ${Object.entries(codeExamples).map(([lang, code], index) => 
                            `<div class="code-panel ${index === 0 ? 'active' : ''}" data-lang="${lang}">
                                <pre><code>${this.escapeHtml(code)}</code></pre>
                                <button class="copy-code-btn" onclick="regexBuilder.copyCode('${lang}', this)">
                                    <i class="fas fa-copy"></i> 복사
                                </button>
                            </div>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;

        // Bind tab events
        const tabs = modal.querySelectorAll('.code-tab');
        const panels = modal.querySelectorAll('.code-panel');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                modal.querySelector(`[data-lang="${tab.getAttribute('data-lang')}"].code-panel`).classList.add('active');
            });
        });

        return modal;
    }

    copyCode(lang, button) {
        const codeExamples = {
            javascript: `const regex = /${this.generatedPattern}/g;\nconst matches = text.match(regex);`,
            python: `import re\npattern = r'${this.generatedPattern}'\nmatches = re.findall(pattern, text)`,
            java: `Pattern pattern = Pattern.compile("${this.generatedPattern}");\nMatcher matcher = pattern.matcher(text);`,
            csharp: `Regex regex = new Regex(@"${this.generatedPattern}");\nMatchCollection matches = regex.Matches(text);`
        };

        const code = codeExamples[lang];
        navigator.clipboard.writeText(code).then(() => {
            button.innerHTML = '<i class="fas fa-check"></i> 복사됨';
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i> 복사';
            }, 2000);
        });
    }

    undo() {
        // Implementation for undo functionality
        this.showNotification('실행 취소 기능은 준비 중입니다', 'info');
    }

    redo() {
        // Implementation for redo functionality  
        this.showNotification('다시 실행 기능은 준비 중입니다', 'info');
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Z: Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            this.undo();
        }
        
        // Ctrl/Cmd + Shift + Z: Redo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
            e.preventDefault();
            this.redo();
        }
        
        // Delete: Remove selected component
        if (e.key === 'Delete' && this.selectedComponent) {
            this.removeComponent(this.selectedComponent);
        }
    }

    // Helper methods
    findComponent(componentId) {
        for (const category of Object.values(this.components)) {
            const component = category.find(c => c.id === componentId);
            if (component) return component;
        }
        return null;
    }

    getDefaultProperties(component) {
        const defaults = {
            'any-char': { quantifier: '' },
            'digit': { quantifier: '' },
            'word-char': { quantifier: '' },
            'char-set': { characters: '', quantifier: '' },
            'negated-set': { characters: '', quantifier: '' },
            'custom-count': { quantifier: '{custom}', customQuantifier: '{1}' }
        };
        
        return defaults[component.id] || {};
    }

    generateId() {
        return 'component-' + Math.random().toString(36).substr(2, 9);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveState() {
        const state = {
            canvas: this.canvas,
            generatedPattern: this.generatedPattern
        };
        localStorage.setItem('builderState', JSON.stringify(state));
    }

    loadSavedData() {
        const saved = localStorage.getItem('builderState');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.canvas = state.canvas || [];
                this.generatedPattern = state.generatedPattern || '';
                this.renderCanvas();
                this.updatePatternDisplay();
            } catch (e) {
                console.warn('Failed to load saved builder state:', e);
            }
        }
    }

    updateDisplay() {
        this.renderCanvas();
        this.updatePatternDisplay();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.getElementById('notification-container') || document.body;
        container.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle', 
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.regexBuilder = new RegexBuilder();
    console.log('🔧 NEO Regex Builder initialized!');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RegexBuilder };
}