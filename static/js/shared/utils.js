// 通知を表示
export function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'error') toast.style.backgroundColor = '#f44336';
    toast.textContent = message;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// YYYY-MM-DD形式に変換
export function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 「X日前」を計算
export function calculateDaysAgo(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
  
    if (diff === 0) return '今日';
    if (diff === 1) return '1日前';
    return `${diff}日前`;
}

// HTMLエスケープ
export function escapeHtml(s) {
    return String(s).replace(/[&<>'"`]/g, c => ({ 
        '&': '&amp;', '<': '&lt;', '>': '&gt;', 
        '"': '&quot;', "'": '&#39;', '`': '&#96;' 
    }[c]));
}

// デバウンス（連打防止）
export function debounce(fn, wait = 200) {
    let t;
    return function (...a) { 
        clearTimeout(t); 
        t = setTimeout(() => fn.apply(this, a), wait); 
    };
}

// スムーススクロール（ヘッダー考慮）
export function initSmoothScrolling(headerOffset = 80) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
}

// モーダル設定（開閉・背景クリック・ESCキー）
export function setupModal(modalId, openBtnId = null, closeBtnId = null, onOpen = null) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (openBtnId) {
        const openBtn = document.getElementById(openBtnId);
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                modal.setAttribute('aria-hidden', 'false');
                if (onOpen) onOpen();
            });
        }
    }

    const closeModal = () => modal.setAttribute('aria-hidden', 'true');

    if (closeBtnId) {
        const closeBtn = document.getElementById(closeBtnId);
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
            closeModal();
        }
    });
}