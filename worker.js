// Cloudflare Workers implementation of criptixo.me
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle different routes
    if (url.pathname === '/') {
      return handleHomePage();
    }
    
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(url.pathname, request, env);
    }
    
    if (url.pathname === '/style.css') {
      return handleCSS();
    }
    
    if (url.pathname === '/favicon.png') {
      return new Response('', { status: 204 });
    }
    
    // Handle blog/project/gallery routes
    if (url.pathname.endsWith('.html')) {
      return handleStaticPage(url.pathname);
    }
    
    return new Response('Not Found', { status: 404 });
  },
};

async function handleHomePage() {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>criptixo.me</title>
  <link rel="stylesheet" href="/style.css" />
  <link rel="icon" type="image/png" href="/favicon.png" />
</head>
<body>
  <div class="container">
    <header>
      <a href="/" class="brand">[ criptixo :: ~ ]</a>
      <nav class="tabs">
        <a href="/" class="active"><span>[~]</span>Home</a>
        <a href="/projects.html"><span>[>_]</span>Projects</a>
        <a href="/blog.html"><span>[#]</span>Blog</a>
        <a href="/gallery.html"><span>[+]</span>Gallery</a>
      </nav>
    </header>

    <section class="main">
      <div class="box term">
        <div class="title term-title">$ whoami</div>
        <div class="profile-section">
          <p class="intro">Hi, I'm <strong>criptixo</strong>. I like tiny tools, Linux internals, and clean terminals.</p>
          <div class="quick-stats">
            <div class="stat-item">📍 Europe/Berlin</div>
            <div class="stat-item">🕒 <span id="local-time">00:00</span></div>
            <div class="stat-item">💻 commits today: <span id="commit-count">0</span></div>
          </div>
        </div>
      </div>

      <div class="box mag">
        <div class="title term-title">$ contact</div>
        <div class="contact-info">
          <div class="contact-item">
            <span class="contact-label">Email:</span>
            <a href="mailto:contact@criptixo.me">contact@criptixo.me</a>
          </div>
          <div class="contact-item">
            <span class="contact-label">GitHub:</span>
            <a href="https://github.com/criptixo" target="_blank">github.com/criptixo</a>
          </div>
        </div>
      </div>

      <div class="box yellow">
        <div class="title term-title">$ interests</div>
        <div class="interests">
          <div class="interest-group">
            <span class="group-label">Code:</span>
            <div class="interest-links">
              <a href="https://github.com/criptixo" target="_blank">github</a>
              <a href="https://gist.github.com/criptixo" target="_blank">gists</a>
            </div>
          </div>
          <div class="interest-group">
            <span class="group-label">Social:</span>
            <div class="interest-links">
              <a href="https://fosstodon.org/@criptixo" target="_blank">mastodon</a>
              <a href="https://last.fm/user/criptixo" target="_blank">last.fm</a>
            </div>
          </div>
        </div>
      </div>

      <div class="box cyan">
        <div class="title term-title">$ now-playing</div>
        <div class="music-section" id="music-section">
          <div class="nowplaying" id="nowplaying">
            <div class="track-info">
              <div id="npTitle" class="track-title">Loading music data...</div>
              <div id="npMeta" class="track-meta muted"></div>
            </div>
          </div>
          <div class="recent-section">
            <div id="recentList" class="recent-tracks">
              <div class="loading-text">Loading history...</div>
            </div>
          </div>
        </div>
      </div>

      <div class="box purple">
        <div class="title term-title">$ guestbook</div>
        <div class="guestbook">
          <div id="messages" class="messages"></div>
          <div class="message-form">
            <input id="username" placeholder="name" maxlength="24" />
            <div class="message-wrapper">
              <textarea id="message" placeholder="leave a message..." maxlength="500" rows="1"></textarea>
              <button id="send" class="send-button">send</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-stats">
          <div class="stat-item">
            <span class="stat-label">you are visitor:</span>
            <span class="stat-value" id="visCount">—</span>
          </div>
        </div>
        <div class="footer-links">
          <a href="mailto:contact@criptixo.me">contact</a>
          <a href="https://github.com/criptixo" target="_blank">github</a>
          <a href="https://last.fm/user/criptixo" target="_blank">last.fm</a>
        </div>
      </div>
      <div class="footer-copyright">
        <span>[</span> © 2025 criptixo <span>]</span>
      </div>
    </footer>
  </div>

  <script>
    // Set current year and time
    document.getElementById('local-time').textContent = new Date().toLocaleTimeString('en-US', { 
      timeZone: 'Europe/Berlin',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    
    setInterval(() => {
      document.getElementById('local-time').textContent = new Date().toLocaleTimeString('en-US', { 
        timeZone: 'Europe/Berlin',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
    }, 1000);

    // Load visitor count
    fetch('/api/visitors')
      .then(r => r.json())
      .then(data => {
        document.getElementById('visCount').textContent = data.count;
      })
      .catch(() => {
        document.getElementById('visCount').textContent = '???';
      });

    // Load Last.fm data
    fetch('/api/lastfm/recent')
      .then(r => r.json())
      .then(data => {
        if (data.nowplaying) {
          document.getElementById('npTitle').textContent = data.nowplaying.name;
          document.getElementById('npMeta').textContent = data.nowplaying.artist + ' • ' + data.nowplaying.album;
        } else {
          document.getElementById('npTitle').textContent = 'Nothing playing';
          document.getElementById('npMeta').textContent = 'Last.fm data unavailable';
        }
        
        if (data.recent && data.recent.length > 0) {
          const recentHtml = data.recent.slice(0, 5).map(track => 
            '<div class="row"><div class="meta"><div class="track">' + track.name + '</div><div class="artist">' + track.artist + '</div></div></div>'
          ).join('');
          document.getElementById('recentList').innerHTML = recentHtml;
        }
      })
      .catch(() => {
        document.getElementById('npTitle').textContent = 'Music data unavailable';
      });

    // Guestbook functionality
    document.getElementById('send').addEventListener('click', async () => {
      const username = document.getElementById('username').value.trim();
      const message = document.getElementById('message').value.trim();
      
      if (!username || !message) {
        alert('Please enter both name and message');
        return;
      }
      
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, message })
        });
        
        if (response.ok) {
          document.getElementById('message').value = '';
          loadMessages();
        }
      } catch (e) {
        console.error('Error sending message:', e);
      }
    });

    // Load messages
    async function loadMessages() {
      try {
        const response = await fetch('/api/messages');
        const messages = await response.json();
        
        const messagesHtml = messages.slice(-10).reverse().map(msg => 
          '<div class="message-item"><span class="message-user">' + msg.username + ':</span><span class="message-text">' + msg.message + '</span></div>'
        ).join('');
        
        document.getElementById('messages').innerHTML = messagesHtml;
      } catch (e) {
        document.getElementById('messages').innerHTML = '<div class="error">Failed to load messages</div>';
      }
    }
    
    loadMessages();
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

async function handleAPI(pathname, request, env) {
  if (pathname === '/api/visitors') {
    return handleVisitors(env);
  }
  
  if (pathname === '/api/lastfm/recent') {
    return handleLastFM();
  }
  
  if (pathname === '/api/messages') {
    if (request.method === 'GET') {
      return handleGetMessages(env);
    } else if (request.method === 'POST') {
      return handlePostMessage(request, env);
    }
  }
  
  return new Response('Not Found', { status: 404 });
}

async function handleVisitors(env) {
  let count = 1;
  
  if (env.VISITOR_COUNT) {
    try {
      const currentCount = await env.VISITOR_COUNT.get('count');
      count = currentCount ? parseInt(currentCount) + 1 : 1;
      await env.VISITOR_COUNT.put('count', count.toString());
    } catch (e) {
      console.error('Error updating visitor count:', e);
    }
  }
  
  return new Response(JSON.stringify({ count }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleLastFM() {
  const LASTFM_USER = 'criptixo';
  const LASTFM_KEY = '1ccce5d51bb11b558f115c25e200e0e7';
  
  try {
    const url = 'https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=' + LASTFM_USER + '&api_key=' + LASTFM_KEY + '&format=json&limit=10';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Last.fm API error');
    }
    
    const data = await response.json();
    const tracks = data.recenttracks?.track || [];
    
    let nowplaying = null;
    let recent = [];
    
    if (tracks.length > 0) {
      const firstTrack = tracks[0];
      
      if (firstTrack['@attr'] && firstTrack['@attr'].nowplaying) {
        nowplaying = {
          name: firstTrack.name,
          artist: firstTrack.artist['#text'] || firstTrack.artist,
          album: firstTrack.album['#text'],
          image: firstTrack.image && firstTrack.image[2] ? firstTrack.image[2]['#text'] : null
        };
        recent = tracks.slice(1);
      } else {
        recent = tracks;
      }
      
      recent = recent.map(track => ({
        name: track.name,
        artist: track.artist['#text'] || track.artist,
        album: track.album['#text'],
        image: track.image && track.image[1] ? track.image[1]['#text'] : null
      }));
    }
    
    return new Response(JSON.stringify({ nowplaying, recent }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch Last.fm data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleGetMessages(env) {
  if (!env.MESSAGES) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  try {
    const messages = await env.MESSAGES.get('messages');
    return new Response(messages || '[]', {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handlePostMessage(request, env) {
  try {
    const { username, message } = await request.json();
    
    if (!username || !message) {
      return new Response('Missing username or message', { status: 400 });
    }
    
    const newMessage = {
      id: Date.now(),
      username: username.substring(0, 24),
      message: message.substring(0, 500),
      timestamp: new Date().toISOString()
    };
    
    if (env.MESSAGES) {
      const existingMessages = JSON.parse(await env.MESSAGES.get('messages') || '[]');
      existingMessages.push(newMessage);
      
      // Keep only last 100 messages
      const recentMessages = existingMessages.slice(-100);
      await env.MESSAGES.put('messages', JSON.stringify(recentMessages));
    }
    
    return new Response('OK', { status: 200 });
  } catch (e) {
    return new Response('Server Error', { status: 500 });
  }
}

async function handleStaticPage(pathname) {
  // Return a basic template for static pages
  const pageName = pathname.replace('.html', '');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageName} | criptixo</title>
  <link rel="stylesheet" href="/style.css" />
  <link rel="icon" type="image/png" href="/favicon.png" />
</head>
<body>
  <div class="container">
    <header>
      <a href="/" class="brand">[ criptixo :: ~ ]</a>
      <nav class="tabs">
        <a href="/"><span>[~]</span>Home</a>
        <a href="/projects.html"><span>[>_]</span>Projects</a>
        <a href="/blog.html"><span>[#]</span>Blog</a>
        <a href="/gallery.html"><span>[+]</span>Gallery</a>
      </nav>
    </header>

    <section class="main">
      <div class="box term">
        <div class="title term-title">$ ${pageName}</div>
        <div class="content">
          <p>Welcome to ${pageName}. This page is under construction.</p>
          <p>Check back soon for updates!</p>
        </div>
        <div class="post-nav">
          <a href="/" class="back-link">← Back to Home</a>
        </div>
      </div>
    </section>

    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-stats">
          <div class="stat-item">
            <span class="stat-label">you are visitor:</span>
            <span class="stat-value">—</span>
          </div>
        </div>
        <div class="footer-links">
          <a href="mailto:contact@criptixo.me">contact</a>
          <a href="https://github.com/criptixo" target="_blank">github</a>
          <a href="https://last.fm/user/criptixo" target="_blank">last.fm</a>
        </div>
      </div>
      <div class="footer-copyright">
        <span>[</span> © 2025 criptixo <span>]</span>
      </div>
    </footer>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

async function handleCSS() {
  // Basic CSS - you'll want to copy your actual CSS here
  const css = `
/* Basic terminal theme */
:root {
  --bg: #0a0a0a;
  --fg: #f0f0f0;
  --accent: #00ff88;
  --purple: #ff00ff;
  --cyan: #00ffff;
  --yellow: #ffff00;
  --red: #ff0044;
}

body {
  background: var(--bg);
  color: var(--fg);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid var(--accent);
  padding-bottom: 20px;
}

.brand {
  color: var(--accent);
  text-decoration: none;
  font-weight: bold;
  font-size: 1.2em;
}

.tabs {
  display: flex;
  gap: 20px;
}

.tabs a {
  color: var(--fg);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.2s;
}

.tabs a:hover,
.tabs a.active {
  background: var(--accent);
  color: var(--bg);
}

.main {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.box {
  border: 1px solid;
  border-radius: 8px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
}

.box.term { border-color: var(--accent); }
.box.mag { border-color: var(--purple); }
.box.yellow { border-color: var(--yellow); }
.box.cyan { border-color: var(--cyan); }
.box.purple { border-color: var(--purple); }

.title {
  margin-bottom: 15px;
  font-weight: bold;
}

.term-title {
  color: var(--accent);
}

.site-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--accent);
  text-align: center;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links a {
  color: var(--fg);
  text-decoration: none;
}

.footer-links a:hover {
  color: var(--accent);
}

.guestbook {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.messages {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--purple);
  padding: 10px;
  border-radius: 4px;
}

.message-item {
  margin-bottom: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.message-form {
  display: flex;
  gap: 10px;
}

.message-form input,
.message-form textarea {
  background: var(--bg);
  border: 1px solid var(--purple);
  color: var(--fg);
  padding: 8px;
  border-radius: 4px;
  flex: 1;
}

.send-button {
  background: var(--purple);
  border: none;
  color: var(--bg);
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.send-button:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .main {
    grid-template-columns: 1fr;
  }
  
  header {
    flex-direction: column;
    gap: 20px;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 10px;
  }
}
`;

  return new Response(css, {
    headers: { 'Content-Type': 'text/css' },
  });
}
