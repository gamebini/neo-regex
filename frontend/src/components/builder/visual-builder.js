// frontend/src/components/builder/visual-builder.js
import { RegexEngine } from '../../core/regex-engine.js';
import { showNotification, copyToClipboard, generateId } from '../../utils/helpers.js';

export class VisualBuilder {
    constructor() {
        this.components = [];
        this.engine = new RegexEngine();
        this.draggedElement = null;
        this.dropZoneIndex = -1;
        
        this.componentLibrary = {
            characters: [
                { id: 'digit', pattern: '\\d', label: '숫자 (0-9)', icon: '0-9', description: '하나의 숫자를 매칭' },
                { id: 'letter', pattern: '[a-zA-Z]', label: '영문자', icon: 'Aa', description: '대소문자 영문자 하나를 매칭' },
                { id: 'lowercase', pattern: '[a-z]', label: '소문자', icon: 'abc', description: '소문자 영문자 하나를 매칭' },
                { id: 'uppercase', pattern: '[A-Z]', label: '대문자', icon: 'ABC', description: '대문자 영문자 하나를 매칭' },
                { id: 'word', pattern: '\\w', label: '단어 문자', icon: 'W', description: '영문자, 숫자, 밑줄을 매칭' },
                { id: 'space', pattern: '\\s', label: '공백', icon: '⎵', description: '공백 문자를 매칭' },
                { id: 'any', pattern: '.', label: '모든 문자', icon: '.*', description: '줄바꿈을 제외한 모든 문자' },
                { id: 'korean', pattern: '[가-힣]', label: '한글', icon: '한', description: '완성된 한글 문자를 매칭' }
            ],
            quantifiers: [
                { id: 'plus', pattern: '+', label: '1개 이상', icon: '+', description: '{1,}와 같음' },
                { id: 'star', pattern: '*', label: '0개 이상', icon: '*', description: '{0,}와 같음' },
                { id: 'question', pattern: '?', label: '0개 또는 1개', icon: '?', description: '{0,1}와 같음' },
                { id: 'exact', pattern: '{n}', label: '정확히 n개', icon: '{3}', description: '정확한 개수 지정', customizable: true },
                { id: 'range', pattern: '{n,m}', label: 'n~m개', icon: '{2,5}', description: '범위 지정', customizable: true }
            ],
            anchors: [
                { id: 'start', pattern: '^', label: '문자열 시작', icon: '^', description: '문자열의 시작 위치' },
                { id: 'end', pattern: '$', label: '문자열 끝', icon: '$', description: '문자열의 끝 위치' },
                { id: 'word_boundary', pattern: '\\b', label: '단어 경계', icon: '|W|', description: '단어와 비단어 문자 사이' }
            ],
            groups: [
                { id: 'group', pattern: '()', label: '그룹', icon: '( )', description: '캡처 그룹 생성' },
                { id: 'non_capture', pattern: '(?:)', label: '비캡처 그룹', icon: '(?:)', description: '캡처하지 않는 그룹' },
                { id: 'lookahead', pattern: '(?=)', label: '전방 탐색', icon: '(?=)', description: '앞에 특정 패턴이 있는지 확인' },
                { id: 'negative_lookahead', pattern: '(?!)', label: '부정 전방 탐색', icon: '(?!)', description: '앞에 특정 패턴이 없는지 확인' }
            ],
            custom: [
                { id: 'custom_class', pattern: '[]', label: '문자 클래스', icon: '[abc]', description: '커스텀 문자 클래스', customizable: true },
                { id: 'literal', pattern: '', label: '문자 그대로', icon: 'text', description: '특수 문자가 아닌 일반 텍스트', customizable: true }
            ]
        };
    }

    render() {
        return `
            <div class="visual-builder">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">시각적 정규식 빌더</h2>
                        <p class="text-gray-600 dark:text-gray-400">드래그 앤 드롭으로 정규식을 만들어보세요</p>
                    </div>
                    <div class="flex space-x-2">
                        <button id="clear-builder" class="btn btn-secondary">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            초기화
                        </button>
                        <button id="save-pattern-builder" class="btn btn-primary">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            패턴 저장
                        </button>
                    </div>
                </div>

                <div class="grid lg:grid-cols-4 gap-6">
                    <!-- Component Palette -->
                    <div class="lg:col-span-1">
                        <div class="card sticky top-4">
                            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">컴포넌트 팔레트</h3>
                            
                            ${Object.entries(this.componentLibrary).map(([category, components]) => `
                                <div class="mb-4">
                                    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                                        ${this.getCategoryLabel(category)}
                                    </h4>
                                    <div class="space-y-1">
                                        ${components.map(component => this.renderPaletteItem(component)).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Main Builder Area -->
                    <div class="lg:col-span-2">
                        <!-- Builder Canvas -->
                        <div class="card mb-4">
                            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">빌더 캔버스</h3>
                            
                            <div id="builder-canvas" class="builder-canvas min-h-32 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                <div class="builder-drop-zone active" data-index="0">
                                    <span class="drop-hint">여기에 컴포넌트를 드래그하세요</span>
                                </div>
                            </div>
                        </div>

                        <!-- Generated Pattern -->
                        <div class="card">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-semibold text-gray-900 dark:text-white">생성된 정규식</h3>
                                <button id="copy-generated-pattern" class="btn btn-sm btn-secondary">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                    </svg>
                                    복사
                                </button>
                            </div>
                            <div class="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                                <code id="generated-pattern" class="font-mono text-lg break-all">
                                    ${this.generatePattern()}
                                </code>
                            </div>
                        </div>
                    </div>

                    <!-- Preview Panel -->
                    <div class="lg:col-span-1">
                        <div class="card sticky top-4">
                            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">실시간 미리보기</h3>
                            
                            <!-- Test Input -->
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    테스트 텍스트
                                </label>
                                <textarea 
                                    id="builder-test-text" 
                                    class="input w-full h-20 text-sm resize-none"
                                    placeholder="여기에 테스트할 텍스트를 입력하세요..."
                                ></textarea>
                            </div>

                            <!-- Flags -->
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    플래그
                                </label>
                                <div class="flex flex-wrap gap-2">
                                    <label class="flex items-center">
                                        <input type="checkbox" id="flag-g" class="mr-1">
                                        <span class="text-sm">g (전역)</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" id="flag-i" class="mr-1">
                                        <span class="text-sm">i (대소문자 무시)</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" id="flag-m" class="mr-1">
                                        <span class="text-sm">m (멀티라인)</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Results -->
                            <div class="mb-4">
                                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">결과</h4>
                                <div id="builder-results" class="bg-gray-50 dark:bg-slate-800 p-3 rounded text-sm min-h-20">
                                    패턴을 만들고 테스트해보세요
                                </div>
                            </div>

                            <!-- Pattern Info -->
                            <div>
                                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">패턴 정보</h4>
                                <div id="pattern-info" class="text-xs space-y-1">
                                    <div>길이: <span id="pattern-length">0</span></div>
                                    <div>복잡도: <span id="pattern-complexity">낮음</span></div>
                                    <div>컴포넌트: <span id="component-count">0</span>개</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Component Edit Modal -->
                <div id="component-edit-modal" class="modal hidden">
                    <div class="modal-overlay"></div>
                    <div class="modal-content max-w-md">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold">컴포넌트 편집</h3>
                            <button id="close-edit-modal" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div id="edit-modal-content">
                            <!-- Modal content will be inserted here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPaletteItem(component) {
        return `
            <div class="palette-item" 
                 draggable="true" 
                 data-component-id="${component.id}"
                 data-component-pattern="${component.pattern}"
                 data-component-customizable="${component.customizable || false}"
                 title="${component.description}">
                <div class="flex items-center space-x-2">
                    <div class="component-icon">${component.icon}</div>
                    <div class="flex-1">
                        <div class="text-sm font-medium">${component.label}</div>
                        <div class="text-xs text-gray-500 font-mono">${component.pattern}</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderBuilderComponent(component, index) {
        return `
            <div class="builder-component" data-index="${index}" data-component-id="${component.id}">
                <div class="component-content">
                    <div class="component-icon">${this.getComponentIcon(component)}</div>
                    <div class="component-label">${this.getComponentLabel(component)}</div>
                    <div class="component-pattern">${component.pattern || component.value}</div>
                </div>
                <div class="component-actions">
                    ${component.customizable ? '<button class="edit-component" title="편집"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>' : ''}
                    <button class="remove-component" title="삭제">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="builder-drop-zone" data-index="${index + 1}"></div>
        `;
    }

    getCategoryLabel(category) {
        const labels = {
            characters: '문자',
            quantifiers: '수량자',
            anchors: '앵커',
            groups: '그룹',
            custom: '커스텀'
        };
        return labels[category] || category;
    }

    getComponentIcon(component) {
        const componentDef = this.findComponentDefinition(component.id);
        return componentDef ? componentDef.icon : component.id;
    }

    getComponentLabel(component) {
        const componentDef = this.findComponentDefinition(component.id);
        return componentDef ? componentDef.label : component.id;
    }

    findComponentDefinition(id) {
        for (const category of Object.values(this.componentLibrary)) {
            const component = category.find(c => c.id === id);
            if (component) return component;
        }
        return null;
    }

    attachEventListeners() {
        // Drag and drop for palette items
        this.attachDragDropListeners();
        
        // Clear builder
        const clearBtn = document.getElementById('clear-builder');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearBuilder());
        }

        // Copy pattern
        const copyBtn = document.getElementById('copy-generated-pattern');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyPattern());
        }

        // Save pattern
        const saveBtn = document.getElementById('save-pattern-builder');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.savePattern());
        }

        // Test text and flags change
        const testText = document.getElementById('builder-test-text');
        if (testText) {
            testText.addEventListener('input', () => this.updatePreview());
        }

        const flags = ['g', 'i', 'm'];
        flags.forEach(flag => {
            const checkbox = document.getElementById(`flag-${flag}`);
            if (checkbox) {
                checkbox.addEventListener('change', () => this.updatePreview());
            }
        });

        // Modal close
        const closeModal = document.getElementById('close-edit-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeEditModal());
        }

        console.log('✅ Visual builder event listeners attached');
    }

    attachDragDropListeners() {
        // Palette items drag start
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('palette-item')) {
                this.draggedElement = {
                    id: e.target.dataset.componentId,
                    pattern: e.target.dataset.componentPattern,
                    customizable: e.target.dataset.componentCustomizable === 'true'
                };
                e.target.classList.add('dragging');
            }
        });

        // Palette items drag end
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('palette-item')) {
                e.target.classList.remove('dragging');
                this.draggedElement = null;
                this.clearDropZoneHighlights();
            }
        });

        // Drop zones
        document.addEventListener('dragover', (e) => {
            if (e.target.classList.contains('builder-drop-zone')) {
                e.preventDefault();
                this.highlightDropZone(e.target);
            }
        });

        document.addEventListener('dragleave', (e) => {
            if (e.target.classList.contains('builder-drop-zone')) {
                this.clearDropZoneHighlights();
            }
        });

        document.addEventListener('drop', (e) => {
            if (e.target.classList.contains('builder-drop-zone')) {
                e.preventDefault();
                const index = parseInt(e.target.dataset.index);
                this.addComponent(this.draggedElement, index);
                this.clearDropZoneHighlights();
            }
        });

        // Component actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-component') || e.target.closest('.remove-component')) {
                const component = e.target.closest('.builder-component');
                const index = parseInt(component.dataset.index);
                this.removeComponent(index);
            } else if (e.target.classList.contains('edit-component') || e.target.closest('.edit-component')) {
                const component = e.target.closest('.builder-component');
                const index = parseInt(component.dataset.index);
                this.editComponent(index);
            }
        });
    }

    highlightDropZone(dropZone) {
        this.clearDropZoneHighlights();
        dropZone.classList.add('highlight');
    }

    clearDropZoneHighlights() {
        document.querySelectorAll('.builder-drop-zone').forEach(zone => {
            zone.classList.remove('highlight');
        });
    }

    addComponent(componentData, index) {
        if (!componentData) return;

        const component = {
            id: generateId(),
            componentId: componentData.id,
            pattern: componentData.pattern,
            customizable: componentData.customizable,
            value: componentData.pattern
        };

        // Handle customizable components
        if (component.customizable) {
            component.value = this.getDefaultValue(component.componentId);
        }

        this.components.splice(index, 0, component);
        this.updateCanvas();
        this.updatePreview();
        
        showNotification('컴포넌트가 추가되었습니다', 'success');
    }

    removeComponent(index) {
        if (index >= 0 && index < this.components.length) {
            this.components.splice(index, 1);
            this.updateCanvas();
            this.updatePreview();
            showNotification('컴포넌트가 제거되었습니다', 'info');
        }
    }

    editComponent(index) {
        const component = this.components[index];
        if (component && component.customizable) {
            this.showEditModal(component, index);
        }
    }

    getDefaultValue(componentId) {
        const defaults = {
            exact: '3',
            range: '2,5',
            custom_class: 'abc',
            literal: 'text'
        };
        return defaults[componentId] || '';
    }

    updateCanvas() {
        const canvas = document.getElementById('builder-canvas');
        if (!canvas) return;

        if (this.components.length === 0) {
            canvas.innerHTML = `
                <div class="builder-drop-zone active" data-index="0">
                    <span class="drop-hint">여기에 컴포넌트를 드래그하세요</span>
                </div>
            `;
        } else {
            canvas.innerHTML = `
                <div class="builder-drop-zone" data-index="0"></div>
                ${this.components.map((component, index) => 
                    this.renderBuilderComponent(component, index)
                ).join('')}
            `;
        }
    }

    generatePattern() {
        if (this.components.length === 0) return '';

        return this.components.map(component => {
            switch (component.componentId) {
                case 'exact':
                    return `{${component.value}}`;
                case 'range':
                    return `{${component.value}}`;
                case 'custom_class':
                    return `[${component.value}]`;
                case 'literal':
                    return this.escapeRegexChars(component.value);
                case 'group':
                    return `(${component.value || ''})`;
                case 'non_capture':
                    return `(?:${component.value || ''})`;
                case 'lookahead':
                    return `(?=${component.value || ''})`;
                case 'negative_lookahead':
                    return `(?!${component.value || ''})`;
                default:
                    return component.value || component.pattern;
            }
        }).join('');
    }

    escapeRegexChars(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    updatePreview() {
        const pattern = this.generatePattern();
        const testText = document.getElementById('builder-test-text')?.value || '';
        const flags = this.getSelectedFlags();

        // Update generated pattern display
        const patternDisplay = document.getElementById('generated-pattern');
        if (patternDisplay) {
            patternDisplay.textContent = pattern || '(패턴 없음)';
        }

        // Update pattern info
        this.updatePatternInfo(pattern);

        // Test pattern if we have both pattern and text
        if (pattern && testText) {
            this.testPattern(pattern, testText, flags);
        } else {
            const resultsDiv = document.getElementById('builder-results');
            if (resultsDiv) {
                resultsDiv.textContent = '패턴을 만들고 테스트해보세요';
            }
        }
    }

    getSelectedFlags() {
        const flags = [];
        if (document.getElementById('flag-g')?.checked) flags.push('g');
        if (document.getElementById('flag-i')?.checked) flags.push('i');
        if (document.getElementById('flag-m')?.checked) flags.push('m');
        return flags.join('');
    }

    updatePatternInfo(pattern) {
        const lengthEl = document.getElementById('pattern-length');
        const complexityEl = document.getElementById('pattern-complexity');
        const countEl = document.getElementById('component-count');

        if (lengthEl) lengthEl.textContent = pattern.length;
        if (countEl) countEl.textContent = this.components.length;
        
        if (complexityEl) {
            const complexity = this.calculateComplexity(pattern);
            complexityEl.textContent = complexity > 10 ? '높음' : complexity > 5 ? '중간' : '낮음';
        }
    }

    calculateComplexity(pattern) {
        let complexity = 0;
        complexity += (pattern.match(/[\*\+\?]/g) || []).length * 2;
        complexity += (pattern.match(/\{[\d,]+\}/g) || []).length * 3;
        complexity += (pattern.match(/\[.*?\]/g) || []).length;
        complexity += (pattern.match(/\(/g) || []).length;
        return complexity;
    }

    testPattern(pattern, text, flags) {
        this.engine.setPattern(pattern, flags);
        const result = this.engine.test(text);

        const resultsDiv = document.getElementById('builder-results');
        if (!resultsDiv) return;

        if (result.success) {
            if (result.matches === 0) {
                resultsDiv.innerHTML = '<div class="text-gray-500">매치 없음</div>';
            } else {
                resultsDiv.innerHTML = `
                    <div class="text-green-600 font-medium">${result.matches}개 매치</div>
                    <div class="mt-2 space-y-1">
                        ${result.results.slice(0, 5).map((match, i) => `
                            <div class="text-xs">
                                <span class="font-mono bg-yellow-100 dark:bg-yellow-800 px-1 rounded">
                                    ${match.match}
                                </span>
                                <span class="text-gray-500 ml-1">(${match.index})</span>
                            </div>
                        `).join('')}
                        ${result.results.length > 5 ? '<div class="text-xs text-gray-500">...</div>' : ''}
                    </div>
                `;
            }
        } else {
            resultsDiv.innerHTML = `<div class="text-red-600">오류: ${result.error}</div>`;
        }
    }

    showEditModal(component, index) {
        const modal = document.getElementById('component-edit-modal');
        const content = document.getElementById('edit-modal-content');
        
        if (!modal || !content) return;

        let editContent = '';

        switch (component.componentId) {
            case 'exact':
                editContent = `
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">반복 횟수</label>
                            <input type="number" id="edit-value" class="input w-full" 
                                   value="${component.value}" min="1" max="999">
                        </div>
                        <div class="flex space-x-2">
                            <button id="save-edit" class="btn btn-primary flex-1">저장</button>
                            <button id="cancel-edit" class="btn btn-secondary flex-1">취소</button>
                        </div>
                    </div>
                `;
                break;
            case 'range':
                const [min, max] = component.value.split(',');
                editContent = `
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="block text-sm font-medium mb-1">최소</label>
                                <input type="number" id="edit-min" class="input w-full" 
                                       value="${min || '1'}" min="0" max="999">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">최대</label>
                                <input type="number" id="edit-max" class="input w-full" 
                                       value="${max || '3'}" min="1" max="999">
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button id="save-edit" class="btn btn-primary flex-1">저장</button>
                            <button id="cancel-edit" class="btn btn-secondary flex-1">취소</button>
                        </div>
                    </div>
                `;
                break;
            case 'custom_class':
                editContent = `
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">문자 클래스</label>
                            <input type="text" id="edit-value" class="input w-full" 
                                   value="${component.value}" placeholder="예: a-z, 0-9, abc">
                            <div class="text-xs text-gray-500 mt-1">
                                예시: a-z (소문자), A-Z (대문자), 0-9 (숫자), abc (특정 문자)
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button id="save-edit" class="btn btn-primary flex-1">저장</button>
                            <button id="cancel-edit" class="btn btn-secondary flex-1">취소</button>
                        </div>
                    </div>
                `;
                break;
            case 'literal':
                editContent = `
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">텍스트</label>
                            <input type="text" id="edit-value" class="input w-full" 
                                   value="${component.value}" placeholder="매칭할 텍스트 입력">
                        </div>
                        <div class="flex space-x-2">
                            <button id="save-edit" class="btn btn-primary flex-1">저장</button>
                            <button id="cancel-edit" class="btn btn-secondary flex-1">취소</button>
                        </div>
                    </div>
                `;
                break;
        }

        content.innerHTML = editContent;
        modal.classList.remove('hidden');

        // Attach modal event listeners
        const saveBtn = document.getElementById('save-edit');
        const cancelBtn = document.getElementById('cancel-edit');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const newValue = this.getEditedValue(component.componentId);
                if (newValue !== null) {
                    this.components[index].value = newValue;
                    this.updateCanvas();
                    this.updatePreview();
                    this.closeEditModal();
                    showNotification('컴포넌트가 수정되었습니다', 'success');
                }
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeEditModal());
        }
    }

    getEditedValue(componentId) {
        switch (componentId) {
            case 'exact':
                const exactValue = document.getElementById('edit-value')?.value;
                return exactValue && parseInt(exactValue) > 0 ? exactValue : null;
            case 'range':
                const minValue = document.getElementById('edit-min')?.value;
                const maxValue = document.getElementById('edit-max')?.value;
                if (minValue && maxValue && parseInt(minValue) <= parseInt(maxValue)) {
                    return `${minValue},${maxValue}`;
                }
                return null;
            case 'custom_class':
            case 'literal':
                return document.getElementById('edit-value')?.value || null;
            default:
                return null;
        }
    }

    closeEditModal() {
        const modal = document.getElementById('component-edit-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    clearBuilder() {
        this.components = [];
        this.updateCanvas();
        this.updatePreview();
        showNotification('빌더가 초기화되었습니다', 'info');
    }

    copyPattern() {
        const pattern = this.generatePattern();
        if (pattern) {
            copyToClipboard(pattern);
            showNotification('패턴이 복사되었습니다', 'success');
        } else {
            showNotification('복사할 패턴이 없습니다', 'warning');
        }
    }

    savePattern() {
        const pattern = this.generatePattern();
        if (!pattern) {
            showNotification('저장할 패턴이 없습니다', 'warning');
            return;
        }

        // TODO: Implement pattern saving
        showNotification('패턴 저장 기능은 곧 출시됩니다', 'info');
    }

    // Public methods for external use
    loadPattern(pattern) {
        // TODO: Parse pattern and recreate components
        showNotification('패턴 로드 기능은 곧 출시됩니다', 'info');
    }

    exportToTester() {
        const pattern = this.generatePattern();
        const flags = this.getSelectedFlags();
        const testText = document.getElementById('builder-test-text')?.value || '';

        if (pattern) {
            const params = new URLSearchParams({
                p: pattern,
                f: flags,
                t: testText
            });

            window.location.hash = `tester?${params.toString()}`;
            showNotification('테스터로 패턴을 전송했습니다', 'success');
        }
    }
}