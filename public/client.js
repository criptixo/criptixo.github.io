// util
function copyText(s){ navigator.clipboard.writeText(s); }

// visitor count + year
(async function(){
  try{
    const r = await fetch('/api/visitors'); const j = await r.json();
    const el = document.getElementById('visCount'); if (el) el.textContent = j.count;
  }catch(e){
    console.error('Failed to fetch visitor count:', e);
  }
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();

// now playing + recent
async function loadNowPlaying(){
  try{
    document.getElementById('music-section').classList.add('loading');
    const r = await fetch('/api/lastfm/now'); const j = await r.json();
    const art = document.getElementById('npArt');
    const placeholder = document.getElementById('album-placeholder');
    const title = document.getElementById('npTitle');
    const meta = document.getElementById('npMeta');
    const recentEl = document.getElementById('recentList');

    // Reset the display if no data
    if (!j || !j.current || !j.current['@attr']?.nowplaying){ 
      if (art) {
        art.src = '';
        art.style.display = 'none';
      }
      if (placeholder) placeholder.style.display = 'flex';
      if (title) title.textContent = 'Not currently playing'; 
      if (meta) meta.textContent = ''; 
    } else {
      const c = j.current;
      // Extract the album art URL from the image array
      const artUrl = c.image ? c.image[c.image.length - 1]['#text'] : '';
      
      if (art && artUrl) {
        art.src = artUrl;
        art.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
      } else {
        if (art) {
          art.src = '';
          art.style.display = 'none';
        }
        if (placeholder) placeholder.style.display = 'flex';
      }
      
      if (title) title.innerHTML = `<a href="${c.url}" target="_blank" rel="noopener">${c.name}</a>`;
      if (meta) meta.textContent = `${c.artist['#text']} — ${c.album['#text']}`;
    }
    
    if (recentEl && j.recent){
      // Show the last 5 tracks
      recentEl.innerHTML = j.recent.slice(0, 5).map(t => {
        const timestamp = t.date ? new Date(t.date.uts * 1000).toLocaleString() : '';
        return `
          <div class="row">
            <img src="${t.image ? t.image[t.image.length - 1]['#text'] : ''}" alt="cover" />
            <div class="meta">
              <div class="n"><a href="${t.url}" target="_blank" rel="noopener">${t.name}</a></div>
              <div class="m">${t.artist['#text']} — ${t.album['#text']}</div>
              <div class="t">${timestamp}</div>
            </div>
          </div>
        `;
      }).join('');
    }
  }catch(e){ 
    console.error(e);
  } finally {
    document.getElementById('music-section').classList.remove('loading');
  }
}
if (document.getElementById('nowplaying')) {
  loadNowPlaying();
  setInterval(loadNowPlaying, 30000);
}

// Chat functionality
if (window.io) {
  const socket = io();
  const log = document.getElementById('chatlog');
  const u = document.getElementById('username');
  const m = document.getElementById('message');
  const sendBtn = document.getElementById('send');
  const typing = document.getElementById('typing');
  let typingTimeout;

  // HTML escaping
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, s => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[s]);
  }

  // Add a message to the chat
  function addMessage({ username, message, timestamp, id }) {
    const div = document.createElement('div');
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString();
    const dateStr = date.toLocaleDateString();
    const isToday = dateStr === new Date().toLocaleDateString();
    
    div.className = 'line';
    div.dataset.id = id;
    div.innerHTML = `
      <span class="t" title="${dateStr} ${time}">[${isToday ? time : `${dateStr} ${time}`}]</span>
      <span class="u">${escapeHtml(username)}</span>:
      <span class="m">${escapeHtml(message)}</span>
    `;
    
    log.appendChild(div);
    
    // Keep only last 100 messages in DOM
    while (log.children.length > 100) {
      log.removeChild(log.firstChild);
    }
    
    // Scroll to bottom if we're already near bottom
    const shouldScroll = log.scrollTop + log.clientHeight + 100 >= log.scrollHeight;
    if (shouldScroll) {
      log.scrollTop = log.scrollHeight;
    }
  }

  // Load chat history
  socket.on('chat history', messages => {
    log.innerHTML = '';
    messages.forEach(addMessage);
    log.scrollTop = log.scrollHeight;
  });

  // Handle new messages
  socket.on('chat message', addMessage);

  // Handle typing indicators
  socket.on('user typing', username => {
    typing.textContent = `${username} is typing...`;
    typing.style.opacity = '1';
  });

  socket.on('user stop typing', () => {
    typing.style.opacity = '0';
  });

  // Send message
  function sendMessage() {
    const username = u.value.trim() || 'anon';
    const message = m.value.trim();
    
    if (!message) return;
    
    socket.emit('chat message', { username, message });
    socket.emit('stop typing');
    m.value = '';
    localStorage.setItem('chat-username', username);
  }

  // Handle typing indicator
  function handleTyping() {
    if (typingTimeout) clearTimeout(typingTimeout);
    
    socket.emit('typing', u.value.trim() || 'anon');
    
    typingTimeout = setTimeout(() => {
      socket.emit('stop typing');
    }, 1000);
  }

  // Event listeners
  sendBtn?.addEventListener('click', sendMessage);
  m?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  m?.addEventListener('input', handleTyping);

  // Restore username from localStorage
  const savedUsername = localStorage.getItem('chat-username');
  if (savedUsername && u) {
    u.value = savedUsername;
  }
}
