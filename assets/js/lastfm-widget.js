// Last.fm Widget for GitHub Pages
// Client-side implementation that works with static hosting

const LASTFM_CONFIG = {
  username: 'criptixo',
  apiKey: '1ccce5d51bb11b558f115c25e200e0e7', // Public read-only API key
  baseUrl: 'https://ws.audioscrobbler.com/2.0/',
  refreshInterval: 30000 // 30 seconds
};

class LastFmWidget {
  constructor() {
    this.isLoading = false;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async loadLastFmData() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoading();

    try {
      // Get recent tracks (includes now playing if available)
      const response = await fetch(
        `${LASTFM_CONFIG.baseUrl}?method=user.getrecenttracks&user=${LASTFM_CONFIG.username}&api_key=${LASTFM_CONFIG.apiKey}&format=json&limit=10&extended=1`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Last.fm API Error: ${data.message}`);
      }
      
      const tracks = data.recenttracks?.track || [];
      
      if (Array.isArray(tracks) && tracks.length > 0) {
        const nowPlaying = tracks[0];
        const isCurrentlyPlaying = nowPlaying['@attr']?.nowplaying === 'true';
        
        this.updateNowPlaying(nowPlaying, isCurrentlyPlaying);
        this.updateRecentTracks(tracks.slice(isCurrentlyPlaying ? 1 : 0, 6));
        this.retryCount = 0; // Reset retry count on success
      } else {
        this.showNoMusic();
      }
    } catch (error) {
      console.error('Last.fm error:', error);
      this.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }

  updateNowPlaying(track, isPlaying) {
    const elements = {
      status: document.getElementById('music-status'),
      track: document.getElementById('current-track'),
      artist: document.getElementById('current-artist'),
      album: document.getElementById('current-album'),
      timestamp: document.getElementById('current-timestamp'),
      albumArt: document.getElementById('npArt'),
      placeholder: document.querySelector('.album-placeholder')
    };

    // Update status
    if (elements.status) {
      elements.status.textContent = isPlaying ? '♪ now playing' : '♪ last played';
      elements.status.className = isPlaying ? 'status-playing' : 'status-recent';
    }

    // Update track info
    if (elements.track) {
      elements.track.textContent = track.name || 'Unknown Track';
      elements.track.title = track.name || 'Unknown Track';
    }

    if (elements.artist) {
      const artistName = track.artist?.name || track.artist?.['#text'] || 'Unknown Artist';
      elements.artist.textContent = artistName;
      elements.artist.title = artistName;
    }

    if (elements.album) {
      const albumName = track.album?.['#text'] || '';
      elements.album.textContent = albumName ? `from "${albumName}"` : '';
      elements.album.title = albumName;
    }

    // Update timestamp
    if (elements.timestamp) {
      if (isPlaying) {
        elements.timestamp.textContent = 'playing now';
        elements.timestamp.title = 'Currently playing';
      } else {
        const playedTime = this.formatPlayTime(track.date);
        const fullTimestamp = this.formatFullTimestamp(track.date);
        elements.timestamp.textContent = playedTime;
        elements.timestamp.title = `Last played: ${fullTimestamp}`;
      }
    }

    // Handle album art
    this.updateAlbumArt(track, elements.albumArt, elements.placeholder);

    // Add a subtle glow effect for currently playing
    const musicSection = document.querySelector('.music-section');
    if (musicSection) {
      if (isPlaying) {
        musicSection.classList.add('now-playing');
      } else {
        musicSection.classList.remove('now-playing');
      }
    }
  }

  updateAlbumArt(track, albumArtEl, placeholderEl) {
    if (!albumArtEl || !placeholderEl) return;

    const images = track.image || [];
    const largeImage = images.find(img => 
      img.size === 'extralarge' || img.size === 'large' || img.size === 'medium'
    );

    if (largeImage && largeImage['#text'] && largeImage['#text'].trim()) {
      albumArtEl.src = largeImage['#text'];
      albumArtEl.alt = `${track.name} album art`;
      albumArtEl.style.display = 'block';
      placeholderEl.style.display = 'none';
      
      // Handle image load errors
      albumArtEl.onerror = () => {
        albumArtEl.style.display = 'none';
        placeholderEl.style.display = 'flex';
      };
    } else {
      albumArtEl.style.display = 'none';
      placeholderEl.style.display = 'flex';
    }
  }

  updateRecentTracks(tracks) {
    const recentEl = document.getElementById('recent-tracks');
    if (!recentEl || !tracks.length) return;

    const html = tracks.map((track, index) => {
      const artistName = track.artist?.name || track.artist?.['#text'] || 'Unknown Artist';
      const trackName = track.name || 'Unknown Track';
      const playedTime = this.formatPlayTime(track.date);
      const fullTimestamp = this.formatFullTimestamp(track.date);
      
      return `
        <div class="row">
          <div class="meta">
            <div class="n" title="${trackName}">${trackName}</div>
            <div class="m" title="${artistName}">${artistName}</div>
            <div class="t" title="${fullTimestamp}">${playedTime}</div>
          </div>
        </div>
      `;
    }).join('');

    recentEl.innerHTML = html;
  }

  formatPlayTime(dateObj) {
    if (!dateObj || !dateObj.uts) return 'recently';
    
    const playedTime = new Date(parseInt(dateObj.uts) * 1000);
    const now = new Date();
    const diffMs = now - playedTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return playedTime.toLocaleDateString();
  }

  formatFullTimestamp(dateObj) {
    if (!dateObj || !dateObj.uts) return 'Unknown time';
    
    const playedTime = new Date(parseInt(dateObj.uts) * 1000);
    return playedTime.toLocaleString(); // Full date and time
  }

  showNoMusic() {
    const elements = {
      status: document.getElementById('music-status'),
      track: document.getElementById('current-track'),
      artist: document.getElementById('current-artist'),
      album: document.getElementById('current-album'),
      albumArt: document.getElementById('npArt'),
      placeholder: document.querySelector('.album-placeholder'),
      recent: document.getElementById('recent-tracks')
    };

    if (elements.status) elements.status.textContent = '♪ not playing';
    if (elements.track) elements.track.textContent = 'No recent scrobbles found';
    if (elements.artist) elements.artist.textContent = '';
    if (elements.album) elements.album.textContent = '';
    
    if (elements.albumArt) elements.albumArt.style.display = 'none';
    if (elements.placeholder) elements.placeholder.style.display = 'flex';
    if (elements.recent) elements.recent.innerHTML = '<div class="no-content">No recent tracks</div>';

    const musicSection = document.querySelector('.music-section');
    if (musicSection) musicSection.classList.remove('now-playing');
  }

  showLoading() {
    const statusEl = document.getElementById('music-status');
    if (statusEl) {
      statusEl.textContent = '♪ loading...';
    }
  }

  handleError(error) {
    this.retryCount++;
    
    const elements = {
      status: document.getElementById('music-status'),
      track: document.getElementById('current-track'),
      artist: document.getElementById('current-artist')
    };

    if (this.retryCount <= this.maxRetries) {
      if (elements.status) elements.status.textContent = '♪ retrying...';
      // Retry with exponential backoff
      setTimeout(() => this.loadLastFmData(), Math.pow(2, this.retryCount) * 1000);
    } else {
      if (elements.status) elements.status.textContent = '♪ connection failed';
      if (elements.track) elements.track.textContent = 'Unable to load music data';
      if (elements.artist) elements.artist.textContent = 'Check connection and try again';
    }
  }

  start() {
    // Load immediately
    this.loadLastFmData();
    
    // Set up refresh interval
    this.intervalId = setInterval(() => {
      this.loadLastFmData();
    }, LASTFM_CONFIG.refreshInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Initialize widget when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const widget = new LastFmWidget();
  widget.start();
  
  // Stop the widget when the page is unloaded
  window.addEventListener('beforeunload', () => {
    widget.stop();
  });
});

// Expose widget globally for manual control if needed
window.LastFmWidget = LastFmWidget;
