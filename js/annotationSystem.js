/**
 * Annotation System - Comments on document changes
 */

export class AnnotationSystem {
  constructor() {
    this.comments = this.loadComments();
  }
  
  loadComments() {
    const saved = localStorage.getItem('litera-comments');
    return saved ? JSON.parse(saved) : [];
  }
  
  saveComments() {
    localStorage.setItem('litera-comments', JSON.stringify(this.comments));
  }
  
  addComment(changeId, text, author = 'User') {
    const comment = {
      id: Date.now().toString(),
      changeId: String(changeId),
      text,
      author,
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    this.comments.push(comment);
    this.saveComments();
    return comment;
  }
  
  getCommentsForChange(changeId) {
    return this.comments.filter(c => c.changeId === String(changeId));
  }
  
  resolveComment(commentId) {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      comment.resolved = true;
      this.saveComments();
    }
  }
  
  deleteComment(commentId) {
    this.comments = this.comments.filter(c => c.id !== commentId);
    this.saveComments();
  }
  
  renderCommentUI(changeId) {
    const comments = this.getCommentsForChange(changeId);
    
    let html = `
      <div class="comment-section" data-change-id="${changeId}" style="margin-top:1rem; background:rgba(255,255,255,0.05); padding:1rem; border-radius:8px;">
        <h4 style="margin-bottom:0.75rem; color:#94a3b8;">Comments (${comments.length})</h4>
        <div class="comments-list" style="margin-bottom:1rem;">
    `;
    
    if (comments.length === 0) {
      html += '<p style="color:#64748b; font-size:0.9rem;">No comments yet</p>';
    } else {
      html += comments.map(c => `
        <div class="comment" style="background:rgba(0,0,0,0.2); padding:0.75rem; border-radius:6px; margin-bottom:0.5rem; border-left:3px solid ${c.resolved ? '#10b981' : '#3b82f6'};">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#64748b; margin-bottom:0.25rem;">
            <span style="color:#f59e0b; font-weight:600;">${c.author}</span>
            <span>${new Date(c.timestamp).toLocaleString()}</span>
          </div>
          <p style="color:#e2e8f0; margin:0;">${c.text}</p>
          <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
            ${!c.resolved ? `<button onclick="annotations.resolveComment('${c.id}'); this.closest('.comment-section').outerHTML = annotations.renderCommentUI('${changeId}');" style="font-size:0.75rem; padding:0.25rem 0.5rem; background:rgba(16,185,129,0.2); color:#10b981; border:none; border-radius:4px; cursor:pointer;">Resolve</button>` : ''}
            <button onclick="annotations.deleteComment('${c.id}'); this.closest('.comment-section').outerHTML = annotations.renderCommentUI('${changeId}');" style="font-size:0.75rem; padding:0.25rem 0.5rem; background:rgba(239,68,68,0.2); color:#ef4444; border:none; border-radius:4px; cursor:pointer;">Delete</button>
          </div>
        </div>
      `).join('');
    }
    
    html += `
        </div>
        <div class="comment-input">
          <textarea id="comment-text-${changeId}" placeholder="Add a comment..." style="width:100%; min-height:60px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:0.5rem; color:white; resize:vertical;"></textarea>
          <button onclick="
            const textarea = document.getElementById('comment-text-${changeId}');
            const text = textarea.value.trim();
            if (text) {
              annotations.addComment('${changeId}', text);
              textarea.value = '';
              this.closest('.comment-section').outerHTML = annotations.renderCommentUI('${changeId}');
            }
          " style="margin-top:0.5rem; padding:0.5rem 1rem; background:#3b82f6; color:white; border:none; border-radius:6px; cursor:pointer;">Add Comment</button>
        </div>
      </div>
    `;
    
    return html;
  }
}
