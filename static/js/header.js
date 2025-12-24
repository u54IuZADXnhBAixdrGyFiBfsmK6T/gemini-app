document.addEventListener('DOMContentLoaded', () => {
    // Desktop dropdown menu functionality
    const navItemsWithDropdown = document.querySelectorAll('.nav-item.has-dropdown');
    navItemsWithDropdown.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.classList.add('show-dropdown');
        });
        item.addEventListener('mouseleave', () => {
            item.classList.remove('show-dropdown');
        });
    });

    // Hamburger menu functionality
    const siteHeader = document.getElementById('site-header');
    const hamburgerBtn = document.getElementById('hamburger-btn');

    if (hamburgerBtn && siteHeader) {
        hamburgerBtn.addEventListener('click', () => {
            siteHeader.classList.toggle('is-open');
            const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
            hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
        });
    }
});