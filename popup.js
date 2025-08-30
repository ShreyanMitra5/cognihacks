// Focus Timer Popup Manager
class FocusTimerPopup {
  constructor() {
    this.currentState = {
      isAuthenticated: false,
      isPlaying: false,
      currentMood: null,
      timer: {
        running: false,
        remaining: 25 * 60,
        duration: 25 * 60,
        minutes: 25,
        seconds: 0
      }
    };
    
    // Listen for state updates from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'STATE_UPDATED') {
        this.currentState = {
          ...this.currentState,
          ...message.data
        };
        this.updateUI();
      }
    });
    
    this.init();
  }

  init() {
    this.initializeElements();
    this.bindEvents();
    this.initialize();
  }

  initializeElements() {
    this.elements = {
      // Auth
      authBtn: document.getElementById('authBtn'),
      authStatus: document.getElementById('authStatus'),
      
      // Timer
      timerDisplay: document.getElementById('timerDisplay'),
      timerProgress: document.getElementById('timerProgress'),
      startBtn: document.getElementById('startBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      stopBtn: document.getElementById('stopBtn'),
      
      // Music
      playPauseBtn: document.getElementById('playPauseBtn'),
      prevBtn: document.getElementById('prevBtn'),
      nextBtn: document.getElementById('nextBtn'),
      
      // Playlists
      energeticBtn: document.getElementById('energeticBtn'),
      sleepBtn: document.getElementById('sleepBtn'),
      ambientBtn: document.getElementById('ambientBtn'),
      chillBtn: document.getElementById('chillBtn'),
      
      // Status
      statusText: document.getElementById('statusText'),
      loading: document.getElementById('loading'),
      message: document.getElementById('message')
    };

    // Check if all required elements exist
    const missingElements = Object.entries(this.elements)
      .filter(([name, element]) => !element)
      .map(([name]) => name);

    if (missingElements.length > 0) {
      console.warn('Some UI elements are missing:', missingElements);
      // Don't show error message, just log warning
    }

    return true;
  }

  bindEvents() {
    // Collapse button
    const collapseBtn = document.getElementById('collapseBtn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        const container = document.querySelector('.container');
        container.classList.toggle('collapsed');
      });
    }

    // Auth
    if (this.elements.authBtn) {
      this.elements.authBtn.addEventListener('click', () => this.authenticate());
    }
    
    // Timer controls
    if (this.elements.startBtn) {
      this.elements.startBtn.addEventListener('click', () => {
        if (this.elements.startBtn.textContent === 'RESUME') {
          this.resumeTimer();
        } else {
          this.startTimer();
        }
      });
    }
    
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.addEventListener('click', () => this.pauseTimer());
    }
    
    if (this.elements.stopBtn) {
      this.elements.stopBtn.addEventListener('click', () => this.stopTimer());
    }
    
    // Playlist buttons
    if (this.elements.energeticBtn) {
      this.elements.energeticBtn.addEventListener('click', () => this.playMoodMusic('energetic'));
    }
    if (this.elements.sleepBtn) {
      this.elements.sleepBtn.addEventListener('click', () => this.playMoodMusic('sleep'));
    }
    if (this.elements.ambientBtn) {
      this.elements.ambientBtn.addEventListener('click', () => this.playMoodMusic('ambient'));
    }
    if (this.elements.chillBtn) {
      this.elements.chillBtn.addEventListener('click', () => this.playMoodMusic('chill'));
    }
    
    // Music controls
    if (this.elements.playPauseBtn) {
      this.elements.playPauseBtn.addEventListener('click', () => this.togglePlayback());
    }
    if (this.elements.prevBtn) {
      this.elements.prevBtn.addEventListener('click', () => this.previousTrack());
    }
    if (this.elements.nextBtn) {
      this.elements.nextBtn.addEventListener('click', () => this.nextTrack());
    }
    
    // Timer display events
    if (this.elements.timerDisplay) {
      this.elements.timerDisplay.addEventListener('click', () => this.makeTimerEditable());
      this.elements.timerDisplay.addEventListener('blur', () => this.saveTimerValue());
      this.elements.timerDisplay.addEventListener('keydown', (e) => this.handleTimerKeydown(e));
    }
  }

  async initialize() {
    try {
      this.showLoading();
      const response = await this.sendMessage({ type: 'GET_STATE' });
      
      if (response.success) {
        this.currentState = {
          ...this.currentState,
          ...response
        };
        this.updateUI();
      }
    } catch (error) {
      console.error('Failed to initialize:', error);
      this.showMessage('Failed to initialize', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async authenticate() {
    try {
      this.showLoading();
      if (this.elements.authBtn) {
        this.elements.authBtn.disabled = true;
      }
      
      const response = await this.sendMessage({ type: 'AUTHENTICATE' });
      
      if (response.success) {
        this.currentState.isAuthenticated = true;
        this.updateUI();
        this.showMessage('Connected to Spotify!', 'success');
      } else {
        throw new Error(response.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      this.showMessage(error.message, 'error');
    } finally {
      this.hideLoading();
      if (this.elements.authBtn) {
        this.elements.authBtn.disabled = false;
      }
    }
  }

  async startTimer() {
    try {
      const duration = Math.ceil(this.currentState.timer.duration / 60) || 25;
      const response = await this.sendMessage({ type: 'START_TIMER', duration });
      
      if (response.success) {
        this.currentState.timer.running = true;
        this.currentState.timer.remaining = this.currentState.timer.duration;
        
        // Update UI
        this.updateUI();
        this.showWebpageWidget();
        this.startLocalTimer();
        this.showMessage('Timer started!', 'success');
        this.updateStatus('Focus mode - stay productive!');
      }
    } catch (error) {
      console.error('Failed to start timer:', error);
      this.showMessage('Failed to start timer', 'error');
    }
  }

  async pauseTimer() {
    try {
      const response = await this.sendMessage({ type: 'PAUSE_TIMER' });
      
      if (response.success) {
        this.currentState.timer.running = false;
        
        // Update UI
        this.updateUI();
        this.pauseWebpageWidget();
        this.stopLocalTimer();
        this.showMessage('Timer paused', 'success');
        this.updateStatus('Timer paused');
      }
    } catch (error) {
      console.error('Failed to pause timer:', error);
      this.showMessage('Failed to pause timer', 'error');
    }
  }

  async resumeTimer() {
    try {
      const response = await this.sendMessage({ type: 'RESUME_TIMER' });
      
      if (response.success) {
        this.currentState.timer.running = true;
        
        // Update UI
        this.updateUI();
        this.resumeWebpageWidget();
        this.startLocalTimer();
        this.showMessage('Timer resumed', 'success');
        this.updateStatus('Focus mode - stay productive!');
      }
    } catch (error) {
      console.error('Failed to resume timer:', error);
      this.showMessage('Failed to resume timer', 'error');
    }
  }

  async stopTimer() {
    try {
      const response = await this.sendMessage({ type: 'STOP_TIMER' });
      
      if (response.success) {
        this.currentState.timer.running = false;
        this.currentState.timer.remaining = this.currentState.timer.duration;
        
        // Update UI
        this.updateUI();
        this.updateTimerProgress();
        this.hideWebpageWidget();
        this.stopLocalTimer();
        this.showMessage('Timer stopped', 'success');
        this.updateStatus('Ready to focus');
      }
    } catch (error) {
      console.error('Failed to stop timer:', error);
      this.showMessage('Failed to stop timer', 'error');
    }
  }

  async playMoodMusic(mood) {
    try {
      this.showLoading();
      
      // Update active button
      this.updateActivePlaylistButton(mood);
      
      const response = await this.sendMessage({ type: 'PLAY_MOOD', mood });
      
      if (response.success) {
        this.currentState.isPlaying = true;
        this.currentState.currentMood = mood;
        this.updateMusicControls();
        this.showMessage(`Playing ${mood} music!`, 'success');
        this.updateStatus(`Now playing ${mood} vibes`);
      } else {
        throw new Error(response.error || 'Failed to play mood music');
      }
    } catch (error) {
      console.error('Failed to play mood music:', error);
      this.showMessage(error.message, 'error');
    } finally {
      this.hideLoading();
    }
  }

  updateActivePlaylistButton(mood) {
    // Remove active class from all buttons
    [this.elements.energeticBtn, this.elements.sleepBtn, this.elements.ambientBtn, this.elements.chillBtn].forEach(btn => {
      if (btn) {
        btn.classList.remove('active');
      }
    });
    
    // Add active class to selected button
    switch(mood) {
      case 'energetic':
        if (this.elements.energeticBtn) this.elements.energeticBtn.classList.add('active');
        break;
      case 'sleep':
        if (this.elements.sleepBtn) this.elements.sleepBtn.classList.add('active');
        break;
      case 'ambient':
        if (this.elements.ambientBtn) this.elements.ambientBtn.classList.add('active');
        break;
      case 'chill':
        if (this.elements.chillBtn) this.elements.chillBtn.classList.add('active');
        break;
    }
  }

  async togglePlayback() {
    try {
      const response = await this.sendMessage({ type: 'TOGGLE_PLAYBACK' });
      
      if (response.success) {
        this.currentState.isPlaying = !this.currentState.isPlaying;
        this.updateMusicControls();
        
        if (this.currentState.isPlaying) {
          this.showMessage('Music resumed', 'success');
          this.updateStatus('Music playing');
        } else {
          this.showMessage('Music paused', 'success');
          this.updateStatus('Music paused');
        }
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error);
      this.showMessage('Failed to control playback', 'error');
    }
  }

  async nextTrack() {
    try {
      const response = await this.sendMessage({ type: 'NEXT_TRACK' });
      
      if (response.success) {
        this.showMessage('Next track', 'success');
      }
    } catch (error) {
      console.error('Failed to skip track:', error);
      this.showMessage('Failed to skip track', 'error');
    }
  }

  async previousTrack() {
    try {
      const response = await this.sendMessage({ type: 'PREVIOUS_TRACK' });
      
      if (response.success) {
        this.showMessage('Previous track', 'success');
      }
    } catch (error) {
      console.error('Failed to go to previous track:', error);
      this.showMessage('Failed to go to previous track', 'error');
    }
  }

  updateUI() {
    // Update timer display and progress
    this.updateTimerDisplay();
    this.updateTimerProgress();
    
    // Update timer controls
    if (this.elements.startBtn && this.elements.pauseBtn && this.elements.stopBtn) {
      const isRunning = this.currentState.timer.running;
      const remaining = this.currentState.timer.remaining;
      const duration = this.currentState.timer.duration;

      // Start button
      this.elements.startBtn.disabled = isRunning;
      this.elements.startBtn.textContent = isRunning ? 'RUNNING' : (remaining < duration ? 'RESUME' : 'START');
      this.elements.startBtn.classList.toggle('primary', !isRunning);

      // Pause button
      this.elements.pauseBtn.disabled = !isRunning;

      // Stop button
      this.elements.stopBtn.disabled = !isRunning && remaining === duration;
    }
    
    if (this.currentState.isAuthenticated) {
      if (this.elements.authStatus) {
        this.elements.authStatus.textContent = 'Connected';
        this.elements.authStatus.classList.add('connected');
      }
      if (this.elements.authBtn) {
        this.elements.authBtn.style.display = 'none';
      }
      
      // Show main content, hide auth section
      const authSection = document.getElementById('authSection');
      const mainContent = document.getElementById('mainContent');
      if (authSection) authSection.style.display = 'none';
      if (mainContent) mainContent.style.display = 'block';
      
      // Enable music controls when authenticated
      if (this.elements.prevBtn) this.elements.prevBtn.disabled = false;
      if (this.elements.nextBtn) this.elements.nextBtn.disabled = false;
      if (this.elements.playPauseBtn) this.elements.playPauseBtn.disabled = false;
    } else {
      if (this.elements.authStatus) {
        this.elements.authStatus.textContent = 'Not Connected';
        this.elements.authStatus.classList.remove('connected');
      }
      if (this.elements.authBtn) {
        this.elements.authBtn.style.display = 'block';
      }
      
      // Show auth section, hide main content
      const authSection = document.getElementById('authSection');
      const mainContent = document.getElementById('mainContent');
      if (authSection) authSection.style.display = 'block';
      if (mainContent) mainContent.style.display = 'none';
      
      // Disable music controls when not authenticated
      if (this.elements.prevBtn) this.elements.prevBtn.disabled = true;
      if (this.elements.nextBtn) this.elements.nextBtn.disabled = true;
      if (this.elements.playPauseBtn) this.elements.playPauseBtn.disabled = true;
    }
    
    this.updateMusicControls();
    this.updateTimerDisplay();
  }

  updateMusicControls() {
    if (this.elements.playPauseBtn) {
      if (this.currentState.isPlaying) {
        this.elements.playPauseBtn.textContent = '⏸';
        this.elements.playPauseBtn.title = 'Pause';
        this.elements.playPauseBtn.disabled = false;
      } else {
        this.elements.playPauseBtn.textContent = '▶';
        this.elements.playPauseBtn.title = 'Play';
        this.elements.playPauseBtn.disabled = false;
      }
    }
    
    // Enable music control buttons when authenticated
    if (this.currentState.isAuthenticated) {
      if (this.elements.prevBtn) this.elements.prevBtn.disabled = false;
      if (this.elements.nextBtn) this.elements.nextBtn.disabled = false;
      if (this.elements.playPauseBtn) this.elements.playPauseBtn.disabled = false;
    }
  }

  updateTimerDisplay() {
    if (this.elements.timerDisplay) {
      const minutes = Math.floor(this.currentState.timer.remaining / 60);
      const seconds = this.currentState.timer.remaining % 60;
      this.elements.timerDisplay.textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }



  updateTimerProgress() {
    if (this.elements.timerProgress) {
      const progress = ((this.currentState.timer.duration - this.currentState.timer.remaining) / this.currentState.timer.duration) * 100;
      this.elements.timerProgress.style.width = `${progress}%`;
    }
  }

  makeTimerEditable() {
    if (this.currentState.timer.running) return; // Don't allow editing while running
    
    if (this.elements.timerDisplay) {
      const timerDisplay = this.elements.timerDisplay;
      timerDisplay.contentEditable = true;
      timerDisplay.focus();
      timerDisplay.classList.add('editing');
      
      // Select all text for easy editing
      const range = document.createRange();
      range.selectNodeContents(timerDisplay);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  saveTimerValue() {
    if (this.elements.timerDisplay) {
      const timerDisplay = this.elements.timerDisplay;
      timerDisplay.contentEditable = false;
      timerDisplay.classList.remove('editing');
      
      // Parse the input value
      const inputText = timerDisplay.textContent.trim();
      const timeMatch = inputText.match(/(\d+):(\d+)/);
      
      if (timeMatch) {
        const minutes = parseInt(timeMatch[1]);
        const seconds = parseInt(timeMatch[2]);
        
        if (minutes >= 0 && minutes <= 120 && seconds >= 0 && seconds <= 59) {
          this.currentState.timer.minutes = minutes;
          this.currentState.timer.seconds = seconds;
          this.currentState.timer.duration = (minutes * 60) + seconds;
          this.currentState.timer.remaining = this.currentState.timer.duration;
          
          // Update display with proper formatting
          timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          
          // Update progress bar
          this.updateTimerProgress();
          
          console.log(`✅ Timer set to ${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          // Invalid time, reset to current value
          this.updateTimerDisplay();
        }
      } else {
        // Invalid format, reset to current value
        this.updateTimerDisplay();
      }
    }
  }

  handleTimerKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (this.elements.timerDisplay) {
        this.elements.timerDisplay.blur(); // This will trigger saveTimerValue
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (this.elements.timerDisplay) {
        this.elements.timerDisplay.classList.remove('editing');
        this.elements.timerDisplay.contentEditable = false;
        this.updateTimerDisplay(); // Reset to current value
      }
    }
  }

  showWebpageWidget() {
    // Send message to content script to show the widget
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'SHOW_WIDGET',
          timer: this.currentState.timer
        }).catch(error => {
          console.log('⚠️ Could not show widget:', error);
          // Try to inject content script if it's not ready
          this.injectContentScript();
        });
      }
    });
  }

  hideWebpageWidget() {
    // Send message to content script to hide the widget
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'HIDE_WIDGET' })
          .catch(() => console.log('⚠️ Could not hide widget'));
      }
    });
  }

  pauseWebpageWidget() {
    // Send message to content script to pause the widget
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'PAUSE_TIMER' })
          .then(() => console.log('✅ Widget paused on webpage'))
          .catch(() => console.log('⚠️ Could not hide widget (content script not ready)'));
      }
    });
  }

  resumeWebpageWidget() {
    // Send message to content script to resume the widget
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'RESUME_TIMER' })
          .then(() => console.log('✅ Widget resumed on webpage'))
          .catch(() => console.log('⚠️ Could not hide widget (content script not ready)'));
      }
    });
  }

  updateStatus(message) {
    if (this.elements.statusText) {
      this.elements.statusText.textContent = message;
    }
  }

  showLoading() {
    if (this.elements.loading) {
      this.elements.loading.classList.add('show');
    }
  }

  hideLoading() {
    if (this.elements.loading) {
      this.elements.loading.classList.remove('show');
    }
  }

  showMessage(text, type = 'info') {
    if (this.elements.message) {
      const messageEl = this.elements.message;
      messageEl.textContent = text;
      messageEl.className = `message ${type}`;
      messageEl.classList.add('show');
      
      setTimeout(() => {
        messageEl.classList.remove('show');
      }, 3000);
    }
  }

  async sendMessage(message) {
    try {
      const response = await chrome.runtime.sendMessage(message);
      return response;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  updateWebpageWidget() {
    // Send current timer state to widget
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'UPDATE_TIMER',
          timer: this.currentState.timer
        }).catch(() => console.log('⚠️ Could not update widget'));
      }
    });
  }

  // Local timer management for UI updates
  startLocalTimer() {
    this.stopLocalTimer(); // Clear any existing timer
    
    // Request initial state from background
    this.sendMessage({ type: 'GET_STATE' }).then(response => {
      if (response.success) {
        this.currentState = {
          ...this.currentState,
          ...response
        };
        this.updateUI();
      }
    });
    
    this.localTimerInterval = setInterval(() => {
      if (this.currentState.timer.running && this.currentState.timer.remaining > 0) {
        this.currentState.timer.remaining--;
        
        // Update UI based on current state
        this.updateUI();
        
        // Update widget if visible
        this.updateWebpageWidget();
        
        if (this.currentState.timer.remaining <= 0) {
          this.timerFinished();
        }
      }
    }, 1000); // Update every second
  }

  stopLocalTimer() {
    if (this.localTimerInterval) {
      clearInterval(this.localTimerInterval);
      this.localTimerInterval = null;
    }
  }

  timerFinished() {
    this.currentState.timer.running = false;
    this.stopLocalTimer();
    
    // Reset UI
    if (this.elements.startBtn) {
      this.elements.startBtn.disabled = false;
      this.elements.startBtn.textContent = 'START';
      this.elements.startBtn.classList.add('primary');
    }
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.disabled = true;
    }
    if (this.elements.stopBtn) {
      this.elements.stopBtn.disabled = true;
    }
    
    this.showMessage('Focus session completed!', 'success');
    this.updateStatus('Great job! Take a break.');
    
    // Hide widget
    this.hideWebpageWidget();
  }

  async injectContentScript() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) return;

      // Inject the script directly
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Create widget container
          const widget = document.createElement('div');
          widget.id = 'archon-timer-widget';
          widget.style.cssText = `
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
          `;

          widget.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; height: 2px; background: #667eea; transition: width 1s linear; width: 0%;"></div>
            <div style="font-size: 15px; font-weight: 500; color: #fff; letter-spacing: 0.5px;">25:00</div>
            <button style="width: 24px; height: 24px; background: rgba(255, 255, 255, 0.1); border: none; border-radius: 6px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;">⏸</button>
          `;

          // Add to page
          document.body.appendChild(widget);

          // Make draggable
          let isDragging = false;
          let startX, startY, startLeft, startTop;

          widget.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = widget.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            widget.style.cursor = 'grabbing';
          });

          document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            widget.style.left = (startLeft + deltaX) + 'px';
            widget.style.top = (startTop + deltaY) + 'px';
            widget.style.right = 'auto';
            widget.style.bottom = 'auto';
          });

          document.addEventListener('mouseup', () => {
            if (isDragging) {
              isDragging = false;
              widget.style.cursor = 'grab';
            }
          });
        }
      });

      console.log('✅ Widget injected');
      
      // Wait a moment then try to show widget again
      setTimeout(() => this.showWebpageWidget(), 100);
    } catch (error) {
      console.error('⚠️ Could not inject widget:', error);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new FocusTimerPopup();
});
