/**
 * Litera Rebuild - Main Application
 * Document redlining software rebuild
 */

import { DocumentLoader } from './documentLoader.js';
import { ComparisonEngine } from './comparisonEngine.js';
import { UIController } from './uiController.js';

class LiteraApp {
    constructor() {
        this.docLoader = new DocumentLoader();
        this.comparisonEngine = new ComparisonEngine();
        this.ui = new UIController();
        
        this.documents = {
            original: null,
            revised: null
        };
        
        this.changes = [];
        this.currentChangeIndex = -1;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.ui.showDropZone();
        console.log('🚀 Litera Rebuild initialized');
    }
    
    setupEventListeners() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const fileInput2 = document.getElementById('file-input-2');
        
        // Drag & drop events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            this.handleFileDrop(e.dataTransfer.files);
        });
        
        dropZone.addEventListener('click', () => {
            if (!this.documents.original) {
                fileInput.click();
            } else if (!this.documents.revised) {
                fileInput2.click();
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });
        
        fileInput2.addEventListener('change', (e) => {
            this.handleSecondFileSelect(e.target.files[0]);
        });
        
        // Button events
        document.getElementById('upload-btn').addEventListener('click', () => {
            fileInput.click();
        });
        
        document.getElementById('compare-btn').addEventListener('click', () => {
            this.compareDocuments();
        });
        
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportDocument();
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterChanges(e.target.dataset.type);
            });
        });
        
        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.switchView(e.target.dataset.view);
            });
        });
        
        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => this.ui.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.ui.zoomOut());
        
        // Navigation controls
        document.getElementById('prev-change').addEventListener('click', () => this.navigateChange(-1));
        document.getElementById('next-change').addEventListener('click', () => this.navigateChange(1));
        
        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchChanges(e.target.value);
        });
    }
    
    navigateChange(direction) {
        if (this.changes.length === 0) return;
        
        this.currentChangeIndex += direction;
        
        if (this.currentChangeIndex < 0) {
            this.currentChangeIndex = this.changes.length - 1;
        } else if (this.currentChangeIndex >= this.changes.length) {
            this.currentChangeIndex = 0;
        }
        
        const changeId = this.changes[this.currentChangeIndex].id;
        this.ui.highlightChange(changeId);
        this.updateChangeCounter();
    }
    
    updateChangeCounter() {
        const counter = document.getElementById('change-counter');
        if (counter && this.changes.length > 0) {
            counter.textContent = `${this.currentChangeIndex + 1} of ${this.changes.length}`;
        }
    }
    
    searchChanges(query) {
        if (!query) {
            this.ui.renderChangesList(this.changes, this);
            return;
        }
        
        const filtered = this.changes.filter(c => {
            const text = (c.originalText + ' ' + c.revisedText).toLowerCase();
            return text.includes(query.toLowerCase());
        });
        
        this.ui.renderChangesList(filtered, this);
        document.getElementById('search-results').textContent = ` (${filtered.length} found)`;
    }
    
    async handleFileSelect(file) {
        if (!file) return;
        
        try {
            const content = await this.docLoader.loadFile(file);
            this.documents.original = {
                name: file.name,
                content: content,
                type: file.type
            };
            
            this.ui.showDocument(content, 'original');
            this.ui.enableButton('compare-btn');
            this.ui.updateDropZoneText('Drop second document or click to browse');
            
            console.log('✅ Original document loaded:', file.name);
        } catch (error) {
            console.error('❌ Failed to load document:', error);
            this.ui.showError('Failed to load document: ' + error.message);
        }
    }
    
    async handleSecondFileSelect(file) {
        if (!file) return;
        
        try {
            const content = await this.docLoader.loadFile(file);
            this.documents.revised = {
                name: file.name,
                content: content,
                type: file.type
            };
            
            this.ui.showDocument(content, 'revised');
            this.ui.enableButton('compare-btn');
            
            console.log('✅ Revised document loaded:', file.name);
        } catch (error) {
            console.error('❌ Failed to load document:', error);
            this.ui.showError('Failed to load document: ' + error.message);
        }
    }
    
    handleFileDrop(files) {
        if (files.length === 0) return;
        
        if (!this.documents.original) {
            this.handleFileSelect(files[0]);
        } else if (!this.documents.revised && files.length > 1) {
            this.handleSecondFileSelect(files[1]);
        }
    }
    
    compareDocuments() {
        if (!this.documents.original || !this.documents.revised) {
            this.ui.showError('Please load both documents before comparing');
            return;
        }
        
        console.log('🔍 Comparing documents...');
        
        this.changes = this.comparisonEngine.compare(
            this.documents.original.content,
            this.documents.revised.content
        );
        
        this.ui.renderComparison(this.changes);
        this.ui.renderChangesList(this.changes, this);
        this.ui.updateStats(this.changes.length);
        this.ui.enableButton('export-btn');
        
        this.currentChangeIndex = 0;
        this.updateChangeCounter();
        
        console.log('✅ Comparison complete:', this.changes.length, 'changes found');
    }
    
    acceptChange(id) {
        const change = this.changes.find(c => c.id === id);
        if (change) {
            change.accepted = true;
            change.rejected = false;
            this.ui.updateChangeStatus(id, 'accepted');
            console.log('✅ Change', id, 'accepted');
        }
    }
    
    rejectChange(id) {
        const change = this.changes.find(c => c.id === id);
        if (change) {
            change.accepted = false;
            change.rejected = true;
            this.ui.updateChangeStatus(id, 'rejected');
            console.log('❌ Change', id, 'rejected');
        }
    }
    
    filterChanges(type) {
        const filtered = type === 'all' 
            ? this.changes 
            : this.changes.filter(c => c.type === type);
        
        this.ui.renderChangesList(filtered);
    }
    
    switchView(view) {
        this.ui.switchView(view);
    }
    
    exportDocument(format = 'html') {
        this.ui.exportDocument(this.changes, format);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.litera = new LiteraApp();
});
