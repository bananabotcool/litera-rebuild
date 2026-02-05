/**
 * Annotations System - Add comments to changes
 */

export class AnnotationSystem {
    constructor() {
        this.annotations = new Map();
    }
    
    addAnnotation(changeId, text, author = 'User') {
        const annotation = {
            id: Date.now(),
            changeId,
            text,
            author,
            timestamp: new Date().toISOString(),
            resolved: false
        };
        
        if (!this.annotations.has(changeId)) {
            this.annotations.set(changeId, []);
        }
        
        this.annotations.get(changeId).push(annotation);
        return annotation;
    }
    
    getAnnotations(changeId) {
        return this.annotations.get(changeId) || [];
    }
    
    deleteAnnotation(changeId, annotationId) {
        const list = this.annotations.get(changeId);
        if (list) {
            const idx = list.findIndex(a => a.id === annotationId);
            if (idx > -1) list.splice(idx, 1);
        }
    }
    
    resolveAnnotation(changeId, annotationId) {
        const list = this.annotations.get(changeId);
        if (list) {
            const ann = list.find(a => a.id === annotationId);
            if (ann) ann.resolved = true;
        }
    }
    
    renderAnnotationForm(changeId, onSubmit) {
        return `
            <div class="annotation-form" id="annotation-form-${changeId}">
                <textarea placeholder="Add a comment..." class="annotation-input"></textarea>
                <div class="annotation-actions">
                    <button onclick="${onSubmit}(${changeId})" class="btn-save">Save</button>
                    <button onclick="this.parentElement.parentElement.remove()" class="btn-cancel">Cancel</button>
                </div>
            </div>
        `;
    }
    
    renderAnnotationsList(changeId) {
        const list = this.getAnnotations(changeId);
        if (list.length === 0) return '';
        
        return `
            <div class="annotations-list">
                ${list.map(a => `
                    <div class="annotation ${a.resolved ? 'resolved' : ''}" data-id="${a.id}">
                        <div class="annotation-header">
                            <span class="annotation-author">${a.author}</span>
                            <span class="annotation-time">${new Date(a.timestamp).toLocaleString()}</span>
                        </div>
                        <div class="annotation-text">${a.text}</div>
                        ${!a.resolved ? `
                            <button onclick="resolveAnnotation(${changeId}, ${a.id})" class="btn-resolve">Resolve</button>
                        ` : '<span class="resolved-badge">Resolved</span>'}
                    </div>
                `).join('')}
            </div>
        `;
    }
}
