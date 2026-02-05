/**
 * Comparison Engine - Diff algorithm for document comparison
 */

export class ComparisonEngine {
    /**
     * Compare two text documents and return changes
     * @param {string} original - Original document text
     * @param {string} revised - Revised document text
     * @returns {Array} Array of change objects
     */
    compare(original, revised) {
        const originalLines = original.split('\n');
        const revisedLines = revised.split('\n');
        
        const changes = this.computeDiff(originalLines, revisedLines);
        
        return changes.map((change, index) => ({
            id: index + 1,
            type: change.type, // 'add', 'remove', 'modify'
            originalText: change.original,
            revisedText: change.revised,
            lineNumber: change.lineNumber,
            accepted: false
        }));
    }
    
    /**
     * Simple LCS-based diff algorithm
     */
    computeDiff(original, revised) {
        const changes = [];
        let origIndex = 0;
        let revIndex = 0;
        
        while (origIndex < original.length || revIndex < revised.length) {
            const origLine = original[origIndex];
            const revLine = revised[revIndex];
            
            if (origIndex >= original.length) {
                // Added lines at end
                changes.push({
                    type: 'add',
                    original: '',
                    revised: revLine,
                    lineNumber: revIndex + 1
                });
                revIndex++;
            } else if (revIndex >= revised.length) {
                // Removed lines at end
                changes.push({
                    type: 'remove',
                    original: origLine,
                    revised: '',
                    lineNumber: origIndex + 1
                });
                origIndex++;
            } else if (origLine === revLine) {
                // No change
                origIndex++;
                revIndex++;
            } else {
                // Check if it's a modification or add/remove
                const nextMatch = this.findNextMatch(original, revised, origIndex, revIndex);
                
                if (nextMatch && nextMatch.origOffset <= 3 && nextMatch.revOffset <= 3) {
                    // Treat as modifications
                    for (let i = 0; i < nextMatch.origOffset && origIndex < original.length; i++) {
                        changes.push({
                            type: 'remove',
                            original: original[origIndex],
                            revised: '',
                            lineNumber: origIndex + 1
                        });
                        origIndex++;
                    }
                    for (let i = 0; i < nextMatch.revOffset && revIndex < revised.length; i++) {
                        changes.push({
                            type: 'add',
                            original: '',
                            revised: revised[revIndex],
                            lineNumber: revIndex + 1
                        });
                        revIndex++;
                    }
                } else {
                    // Simple modification
                    changes.push({
                        type: 'modify',
                        original: origLine,
                        revised: revLine,
                        lineNumber: origIndex + 1
                    });
                    origIndex++;
                    revIndex++;
                }
            }
        }
        
        return changes;
    }
    
    findNextMatch(original, revised, origStart, revStart) {
        for (let i = origStart; i < Math.min(origStart + 5, original.length); i++) {
            for (let j = revStart; j < Math.min(revStart + 5, revised.length); j++) {
                if (original[i] === revised[j]) {
                    return { origOffset: i - origStart, revOffset: j - revStart };
                }
            }
        }
        return null;
    }
    
    /**
     * Generate unified diff view HTML
     */
    generateUnifiedView(changes) {
        let html = '<div class="unified-view">';
        
        changes.forEach(change => {
            switch (change.type) {
                case 'add':
                    html += `<div class="change-line added"><ins>${this.escapeHtml(change.revisedText)}</ins></div>`;
                    break;
                case 'remove':
                    html += `<div class="change-line removed"><del>${this.escapeHtml(change.originalText)}</del></div>`;
                    break;
                case 'modify':
                    const wordDiff = this.wordDiff(change.originalText, change.revisedText);
                    html += `<div class="change-line modified">${wordDiff}</div>`;
                    break;
            }
        });
        
        html += '</div>';
        return html;
    }
    
    /**
     * Word-level diff for modifications
     */
    wordDiff(original, revised) {
        const origWords = original.split(' ');
        const revWords = revised.split(' ');
        
        let result = '';
        let origIdx = 0;
        let revIdx = 0;
        
        while (origIdx < origWords.length || revIdx < revWords.length) {
            if (origIdx >= origWords.length) {
                result += `<ins>${this.escapeHtml(revWords[revIdx])}</ins> `;
                revIdx++;
            } else if (revIdx >= revWords.length) {
                result += `<del>${this.escapeHtml(origWords[origIdx])}</del> `;
                origIdx++;
            } else if (origWords[origIdx] === revWords[revIdx]) {
                result += this.escapeHtml(origWords[origIdx]) + ' ';
                origIdx++;
                revIdx++;
            } else {
                // Check if word was replaced or modified
                if (this.similarity(origWords[origIdx], revWords[revIdx]) > 0.7) {
                    result += `<del>${this.escapeHtml(origWords[origIdx])}</del> `;
                    result += `<ins>${this.escapeHtml(revWords[revIdx])}</ins> `;
                } else {
                    result += `<del>${this.escapeHtml(origWords[origIdx])}</del> `;
                    result += `<ins>${this.escapeHtml(revWords[revIdx])}</ins> `;
                }
                origIdx++;
                revIdx++;
            }
        }
        
        return result.trim();
    }
    
    similarity(str1, str2) {
        const len = Math.max(str1.length, str2.length);
        if (len === 0) return 1;
        
        let matches = 0;
        for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
            if (str1[i] === str2[i]) matches++;
        }
        
        return matches / len;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
