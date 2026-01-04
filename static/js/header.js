document.addEventListener('DOMContentLoaded', () => {
    const siteHeader = document.getElementById('site-header');

    // Desktop dropdown menu functionality
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

    // Hamburger menu functionality
    const hamburgerBtn = document.getElementById('hamburger-btn');
    if (hamburgerBtn && siteHeader) {
        hamburgerBtn.addEventListener('click', () => {
            siteHeader.classList.toggle('is-open');
            const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
            hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Auto-hide header on scroll
    let lastScrollY = window.scrollY;
    if (siteHeader) {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            // Do nothing if mobile menu is open
            if (siteHeader.classList.contains('is-open')) {
                return;
            }
            // Hide on scroll down past header height
            if (currentScrollY > lastScrollY && currentScrollY > siteHeader.offsetHeight) {
                siteHeader.classList.add('is-hidden');
            }
            // Show on scroll up
            else if (currentScrollY < lastScrollY) {
                siteHeader.classList.remove('is-hidden');
            }
            lastScrollY = currentScrollY;
        }, { passive: true });
    }
    
    // ===== Record ドロップダウンの現在ページハイライト =====
    highlightCurrentRecordPage();
});

function highlightCurrentRecordPage() {
    const currentPath = window.location.pathname;
    const recordLinks = document.querySelectorAll('.record-link');
    
    recordLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath === href) {
            link.classList.add('active');
        }
    });
}