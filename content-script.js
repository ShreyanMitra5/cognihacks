// Widget class for managing the floating timer
class TimerWidget {
  constructor() {
    this.widget = null;
    this.timerDisplay = null;
    this.progressBar = null;
    this.pauseBtn = null;
    this.createWidget();
    this.setupMessageListener();
  }

  createWidget() {
    // Create widget container
    this.widget = document.createElement('div');
    this.widget.id = 'archon-timer-widget';
    this.widget.style.cssText = `
      all: initial;
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 160px;
      height: 44px;
      background: rgba(0, 0, 0, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      cursor: move;
      user-select: none;
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
    this.currentTimer = timer;
    
    // Clear any existing interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    // Update immediately
    this.updateDisplay();
    
    // If timer is running, start local updates
    if (timer.running) {
      this.updateInterval = setInterval(() => {
        if (this.currentTimer.remaining > 0) {
          this.currentTimer.remaining--;
          this.updateDisplay();
        }
      }, 1000);
    }
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