// Widget class for managing the floating timer
class TimerWidget {
  constructor() {
    this.widget = null;
    this.timerDisplay = null;
    this.progressBar = null;
    this.pauseBtn = null;
    this.initialized = false;
    this.setupMessageListener();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    
    // Create and inject widget
    this.createWidget();
    
    // Re-inject if body changes
    const observer = new MutationObserver(() => {
      if (!document.body.contains(this.widget)) {
        this.createWidget();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  createWidget() {
    // Create widget container
    this.widget = document.createElement('div');
    this.widget.id = 'archon-timer-widget';
    this.widget.style.cssText = `
      all: initial !important;
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      width: 160px !important;
      height: 44px !important;
      background: rgba(0, 0, 0, 0.85) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 12px !important;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4) !important;
      z-index: 2147483647 !important;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 0 12px !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
      cursor: move !important;
      user-select: none !important;
      pointer-events: auto !important;
      visibility: visible !important;
      opacity: 1 !important;
      transform: none !important;
      margin: 0 !important;
      max-width: none !important;
      max-height: none !important;
      clip: auto !important;
    `;

    // Create progress bar
    this.progressBar = document.createElement('div');
    this.progressBar.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      height: 2px;
      background: #667eea;
      transition: width 1s linear;
      width: 0%;
      border-top-left-radius: 12px;
    `;

    // Create timer display
    this.timerDisplay = document.createElement('div');
    this.timerDisplay.style.cssText = `
      font-size: 15px;
      font-weight: 500;
      color: #fff;
      letter-spacing: 0.5px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `;
    this.timerDisplay.textContent = '25:00';

    // Create pause button
    this.pauseBtn = document.createElement('button');
    this.pauseBtn.style.cssText = `
      width: 24px;
      height: 24px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 6px;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.2s ease;
      padding: 0;
      margin: 0;
    `;
    this.pauseBtn.textContent = '⏸';
    this.pauseBtn.addEventListener('click', () => this.togglePause());

    // Add elements to widget
    this.widget.appendChild(this.progressBar);
    this.widget.appendChild(this.timerDisplay);
    this.widget.appendChild(this.pauseBtn);

    // Add widget to page
    document.body.appendChild(this.widget);

    // Setup drag functionality
    this.setupDrag();
  }

  setupDrag() {
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    this.widget.addEventListener('mousedown', (e) => {
      if (e.target === this.pauseBtn) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = this.widget.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      this.widget.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      this.widget.style.left = (startLeft + deltaX) + 'px';
      this.widget.style.top = (startTop + deltaY) + 'px';
      this.widget.style.right = 'auto';
      this.widget.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        this.widget.style.cursor = 'move';
      }
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'SHOW_WIDGET':
          this.show();
          this.updateTimer(message.timer);
          break;
        case 'HIDE_WIDGET':
          if (this.updateInterval) {
            clearInterval(this.updateInterval);
          }
          this.hide();
          break;
        case 'UPDATE_TIMER':
          this.updateTimer(message.timer);
          break;
        case 'PAUSE_TIMER':
          if (this.updateInterval) {
            clearInterval(this.updateInterval);
          }
          this.pauseBtn.textContent = '▶';
          if (this.currentTimer) {
            this.currentTimer.running = false;
          }
          break;
        case 'RESUME_TIMER':
          this.pauseBtn.textContent = '⏸';
          if (this.currentTimer) {
            this.currentTimer.running = true;
            this.updateTimer(this.currentTimer);
          }
          break;
      }
      sendResponse({ success: true });
      return true;
    });
  }

  show() {
    this.widget.style.display = 'flex';
  }

  hide() {
    this.widget.style.display = 'none';
  }

  updateTimer(timer) {
    if (!timer) return;
    
    // Store the timer state
    this.currentTimer = {
      ...timer,
      running: timer.running,
      remaining: timer.remaining,
      duration: timer.duration
    };
    
    // Update immediately
    this.updateDisplay();
  }

  updateDisplay() {
    const minutes = Math.floor(this.currentTimer.remaining / 60);
    const seconds = this.currentTimer.remaining % 60;
    this.timerDisplay.textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const progress = ((this.currentTimer.duration - this.currentTimer.remaining) / this.currentTimer.duration) * 100;
    this.progressBar.style.width = `${progress}%`;

    this.pauseBtn.textContent = this.currentTimer.running ? '⏸' : '▶';
  }

  togglePause() {
    const message = { 
      type: this.pauseBtn.textContent === '⏸' ? 'PAUSE_TIMER' : 'RESUME_TIMER' 
    };
    chrome.runtime.sendMessage(message);
  }
}

// Initialize widget when content script loads
new TimerWidget();