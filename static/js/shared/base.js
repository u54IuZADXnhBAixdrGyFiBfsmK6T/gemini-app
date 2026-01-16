document.addEventListener('DOMContentLoaded', () => {
    const siteHeader = document.getElementById('site-header');

    // Dropdown functionality for navigation items
    const navItemsWithDropdown = document.querySelectorAll('.site-header__nav-item.has-dropdown');
    navItemsWithDropdown.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (siteHeader && !siteHeader.classList.contains('is-open')) {
                item.classList.add('show-dropdown');
            }
        });
        item.addEventListener('mouseleave', () => {
            item.classList.remove('show-dropdown');
        });
    });

    // Hamburger menu toggle
    const hamburgerBtn = document.getElementById('hamburger-btn');
    if (hamburgerBtn && siteHeader) {
        hamburgerBtn.addEventListener('click', () => {
            siteHeader.classList.toggle('is-open');
            const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
            hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Hide header on scroll down, show on scroll up
    let lastScrollY = window.scrollY;
    if (siteHeader) {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Don't hide header when mobile menu is open
            if (siteHeader.classList.contains('is-open')) {
                return;
            }
            
            // Hide header when scrolling down
            if (currentScrollY > lastScrollY && currentScrollY > siteHeader.offsetHeight) {
                siteHeader.classList.add('is-hidden');
            }
            // Show header when scrolling up
            else if (currentScrollY < lastScrollY) {
                siteHeader.classList.remove('is-hidden');
            }
            
            lastScrollY = currentScrollY;
        }, { passive: true });
    }
    
    // Highlight current record page
    highlightCurrentRecordPage();
});

/**
 * Highlights the active record page link in the dropdown
 */
function highlightCurrentRecordPage() {
    const currentPath = window.location.pathname;
    const recordLinks = document.querySelectorAll('.record-link');
    
    recordLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath === href) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}