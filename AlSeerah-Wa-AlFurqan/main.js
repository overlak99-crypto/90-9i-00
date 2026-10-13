document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. التنقل بين تسجيل الدخول وإنشاء الحساب
    // ==========================================
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');

    if (showSignupBtn && signupForm && loginForm) {
        showSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        });
    }

    if (showLoginBtn && signupForm && loginForm) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    // ==========================================
    // 2. عملية تسجيل الدخول
    // ==========================================
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('login-email').value.trim().toLowerCase();
            const passwordInput = document.getElementById('login-password').value.trim();

            // بيانات الأدمن الخاصة بك
            const adminEmail = "ziad@alseerah.com";
            const adminPassword = "247612";

            if (emailInput === adminEmail && passwordInput === adminPassword) {
                alert("أهلاً بك يا عم زياد، جاري توجيهك لوحة التحكم...");
                window.location.href = 'admin.html';
            } else {
                alert("تم تسجيل الدخول بنجاح!");
                window.location.href = 'index.html';
            }
        });
    }

    // ==========================================
    // 3. عملية إنشاء حساب جديد
    // ==========================================
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = document.getElementById('signup-password').value;
            const confirmPass = document.getElementById('signup-confirm-password').value;

            if (pass !== confirmPass) {
                alert('كلمتا المرور غير متطابقتين!');
                return;
            }

            alert('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.');
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
            signupForm.reset();
        });
    }

    // ==========================================
    // 4. لوحة التحكم - إضافة وحذف القصص والصور
    // ==========================================
    const addStoryForm = document.getElementById('add-story-form');
    const storyImageInput = document.getElementById('story-image');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    let currentimageBase64 = "";

    if (storyImageInput) {
        storyImageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.addEventListener('load', function() {
                    currentimageBase64 = this.result;
                    if (imagePreview) imagePreview.setAttribute('src', this.result);
                    if (imagePreviewContainer) imagePreviewContainer.style.display = 'block';
                });
                reader.readAsDataURL(file);
            }
        });
    }

    if (addStoryForm) {
        addStoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const category = document.getElementById('story-category').value;
            const title = document.getElementById('story-title').value;
            const content = document.getElementById('story-content').value;
            const newStory = {
                id: Date.now(),
                category: category,
                title: title,
                content: content,
                image: currentimageBase64,
                date: new Date().toLocaleDateString('ar-EG')
            };

            let stories = JSON.parse(localStorage.getItem('alseerah_stories')) || [];
            stories.push(newStory);
            localStorage.setItem('alseerah_stories', JSON.stringify(stories));

            alert('تم نشر الموضوع بنجاح!');
            addStoryForm.reset();
            if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
            currentimageBase64 = "";
            loadAdminStoriesList();
        });
    }

    function loadAdminStoriesList() {
        const storiesListDiv = document.getElementById('stories-list');
        if (!storiesListDiv) return;

        let stories = JSON.parse(localStorage.getItem('alseerah_stories')) || [];
        if (stories.length === 0) {
            storiesListDiv.innerHTML = '<p class="empty-msg" style="text-align:center; color:#777; padding:15px;">لا توجد موضوعات منشورة حتى الآن.</p>';
            return;
        }

        storiesListDiv.innerHTML = stories.map(story => 
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding: 12px 0;">
                <div>
                    <strong>${story.title}</strong> <small style="color:#666;">(${story.date})</small>
                </div>
                <button onclick="deleteStory(${story.id})" class="btn-danger">حذف</button>
            </div>
        ).join('');
    }

    loadAdminStoriesList();

    // ==========================================
    // 5. عرض القصص وتصفيتها في الصفحة الرئيسية
    // ==========================================
    const cardsGrid = document.getElementById('cards-grid');
    const categoryButtons = document.querySelectorAll('.cat-btn');

    if (cardsGrid) {
        displayStories('all');

        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                displayStories(btn.getAttribute('data-cat'));
            });
        });
    }

}); // نهاية الـ DOMContentLoaded

// دوال عامة لتعمل عبر الـ HTML مباشرة
function deleteStory(id) {
    if (confirm('هل أنت متأكد من حذف هذا الموضوع؟')) {
        let stories = JSON.parse(localStorage.getItem('alseerah_stories')) || [];
        stories = stories.filter(s => s.id !== id);
        localStorage.setItem('alseerah_stories', JSON.stringify(stories));
        
        // إعادة تحميل القائمة في الأدمن لو مفتوحة
        const storiesListDiv = document.getElementById('stories-list');
        if (storiesListDiv) {
            window.location.reload();
        }
    }
}

function displayStories(category) {
    const cardsGrid = document.getElementById('cards-grid');
    if (!cardsGrid) return;
    
    let stories = JSON.parse(localStorage.getItem('alseerah_stories')) || [];
    let favorites = JSON.parse(localStorage.getItem('alseerah_favs')) || [];

    if (category === 'favorites') {
        stories = stories.filter(s => favorites.includes(s.id));
    } else if (category !== 'all') {
        stories = stories.filter(s => s.category === category);
    }

    if (stories.length === 0) {
        cardsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#777; padding:40px;">لا توجد موضوعات في هذا القسم حالياً.</p>';
        return;
    }

    cardsGrid.innerHTML = stories.map(story => {
        const isFav = favorites.includes(story.id);
        const imgTag = story.image ? `<img src="${story.image}" alt="${story.title}" class="card-img">` : ''
        return 
            <article class="story-card">
                ${imgTag}
                <div class="card-body">
                    <span class="card-tag">${getCategoryName(story.category)}</span>
                    <h2 class="card-title">${story.title}</h2>
                    <p class="card-text">${story.content}</p>
                    <div class="card-footer">
                        <small style="color:#777;">${story.date}</small>
                        <button onclick="toggleFavorite(${story.id})" class="fav-btn">
                            ${isFav ? '❤️ بالمفضلة' : '🤍 إضافة للمفضلة'}
                        </button>
                    </div>
                </div>
            </article>
        ;
    }).join('');
}

function getCategoryName(cat) {
    const names = { 
        'quran': 'القرآن والتفسير', 
        'seerah': 'السيرة النبوية', 
        'prophets': 'قصص الأنبياء', 
        'battles': 'غزوات ومعارك' 
    };
    return names[cat] || 'عام';
}

function toggleFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem('alseerah_favs')) || [];
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('alseerah_favs', JSON.stringify(favorites));
    
    const activeBtn = document.querySelector('.cat-btn.active');
    displayStories(activeBtn ? activeBtn.getAttribute('data-cat') : 'all');
}