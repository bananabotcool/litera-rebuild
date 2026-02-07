/**
 * Litera Pro - Main Application
 * Document redlining with annotations and accept/reject
 */

import { DocumentLoader } from './documentLoader.js';
import { ComparisonEngine } from './comparisonEngine.js';
import { UIController } from './uiController.js';
import { AnnotationSystem } from './annotationSystem.js';
import { ChangeManager } from './changeManager.js';

class LiteraApp {
    constructor() {
        this.docLoader = new DocumentLoader();
        this.comparisonEngine = new ComparisonEngine();
        this.ui = new UIController();
        this.annotations = new AnnotationSystem();
        this.changeManager = new ChangeManager();
        
        // Global references
        window.annotations = this.annotations;
        window.changeManager = this.changeManager;
        window.litera = this;
        
        this.documents = { original: null, revised: null };
        this.changes = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.ui.showDropZone();
        console.log('Litera Pro initialized');
    }
    
    setupEventListeners() {
        // File upload
        const fileInput = document.getElementById('file-input');
        const fileInput2 = document.getElementById('file-input-2');
        const dropZone = document.getElementById('drop-zone');
        
        dropZone?.addEventListener('click', () => {
            if (!this.documents.original) fileInput?.click();
            else if (!this.documents.revised) fileInput2?.click();
        });
        
        fileInput?.addEventListener('change', (e) => this.handleFile(e.target.files[0], 'original'));
        fileInput2?.addEventListener('change', (e) => this.handleFile(e.target.files[0], 'revised'));
        
        // Buttons
        document.getElementById('compare-btn')?.addEventListener('click', () => this.compare());
        document.getElementById('export-btn')?.addEventListener('click', () => this.export());
    }
    
    handleFile(file, type) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.documents[type] = e.target.result;
            this.ui.updateDropZoneText(`${type}: ${file.name}`);
            
            if (this.documents.original && this.documents.revised) {
                document.getElementById('compare-btn').disabled = false;
            }
        };
        reader.readAsText(file);
    }
    
    compare() {
        if (!this.documents.original || !this.documents.revised) return;
        
        this.changes = this.comparisonEngine.compare(
            this.documents.original,
            this.documents.revised
        );
        
        this.renderChanges();
        this.ui.renderComparison(this.changes);
        
        document.getElementById('export-btn').disabled = false;
    }
    
    renderChanges() {
        const list = document.getElementById('changes-list');
        if (!list) return;
        
        if (this.changes.length === 0) {
            list.innerHTML = '<p class="empty">No changes</p>';
            return;
        }
        
        list.innerHTML = this.changes.map(c => `
            <div class="change-item ${this.changeManager.getState(c.id)}" data-id="${c.id}">
                <div class="change-header">
                    <span class="type-${c.type}">${c.type}</span>
                    <span>Line ${c.lineNumber}</span>
                </div>
                <div class="preview">${(c.revisedText || c.originalText || '').slice(0, 50)}...</div>
                <div class="actions">
                    <button onclick="changeManager.acceptChange('${c.id}')">Accept</button>
                    <button onclick="changeManager.rejectChange('${c.id}')">Reject</button>
                    <span class="state">${this.changeManager.getState(c.id)}</span>
                </div>
                <div class="comments">
                    ${this.annotations.renderCommentUI(c.id)}
                </div>
            </div>
        `).join('');
        
        // Update stats
        const accepted = this.changes.filter(c => this.changeManager.getState(c.id) === 'accepted').length;
        const rejected = this.changes.filter(c => this.changeManager.getState(c.id) === 'rejected').length;
        
        document.getElementById('total-changes').textContent = this.changes.length;
        document.getElementById('accepted-count').textContent = accepted;
        document.getElementById('rejected-count').textContent = rejected;
    }
    
    export() {
        const content = this.changes.map(c => ({
            ...c,
            state: this.changeManager.getState(c.id),
            comments: this.annotations.getCommentsForChange(c.id)
        }));
        
        const blob = new Blob([JSON.stringify(content, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'litera-comparison.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// Initialize
new LiteraApp();
