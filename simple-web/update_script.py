import re

with open("script.js", "r") as f:
    content = f.read()

# Create renderPost function
render_post_func = """
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

        postEl.innerHTML = `
            <div class="post-header">
                <img src="https://ui-avatars.com/api/?name=${post.author_id}&background=333&color=fff&rounded=true" alt="프로필" class="profile-pic-small">
                <span class="username">${post.author_id}</span>
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
                    if (!document.querySelector('.search-content').classList.contains('hidden')) {
                        doSearch();
                    } else {
                        loadFeed();
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
"""

# Replace in loadFeed
old_load_feed_loop = """            posts.forEach(post => {
                const postEl = document.createElement('div');
                postEl.className = 'feed-post';
                let imgHtml = '';
                if (post.images && post.images.length > 0) {
                    post.images.forEach(img => {
                        imgHtml += `<img src="${img}" style="max-width:100%; border-radius:8px; margin-top:8px;">`;
                    });
                }
                postEl.innerHTML = `
                    <div class="post-header">
                        <img src="https://ui-avatars.com/api/?name=${post.author_id}&background=333&color=fff&rounded=true" alt="프로필" class="profile-pic-small">
                        <span class="username">${post.author_id}</span>
                    </div>
                    <div class="post-content">
                        ${post.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                        ${imgHtml}
                    </div>
                `;
                feedStream.appendChild(postEl);
            });"""

new_load_feed_loop = "            posts.forEach(post => { feedStream.appendChild(createPostElement(post)); });"

# Replace in doSearch
old_search_loop = """            posts.forEach(post => {
                const postEl = document.createElement('div');
                postEl.className = 'feed-post';
                let imgHtml = '';
                if (post.images && post.images.length > 0) {
                    post.images.forEach(img => {
                        imgHtml += `<img src="${img}" style="max-width:100%; border-radius:8px; margin-top:8px;">`;
                    });
                }
                postEl.innerHTML = `
                    <div class="post-header">
                        <img src="https://ui-avatars.com/api/?name=${post.author_id}&background=333&color=fff&rounded=true" alt="프로필" class="profile-pic-small">
                        <span class="username">${post.author_id}</span>
                    </div>
                    <div class="post-content">
                        ${post.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                        ${imgHtml}
                    </div>
                `;
                searchResults.appendChild(postEl);
            });"""
            
new_search_loop = "            posts.forEach(post => { searchResults.appendChild(createPostElement(post)); });"


content = content.replace("    let currentFeedType = 'latest';", render_post_func + "\n    let currentFeedType = 'latest';")
content = content.replace(old_load_feed_loop, new_load_feed_loop)
content = content.replace(old_search_loop, new_search_loop)

with open("script.js", "w") as f:
    f.write(content)

print("Updated script.js")
