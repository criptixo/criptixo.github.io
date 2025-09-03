# criptixo.me

A minimal, neon-styled personal website built with Node.js and Express. Features a terminal-inspired design with real-time chat, Last.fm integration, and markdown-based content management.

## Features

- **Minimal Design**: Clean, terminal-inspired interface with modern neon color palette
- **Real-time Chat**: Socket.IO powered live messaging system
- **Last.fm Integration**: Display currently playing music with album art
- **Markdown Content**: Dynamic blog, projects, and gallery content from markdown files
- **Responsive Layout**: Works on desktop and mobile devices
- **Visitor Counter**: Track site visitors with IP-based identification

## Tech Stack

- **Backend**: Node.js, Express.js
- **Real-time**: Socket.IO
- **Content**: Markdown processing with gray-matter and marked
- **Frontend**: Vanilla JavaScript, CSS custom properties
- **APIs**: Last.fm API integration

## Installation

1. Clone the repository:
```bash
git clone https://github.com/criptixo/criptixo.me.git
cd criptixo.me
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Visit `http://localhost:3000`

## Structure

```
├── content/           # Markdown content files
│   ├── blog/         # Blog posts
│   ├── gallery/      # Gallery items
│   └── projects/     # Project descriptions
├── data/             # JSON data files
├── public/           # Static assets
├── utils/            # Utility functions
├── server.js         # Main server file
└── package.json      # Dependencies and scripts
```

## Content Management

Add new content by creating markdown files in the appropriate directories:

- **Blog posts**: `content/blog/slug.md`
- **Projects**: `content/projects/slug.md`
- **Gallery items**: `content/gallery/slug.md`

Each markdown file should include frontmatter:

```yaml
---
title: "Your Title"
date: "2025-09-03"
tags: "tag1, tag2"
excerpt: "Brief description"
---

Your content here...
```

## API Endpoints

- `GET /api/blog/list` - List all blog posts
- `GET /api/blog/:slug` - Get specific blog post
- `GET /api/projects/list` - List all projects
- `GET /api/projects/:slug` - Get specific project
- `GET /api/gallery/list` - List all gallery items
- `GET /api/gallery/:slug` - Get specific gallery item
- `GET /api/lastfm/recent` - Get recent Last.fm tracks

## Configuration

The server uses hardcoded Last.fm credentials. To use your own:

1. Get API key from [Last.fm API](https://www.last.fm/api)
2. Update `LASTFM_USER` and `LASTFM_KEY` in `server.js`

## License

MIT License - feel free to use this code for your own projects.

## Contact

- GitHub: [@criptixo](https://github.com/criptixo)
- Email: contact@criptixo.me
- Last.fm: [criptixo](https://last.fm/user/criptixo)
