// Index page enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to snippet sections
    const snippets = document.querySelectorAll('.blog-snippet, .gallery-snippet');
    
    snippets.forEach(snippet => {
        snippet.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 5px 15px rgba(255, 105, 180, 0.1)';
        });
        
        snippet.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Add click tracking for snippet links
    const snippetLinks = document.querySelectorAll('.snippet-link');
    snippetLinks.forEach(link => {
        link.addEventListener('click', function() {
            console.log('Snippet link clicked:', this.href);
        });
    });
    
    // Add a subtle animation to tags on hover
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});
