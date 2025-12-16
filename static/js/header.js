document.addEventListener('DOMContentLoaded', () => {
    const navItemsWithDropdown = document.querySelectorAll('.nav-item.has-dropdown');
    navItemsWithDropdown.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.classList.add('show-dropdown');
        });
        item.addEventListener('mouseleave', () => {
            item.classList.remove('show-dropdown');
        });
    });
});