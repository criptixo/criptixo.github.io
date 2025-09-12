// Blog filtering functionality
class BlogFilter {
  constructor() {
    this.initializeFilters();
  }

  initializeFilters() {
    const filterButtons = document.querySelectorAll('.blog-filters .filter-btn');
    const blogPosts = document.querySelectorAll('.blog-post');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.dataset.category;
        
        // Update active state
        this.updateActiveButton(button, filterButtons);
        
        // Filter blog posts
        this.filterPosts(category, blogPosts);
      });
    });
  }

  updateActiveButton(activeButton, allButtons) {
    allButtons.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
  }

  filterPosts(category, posts) {
    let visibleCount = 0;
    
    posts.forEach(post => {
      if (category === 'all') {
        post.style.display = 'block';
        post.classList.remove('filtered-out');
        visibleCount++;
      } else {
        const postCategories = post.dataset.category || '';
        const hasCategory = postCategories.split(' ').includes(category);
        
        if (hasCategory) {
          post.style.display = 'block';
          post.classList.remove('filtered-out');
          visibleCount++;
        } else {
          post.style.display = 'none';
          post.classList.add('filtered-out');
        }
      }
    });

    // Show/hide "no posts found" message
    this.toggleNoPostsMessage(visibleCount, category);

    // Add smooth animation for filtered posts
    this.animateFilteredPosts(posts);
  }

  toggleNoPostsMessage(visibleCount, category) {
    let noPostsMsg = document.querySelector('.no-posts-message');
    
    if (visibleCount === 0) {
      if (!noPostsMsg) {
        noPostsMsg = document.createElement('div');
        noPostsMsg.className = 'no-posts-message';
        noPostsMsg.innerHTML = `<p>No posts found in "${category}" category. Try selecting a different category.</p>`;
        document.querySelector('.blog-list').appendChild(noPostsMsg);
      }
      noPostsMsg.style.display = 'block';
    } else {
      if (noPostsMsg) {
        noPostsMsg.style.display = 'none';
      }
    }
  }

  animateFilteredPosts(posts) {
    const visiblePosts = Array.from(posts).filter(post => 
      post.style.display !== 'none'
    );

    visiblePosts.forEach((post, index) => {
      post.style.animationDelay = `${index * 0.1}s`;
      post.classList.remove('fade-in');
      // Force reflow
      post.offsetHeight;
      post.classList.add('fade-in');
    });
  }

  // Method to get category count for UI feedback
  getCategoryCount(category) {
    const posts = document.querySelectorAll('.blog-post');
    if (category === 'all') return posts.length;
    
    return Array.from(posts).filter(post => {
      const postCategories = post.dataset.category || '';
      return postCategories.split(' ').includes(category);
    }).length;
  }
}

// Initialize blog filter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BlogFilter();
});
