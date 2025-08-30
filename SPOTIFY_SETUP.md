# Spotify App Setup Guide

## 🔧 Required Spotify App Configuration

The "Authorization page could not be loaded" error typically occurs when the redirect URI is not properly configured in your Spotify app settings. Here's how to fix it:

### Step 1: Access Your Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Find your app with Client ID: `5eb5fd2d8bb14edb8cc7f632cbe718a1`
4. Click on the app to open its settings

### Step 2: Configure Redirect URIs

1. In your app settings, find the "Redirect URIs" section
2. Click "Add" to add a new redirect URI
3. Add the following redirect URI (you can get this by clicking "Test Connection" in the extension):
   ```
   https://[your-extension-id].chromiumapp.org/spotify-tab-player
   ```
4. Replace `[your-extension-id]` with your actual extension ID
5. Save the changes

### Step 3: Get Your Extension ID

1. Open Chrome and go to `chrome://extensions/`
2. Find "Spotify Tab Player" in the list
3. Copy the Extension ID (it's a long string of letters and numbers)
4. Use this ID in the redirect URI above

### Step 4: Test the Configuration

1. Reload the extension in Chrome
2. Click the extension icon
3. Click "Test Connection" to get your redirect URI
4. Make sure this URI is added to your Spotify app settings
5. Try authenticating again

### Alternative: Use a Generic Redirect URI

If you're having trouble with the specific redirect URI, you can also try adding this generic one:
```
https://[your-extension-id].chromiumapp.org/
```

### Common Issues and Solutions

**Issue**: "Authorization page could not be loaded"
- **Solution**: Make sure the redirect URI is exactly correct in Spotify app settings

**Issue**: "Invalid redirect URI"
- **Solution**: Double-check the extension ID and URI format

**Issue**: "Client ID not found"
- **Solution**: Verify you're using the correct Client ID: `5eb5fd2d8bb14edb8cc7f632cbe718a1`

### Debugging Steps

1. **Check Console Logs**:
   - Open Chrome DevTools
   - Go to Extensions page
   - Click "Inspect views: background page"
   - Look for console logs showing the redirect URI

2. **Verify App Settings**:
   - Ensure your Spotify app is set to "Web App"
   - Check that all required scopes are enabled
   - Verify the Client ID matches exactly

3. **Test with Extension**:
   - Use the "Test Connection" button in the extension popup
   - Copy the displayed redirect URI
   - Add it to your Spotify app settings

### Required Scopes

Make sure your Spotify app has these scopes enabled:
- `user-read-private`
- `user-read-email`
- `playlist-read-private`
- `playlist-read-collaborative`
- `user-read-playback-state`
- `user-modify-playback-state`
- `user-read-currently-playing`

### Final Notes

- The extension requires a **Spotify Premium account** to work
- Make sure you're logged into the correct Spotify account
- The redirect URI is unique to your extension installation
- If you reinstall the extension, you'll need to update the redirect URI

After completing these steps, the authentication should work properly and you'll be able to use the extension!
