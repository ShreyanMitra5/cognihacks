

class FloatingTimer {
    constructor() {
        this.timer = null;
        this.isRunning = false;
        this.isPaused = false;
        this.duration = 25 * 60; // 25 minutes in seconds
        this.remaining = this.duration;
        
        this.init();
    }
    
    init() {
        this.setupDragAndDrop();
        this.setupTimerControls();
        this.updateProgressBar();
        this.updateDisplay();
    }
    
    setupDragAndDrop() {
        const timer = document.getElementById('floatingTimer');
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        timer.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('pause-btn')) {
                return;
            }
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(timer.style.left) || 100;
            startTop = parseInt(timer.style.top) || 100;
            
            timer.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            timer.style.left = (startLeft + deltaX) + 'px';
            timer.style.top = (startTop + deltaY) + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                timer.style.cursor = 'move';
            }
        });
    }
    
    setupTimerControls() {
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
    }
    
    togglePause() {
        if (!this.isRunning) return;
        
        if (this.isPaused) {
            this.resumeTimer();
        } else {
            this.pauseTimer();
        }
    }
    
    startTimer() {
        if (this.isRunning && !this.isPaused) return;
        
        if (this.isPaused) {
            // Resume from pause
            this.resumeTimer();
        } else {
            // Start new timer
            this.isRunning = true;
            this.isPaused = false;
            this.remaining = this.duration;
            
            this.timer = setInterval(() => {
                this.remaining--;
                this.updateDisplay();
                this.updateProgressBar();
                
                if (this.remaining <= 0) {
                    this.completeTimer();
                }
            }, 1000);
            
            this.updateDisplay();
            this.updatePauseButton();
        }
    }
    
    pauseTimer() {
        if (!this.isRunning || this.isPaused) return;
        
        clearInterval(this.timer);
        this.isPaused = true;
        this.updatePauseButton();
    }
    
    resumeTimer() {
        if (!this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        this.timer = setInterval(() => {
            this.remaining--;
            this.updateDisplay();
            this.updateProgressBar();
            
            if (this.remaining <= 0) {
                this.completeTimer();
            }
        }, 1000);
        
        this.updatePauseButton();
    }
    
    stopTimer() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.isPaused = false;
        this.remaining = this.duration;
        this.updateDisplay();
        this.updateProgressBar();
        this.updatePauseButton();
    }
    
    completeTimer() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.isPaused = false;
        this.remaining = 0;
        this.updateDisplay();
        this.updateProgressBar();
        this.updatePauseButton();
        
        // Show completion notification
        this.showNotification('Focus session complete! 🎉');
    }
    
    updatePauseButton() {
        const pauseBtn = document.getElementById('pauseBtn');
        if (!pauseBtn) return;
        
        if (this.isRunning && !this.isPaused) {
            pauseBtn.textContent = '⏸';
            pauseBtn.title = 'Pause Timer';
            pauseBtn.disabled = false;
        } else if (this.isPaused) {
            pauseBtn.textContent = '▶';
            pauseBtn.title = 'Resume Timer';
            pauseBtn.disabled = false;
        } else {
            pauseBtn.textContent = '⏸';
            pauseBtn.title = 'Pause Timer';
            pauseBtn.disabled = true;
        }
    }
    
    updateDisplay() {
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            const minutes = Math.floor(this.remaining / 60);
            const seconds = this.remaining % 60;
            timerDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    updateProgressBar() {
        const progressBar = document.getElementById('progressBarTop');
        if (progressBar) {
            const progress = ((this.duration - this.remaining) / this.duration) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 14px;
            z-index: 10001;
            animation: slideIn 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Public methods for external control
    start() {
        this.startTimer();
    }
    
    pause() {
        this.pauseTimer();
    }
    
    resume() {
        this.resumeTimer();
    }
    
    stop() {
        this.stopTimer();
    }
    
    setTime(minutes, seconds = 0) {
        this.duration = (minutes * 60) + seconds;
        this.remaining = this.duration;
        this.updateDisplay();
        this.updateProgressBar();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing Archon Focus Timer...');
    
    // Add slideIn animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize the timer
    const timer = new FloatingTimer();
    console.log('✅ Archon Focus Timer initialized successfully');
    
    // Make timer globally accessible for external control
    window.archonTimer = timer;
});
