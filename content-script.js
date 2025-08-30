// Widget class for managing the floating timer and modal
class TimerWidget {
  constructor() {
    this.widget = null;
    this.timerDisplay = null;
    this.progressBar = null;
    this.pauseBtn = null;
    this.modal = null;
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
    
    // Create modal (hidden initially)
    this.createModal();
    
    // Re-inject if body changes
    const observer = new MutationObserver(() => {
      if (!document.body.contains(this.widget)) {
        this.createWidget();
      }
      if (!document.body.contains(this.modal)) {
        this.createModal();
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

  createModal() {
    this.modal = document.createElement('div');
    this.modal.id = 'archon-modal';
    this.modal.style.cssText = `
      all: initial !important;
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      width: 600px !important;
      background: rgba(0, 0, 0, 0.95) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 16px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
      z-index: 2147483647 !important;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
      padding: 24px !important;
      color: #fff !important;
      display: none !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      text-align: center !important;
      position: relative !important;
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      position: absolute !important;
      top: -12px !important;
      right: -12px !important;
      width: 24px !important;
      height: 24px !important;
      border-radius: 50% !important;
      border: none !important;
      background: rgba(255, 255, 255, 0.1) !important;
      color: #fff !important;
      cursor: pointer !important;
      font-size: 18px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.2s ease !important;
    `;
    closeButton.addEventListener('click', () => this.hideModal());

    const title = document.createElement('h2');
    title.textContent = 'Focus Session Complete!';
    title.style.cssText = `
      font-size: 24px !important;
      margin-bottom: 24px !important;
      background: linear-gradient(135deg, #fff, rgba(255, 255, 255, 0.8)) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    `;

    const stats = document.createElement('div');
    stats.style.cssText = `
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 20px !important;
      margin-bottom: 24px !important;
    `;

    const avgScore = document.createElement('div');
    avgScore.innerHTML = `
      <div style="font-size: 48px !important; font-weight: 300 !important; margin-bottom: 8px !important;
           background: linear-gradient(135deg, #fff, rgba(255, 255, 255, 0.8)) !important;
           -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;">
        <span id="archon-avg-score">0</span>%
      </div>
      <div style="font-size: 14px !important; opacity: 0.6 !important;">Average Focus</div>
    `;

    const currentScore = document.createElement('div');
    currentScore.innerHTML = `
      <div style="font-size: 48px !important; font-weight: 300 !important; margin-bottom: 8px !important;
           background: linear-gradient(135deg, #fff, rgba(255, 255, 255, 0.8)) !important;
           -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;">
        <span id="archon-current-score">0</span>%
      </div>
      <div style="font-size: 14px !important; opacity: 0.6 !important;">Current Focus</div>
    `;

    const chartContainer = document.createElement('div');
    chartContainer.style.cssText = `
      height: 300px !important;
      background: rgba(255, 255, 255, 0.02) !important;
      border-radius: 12px !important;
      padding: 20px !important;
      border: 1px solid rgba(255, 255, 255, 0.06) !important;
    `;
    chartContainer.innerHTML = '<canvas id="archon-chart"></canvas>';

    stats.appendChild(avgScore);
    stats.appendChild(currentScore);
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(stats);
    modalContent.appendChild(chartContainer);
    this.modal.appendChild(modalContent);

    document.body.appendChild(this.modal);
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
          this.hide();
          break;
        case 'UPDATE_TIMER':
          this.updateTimer(message.timer);
          break;
        case 'PAUSE_TIMER':
          this.pauseBtn.textContent = '▶';
          break;
        case 'RESUME_TIMER':
          this.pauseBtn.textContent = '⏸';
          break;
        case 'SHOW_RESULTS':
          this.showResults(message.data);
          break;
      }
      sendResponse({ success: true });
      return true;
    });
  }

  async showResults(data) {
    try {
      // Get current flow score
      const response = await fetch('https://481606634176.ngrok-free.app/metrics');
      const currentData = await response.json();
      const currentScore = Math.round(currentData.flow_score * 100);

      // Update scores
      document.getElementById('archon-avg-score').textContent = data.averageScore;
      document.getElementById('archon-current-score').textContent = currentScore;

      // Create chart
      const ctx = document.getElementById('archon-chart').getContext('2d');
      // Create chart
      new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: data.scoreData.map((_, i) => `${i + 1}`),
          datasets: [{
            label: 'Focus Score',
            data: data.scoreData.map(d => d.score * 100),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)'
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)'
              }
            }
          }
        }
      });

      // Show modal
      this.modal.style.display = 'block';
    } catch (error) {
      console.error('Failed to show results:', error);
    }
  }

  hideModal() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
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