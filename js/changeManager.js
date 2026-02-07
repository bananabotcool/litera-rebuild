/**
 * Change Manager - Accept/Reject changes
 */

export class ChangeManager {
  constructor() {
    this.states = this.loadStates();
  }
  
  loadStates() {
    const saved = localStorage.getItem('litera-change-states');
    return saved ? JSON.parse(saved) : {};
  }
  
  saveStates() {
    localStorage.setItem('litera-change-states', JSON.stringify(this.states));
  }
  
  acceptChange(changeId) {
    this.states[changeId] = 'accepted';
    this.saveStates();
    this.updateUI(changeId);
  }
  
  rejectChange(changeId) {
    this.states[changeId] = 'rejected';
    this.saveStates();
    this.updateUI(changeId);
  }
  
  getState(changeId) {
    return this.states[changeId] || 'pending';
  }
  
  updateUI(changeId) {
    const state = this.getState(changeId);
    const element = document.querySelector(`[data-change-id="${changeId}"]`);
    if (element) {
      element.classList.remove('accepted', 'rejected', 'pending');
      element.classList.add(state);
    }
  }
  
  renderActions(changeId) {
    const state = this.getState(changeId);
    return `
      <div class="change-actions">
        <button class="btn-accept ${state === 'accepted' ? 'active' : ''}" 
                onclick="changeManager.acceptChange('${changeId}')">
          ✓ Accept
        </button>
        <button class="btn-reject ${state === 'rejected' ? 'active' : ''}" 
                onclick="changeManager.rejectChange('${changeId}')">
          ✕ Reject
        </button>
        <span class="state-badge ${state}">${state}</span>
      </div>
    `;
  }
}
