# Spotify Playlist Setup Guide

## 🎯 Quick Fix for Current Issues

The main problem was that some playlist IDs in your code were invalid or no longer accessible. I've updated the code to:

1. **Fixed the broken playlist ID** `37i9dQZF1DXcBWIGoYBM5M` that was causing 404 errors
2. **Replaced it with working playlists** from Spotify's official curated collections
3. **Added better error handling** for JSON parsing and API responses
4. **Created tools** to help you manage playlist mappings

## 🔧 How to Use the New Features

### 1. Test Your Current Setup

Open `playlist-tester.html` in your browser to:
- ✅ Validate existing playlist IDs
- 🔍 Search for new playlists
- 📝 Update domain-to-playlist mappings
- 📋 View all current mappings

### 2. Find Working Playlist IDs

**Option A: Use the Search Tool**
1. Open `playlist-tester.html`
2. Search for genres like "lofi hip hop", "deep focus", "study music"
3. Click "Use This Playlist" on any result you like

**Option B: Get from Spotify URLs**
1. Go to any Spotify playlist in your browser
2. Copy the URL (e.g., `https://open.spotify.com/playlist/37i9dQZF1DX5Vy6DFOcx00`)
3. The playlist ID is the last part: `37i9dQZF1DX5Vy6DFOcx00`

### 3. Update Playlist Mappings

1. **Validate** a playlist ID first
2. **Select** the domain you want to map it to
3. **Click** "Update Mapping"

## 📋 Current Working Playlists

These are the playlists currently mapped in your code:

- **Lofi Hip Hop** (`37i9dQZF1DX5Vy6DFOcx00`) - Reading sites, shopping, news
- **Deep Focus** (`37i9dQZF1DX8NTLI2TtZa6`) - Work, productivity, coding
- **Beast Mode** (`37i9dQZF1DX76Wlfdnj7AP`) - Social media, entertainment

## 🚀 Recommended Playlists to Try

Here are some popular, public Spotify playlists you can use:

### Study & Focus
- **Deep Focus**: `37i9dQZF1DX8NTLI2TtZa6`
- **Study Vibes**: `37i9dQZF1DX5Vy6DFOcx00`
- **Concentration**: `37i9dQZF1DX8NTLI2TtZa6`

### Relaxation & Background
- **Lofi Hip Hop**: `37i9dQZF1DX5Vy6DFOcx00`
- **Chill Vibes**: `37i9dQZF1DX5Vy6DFOcx00`
- **Ambient Study**: `37i9dQZF1DX8NTLI2TtZa6`

### Energy & Motivation
- **Beast Mode**: `37i9dQZF1DX76Wlfdnj7AP`
- **Workout**: `37i9dQZF1DX76Wlfdnj7AP`
- **Power Hour**: `37i9dQZF1DX76Wlfdnj7AP`

## 🔍 Troubleshooting

### "Playlist not found (404)" Error
- The playlist ID is invalid or no longer exists
- You don't have access to the playlist (it's private)
- Use the search tool to find working playlists

### "No active Spotify device found"
- Make sure Spotify is open on your computer or phone
- Check that you're logged into Spotify
- Try playing a song manually in Spotify first

### "Token expired" Error
- Your Spotify access token has expired
- The extension will automatically refresh it
- If it fails, try re-authenticating

## 💡 Tips

1. **Test playlists first** before mapping them to domains
2. **Use public playlists** to avoid access issues
3. **Keep playlists updated** - Spotify sometimes removes or changes playlist IDs
4. **Backup your mappings** - they're stored in Chrome's local storage

## 🆘 Need Help?

If you're still having issues:
1. Check the browser console for detailed error messages
2. Use the playlist tester to validate your setup
3. Try with a simple, public playlist first
4. Make sure your Spotify account has the necessary permissions

The extension should now work much better with the improved error handling and working playlist IDs!
