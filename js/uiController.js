/**
 * UI Controller - Handles all DOM manipulation and user interface
 */

export class UIController {
    constructor() {
        this.zoom = 100;
        this.currentView = 'unified';
    }
    
    showDropZone() {
        const view = document.getElementById('document-view');
        view.innerHTML = `
            <div class="drop-zone" id="drop-zone">
                <div class="drop-content">
                    <span class="drop-icon">📄</span>
                    <p>Drag & drop documents here</p>
                    <p class="drop-hint">or click to browse</p>
                </div>
            </div>
        `;
    }
    
    updateDropZoneText(text) {
        const hint = document.querySelector('.drop-hint');
        if (hint) {
            hint.textContent = text;
        }
    }
    
    showDocument(content, type) {
        const view = document.getElementById('document-view');
        
        if (type === 'original') {
            view.innerHTML = `
                <div class="document-preview">
                    <div class="doc-header">
                        <span class="doc-badge original">Original</span>
                    </div>
                    <pre class="doc-content">${this.escapeHtml(content)}</pre>
                </div>
            `;
        } else if (type === 'revised') {
            const existing = view.querySelector('.document-preview');
            if (existing) {
                view.innerHTML += `
                    <div class="document-preview">
                        <div class="doc-header">
                            <span class="doc-badge revised">Revised</span>
                        </div>
                        <pre class="doc-content">${this.escapeHtml(content)}</pre>
                    </div>
                `;
            }
        }
    }
    
    renderComparison(changes) {
        const view = document.getElementById('document-view');
        view.innerHTML = ''; // Clear existing content
        
        if (this.currentView === 'unified') {
            view.innerHTML = this.renderUnifiedView(changes);
        } else {
            view.innerHTML = this.renderSplitView(changes);
        }
        
        // Add event listeners to change items
        document.querySelectorAll('.change-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.highlightChange(id);
            });
        });
    }
    
    highlightChange(id) {
        document.querySelectorAll('.change-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const item = document.querySelector(`.change-item[data-id="${id}"]`);
        if (item) {
            item.classList.add('selected');
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    renderUnifiedView(changes) {
        let html = '<div class="comparison-view unified">';
        
        changes.forEach(change => {
            const changeClass = `change-${change.type}`;
            html += `
                <div class="change-item ${changeClass}" data-id="${change.id}">
                    <span class="line-number">${change.lineNumber}</span>
                    ${this.renderChangeContent(change)}
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    renderSplitView(changes) {
        let leftHtml = '<div class="split-pane left"><h4>Original</h4>';
        let rightHtml = '<div class="split-pane right"><h4>Revised</h4>';
        
        changes.forEach(change => {
            if (change.type === 'remove') {
                leftHtml += `<div class="change-line removed">${this.escapeHtml(change.originalText)}</div>`;
                rightHtml += `<div class="change-line empty"></div>`;
            } else if (change.type === 'add') {
                leftHtml += `<div class="change-line empty"></div>`;
                rightHtml += `<div class="change-line added">${this.escapeHtml(change.revisedText)}</div>`;
            } else {
                leftHtml += `<div class="change-line">${this.escapeHtml(change.originalText)}</div>`;
                rightHtml += `<div class="change-line modified">${this.escapeHtml(change.revisedText)}</div>`;
            }
        });
        
        leftHtml += '</div>';
        rightHtml += '</div>';
        
        return `<div class="comparison-view split">${leftHtml}${rightHtml}</div>`;
    }
    
    renderChangeContent(change) {
        switch (change.type) {
            case 'add':
                return `<ins>${this.escapeHtml(change.revisedText)}</ins>`;
            case 'remove':
                return `<del>${this.escapeHtml(change.originalText)}</del>`;
            case 'modify':
                return `<del>${this.escapeHtml(change.originalText)}</del> → <ins>${this.escapeHtml(change.revisedText)}</ins>`;
            default:
                return '';
        }
    }
    
    renderChangesList(changes) {
        const list = document.getElementById('changes-list');
        
        if (changes.length === 0) {
            list.innerHTML = '<p class="empty">No changes detected</p>';
            return;
        }
        
        let html = '';
        changes.forEach(change => {
            const typeIcon = change.type === 'add' ? '➕' : change.type === 'remove' ? '➖' : '✏️';
            const preview = (change.revisedText || change.originalText || '').substring(0, 50);
            
            html += `
                <div class="change-item-sidebar" data-id="${change.id}">
                    <span class="change-icon ${change.type}">${typeIcon}</span>
                    <div class="change-info">
                        <span class="change-type">${change.type}</span>
                        <span class="change-preview">${this.escapeHtml(preview)}${preview.length >= 50 ? '...' : ''}</span>
                    </div>
                    <button class="btn-navigate" onclick="scrollToChange(${change.id})">→</button>
                </div>
            `;
        });
        
        list.innerHTML = html;
    }
    
    updateStats(totalCount) {
        document.getElementById('total-changes').textContent = totalCount;
    }
    
    enableButton(buttonId) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.disabled = false;
        }
    }
    
    disableButton(buttonId) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.disabled = true;
        }
    }
    
    switchView(view) {
        this.currentView = view;
        // Re-render if changes exist
    }
    
    zoomIn() {
        this.zoom = Math.min(this.zoom + 10, 200);
        this.applyZoom();
    }
    
    zoomOut() {
        this.zoom = Math.max(this.zoom - 10, 50);
        this.applyZoom();
    }
    
    applyZoom() {
        document.getElementById('zoom-level').textContent = `${this.zoom}%`;
        const docView = document.querySelector('.document-view');
        if (docView) {
            docView.style.fontSize = `${this.zoom}%`;
        }
    }
    
    showError(message) {
        alert(message);
    }
    
    exportDocument(changes) {
        const acceptedChanges = changes.filter(c => c.accepted);
        const content = JSON.stringify(acceptedChanges, null, 2);
        
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'comparison-results.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
