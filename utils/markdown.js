import { marked } from 'marked';
import matter from 'gray-matter';
import hljs from 'highlight.js';
import fs from 'fs/promises';
import path from 'path';

// Configure marked with syntax highlighting
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return code;
  }
});

async function readMarkdownFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const { data, content: markdown } = matter(content);
  const html = marked.parse(markdown);
  
  return {
    metadata: {
      ...data,
      date: data.date || new Date(await fs.stat(filePath)).toISOString(),
      slug: path.basename(filePath, '.md'),
      readingTime: Math.ceil(markdown.split(/\s+/).length / 200) // Approx. 200 words per minute
    },
    content: html
  };
}

async function getAllPosts(contentDir) {
  const files = await fs.readdir(contentDir);
  const posts = await Promise.all(
    files
      .filter(file => file.endsWith('.md'))
      .map(async file => {
        const filePath = path.join(contentDir, file);
        return await readMarkdownFile(filePath);
      })
  );
  
  // Sort by date, newest first
  return posts.sort((a, b) => new Date(b.metadata.date) - new Date(a.metadata.date));
}

function generateHTML(type, { metadata, content }) {
  const title = metadata.title || 'Untitled';
  const date = new Date(metadata.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — criptixo</title>
  <link rel="stylesheet" href="/style.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/tokyo-night-dark.min.css">
</head>
<body>
  <div class="container">
    <header>
      <a href="/" class="brand" aria-label="Home">[ criptixo :: ~/${type}/${metadata.slug} ]</a>
      <nav class="tabs" role="navigation" aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/projects.html"${type === 'projects' ? ' class="active"' : ''}>Projects</a>
        <a href="/blog.html"${type === 'blog' ? ' class="active"' : ''}>Blog</a>
        <a href="/gallery.html">Gallery</a>
      </nav>
    </header>

    <section class="main">
      <div class="box ${type === 'blog' ? 'cyan' : 'green'}">
        <div class="title ${type === 'blog' ? 'cyan' : 'green'}-title">$ cat ~/${type}/${metadata.slug}.md</div>
        <hr class="titleline">
        <article class="content-page">
          <div class="content-meta">
            <time datetime="${metadata.date}">${date}</time>
            ${metadata.readingTime ? `<span class="reading-time">${metadata.readingTime} min read</span>` : ''}
          </div>
          <div class="content-body">
            ${content}
          </div>
          ${metadata.tags ? `
          <div class="content-tags">
            ${metadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          ` : ''}
        </article>
      </div>
    </section>

    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-stats">
          <div class="stat-item">
            <span class="stat-label">visitors:</span>
            <span class="stat-value" id="visCount">—</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">uptime:</span>
            <span class="stat-value">2023—<span id="year"></span></span>
          </div>
        </div>
        <div class="footer-links">
          <a href="https://ko-fi.com/criptixo" target="_blank" rel="noopener" class="kofi-link">🍺 buy me a beer</a>
          <span class="separator">•</span>
          <a href="https://ko-fi.com/criptixo" target="_blank" rel="noopener" class="kofi-link">🍺 buy me a beer</a>
        </div>
      </div>
      <div class="footer-copyright">
        <span class="symbol">[</span> © <span id="year"></span> criptixo <span class="symbol">]</span>
      </div>
    </footer>
  </div>
  <script src="/client.js"></script>
</body>
</html>`;
}

export {
  readMarkdownFile,
  getAllPosts,
  generateHTML
};
