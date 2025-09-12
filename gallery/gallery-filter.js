// Gallery filtering functionality
class GalleryFilter {
  constructor() {
    this.initializeFilters();
  }

  initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.dataset.category;
        
        // Update active state
        this.updateActiveButton(button, filterButtons);
        
        // Filter gallery items
        this.filterItems(category, galleryItems);
      });
    });
  }

  updateActiveButton(activeButton, allButtons) {
    allButtons.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
  }

  filterItems(category, items) {
    items.forEach(item => {
      if (category === 'all') {
        item.style.display = 'flex';
        item.classList.remove('filtered-out');
      } else {
        const itemCategories = item.dataset.category || '';
        const hasCategory = itemCategories.split(' ').includes(category);
        
        if (hasCategory) {
          item.style.display = 'flex';
          item.classList.remove('filtered-out');
        } else {
          item.style.display = 'none';
          item.classList.add('filtered-out');
        }
      }
    });

    // Add smooth animation for filtered items
    this.animateFilteredItems(items);
  }

  animateFilteredItems(items) {
    const visibleItems = Array.from(items).filter(item => 
      item.style.display !== 'none'
    );

    visibleItems.forEach((item, index) => {
      item.style.animationDelay = `${index * 0.1}s`;
      item.classList.remove('fade-in');
      // Force reflow
      item.offsetHeight;
      item.classList.add('fade-in');
    });
  }

  // Method to get category count for UI feedback
  getCategoryCount(category) {
    const items = document.querySelectorAll('.gallery-item');
    if (category === 'all') return items.length;
    
    return Array.from(items).filter(item => {
      const itemCategories = item.dataset.category || '';
      return itemCategories.split(' ').includes(category);
    }).length;
  }
}

// Initialize gallery filter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new GalleryFilter();
});
