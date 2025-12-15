let currentView = 'home';

// ビュー要素
const views = {
    'home': document.getElementById('home-view'),
    'services': document.getElementById('services-view'),
    'contact': document.getElementById('contact-view'),
};

// ナビリンク
const navLinks = {
    'home': document.getElementById('nav-home'),
    'services': document.getElementById('nav-services'),
    'contact': document.getElementById('nav-contact'),
};

// ナビゲーション処理
function navigate(viewId) {
    if (currentView === viewId) return;

    Object.values(views).forEach(view => {
        view.classList.remove('animate-fadeIn');
        view.style.display = 'none';
    });

    const targetView = views[viewId];
    if (targetView) {
        targetView.style.display = 'block';
        void targetView.offsetWidth;
        targetView.classList.add('animate-fadeIn');
    }

    Object.keys(navLinks).forEach(key => {
        navLinks[key].classList.remove('active-link');
        if (key === viewId) navLinks[key].classList.add('active-link');
    });

    currentView = viewId;
}

// お問い合わせフォーム処理
const contactForm = document.getElementById('contact-form');
const statusMessage = document.getElementById('status-message');

contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;

    statusMessage.classList.remove('hidden', 'text-red-500');
    statusMessage.classList.add('text-green-500');
    statusMessage.textContent = `${name}様、メッセージを承りました。`;

    contactForm.reset();

    setTimeout(() => {
        statusMessage.classList.add('hidden');
        statusMessage.textContent = '';
    }, 3000);
});

// 初期表示
window.onload = () => navigate('home');
