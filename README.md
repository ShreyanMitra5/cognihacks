# 🎯 Archon - Focus Timer

A Chrome extension that combines a Pomodoro timer with mood-based Spotify music and a floating desktop widget.

## ✨ Features

### 🕐 **Custom Timer Input**
- **Type any duration** from 1-120 minutes
- **Real-time updates** as you type
- **Input disabled** while timer is running
- **Auto-reset** when timer stops

### 🖥️ **Desktop Widget (NEW!)**
- **Automatically appears** when you start the timer
- **Bottom right corner** of your screen
- **Draggable** - move it anywhere
- **Music controls** - play/pause music, pause timer, stop timer
- **Auto-hides** when timer completes

### 🎵 **Mood-Based Music**
- **Energetic** - Rap, Jungle/Rally, Hip-hop
- **Sleep** - Slow, calming piano
- **Ambient** - Tree/forest sounds, rain, nature
- **Chill Study** - Chill study lofi playlist

### 🎨 **Modern UI**
- **Black & white** minimalist design
- **Draggable sections** - rearrange as you like
- **Frosted glass effects** and smooth animations
- **Responsive design** that works on any screen size

## 🚀 How to Test

### **Step 1: Install & Reload**
1. Go to `chrome://extensions/`
2. Find "Archon - Focus Timer"
3. Click **🔄 Reload** button
4. Wait for it to reload completely

### **Step 2: Test Custom Timer**
1. **Click the extension icon** to open popup
2. **Type any number** in the timer input (e.g., 45 for 45 minutes)
3. **Watch the display update** in real-time
4. **Click "Start"** to begin your session

### **Step 3: Watch for Desktop Widget**
1. **When you click "Start"**, a desktop widget appears in bottom right
2. **Drag it around** your screen
3. **Use the controls**:
   - ▶/⏸ - Play/pause music
   - ⏸ - Pause timer
   - ⏹ - Stop timer
4. **Close it** with the × button

### **Step 4: Test Music**
1. **Click any mood button** (Energetic, Sleep, Ambient, Chill Study)
2. **Use music controls** in the popup or desktop widget
3. **Watch the status** update with current mood

## 🔧 Troubleshooting

### **CSP Errors Fixed**
- ✅ **No more inline scripts**
- ✅ **All JavaScript in external files**
- ✅ **Proper event listeners**

### **Desktop Widget Not Appearing?**
1. **Check console** for errors
2. **Make sure timer actually started** (button should say "RUNNING")
3. **Look in bottom right corner** of your screen
4. **Try dragging the popup** to see if widget is behind it

### **Timer Not Working?**
1. **Check console** for error messages
2. **Verify Spotify connection** (click "Connect" if needed)
3. **Make sure you're testing from the extension popup**, not a regular webpage

### **Music Not Playing?**
1. **Check Spotify is open** on your device
2. **Verify authentication** in the extension
3. **Check console** for API errors
4. **Try different mood playlists**

## 📁 File Structure

```
├── popup.html          # Main extension popup
├── popup.js            # Popup functionality
├── background.js       # Background service worker
├── manifest.json       # Extension configuration
├── floating-timer.html # Standalone floating timer (for testing)
├── floating-timer.js   # Floating timer functionality
└── test-floating-timer.html # Test page
```

## 🎯 Expected Behavior

- ✅ **Custom timer input** works (type any number 1-120)
- ✅ **Desktop widget appears** automatically when timer starts
- ✅ **Widget is draggable** around your screen
- ✅ **Music controls work** in both popup and widget
- ✅ **No CSP errors** in console
- ✅ **Timer counts down** properly
- ✅ **Progress bar updates** in real-time

## 🚨 Important Notes

- **Test from extension popup**, not regular web pages
- **Spotify must be open** for music to work
- **Desktop widget appears on the webpage**, not as a system overlay
- **All sections are draggable** - rearrange as needed
- **Timer input disabled** while running to prevent conflicts

## 🎉 Success Indicators

When everything works correctly, you should see:
1. **No CSP errors** in console
2. **Desktop widget appears** in bottom right when timer starts
3. **Widget is fully functional** with music controls
4. **Custom timer duration** works as expected
5. **Smooth animations** and responsive UI

---

**Happy focusing! 🎯✨**
