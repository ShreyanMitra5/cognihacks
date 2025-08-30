// Spotify Mood Player Background Script
class SpotifyMoodPlayer {
  constructor() {
    this.clientId = '5eb5fd2d8bb14edb8cc7f632cbe718a1';
    this.redirectUri = chrome.identity.getRedirectURL('spotify-mood-player');
    console.log('Generated Redirect URI:', this.redirectUri);
    this.accessToken = null;
    this.refreshToken = null;
    this.currentPlaylist = null;
    this.isPlaying = false;
    this.timerRunning = false;
    this.timerDuration = 25 * 60; // 25 minutes in seconds
    this.timerRemaining = this.timerDuration;
    this.timerInterval = null;
    
    // Load saved timer state
    this.loadTimerState();
    
    // Curated playlists for different focus states
    this.moodPlaylists = {
      'energetic': '37i9dQZF1DX76Wlfdnj7AP', // Beast Mode - Rap, Jungle/Rally, Hip-hop
      'sleep': '37i9dQZF1DX8NTLI2TtZa6', // Deep Focus - Slow, calming piano
      'ambient': '37i9dQZF1DX5Vy6DFOcx00', // Lofi Hip Hop - Tree/forest sounds, rain, nature
      'chill': '37i9dQZF1DX3Ogo9pFvBkY' // Happy Hits - Chill study lofi playlist by Spotify
    };
    
    this.init();
  }

  async init() {
    // Load stored tokens
    const result = await chrome.storage.local.get(['accessToken', 'refreshToken']);
    this.accessToken = result.accessToken;
    this.refreshToken = result.refreshToken;
    
    if (this.accessToken) {
      await this.initializePlayer();
    }
  }

  async loadTimerState() {
    try {
      const result = await chrome.storage.local.get(['timerState']);
      if (result.timerState) {
        const { running, duration, remaining } = result.timerState;
        this.timerRunning = running;
        this.timerDuration = duration;
        this.timerRemaining = remaining;
        
        // If timer was running, resume it
        if (running && remaining > 0) {
          this.resumeTimer();
        }
      }
    } catch (error) {
      console.error('Failed to load timer state:', error);
    }
  }

  async saveTimerState() {
    try {
      await chrome.storage.local.set({
        timerState: {
          running: this.timerRunning,
          duration: this.timerDuration,
          remaining: this.timerRemaining
        }
      });
    } catch (error) {
      console.error('Failed to save timer state:', error);
    }
  }

  async authenticate() {
    try {
      console.log('Starting authentication flow...');
      
      if (!this.clientId) {
        throw new Error('Spotify client ID is not configured');
      }

      // Generate PKCE verifier and challenge
      const codeVerifier = this.generateRandomString(128);
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);
      const state = this.generateRandomString(16);
      
      // Store the code verifier for later use
      await chrome.storage.local.set({ codeVerifier });
      
      // Build the authorization URL
      const authUrl = new URL('https://accounts.spotify.com/authorize');
      authUrl.searchParams.append('client_id', this.clientId);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('redirect_uri', this.redirectUri);
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('code_challenge_method', 'S256');
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('scope', [
        'user-read-private',
        'user-read-email',
        'user-modify-playback-state',
        'user-read-playback-state',
        'user-read-currently-playing',
        'streaming',
        'playlist-read-private',
        'playlist-read-collaborative'
      ].join(' '));
      
      console.log('Launching auth flow with URL:', authUrl.toString());
      
      // Launch the auth flow
      const authResult = await new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow({
          url: authUrl.toString(),
          interactive: true
        }, (responseUrl) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(responseUrl);
          }
        });
      });
      
      if (!authResult) {
        throw new Error('Authentication was cancelled by user');
      }
      
      console.log('Auth result received, processing...');
      
      // Parse the response URL
      const url = new URL(authResult);
      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');
      const error = url.searchParams.get('error');
      
      // Check for errors
      if (error) {
        const errorDescription = url.searchParams.get('error_description') || error;
        throw new Error(`Spotify authorization failed: ${errorDescription}`);
      }
      
      // Verify state
      if (state !== returnedState) {
        throw new Error('State mismatch - possible security issue');
      }
      
      if (!code) {
        throw new Error('No authorization code received from Spotify');
      }
      
      console.log('Exchanging authorization code for tokens...');
      
      // Exchange the authorization code for tokens
      await this.exchangeCodeForTokens(code, codeVerifier);
      
      console.log('Authentication successful!');
      
    } catch (error) {
      console.error('Authentication failed:', error);
      
      // Clear any stored tokens on failure
      await chrome.storage.local.remove(['accessToken', 'refreshToken', 'codeVerifier']);
      this.accessToken = null;
      this.refreshToken = null;
      
      throw error;
    }
  }

  async exchangeCodeForTokens(code, codeVerifier) {
    try {
      console.log('Exchanging authorization code for tokens...');
      
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri,
          code_verifier: codeVerifier,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('Token exchange failed:', response.status, error);
        throw new Error(error.error_description || 
                       error.error || 
                       `Failed to exchange code for tokens (${response.status})`);
      }
      
      const data = await response.json().catch(error => {
        console.error('Failed to parse token response:', error);
        throw new Error('Invalid response from Spotify');
      });
      
      if (!data.access_token) {
        throw new Error('No access token received from Spotify');
      }
      
      console.log('Successfully obtained tokens');
      
      // Update instance properties
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token || this.refreshToken;
      
      // Store tokens
      await chrome.storage.local.set({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken
      });
      
      console.log('Tokens stored successfully');
      
      // Initialize the player with the new tokens
      await this.initializePlayer();
      
      return true;
      
    } catch (error) {
      console.error('Failed to exchange code for tokens:', error);
      
      // Clear any partial state on failure
      await chrome.storage.local.remove(['accessToken', 'refreshToken']);
      this.accessToken = null;
      this.refreshToken = null;
      
      throw error;
    }
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error_description || data.error);
    }
    
    this.accessToken = data.access_token;
    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
    }
    
    await chrome.storage.local.set({
      accessToken: this.accessToken,
      refreshToken: this.refreshToken
    });
  }

  async initializePlayer() {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }
    
    console.log('Player initialized with access token');
  }

  async playMoodPlaylist(mood) {
    try {
      if (!this.accessToken) {
        throw new Error('No access token available');
      }
      
      const playlistId = this.moodPlaylists[mood.toLowerCase()];
      if (!playlistId) {
        throw new Error(`No playlist found for mood: ${mood}`);
      }
      
      console.log(`🎵 Playing ${mood} music: ${playlistId}`);
      
      // Get available devices
      const devicesResponse = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      if (!devicesResponse.ok) {
        throw new Error('Failed to get devices');
      }
      
      const devices = await this.safeJsonParse(devicesResponse);
      const activeDevice = devices.devices?.find(device => device.is_active) || devices.devices?.[0];
      
      if (!activeDevice) {
        throw new Error(
          'No active Spotify device found. Please open Spotify on your computer or phone.'
        );
      }
      
      console.log(`📱 Using device: ${activeDevice.name}`);
      
      // Start playback with the playlist and enable shuffle for variety
      const playResponse = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${activeDevice.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          context_uri: `spotify:playlist:${playlistId}`,
          position_ms: 0
        })
      });
      
      if (!playResponse.ok) {
        throw new Error('Failed to start playback');
      }
      
      // Enable shuffle for better variety
      await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=true&device_id=${activeDevice.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      this.isPlaying = true;
      this.currentPlaylist = playlistId;
      console.log(`✅ Successfully started ${mood} music with shuffle enabled`);
      
    } catch (error) {
      console.error('Error playing mood playlist:', error);
      throw error;
    }
  }

  async togglePlayback() {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }
    
    try {
      // Get current playback state
      const stateResponse = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      // Handle no content (204) when nothing is playing
      if (stateResponse.status === 204) {
        console.log('No content - starting playback');
        const response = await fetch('https://api.spotify.com/v1/me/player/play', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to start playback');
        }
        
        this.isPlaying = true;
        return;
      }
      
      if (!stateResponse.ok) {
        throw new Error('Failed to get playback state');
      }
      
      const state = await this.safeJsonParse(stateResponse);
      const isCurrentlyPlaying = !state.is_playing;
      const action = isCurrentlyPlaying ? 'play' : 'pause';
      
      const response = await fetch(`https://api.spotify.com/v1/me/player/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} playback`);
      }
      
      this.isPlaying = isCurrentlyPlaying;
      
    } catch (error) {
      console.error('Toggle playback failed:', error);
      throw error;
    }
  }

  async nextTrack() {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }
    
    const response = await fetch('https://api.spotify.com/v1/me/player/next', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to skip to next track');
    }
    
    console.log('✅ Skipped to next track');
  }

  async previousTrack() {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }
      
    const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to go to previous track');
    }
    
    console.log('✅ Went to previous track');
  }

  async getCurrentPlaybackState() {
    if (!this.accessToken) {
      return { is_playing: false, item: null };
    }
    
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      if (response.status === 204) {
        return { is_playing: false, item: null };
      }
      
      if (!response.ok) {
        return { is_playing: false, item: null };
      }
      
      const state = await this.safeJsonParse(response);
      return state;
      
    } catch (error) {
      console.error('Error in getCurrentPlaybackState:', error);
      return { is_playing: false, item: null };
    }
  }

  // Timer methods
  async startTimer(duration = 25) {
    this.timerDuration = duration * 60; // Convert minutes to seconds
    this.timerRemaining = this.timerDuration;
    this.timerRunning = true;
    
    // Save initial state
    await this.saveTimerState();
    
    this.timerInterval = setInterval(async () => {
      this.timerRemaining--;
      
      // Save state on each tick
      await this.saveTimerState();
      
      if (this.timerRemaining <= 0) {
        this.stopTimer();
        // Timer finished - could add notification here
      }
      
      // Send timer update to popup
      this.updatePopup();
    }, 1000);
    
    console.log(`⏰ Timer started for ${duration} minutes`);
  }

  async pauseTimer() {
    if (this.timerRunning) {
      clearInterval(this.timerInterval);
      this.timerRunning = false;
      await this.saveTimerState();
      this.updatePopup(); // Immediately update popup
      console.log('⏸️ Timer paused');
    }
  }

  async resumeTimer() {
    if (!this.timerRunning && this.timerRemaining > 0) {
      this.timerRunning = true;
      await this.saveTimerState();
      
      this.timerInterval = setInterval(async () => {
        this.timerRemaining--;
        
        // Save state on each tick
        await this.saveTimerState();
        
        if (this.timerRemaining <= 0) {
          this.stopTimer();
        }
        
        // Send timer update to popup
        this.updatePopup();
      }, 1000);
      
      this.updatePopup(); // Immediately update popup
      console.log('▶️ Timer resumed');
    }
  }

  async stopTimer() {
    clearInterval(this.timerInterval);
    this.timerRunning = false;
    this.timerRemaining = this.timerDuration;
    await this.saveTimerState();
    this.updatePopup(); // Immediately update popup
    console.log('⏹️ Timer stopped');
  }

  getTimerState() {
    const minutes = Math.floor(this.timerRemaining / 60);
    const seconds = this.timerRemaining % 60;
    const progress = ((this.timerDuration - this.timerRemaining) / this.timerDuration) * 100;
    
    return {
      minutes,
      seconds,
      progress,
      running: this.timerRunning,
      remaining: this.timerRemaining,
      duration: this.timerDuration
    };
  }

  async updatePopup() {
    try {
      const playbackState = await this.getCurrentPlaybackState();
      const timerState = this.getTimerState();
      
      const state = {
        isPlaying: playbackState?.is_playing || false,
        currentTrack: playbackState?.item || null,
        currentPlaylist: this.currentPlaylist,
        isAuthenticated: !!this.accessToken,
        timer: timerState
      };
      
      // Send the state to the popup
      try {
        await chrome.runtime.sendMessage({
          type: 'STATE_UPDATED',
          data: state
        });
      } catch (error) {
        // Popup might be closed
      }
      
    } catch (error) {
      console.error('Error in updatePopup:', error);
    }
  }

  async safeJsonParse(response) {
    try {
      const text = await response.text();
      
      if (!text || text.trim() === '') {
        return {};
      }
      
      const parsed = JSON.parse(text);
      return parsed;
      
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      return {};
    }
  }

  generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  async generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
}

// Initialize the player
const spotifyPlayer = new SpotifyMoodPlayer();

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      console.log('Received message:', message.type, message);
      let response = {};
      
      switch (message.type) {
        case 'GET_STATE':
          const playbackState = await spotifyPlayer.getCurrentPlaybackState();
          const timerState = spotifyPlayer.getTimerState();
          response = {
            success: true,
            isPlaying: playbackState?.is_playing || false,
            currentTrack: playbackState?.item || null,
            currentPlaylist: spotifyPlayer.currentPlaylist,
            isAuthenticated: !!spotifyPlayer.accessToken,
            timer: timerState
          };
          break;
          
        case 'PLAY_MOOD':
          await spotifyPlayer.playMoodPlaylist(message.mood);
          response = { 
            success: true,
            mood: message.mood
          };
          break;
          
        case 'TOGGLE_PLAYBACK':
          await spotifyPlayer.togglePlayback();
          response = { 
            success: true
          };
          break;
          
        case 'NEXT_TRACK':
          await spotifyPlayer.nextTrack();
          response = { 
            success: true
          };
          break;
          
        case 'PREVIOUS_TRACK':
          await spotifyPlayer.previousTrack();
          response = { 
            success: true
          };
          break;
          
        case 'START_TIMER':
          spotifyPlayer.startTimer(message.duration || 25);
          response = { 
            success: true,
            duration: message.duration || 25
          };
          break;
          
        case 'PAUSE_TIMER':
          spotifyPlayer.pauseTimer();
          response = { 
            success: true
          };
          break;
          
        case 'RESUME_TIMER':
          spotifyPlayer.resumeTimer();
          response = { 
            success: true
          };
          break;
          
        case 'STOP_TIMER':
          spotifyPlayer.stopTimer();
          response = { 
            success: true
          };
          break;
          
        case 'AUTHENTICATE':
          await spotifyPlayer.authenticate();
          response = { 
            success: true,
            isAuthenticated: !!spotifyPlayer.accessToken
          };
          break;
          
        default:
          throw new Error(`Unknown message type: ${message.type}`);
      }
      
      console.log('Sending response:', { type: message.type, ...response });
      sendResponse({ success: true, ...response });
      
    } catch (error) {
      console.error('Error handling message:', message.type, error);
      sendResponse({ 
        success: false, 
        error: error.message || 'An unknown error occurred',
        type: message.type
      });
    }
  })();
  
  return true;
});



