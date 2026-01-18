document.addEventListener('DOMContentLoaded', () => {
    const siteHeader = document.getElementById('site-header');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navItemsWithDropdown = document.querySelectorAll('.site-header__nav-item.has-dropdown');

    // モバイル判定
    const isMobile = () => window.innerWidth <= 768;

    // ドロップダウン機能（デスクトップ用）
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

        // モバイル用：クリックでドロップダウン切り替え
        const navLink = item.querySelector('.site-header__nav-link, .site-header__promo');
        if (navLink) {
            navLink.addEventListener('click', (e) => {
                if (isMobile() && siteHeader.classList.contains('is-open')) {
                    e.preventDefault();
                    
                    // 他のドロップダウンを閉じる
                    navItemsWithDropdown.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('show-dropdown');
                        }
                    });
                    
                    // 現在のドロップダウンを切り替え
                    item.classList.toggle('show-dropdown');
                }
            });
        }
    });

    // ハンバーガーメニュートグル
    if (hamburgerBtn && siteHeader) {
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = siteHeader.classList.toggle('is-open');
            hamburgerBtn.setAttribute('aria-expanded', isOpen);
            
            // メニューを閉じるときは全てのドロップダウンも閉じる
            if (!isOpen) {
                navItemsWithDropdown.forEach(item => {
                    item.classList.remove('show-dropdown');
                });
            }
        });
    }

    // メニュー外をクリックしたら閉じる
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

    // スクロールでヘッダーを隠す/表示
    let lastScrollY = window.scrollY;
    if (siteHeader) {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // モバイルメニューが開いている時は隠さない
            if (siteHeader.classList.contains('is-open')) {
                return;
            }
            
            // 下にスクロール時はヘッダーを隠す
            if (currentScrollY > lastScrollY && currentScrollY > siteHeader.offsetHeight) {
                siteHeader.classList.add('is-hidden');
            }
            // 上にスクロール時はヘッダーを表示
            else if (currentScrollY < lastScrollY) {
                siteHeader.classList.remove('is-hidden');
            }
            
            lastScrollY = currentScrollY;
        }, { passive: true });
    }
    
    // 現在のRecordページをハイライト
    highlightCurrentRecordPage();

    // ウィンドウリサイズ時の処理
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // デスクトップに戻ったらモバイルメニューの状態をリセット
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

/**
 * 現在のRecordページのリンクをハイライト
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