// Automatically handles active page highlighting
function setActiveLink() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('.tabs a');
  links.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveLink();
});
