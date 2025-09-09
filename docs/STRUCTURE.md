# Website File Structure

This document explains the organized file structure of criptixo.me website.

## Directory Structure

```
criptixo.me/
├── index.html              # Main homepage
├── 404.html               # Error page
├── CNAME                  # GitHub Pages domain config
├── robots.txt             # SEO configuration
├── README.md              # Project documentation
├── .gitignore             # Git ignore rules
├── .github/               # GitHub workflows
│   └── workflows/
│       └── static.yml     # GitHub Pages deployment
├── assets/                # Static assets
│   ├── css/               # Stylesheets
│   │   └── style.css      # Main CSS file
│   ├── js/                # JavaScript files
│   │   └── lastfm-widget.js # Last.fm integration
│   └── images/            # Images and icons
│       └── favicon.png    # Website favicon
├── pages/                 # Secondary pages
│   ├── blog.html          # Blog page
│   ├── projects.html      # Projects page
│   └── gallery.html       # Gallery page
└── docs/                  # Documentation
    └── STRUCTURE.md       # This file
```

## File Organization Principles

### Assets Directory (`/assets/`)
- **CSS**: All stylesheets in `/assets/css/`
- **JavaScript**: All scripts in `/assets/js/`
- **Images**: All images, icons, and media in `/assets/images/`

### Pages Directory (`/pages/`)
- Secondary pages (not homepage) organized separately
- Easier navigation and maintenance
- Clear separation of content types

### Root Level
- Main entry points (index.html, 404.html)
- Configuration files (CNAME, robots.txt)
- Documentation (README.md)

## Path References

### From Root Directory
- CSS: `assets/css/style.css`
- JS: `assets/js/lastfm-widget.js`
- Images: `assets/images/favicon.png`
- Pages: `pages/blog.html`

### From Pages Directory
- CSS: `../assets/css/style.css`
- JS: `../assets/js/lastfm-widget.js`
- Images: `../assets/images/favicon.png`
- Home: `../index.html`

## Benefits

1. **Clean Organization**: Clear separation of concerns
2. **Scalability**: Easy to add new assets and pages
3. **Maintainability**: Predictable file locations
4. **Best Practices**: Follows standard web development structure
5. **SEO Friendly**: Organized URLs and file structure
6. **Performance**: Efficient asset loading and caching

## GitHub Pages Compatibility

This structure is fully compatible with GitHub Pages:
- Root-level HTML files are served directly
- Assets are properly referenced with relative paths
- No special configuration needed for static hosting
