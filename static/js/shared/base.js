document.addEventListener('DOMContentLoaded', () => {
    const siteHeader = document.getElementById('site-header');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navItemsWithDropdown = document.querySelectorAll('.site-header__nav-item.has-dropdown');

    const isMobile = () => window.innerWidth <= 768;

    navItemsWithDropdown.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (!isMobile() && siteHeader && !siteHeader.classList.contains('is-open')) {
                item.classList.add('show-dropdown');
            }
        });
        item.addEventListener('mouseleave', () => {
            if (!isMobile()) {
                item.classList.remove('show-dropdown');
            }
        });

        const navLink = item.querySelector('.site-header__nav-link, .site-header__promo');
        if (navLink) {
            navLink.addEventListener('click', (e) => {
                if (isMobile() && siteHeader.classList.contains('is-open')) {
                    e.preventDefault();
                    
                    navItemsWithDropdown.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('show-dropdown');
                        }
                    });
                    
                    item.classList.toggle('show-dropdown');
                }
            });
        }
    });

    if (hamburgerBtn && siteHeader) {
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = siteHeader.classList.toggle('is-open');
            hamburgerBtn.setAttribute('aria-expanded', isOpen);
            
            if (!isOpen) {
                navItemsWithDropdown.forEach(item => {
                    item.classList.remove('show-dropdown');
                });
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (isMobile() && siteHeader.classList.contains('is-open')) {
            const isClickInsideNav = e.target.closest('.site-header__nav') || e.target.closest('.site-header__hamburger');
            if (!isClickInsideNav) {
                siteHeader.classList.remove('is-open');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
                navItemsWithDropdown.forEach(item => {
                    item.classList.remove('show-dropdown');
                });
            }
        }
    });

    let lastScrollY = window.scrollY;
    if (siteHeader) {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (siteHeader.classList.contains('is-open')) {
                return;
            }
            
            if (currentScrollY > lastScrollY && currentScrollY > siteHeader.offsetHeight) {
                siteHeader.classList.add('is-hidden');
            }
            else if (currentScrollY < lastScrollY) {
                siteHeader.classList.remove('is-hidden');
            }
            
            lastScrollY = currentScrollY;
        }, { passive: true });
    }
    
    highlightCurrentRecordPage();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!isMobile() && siteHeader.classList.contains('is-open')) {
                siteHeader.classList.remove('is-open');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
                navItemsWithDropdown.forEach(item => {
                    item.classList.remove('show-dropdown');
                });
            }
        }, 250);
    });
});

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