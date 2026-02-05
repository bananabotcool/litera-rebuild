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
                    <span class="drop-icon">[DOC]</span>
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
    
    showLoading(message = 'Loading...') {
        const view = document.getElementById('document-view');
        view.innerHTML = `
            <div class="loading-overlay">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }
    
    hideLoading() {
        // Content will be replaced by showDocument or renderComparison
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
    
    renderChangesList(changes, appInstance) {
        const list = document.getElementById('changes-list');
        
        if (changes.length === 0) {
            list.innerHTML = '<p class="empty">No changes detected</p>';
            return;
        }
        
        let html = '';
        changes.forEach(change => {
            const preview = (change.revisedText || change.originalText || '').substring(0, 50);
            const statusClass = change.accepted ? 'accepted' : change.rejected ? 'rejected' : '';
            
            html += `
                <div class="change-item-sidebar ${statusClass}" data-id="${change.id}">
                    <div class="change-info" onclick="if(window.litera) window.litera.ui.highlightChange(${change.id})">
                        <span class="change-type">${change.type}</span>
                        <span class="change-preview">${this.escapeHtml(preview)}${preview.length >= 50 ? '...' : ''}</span>
                    </div>
                    <div class="change-actions">
                        <button class="btn-accept" onclick="if(window.litera) window.litera.acceptChange(${change.id})">✓</button>
                        <button class="btn-reject" onclick="if(window.litera) window.litera.rejectChange(${change.id})">✕</button>
                    </div>
                </div>
            `;
        });
        
        list.innerHTML = html;
    }
    
    updateChangeStatus(id, status) {
        const item = document.querySelector(`.change-item-sidebar[data-id="${id}"]`);
        if (item) {
            item.classList.remove('accepted', 'rejected');
            item.classList.add(status);
        }
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
    
    exportDocument(changes, format = 'html') {
        const acceptedChanges = changes.filter(c => c.accepted !== false);
        
        let content, mimeType, filename;
        
        if (format === 'html') {
            content = this.generateExportHTML(acceptedChanges);
            mimeType = 'text/html';
            filename = 'comparison-result.html';
        } else if (format === 'json') {
            content = JSON.stringify(acceptedChanges, null, 2);
            mimeType = 'application/json';
            filename = 'comparison-results.json';
        } else if (format === 'txt') {
            content = this.generateExportText(acceptedChanges);
            mimeType = 'text/plain';
            filename = 'comparison-results.txt';
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    generateExportHTML(changes) {
        return `<!DOCTYPE html>
<html>
<head>
    <title>Litera Comparison Results</title>
    <style>
        body { font-family: system-ui; max-width: 800px; margin: 2rem auto; padding: 1rem; }
        h1 { color: #2563eb; }
        .change { margin: 1rem 0; padding: 1rem; border-radius: 8px; }
        .add { background: #dcfce7; border-left: 4px solid #16a34a; }
        .remove { background: #fee2e2; border-left: 4px solid #dc2626; }
        .modify { background: #fef3c7; border-left: 4px solid #f59e0b; }
        .change-type { font-weight: bold; text-transform: uppercase; font-size: 0.75rem; }
        .add .change-type { color: #16a34a; }
        .remove .change-type { color: #dc2626; }
        .modify .change-type { color: #f59e0b; }
        ins { background: #dcfce7; text-decoration: none; }
        del { background: #fee2e2; text-decoration: line-through; }
    </style>
</head>
<body>
    <h1>Document Comparison Results</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>Total Changes: ${changes.length}</p>
    ${changes.map(c => `
        <div class="change ${c.type}">
            <div class="change-type">${c.type} - Line ${c.lineNumber}</div>
            ${c.type === 'add' ? `<ins>${this.escapeHtml(c.revisedText)}</ins>` : ''}
            ${c.type === 'remove' ? `<del>${this.escapeHtml(c.originalText)}</del>` : ''}
            ${c.type === 'modify' ? `<del>${this.escapeHtml(c.originalText)}</del> → <ins>${this.escapeHtml(c.revisedText)}</ins>` : ''}
        </div>
    `).join('')}
</body>
</html>`;
    }
    
    generateExportText(changes) {
        let text = `DOCUMENT COMPARISON RESULTS\n`;
        text += `Generated: ${new Date().toLocaleString()}\n`;
        text += `Total Changes: ${changes.length}\n\n`;
        text += `=${'='.repeat(50)}\n\n`;
        
        changes.forEach(c => {
            text += `[${c.type.toUpperCase()}] Line ${c.lineNumber}\n`;
            if (c.originalText) text += `Original: ${c.originalText}\n`;
            if (c.revisedText) text += `Revised: ${c.revisedText}\n`;
            text += `\n`;
        });
        
        return text;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
