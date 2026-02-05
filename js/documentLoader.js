/**
 * Document Loader - Handles file upload and text extraction
 */

export class DocumentLoader {
    constructor() {
        this.supportedTypes = [
            'text/plain',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/pdf'
        ];
    }
    
    async loadFile(file) {
        if (!file) {
            throw new Error('No file provided');
        }
        
        // For now, support plain text files
        // TODO: Add DOCX and PDF parsing
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            return await this.loadTextFile(file);
        }
        
        // Fallback: try to read as text
        try {
            return await this.loadTextFile(file);
        } catch (e) {
            throw new Error(`Unsupported file type: ${file.type}. Please use .txt files for now.`);
        }
    }
    
    loadTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = (e) => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }
    
    // TODO: Implement DOCX parsing
    async loadDocxFile(file) {
        // Would need mammoth.js or similar library
        throw new Error('DOCX support coming soon');
    }
    
    // TODO: Implement PDF parsing
    async loadPdfFile(file) {
        // Would need pdf.js library
        throw new Error('PDF support coming soon');
    }
    
    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (file.size > maxSize) {
            throw new Error('File too large. Max size is 10MB.');
        }
        
        return true;
    }
}
