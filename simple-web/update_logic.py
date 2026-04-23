import re

# Update main.py
with open("main.py", "r") as f:
    main_content = f.read()

main_content = main_content.replace(
    '''    db.refresh(post)\n    return {"message": "Post created successfully", "id": post.id}''',
    '''    db.refresh(post)
    imgs = post.image_paths.split(",") if post.image_paths else []
    full_post = {
        "id": post.id,
        "author_id": post.author_id,
        "content": post.content,
        "images": [i for i in imgs if i],
        "likes": post.likes,
        "views": post.views,
        "created_at": post.created_at.isoformat(),
        "replies": []
    }
    return {"message": "Post created successfully", "post": full_post}'''
)

main_content = main_content.replace(
    '''    db.refresh(reply)\n    return {"message": "Reply created successfully"}''',
    '''    db.refresh(reply)
    full_reply = {
        "id": reply.id,
        "post_id": reply.post_id,
        "author_id": reply.author_id,
        "content": reply.content,
        "created_at": reply.created_at.isoformat()
    }
    return {"message": "Reply created successfully", "reply": full_reply}'''
)
# if there was no db.refresh(reply)
if 'db.refresh(reply)' not in main_content:
    main_content = main_content.replace(
        '''    db.commit()\n    return {"message": "Reply created successfully"}''',
        '''    db.commit()
    db.refresh(reply)
    full_reply = {
        "id": reply.id,
        "post_id": reply.post_id,
        "author_id": reply.author_id,
        "content": reply.content,
        "created_at": reply.created_at.isoformat()
    }
    return {"message": "Reply created successfully", "reply": full_reply}'''
    )

with open("main.py", "w") as f:
    f.write(main_content)


# Update script.js
with open("script.js", "r") as f:
    script_content = f.read()

# Replace reply logic
reply_old = '''                if (res.ok) {
                    if (!document.querySelector('.search-content').classList.contains('hidden')) {
                        doSearch();
                    } else {
                        loadFeed();
                    }
                }'''

reply_new = '''                if (res.ok) {
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
                }'''
script_content = script_content.replace(reply_old, reply_new)


# Replace post create logic
post_old = '''                if (res.ok) {
                    postInput.value = '';
                    selectedImages = [];
                    imagePreviewContainer.innerHTML = '';
                    imagePreviewContainer.classList.add('hidden');
                    updateSubmitBtnState();
                    imageUploadInput.value = '';
                    const scrollContainer = document.querySelector('.feed-content');
                    const isAtBottom = scrollContainer ? (scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 150) : true;
                    
                    loadFeed(isAtBottom);
                } else {'''

post_new = '''                if (res.ok) {
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
                } else {'''
script_content = script_content.replace(post_old, post_new)

with open("script.js", "w") as f:
    f.write(script_content)

print("Updated main.py and script.js")
