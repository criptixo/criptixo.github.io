import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import http from 'http';

import { readMarkdownFile, getAllPosts, generateHTML } from './utils/markdown.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// Content directories
const contentDir = path.join(__dirname, 'content');
const blogDir = path.join(contentDir, 'blog');
const projectsDir = path.join(contentDir, 'projects');
const galleryDir = path.join(contentDir, 'gallery');

// Create content directories if they don't exist
[contentDir, blogDir, projectsDir, galleryDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Data dirs
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const msgFile = path.join(dataDir, 'messages.json');
const visitorsFile = path.join(dataDir, 'visitors.json');
const cacheFile = path.join(dataDir, 'lastfm_cache.json');

// Load persistence
let messages = [];
try {
  messages = fs.existsSync(msgFile) ? JSON.parse(fs.readFileSync(msgFile)) : [];
  if (!Array.isArray(messages)) messages = [];
} catch (e) {
  console.error('Error loading messages:', e);
  messages = [];
}

let visitorCount = fs.existsSync(visitorsFile) ? JSON.parse(fs.readFileSync(visitorsFile)).count : 0;

// Atomic visitor counter using file system locks
function getVisitorCount() {
  try {
    return fs.existsSync(visitorsFile) ? JSON.parse(fs.readFileSync(visitorsFile)).count : 0;
  } catch (e) {
    console.error('Error reading visitor count:', e);
    return 0;
  }
}

function incrementVisitorCount() {
  // Using a temporary file for atomic write
  const tempFile = visitorsFile + '.tmp';
  try {
    // Read current count
    const currentCount = getVisitorCount();
    // Write to temp file first
    fs.writeFileSync(tempFile, JSON.stringify({count: currentCount + 1}));
    // Atomic rename
    fs.renameSync(tempFile, visitorsFile);
    return currentCount + 1;
  } catch (e) {
    console.error('Error incrementing visitor count:', e);
    // Cleanup temp file if it exists
    if (fs.existsSync(tempFile)) {
      try { fs.unlinkSync(tempFile); } catch {}
    }
    return getVisitorCount();
  }
}

// Visitor counter middleware
app.use((req,res,next)=>{
  // Skip increment for static assets and API calls
  if (req.path.startsWith('/api/') || req.path.includes('.')) {
    next();
    return;
  }
  req.visitorCount = incrementVisitorCount();
  next();
});

// Last.fm setup - hardcoded credentials
const LASTFM_USER = 'criptixo';
const LASTFM_KEY = '1ccce5d51bb11b558f115c25e200e0e7';

async function fetchWithRetry(url, tries=3, delay=500){
  for(let i=0;i<tries;i++){
    try{
      const res = await fetch(url,{family:4});
      if(!res.ok) throw new Error('bad status '+res.status);
      return await res.json();
    }catch(e){
      if(i===tries-1) throw e;
      await new Promise(r=>setTimeout(r,delay*(i+1)));
    }
  }
}

// API Routes - These must come before static file serving
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'production'
  });
});

app.get('/api/visitors', (req, res) => {
  res.json({ count: getVisitorCount() });
});

app.get('/api/lastfm/now',async(req,res)=>{
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_KEY}&format=json&limit=10`;
  try{
    const data = await fetchWithRetry(url,3,800);
    fs.writeFileSync(cacheFile, JSON.stringify(data,null,2));
    const tracks = data.recenttracks.track;
    res.json({
      current: tracks[0]||null,
      recent: tracks.slice(1)
    });
  }catch(e){
    console.error("Last.fm fetch failed",e);
    if(fs.existsSync(cacheFile)){
      const data = JSON.parse(fs.readFileSync(cacheFile));
      const tracks = data.recenttracks.track;
      return res.json({
        cached:true,
        current: tracks[0]||null,
        recent: tracks.slice(1)
      });
    }
    res.status(500).json({error:"Last.fm failed"});
  }
});

app.get('/api/lastfm/health',(req,res)=>res.json({
  ok: true,
  configured: true,
  user: LASTFM_USER
}));

// Messages
app.get('/api/messages',(req,res)=>res.json(messages));
app.post('/api/messages',(req,res)=>{
  const {username,message} = req.body;
  // Get client IP address
  const clientIP = req.ip || 
                  req.connection.remoteAddress || 
                  req.socket.remoteAddress ||
                  (req.headers['x-forwarded-for'] || '').split(',')[0] ||
                  '127.0.0.1';

  const m = {
    username,
    message,
    timestamp: new Date().toISOString(),
    id: clientIP
  };
  messages.push(m);
  fs.writeFileSync(msgFile, JSON.stringify(messages,null,2));
  io.emit('message',m);
  res.json({ok:true});
});

// API routes for content listing
app.get('/api/blog/posts', async (req, res) => {
  try {
    const posts = await getAllPosts(blogDir);
    res.json(posts);
  } catch (error) {
    console.error('Error getting blog posts:', error);
    res.status(500).json({ error: 'Error loading blog posts' });
  }
});

app.get('/api/projects/list', async (req, res) => {
  try {
    const projects = await getAllPosts(projectsDir);
    res.json(projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: 'Error loading projects' });
  }
});

app.get('/api/gallery/list', async (req, res) => {
  try {
    const gallery = await getAllPosts(galleryDir);
    res.json(gallery);
  } catch (error) {
    console.error('Error getting gallery items:', error);
    res.status(500).json({ error: 'Error loading gallery items' });
  }
});

// Content routes
app.get(['/blog/:slug', '/blog/:slug.html'], async (req, res) => {
  try {
    const slug = req.params.slug.replace('.html', '');
    const filePath = path.join(blogDir, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Blog post not found');
    }
    const post = await readMarkdownFile(filePath);
    const html = generateHTML('blog', post);
    res.send(html);
  } catch (error) {
    console.error('Error serving blog post:', error);
    res.status(500).send('Error loading blog post');
  }
});

app.get(['/projects/:slug', '/projects/:slug.html'], async (req, res) => {
  try {
    const slug = req.params.slug.replace('.html', '');
    const filePath = path.join(projectsDir, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Project not found');
    }
    const project = await readMarkdownFile(filePath);
    const html = generateHTML('projects', project);
    res.send(html);
  } catch (error) {
    console.error('Error serving project page:', error);
    res.status(500).send('Error loading project page');
  }
});

app.get(['/gallery/:slug', '/gallery/:slug.html'], async (req, res) => {
  try {
    const slug = req.params.slug.replace('.html', '');
    const filePath = path.join(galleryDir, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Gallery item not found');
    }
    const galleryItem = await readMarkdownFile(filePath);
    const html = generateHTML('gallery', galleryItem);
    res.send(html);
  } catch (error) {
    console.error('Error serving gallery page:', error);
    res.status(500).send('Error loading gallery page');
  }
});

// Routes for individual content pages - serve post.html template
app.get('/blog/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'post.html'));
});

app.get('/projects/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'post.html'));
});

app.get('/gallery/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'post.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Handle 404s after all other routes
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'), err => {
    if (err) {
      console.error('Error sending 404 page:', err);
      res.status(404).send('404 Not Found');
    }
  });
});

// Handle errors
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).sendFile(path.join(__dirname, 'public', '500.html'), err => {
    if (err) {
      res.status(500).send('500 Internal Server Error');
    }
  });
});

// Socket.io chat
io.on('connection', socket => {
  // Send last 50 messages on connection
  socket.emit('chat history', messages.slice(-50));

  // Handle new messages
  socket.on('chat message', msg => {
    // Get client IP address
    const clientIP = socket.request.connection.remoteAddress || 
                    socket.request.socket.remoteAddress ||
                    (socket.request.headers['x-forwarded-for'] || '').split(',')[0] ||
                    socket.handshake.address ||
                    '127.0.0.1';

    const message = {
      username: msg.username.slice(0, 24),  // Limit username length
      message: msg.message.slice(0, 500),   // Limit message length
      timestamp: new Date().toISOString(),
      id: clientIP
    };

    // Store message
    messages.push(message);
    if (messages.length > 500) messages.shift(); // Keep last 500 messages
    fs.writeFileSync(msgFile, JSON.stringify(messages, null, 2));

    // Broadcast to all clients
    io.emit('chat message', message);
  });

  // Handle typing indicator
  socket.on('typing', username => {
    socket.broadcast.emit('user typing', username);
  });

  // Handle user stopped typing
  socket.on('stop typing', () => {
    socket.broadcast.emit('user stop typing');
  });
});

const PORT = 3000;
server.listen(PORT,()=>console.log("listening on "+PORT));
