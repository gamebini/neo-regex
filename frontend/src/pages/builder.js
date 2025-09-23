// src/pages/builder.js - 시각적 빌더 페이지 스크립트

class VisualRegexBuilder {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.patternDisplay = document.getElementById('generated-pattern');
        this.components = [];
        this.connections = [];
        this.selectedComponent = null;
        this.draggedComponent = null;
        this.history = [];
        this.historyIndex = -1;
        
        this.init();
    }
    
    init() {
        this.setupDragAndDrop();
        this.setupEventListeners();
        this.setupCanvas();
        this.loadPaletteComponents();
        this.updatePattern();
    }
    
    setupDragAndDrop() {
        // 팔레트 아이템들에 드래그 이벤트 설정
        const paletteItems = document.querySelectorAll('.component-item');
        paletteItems.forEach(item => {
            item.addEventListener('dragstart', this.handleDragStart.bind(this));
            item.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
        
        // 캔버스에 드롭 이벤트 설정
        this.canvas.addEventListener('dragover', this.handleDragOver.bind(this));
        this.canvas.addEventListener('drop', this.handleDrop.bind(this));
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
    }
    
    setupEventListeners() {
        // 검색 기능
        const searchInput = document.getElementById('palette-search');
        searchInput.addEventListener('input', this.handleSearch.bind(this));
        
        // 플래그 변경 이벤트
        const flagInputs = document.querySelectorAll('input[type="checkbox"][id^="flag-"]');
        flagInputs.forEach(input => {
            input.addEventListener('change', this.updatePattern.bind(this));
        });
        
        // 키보드 단축키
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
    }
    
    setupCanvas() {
        // 캔버스 초기 설정
        this.canvas.innerHTML = `
            <div class="canvas-placeholder">
                <div class="placeholder-content">
                    <i class="fas fa-magic"></i>
                    <h3>패턴 만들기 시작하기</h3>
                    <p>왼쪽에서 구성 요소를 드래그해서 여기에 놓으세요</p>
                    <div class="placeholder-tips">
                        <div class="tip-item">
                            <i class="fas fa-lightbulb"></i>
                            <span>팁: 구성 요소들을 연결해서 복잡한 패턴을 만들 수 있어요</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    loadPaletteComponents() {
        // 이미 HTML에서 로드된 컴포넌트들을 JavaScript로 관리
        console.log('팔레트 컴포넌트 로드 완료');
    }
    
    handleDragStart(e) {
        this.draggedComponent = {
            pattern: e.currentTarget.dataset.pattern,
            description: e.currentTarget.dataset.desc,
            type: e.currentTarget.closest('.component-category').dataset.category
        };
        
        e.currentTarget.classList.add('dragging');
        
        // 드래그 이미지 설정
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', '');
    }
    
    handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
        this.draggedComponent = null;
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        
        // 드롭 가능한 영역 하이라이트
        this.canvas.classList.add('drag-over');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.canvas.classList.remove('drag-over');
        
        if (!this.draggedComponent) return;
        
        // 드롭 위치 계산
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 새 컴포넌트 추가
        this.addComponent(this.draggedComponent, { x, y });
        
        // 플레이스홀더 숨기기
        const placeholder = this.canvas.querySelector('.canvas-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
    }
    
    addComponent(componentData, position) {
        const componentId = `component-${Date.now()}`;
        const component = {
            id: componentId,
            pattern: componentData.pattern,
            description: componentData.description,
            type: componentData.type,
            position: position,
            properties: this.getDefaultProperties(componentData.type)
        };
        
        // 컴포넌트 DOM 생성
        const componentElement = this.createComponentElement(component);
        this.canvas.appendChild(componentElement);
        
        // 컴포넌트 배열에 추가
        this.components.push(component);
        
        // 히스토리 저장
        this.saveToHistory();
        
        // 패턴 업데이트
        this.updatePattern();
        
        // 새 컴포넌트 선택
        this.selectComponent(component);
        
        console.log('컴포넌트 추가:', component);
    }
    
    createComponentElement(component) {
        const element = document.createElement('div');
        element.className = 'canvas-component';
        element.id = component.id;
        element.style.left = component.position.x + 'px';
        element.style.top = component.position.y + 'px';
        
        element.innerHTML = `
            <div class="component-header">
                <div class="component-icon">${this.getComponentIcon(component.type)}</div>
                <div class="component-title">${component.description}</div>
                <div class="component-actions">
                    <button class="component-btn" onclick="builder.editComponent('${component.id}')" title="편집">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="component-btn" onclick="builder.deleteComponent('${component.id}')" title="삭제">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="component-body">
                <div class="component-pattern">
                    <code>${component.pattern}</code>
                </div>
                <div class="component-connections">
                    <div class="connection-point input" data-direction="input"></div>
                    <div class="connection-point output" data-direction="output"></div>
                </div>
            </div>
        `;
        
        // 이벤트 리스너 추가
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectComponent(component);
        });
        
        return element;
    }
    
    getComponentIcon(type) {
        const icons = {
            'basic': '<i class="fas fa-font"></i>',
            'quantifiers': '<i class="fas fa-repeat"></i>',
            'anchors': '<i class="fas fa-anchor"></i>',
            'groups': '<i class="fas fa-layer-group"></i>',
            'special': '<i class="fas fa-star"></i>'
        };
        return icons[type] || '<i class="fas fa-cube"></i>';
    }
    
    getDefaultProperties(type) {
        const defaults = {
            'basic': { caseSensitive: true, unicode: false },
            'quantifiers': { greedy: true, min: 1, max: null },
            'anchors': { multiline: false },
            'groups': { capture: true, name: '' },
            'special': { escaped: false }
        };
        return defaults[type] || {};
    }
    
    selectComponent(component) {
        // 이전 선택 해제
        document.querySelectorAll('.canvas-component.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // 새 컴포넌트 선택
        const element = document.getElementById(component.id);
        if (element) {
            element.classList.add('selected');
            this.selectedComponent = component;
            this.showComponentProperties(component);
        }
    }
    
    showComponentProperties(component) {
        const propertiesContent = document.getElementById('properties-content');
        
        propertiesContent.innerHTML = `
            <div class="properties-form">
                <div class="property-section">
                    <h4 class="property-title">기본 정보</h4>
                    <div class="property-item">
                        <label class="property-label">패턴:</label>
                        <input type="text" class="property-input" value="${component.pattern}" 
                               onchange="builder.updateComponentProperty('${component.id}', 'pattern', this.value)">
                    </div>
                    <div class="property-item">
                        <label class="property-label">설명:</label>
                        <input type="text" class="property-input" value="${component.description}"
                               onchange="builder.updateComponentProperty('${component.id}', 'description', this.value)">
                    </div>
                </div>
                
                <div class="property-section">
                    <h4 class="property-title">고급 설정</h4>
                    ${this.generateAdvancedProperties(component)}
                </div>
                
                <div class="property-actions">
                    <button class="property-btn primary" onclick="builder.applyComponentChanges('${component.id}')">
                        <i class="fas fa-check"></i>
                        적용
                    </button>
                    <button class="property-btn secondary" onclick="builder.resetComponentProperties('${component.id}')">
                        <i class="fas fa-undo"></i>
                        초기화
                    </button>
                </div>
            </div>
        `;
    }
    
    generateAdvancedProperties(component) {
        const properties = component.properties || {};
        let html = '';
        
        switch (component.type) {
            case 'quantifiers':
                html = `
                    <div class="property-item">
                        <label class="property-label">
                            <input type="checkbox" ${properties.greedy ? 'checked' : ''}
                                   onchange="builder.updateComponentProperty('${component.id}', 'greedy', this.checked)">
                            탐욕적 매칭
                        </label>
                    </div>
                    <div class="property-item">
                        <label class="property-label">최소:</label>
                        <input type="number" class="property-input" value="${properties.min || 0}" min="0"
                               onchange="builder.updateComponentProperty('${component.id}', 'min', parseInt(this.value))">
                    </div>
                    <div class="property-item">
                        <label class="property-label">최대:</label>
                        <input type="number" class="property-input" value="${properties.max || ''}" min="0"
                               onchange="builder.updateComponentProperty('${component.id}', 'max', this.value ? parseInt(this.value) : null)">
                    </div>
                `;
                break;
            case 'groups':
                html = `
                    <div class="property-item">
                        <label class="property-label">
                            <input type="checkbox" ${properties.capture ? 'checked' : ''}
                                   onchange="builder.updateComponentProperty('${component.id}', 'capture', this.checked)">
                            캡처 그룹
                        </label>
                    </div>
                    <div class="property-item">
                        <label class="property-label">그룹명:</label>
                        <input type="text" class="property-input" value="${properties.name || ''}"
                               onchange="builder.updateComponentProperty('${component.id}', 'name', this.value)">
                    </div>
                `;
                break;
            default:
                html = '<p class="no-properties">이 컴포넌트에는 추가 설정이 없습니다.</p>';
        }
        
        return html;
    }
    
    updateComponentProperty(componentId, property, value) {
        const component = this.components.find(c => c.id === componentId);
        if (component) {
            if (!component.properties) component.properties = {};
            component.properties[property] = value;
            
            // 패턴이 변경된 경우 DOM도 업데이트
            if (property === 'pattern' || property === 'description') {
                component[property] = value;
                this.updateComponentElement(component);
            }
            
            this.updatePattern();
        }
    }
    
    updateComponentElement(component) {
        const element = document.getElementById(component.id);
        if (element) {
            const titleEl = element.querySelector('.component-title');
            const patternEl = element.querySelector('.component-pattern code');
            
            if (titleEl) titleEl.textContent = component.description;
            if (patternEl) patternEl.textContent = component.pattern;
        }
    }
    
    editComponent(componentId) {
        const component = this.components.find(c => c.id === componentId);
        if (component) {
            this.selectComponent(component);
        }
    }
    
    deleteComponent(componentId) {
        if (confirm('이 컴포넌트를 삭제하시겠습니까?')) {
            // DOM에서 제거
            const element = document.getElementById(componentId);
            if (element) {
                element.remove();
            }
            
            // 배열에서 제거
            this.components = this.components.filter(c => c.id !== componentId);
            
            // 연결 정보도 제거
            this.connections = this.connections.filter(
                conn => conn.from !== componentId && conn.to !== componentId
            );
            
            // 선택 해제
            if (this.selectedComponent && this.selectedComponent.id === componentId) {
                this.selectedComponent = null;
                this.hideComponentProperties();
            }
            
            // 히스토리 저장
            this.saveToHistory();
            
            // 패턴 업데이트
            this.updatePattern();
            
            // 플레이스홀더 표시
            if (this.components.length === 0) {
                this.setupCanvas();
            }
        }
    }
    
    hideComponentProperties() {
        const propertiesContent = document.getElementById('properties-content');
        propertiesContent.innerHTML = `
            <div class="no-selection">
                <div class="no-selection-content">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>구성 요소를 선택하여 속성을 편집하세요</p>
                </div>
            </div>
        `;
    }
    
    updatePattern() {
        let pattern = '';
        
        // 컴포넌트들을 위치 순서대로 정렬
        const sortedComponents = [...this.components].sort((a, b) => {
            return a.position.x - b.position.x || a.position.y - b.position.y;
        });
        
        // 패턴 조합
        sortedComponents.forEach((component, index) => {
            if (index > 0) {
                // 컴포넌트 사이 연결 확인
                pattern += this.getConnectionPattern(sortedComponents[index - 1], component);
            }
            pattern += component.pattern;
        });
        
        // 플래그 적용
        const flags = this.getSelectedFlags();
        
        // 패턴 표시 업데이트
        const patternDisplay = document.getElementById('generated-pattern');
        if (pattern) {
            patternDisplay.textContent = `/${pattern}/${flags}`;
            patternDisplay.className = 'pattern-code valid';
        } else {
            patternDisplay.textContent = '패턴이 여기에 표시됩니다';
            patternDisplay.className = 'pattern-code empty';
        }
        
        // 패턴 정보 업데이트
        this.updatePatternInfo(pattern);
    }
    
    getConnectionPattern(fromComponent, toComponent) {
        // 간단한 연결 패턴 (향후 확장 가능)
        return '';
    }
    
    getSelectedFlags() {
        const flagInputs = document.querySelectorAll('input[type="checkbox"][id^="flag-"]:checked');
        return Array.from(flagInputs).map(input => input.value).join('');
    }
    
    updatePatternInfo(pattern) {
        // 패턴 길이
        const lengthEl = document.getElementById('pattern-length');
        if (lengthEl) lengthEl.textContent = pattern.length;
        
        // 복잡도 계산 (간단한 휴리스틱)
        const complexityEl = document.getElementById('pattern-complexity');
        if (complexityEl) {
            let complexity = '낮음';
            if (pattern.length > 50) complexity = '높음';
            else if (pattern.length > 20) complexity = '중간';
            
            complexityEl.textContent = complexity;
        }
        
        // 그룹 개수
        const groupsEl = document.getElementById('pattern-groups');
        if (groupsEl) {
            const groupCount = (pattern.match(/\(/g) || []).length;
            groupsEl.textContent = groupCount;
        }
    }
    
    handleCanvasClick(e) {
        if (e.target === this.canvas) {
            this.selectedComponent = null;
            document.querySelectorAll('.canvas-component.selected').forEach(el => {
                el.classList.remove('selected');
            });
            this.hideComponentProperties();
        }
    }
    
    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.component-item');
        
        items.forEach(item => {
            const label = item.querySelector('.component-label').textContent.toLowerCase();
            const pattern = item.dataset.pattern.toLowerCase();
            const desc = item.dataset.desc.toLowerCase();
            
            const matches = label.includes(query) || pattern.includes(query) || desc.includes(query);
            item.style.display = matches ? 'flex' : 'none';
        });
    }
    
    handleKeyboard(e) {
        // Ctrl+Z: 실행 취소
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            this.undo();
        }
        
        // Ctrl+Y: 다시 실행
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            this.redo();
        }
        
        // Delete: 선택된 컴포넌트 삭제
        if (e.key === 'Delete' && this.selectedComponent) {
            this.deleteComponent(this.selectedComponent.id);
        }
    }
    
    saveToHistory() {
        const state = {
            components: JSON.parse(JSON.stringify(this.components)),
            connections: JSON.parse(JSON.stringify(this.connections))
        };
        
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(state);
        this.historyIndex++;
        
        // 히스토리 크기 제한
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreFromHistory();
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreFromHistory();
        }
    }
    
    restoreFromHistory() {
        const state = this.history[this.historyIndex];
        if (state) {
            this.components = JSON.parse(JSON.stringify(state.components));
            this.connections = JSON.parse(JSON.stringify(state.connections));
            this.rebuildCanvas();
            this.updatePattern();
        }
    }
    
    rebuildCanvas() {
        // 캔버스 초기화
        this.canvas.innerHTML = '';
        
        if (this.components.length === 0) {
            this.setupCanvas();
            return;
        }
        
        // 컴포넌트들 다시 생성
        this.components.forEach(component => {
            const element = this.createComponentElement(component);
            this.canvas.appendChild(element);
        });
        
        this.selectedComponent = null;
        this.hideComponentProperties();
    }
}

// 전역 함수들
let builder;

// 페이지 로드 시 빌더 초기화
document.addEventListener('DOMContentLoaded', function() {
    builder = new VisualRegexBuilder();
});

// 카테고리 토글
function toggleCategory(categoryName) {
    const category = document.querySelector(`[data-category="${categoryName}"]`);
    const items = category.querySelector('.category-items');
    const icon = category.querySelector('.toggle-icon');
    
    if (items.style.display === 'none') {
        items.style.display = 'grid';
        icon.style.transform = 'rotate(0deg)';
    } else {
        items.style.display = 'none';
        icon.style.transform = 'rotate(-90deg)';
    }
}

// 팔레트 토글
function togglePalette() {
    const palette = document.querySelector('.component-palette');
    const btn = document.querySelector('.palette-collapse-btn i');
    
    palette.classList.toggle('collapsed');
    
    if (palette.classList.contains('collapsed')) {
        btn.className = 'fas fa-angle-right';
    } else {
        btn.className = 'fas fa-angle-left';
    }
}

// 속성 패널 토글
function toggleProperties() {
    const panel = document.querySelector('.properties-panel');
    const btn = document.querySelector('.panel-collapse-btn i');
    
    panel.classList.toggle('collapsed');
    
    if (panel.classList.contains('collapsed')) {
        btn.className = 'fas fa-angle-left';
    } else {
        btn.className = 'fas fa-angle-right';
    }
}

// 빌더 액션들
function clearBuilder() {
    if (confirm('모든 작업을 초기화하시겠습니까?')) {
        builder.components = [];
        builder.connections = [];
        builder.selectedComponent = null;
        builder.rebuildCanvas();
        builder.updatePattern();
        builder.saveToHistory();
    }
}

function loadTemplate(templateName) {
    const templates = {
        email: {
            pattern: '[\\w\\.-]+@[\\w\\.-]+\\.\\w+',
            description: '이메일 주소 템플릿'
        },
        phone: {
            pattern: '0\\d{1,2}-\\d{3,4}-\\d{4}',
            description: '전화번호 템플릿'
        },
        url: {
            pattern: 'https?://[\\w\\.-]+',
            description: 'URL 템플릿'
        },
        password: {
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
            description: '비밀번호 템플릿'
        }
    };
    
    const template = templates[templateName];
    if (template && confirm(`${template.description}을 불러오시겠습니까?`)) {
        clearBuilder();
        
        // 템플릿 컴포넌트 추가
        builder.addComponent({
            pattern: template.pattern,
            description: template.description,
            type: 'template'
        }, { x: 100, y: 100 });
    }
}

function testInTester() {
    const pattern = document.getElementById('generated-pattern').textContent;
    if (pattern && pattern !== '패턴이 여기에 표시됩니다') {
        // 테스터 페이지로 패턴 전달
        const cleanPattern = pattern.replace(/^\/|\/[gimsuxy]*$/g, '');
        const flags = pattern.match(/\/([gimsuxy]*)$/)?.[1] || '';
        
        const url = `./tester.html?pattern=${encodeURIComponent(cleanPattern)}&flags=${flags}`;
        window.open(url, '_blank');
    } else {
        alert('먼저 패턴을 만들어 주세요.');
    }
}

function exportPattern() {
    const pattern = document.getElementById('generated-pattern').textContent;
    if (pattern && pattern !== '패턴이 여기에 표시됩니다') {
        // 내보내기 옵션 모달 표시
        showExportModal(pattern);
    } else {
        alert('내보낼 패턴이 없습니다.');
    }
}

function showExportModal(pattern) {
    const modal = document.createElement('div');
    modal.className = 'export-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>패턴 내보내기</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="export-options">
                    <label class="export-option">
                        <input type="radio" name="export-type" value="copy" checked>
                        클립보드에 복사
                    </label>
                    <label class="export-option">
                        <input type="radio" name="export-type" value="json">
                        JSON 파일로 저장
                    </label>
                    <label class="export-option">
                        <input type="radio" name="export-type" value="code">
                        코드 스니펫 생성
                    </label>
                </div>
                <div class="pattern-preview">
                    <code>${pattern}</code>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-primary" onclick="executeExport('${pattern}', this)">
                    내보내기
                </button>
                <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                    취소
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function executeExport(pattern, button) {
    const exportType = document.querySelector('input[name="export-type"]:checked').value;
    
    switch (exportType) {
        case 'copy':
            navigator.clipboard.writeText(pattern).then(() => {
                showNotification('패턴이 클립보드에 복사되었습니다.', 'success');
            });
            break;
        case 'json':
            downloadJSON(pattern);
            break;
        case 'code':
            showCodeSnippet(pattern);
            return; // 모달을 닫지 않음
    }
    
    button.parentElement.parentElement.parentElement.remove();
}

function downloadJSON(pattern) {
    const data = {
        pattern: pattern,
        components: builder.components,
        connections: builder.connections,
        created: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'regex-pattern.json';
    a.click();
    URL.revokeObjectURL(url);
}

function showCodeSnippet(pattern) {
    // 코드 스니펫 모달로 변환
    const modal = document.querySelector('.export-modal');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="code-snippets">
            <div class="snippet-tabs">
                <button class="snippet-tab active" onclick="showSnippet('javascript')">JavaScript</button>
                <button class="snippet-tab" onclick="showSnippet('python')">Python</button>
                <button class="snippet-tab" onclick="showSnippet('java')">Java</button>
            </div>
            <div class="snippet-content" id="snippet-javascript">
                <pre><code>const regex = new RegExp(${JSON.stringify(pattern.replace(/^\/|\/[gimsuxy]*$/g, ''))});
const text = "테스트할 텍스트";
const matches = text.match(regex);
console.log(matches);</code></pre>
                <button class="copy-snippet" onclick="copySnippet(this)">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            <div class="snippet-content" id="snippet-python" style="display: none;">
                <pre><code>import re

pattern = r"${pattern.replace(/^\/|\/[gimsuxy]*$/g, '').replace(/\\/g, '\\\\')}"
text = "테스트할 텍스트"
matches = re.findall(pattern, text)
print(matches)</code></pre>
                <button class="copy-snippet" onclick="copySnippet(this)">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            <div class="snippet-content" id="snippet-java" style="display: none;">
                <pre><code>import java.util.regex.Pattern;
import java.util.regex.Matcher;

String pattern = "${pattern.replace(/^\/|\/[gimsuxy]*$/g, '').replace(/\\/g, '\\\\')}";
String text = "테스트할 텍스트";
Pattern regex = Pattern.compile(pattern);
Matcher matcher = regex.matcher(text);
while (matcher.find()) {
    System.out.println(matcher.group());
}</code></pre>
                <button class="copy-snippet" onclick="copySnippet(this)">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        </div>
    `;
}

function showSnippet(language) {
    document.querySelectorAll('.snippet-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.snippet-content').forEach(content => {
        content.style.display = 'none';
    });
    
    document.querySelector(`[onclick="showSnippet('${language}')"]`).classList.add('active');
    document.getElementById(`snippet-${language}`).style.display = 'block';
}

function copySnippet(button) {
    const code = button.previousElementSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
        showNotification('코드가 복사되었습니다.', 'success');
    });
}

// 실행 취소/다시 실행
function undoLastAction() {
    if (builder) {
        builder.undo();
    }
}

function redoLastAction() {
    if (builder) {
        builder.redo();
    }
}

// 줌 기능
function zoomIn() {
    const canvas = document.getElementById('canvas');
    const currentZoom = parseFloat(canvas.style.zoom || '1');
    const newZoom = Math.min(currentZoom + 0.1, 2);
    canvas.style.zoom = newZoom;
}

function zoomOut() {
    const canvas = document.getElementById('canvas');
    const currentZoom = parseFloat(canvas.style.zoom || '1');
    const newZoom = Math.max(currentZoom - 0.1, 0.5);
    canvas.style.zoom = newZoom;
}

// 패턴 설명
function explainPattern() {
    const pattern = document.getElementById('generated-pattern').textContent;
    if (pattern && pattern !== '패턴이 여기에 표시됩니다') {
        showPatternExplanation(pattern);
    }
}

function showPatternExplanation(pattern) {
    // 패턴 설명 모달 (간단한 버전)
    const explanation = "이 패턴은 " + builder.components.length + "개의 구성 요소로 이루어져 있습니다.";
    alert(explanation);
}

// 패턴 복사
function copyPattern() {
    const pattern = document.getElementById('generated-pattern').textContent;
    if (pattern && pattern !== '패턴이 여기에 표시됩니다') {
        const cleanPattern = pattern.replace(/^\/|\/[gimsuxy]*$/g, '');
        navigator.clipboard.writeText(cleanPattern).then(() => {
            showNotification('패턴이 복사되었습니다.', 'success');
        });
    }
}