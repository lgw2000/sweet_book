document.addEventListener('DOMContentLoaded', () => {
    const pages = {
        home: document.getElementById('home-page'),
        login: document.getElementById('login-page'),
        find: document.getElementById('find-page'),
        signup: document.getElementById('signup-page')
    };

    function navigateTo(pageId) {
        Object.values(pages).forEach(page => {
            page.classList.remove('active');
        });
        pages[pageId].classList.add('active');
    }

    // Check login state on load
    if (localStorage.getItem('isLoggedIn') === 'true') {
        navigateTo('home');
    }

    // Helper for safe event listeners
    function addClick(id, callback) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', callback);
    }

    // Navigation triggers
    addClick('nav-login-btn', () => navigateTo('login'));
    addClick('go-find-btn', () => navigateTo('find'));
    addClick('go-signup-btn', () => navigateTo('signup'));
    
    addClick('back-login-from-find', () => navigateTo('login'));
    addClick('back-login-from-signup', () => navigateTo('login'));

    // API Helpers
    async function postData(url = '', data = {}) {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.detail || 'API request failed');
        }
        return result;
    }

    // Forms
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('user-id').value;
        const userPw = document.getElementById('user-pw').value;
        try {
            const res = await postData('/api/login', { user_id: userId, password: userPw });
            // alert(res.message);  // Removed per request
            // Save login state
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUser', userId);
            // Reset fields
            document.getElementById('user-id').value = '';
            document.getElementById('user-pw').value = '';
            navigateTo('home');
        } catch (error) {
            alert('로그인 실패: ' + error.message);
        }
    });
    
    document.getElementById('find-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('find-email').value;
        
        // 아이디 찾기인지 비밀번호 찾기인지 묻기
        const findPw = confirm("비밀번호를 찾으시겠습니까?\n(확인: 비밀번호 찾기, 취소: 아이디 찾기)");
        
        try {
            if (findPw) {
                const userId = prompt("아이디를 입력해주세요:");
                if (!userId) return;
                const res = await postData('/api/find-pw', { user_id: userId, email: email });
                alert(`임시 비밀번호가 발급되었습니다: ${res.temp_password}\n기억해두시고 로그인 후 변경바랍니다.`);
            } else {
                const res = await postData('/api/find-id', { email: email });
                alert(`가입하신 아이디는 [ ${res.user_id} ] 입니다.`);
            }
        } catch (error) {
            alert('찾기 실패: ' + error.message);
        }
    });

    document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newId = document.getElementById('new-id').value;
        const newPw = document.getElementById('new-pw').value;
        const newEmail = document.getElementById('new-email').value;
        
        try {
            const res = await postData('/api/signup', { user_id: newId, email: newEmail, password: newPw });
            // alert(res.message);  // Removed per request
            // Reset fields
            document.getElementById('new-id').value = '';
            document.getElementById('new-pw').value = '';
            document.getElementById('new-email').value = '';
            navigateTo('login');
        } catch (error) {
            alert('회원가입 실패: ' + error.message);
        }
    });

    // More Menu Toggle
    const moreBtn = document.getElementById('more-btn');
    const moreMenu = document.getElementById('more-menu');

    if (moreBtn && moreMenu) {
        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            moreMenu.classList.toggle('show');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!moreMenu.contains(e.target) && !moreBtn.contains(e.target)) {
                moreMenu.classList.remove('show');
            }
        });
    }

    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    if (themeToggleBtn && themeIcon) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('light-mode');
            
            if (document.body.classList.contains('light-mode')) {
                themeIcon.classList.remove('ph-moon');
                themeIcon.classList.add('ph-sun');
            } else {
                themeIcon.classList.remove('ph-sun');
                themeIcon.classList.add('ph-moon');
            }
        });
    }

    // Feed, Search, and Navigation Logic
    const feedStream = document.getElementById('feed-stream');
    const searchResults = document.getElementById('search-results');
    const feedContent = document.querySelector('.feed-content');
    const searchContent = document.querySelector('.search-content');
    const navHomeBtn = document.getElementById('nav-home-btn');
    const navSearchBtn = document.getElementById('nav-search-btn');
    

    function createPostElement(post) {
        const postEl = document.createElement('div');
        postEl.className = 'feed-post';
        
        let imgHtml = '';
        if (post.images && post.images.length > 0) {
            post.images.forEach(img => {
                imgHtml += `<img src="${img}" style="max-width:100%; border-radius:8px; margin-top:8px;">`;
            });
        }
        
        let repliesHtml = '';
        if (post.replies && post.replies.length > 0) {
            post.replies.forEach(r => {
                repliesHtml += `
                    <div class="reply-item">
                        <div class="reply-content">
                            <span class="reply-author">${r.author_id}</span>
                            ${r.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                        </div>
                    </div>
                `;
            });
        }

        const dateStr = post.created_at.endsWith('Z') ? post.created_at : post.created_at + 'Z';
        const postDate = new Date(dateStr);
        const diffMs = Math.max(0, new Date() - postDate);
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        let timeStr = '';
        if (diffSec < 60) timeStr = '방금 전';
        else if (diffMin < 60) timeStr = `${diffMin}분 전`;
        else if (diffHour < 24) timeStr = `${diffHour}시간 전`;
        else if (diffDay < 7) timeStr = `${diffDay}일 전`;
        else timeStr = postDate.toLocaleDateString();

        postEl.innerHTML = `
            <div class="post-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="https://ui-avatars.com/api/?name=${post.author_id}&background=333&color=fff&rounded=true" alt="프로필" class="profile-pic-small">
                    <span class="username">${post.author_id}</span>
                </div>
                <span style="color:#737373; font-size:12px;">${timeStr}</span>
            </div>
            <div class="post-content">
                ${post.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                ${imgHtml}
            </div>
            <div class="post-actions">
                <span><i class="ph ph-heart"></i> ${post.likes}</span>
                <span><i class="ph ph-chat-circle"></i> ${post.replies ? post.replies.length : 0}</span>
                <span><i class="ph ph-eye"></i> ${post.views || 0}</span>
            </div>
            <div class="replies-container">
                ${repliesHtml}
                <div class="reply-input-wrapper">
                    <input type="text" class="reply-input" placeholder="답글 달기...">
                    <button class="reply-submit-btn" data-post-id="${post.id}">게시</button>
                </div>
            </div>
        `;
        
        // Add event listener for reply submit
        const replyBtn = postEl.querySelector('.reply-submit-btn');
        const replyInput = postEl.querySelector('.reply-input');
        replyBtn.addEventListener('click', async () => {
            const content = replyInput.value.trim();
            if (!content) return;
            const authorId = localStorage.getItem('loggedInUser') || '나';
            try {
                const res = await fetch('/api/replies', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({post_id: post.id, author_id: authorId, content: content})
                });
                if (res.ok) {
                    const data = await res.json();
                    const r = data.reply;
                    const replyHtml = `
                        <div class="reply-item">
                            <div class="reply-content">
                                <span class="reply-author">${r.author_id}</span>
                                ${r.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                            </div>
                        </div>
                    `;
                    // Insert before the input wrapper
                    postEl.querySelector('.reply-input-wrapper').insertAdjacentHTML('beforebegin', replyHtml);
                    replyInput.value = '';
                    
                    // Increment chat count
                    const chatSpan = postEl.querySelector('.ph-chat-circle').parentElement;
                    if (chatSpan) {
                        const newCount = parseInt(chatSpan.textContent.trim()) + 1;
                        chatSpan.innerHTML = `<i class="ph ph-chat-circle"></i> ${newCount}`;
                    }
                }
            } catch(e) {
                console.error(e);
            }
        });
        
        replyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') replyBtn.click();
        });

        return postEl;
    }

    let currentFeedType = 'latest';
    let currentPopularTime = 'alltime';

    async function loadFeed(scrollToBottom = false) {
        if (!feedStream) return;
        const scrollContainer = document.querySelector('.feed-content');
        const scrollPos = scrollContainer ? scrollContainer.scrollTop : 0;
        
        feedStream.innerHTML = '';
        try {
            const userId = localStorage.getItem('loggedInUser') || '나';
            const res = await fetch(`/api/feed?type=${currentFeedType}&timeframe=${currentPopularTime}&user_id=${userId}`);
            const posts = await res.json();
            
            if (posts.length === 0) {
                feedStream.innerHTML = '<p style="text-align:center; color:#737373;">게시물이 없습니다.</p>';
            }
            
            posts.forEach(post => { feedStream.appendChild(createPostElement(post)); });
            
            // Restore scroll position to prevent jumping
            if (scrollContainer) {
                requestAnimationFrame(() => {
                    if (scrollToBottom) {
                        scrollContainer.scrollTop = scrollContainer.scrollHeight;
                    } else {
                        scrollContainer.scrollTop = scrollPos;
                    }
                });
            }
        } catch (e) {
            console.error('피드 로딩 에러', e);
        }
    }

    if (localStorage.getItem('isLoggedIn') === 'true') {
        loadFeed(true);
    }

    // Feed Tabs Toggle
    const feedTabs = document.querySelectorAll('.feed-tab');
    const popularSubtabs = document.getElementById('popular-subtabs');
    const subTabs = document.querySelectorAll('.sub-tab');

    feedTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            feedTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            currentFeedType = tab.dataset.type;
            
            if (currentFeedType === 'popular') {
                popularSubtabs.classList.remove('hidden');
            } else {
                popularSubtabs.classList.add('hidden');
            }
            loadFeed(true);
        });
    });

    subTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            subTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentPopularTime = tab.dataset.time;
            loadFeed(true);
        });
    });

    // Navigation (Home vs Search)
    if (navHomeBtn && navSearchBtn) {
        navHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navHomeBtn.classList.add('active');
            navSearchBtn.classList.remove('active');
            feedContent.classList.remove('hidden');
            searchContent.classList.add('hidden');
            loadFeed(true);
        });

        navSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navSearchBtn.classList.add('active');
            navHomeBtn.classList.remove('active');
            feedContent.classList.add('hidden');
            searchContent.classList.remove('hidden');
        });
    }

    // Search Logic
    const searchInput = document.getElementById('search-input');
    const searchSubmitBtn = document.getElementById('search-submit-btn');

    async function doSearch() {
        if (!searchInput.value.trim()) return;
        const scrollContainer = document.querySelector('.search-content');
        const scrollPos = scrollContainer ? scrollContainer.scrollTop : 0;
        
        searchResults.innerHTML = '';
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(searchInput.value.trim())}`);
            const posts = await res.json();
            
            if (posts.length === 0) {
                searchResults.innerHTML = '<p style="text-align:center; color:#737373;">검색 결과가 없습니다.</p>';
            }
            
            posts.forEach(post => { searchResults.appendChild(createPostElement(post)); });
            
            if (scrollContainer) {
                requestAnimationFrame(() => {
                    scrollContainer.scrollTop = scrollPos;
                });
            }
        } catch (e) {
            console.error('검색 에러', e);
        }
    }

    if (searchSubmitBtn) searchSubmitBtn.addEventListener('click', doSearch);
    if (searchInput) searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doSearch();
    });

    // Image Upload Logic
    const addPhotoBtn = document.getElementById('add-photo-btn');
    const imageUploadInput = document.getElementById('image-upload-input');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    let selectedImages = [];

    if (addPhotoBtn && imageUploadInput) {
        addPhotoBtn.addEventListener('click', () => {
            imageUploadInput.click();
        });

        imageUploadInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (selectedImages.filter(i => i !== null).length + files.length > 2) {
                alert('이미지는 최대 2장까지만 첨부할 수 있습니다.');
                return;
            }
            
            files.forEach(file => {
                selectedImages.push(file);
                const idx = selectedImages.length - 1;
                
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const previewHtml = `
                        <div class="preview-img-wrapper" data-index="${idx}">
                            <img src="${ev.target.result}" alt="Preview">
                            <button class="remove-img"><i class="ph ph-x"></i></button>
                        </div>
                    `;
                    imagePreviewContainer.insertAdjacentHTML('beforeend', previewHtml);
                    imagePreviewContainer.classList.remove('hidden');
                    
                    const newPreview = imagePreviewContainer.lastElementChild;
                    newPreview.querySelector('.remove-img').addEventListener('click', function() {
                        const i = parseInt(this.parentElement.dataset.index);
                        selectedImages[i] = null;
                        this.parentElement.remove();
                        if (selectedImages.filter(img => img !== null).length === 0) {
                            imagePreviewContainer.classList.add('hidden');
                        }
                        updateSubmitBtnState();
                    });
                };
                reader.readAsDataURL(file);
            });
            updateSubmitBtnState();
        });
    }

    // Post Creation Submission
    const postInput = document.getElementById('new-post-input');
    const postSubmitBtn = document.getElementById('post-submit-btn');

    function updateSubmitBtnState() {
        const hasText = postInput && postInput.value.trim().length > 0;
        const hasImg = selectedImages.filter(i => i !== null).length > 0;
        if (hasText || hasImg) {
            postSubmitBtn.classList.add('active');
        } else {
            postSubmitBtn.classList.remove('active');
        }
    }
    
    if (postInput) {
        postInput.addEventListener('input', updateSubmitBtnState);
        postInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (postSubmitBtn.classList.contains('active')) {
                    postSubmitBtn.click();
                }
            }
        });
    }

    if (postSubmitBtn) {
        postSubmitBtn.addEventListener('click', async () => {
            const content = postInput.value.trim();
            const validImages = selectedImages.filter(i => i !== null);
            if (content.length === 0 && validImages.length === 0) return;

            const authorId = localStorage.getItem('loggedInUser') || '나';

            const formData = new FormData();
            formData.append('author_id', authorId);
            formData.append('content', content);
            validImages.forEach(file => {
                formData.append('images', file);
            });

            try {
                const res = await fetch('/api/posts', {
                    method: 'POST',
                    body: formData
                });
                
                if (res.ok) {
                    const data = await res.json();
                    const newPost = data.post;
                    const scrollContainer = document.querySelector('.feed-content');
                    const isAtBottom = scrollContainer ? (scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 150) : true;
                    
                    feedStream.appendChild(createPostElement(newPost));
                    
                    postInput.value = '';
                    selectedImages = [];
                    imagePreviewContainer.innerHTML = '';
                    imagePreviewContainer.classList.add('hidden');
                    updateSubmitBtnState();
                    imageUploadInput.value = '';
                    
                    if (isAtBottom && scrollContainer) {
                        requestAnimationFrame(() => {
                            scrollContainer.scrollTop = scrollContainer.scrollHeight;
                        });
                    }
                } else {
                    alert('게시물 등록 실패');
                }
            } catch (e) {
                alert('오류 발생: ' + e);
            }
        });
    }
});
