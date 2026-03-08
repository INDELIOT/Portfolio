// ============================================
// Admin Panel - Blog Management System
// Uses data/blogs.json as source, localStorage as working cache
// Export JSON to save changes back to file
// ============================================

// ---- Config ----
const ADMIN_USERNAME = 'admin';
const STORAGE_KEY = 'portfolio_blogs';
const SESSION_KEY = 'admin_session';

// Simple hash function for password comparison
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

// Pre-compute the hash for validation
const VALID_PASS_HASH = simpleHash('shivam@2026');

// ---- DOM Elements ----
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const blogForm = document.getElementById('blog-form');
const adminBlogList = document.getElementById('admin-blog-list');
const blogCount = document.getElementById('blog-count');
const pageTitle = document.getElementById('page-title');
const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.querySelector('.sidebar');
const exportBtn = document.getElementById('export-json-btn');

let deleteBlogId = null;

// ---- Init ----
function init() {
    // Load blogs from data/blogs.json into localStorage (if not cached)
    loadBlogsFromJSON();

    // Check session
    if (sessionStorage.getItem(SESSION_KEY)) {
        showDashboard();
    } else {
        showLogin();
    }

    setupEventListeners();
}

// Load blogs from JSON file
function loadBlogsFromJSON() {
    // If localStorage already has blogs, use those (admin may have made edits)
    if (localStorage.getItem(STORAGE_KEY)) {
        loadAdminBlogs();
        return;
    }

    fetch('data/blogs.json')
        .then(res => {
            if (!res.ok) throw new Error('File not found');
            return res.json();
        })
        .then(blogs => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
            loadAdminBlogs();
        })
        .catch(err => {
            console.log('Could not load blogs.json, using empty:', err.message);
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
            loadAdminBlogs();
        });
}

// ---- Auth ----
function showLogin() {
    loginScreen.classList.remove('hidden');
    dashboard.classList.add('hidden');
}

function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loadAdminBlogs();
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (username === ADMIN_USERNAME && simpleHash(password) === VALID_PASS_HASH) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        loginError.textContent = '';
        showDashboard();
    } else {
        loginError.textContent = '❌ Invalid username or password';
        document.getElementById('login-password').value = '';
    }
}

function handleLogout(e) {
    e.preventDefault();
    sessionStorage.removeItem(SESSION_KEY);
    showLogin();
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}

// ---- Blog CRUD ----
function getBlogs() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveBlogs(blogs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
}

function loadAdminBlogs() {
    const blogs = getBlogs();
    blogCount.textContent = `${blogs.length} Blog${blogs.length !== 1 ? 's' : ''}`;

    if (blogs.length === 0) {
        adminBlogList.innerHTML = `
            <div class="empty-state">
                <i class="far fa-newspaper"></i>
                <h3>No blogs yet</h3>
                <p>Click "Add New Blog" to create your first post.</p>
            </div>
        `;
        return;
    }

    adminBlogList.innerHTML = blogs.map(blog => `
        <div class="admin-blog-card" data-id="${blog.id}">
            <div class="card-image">
                <img src="${blog.image}" alt="${blog.title}" onerror="this.style.display='none'">
            </div>
            <div class="card-body">
                <h4>${blog.link ? `<a href="${blog.link}" target="_blank" style="color:var(--admin-primary);text-decoration:none;">${blog.title} <i class="fas fa-external-link-alt" style="font-size:0.7rem"></i></a>` : blog.title}</h4>
                <p>${blog.content}</p>
            </div>
            <div class="card-actions">
                <button class="btn btn-edit" onclick="editBlog(${blog.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-delete" onclick="openDeleteModal(${blog.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function handleBlogSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById('edit-blog-id').value;
    const title = document.getElementById('blog-title').value.trim();
    const image = document.getElementById('blog-image').value.trim();
    const link = document.getElementById('blog-link').value.trim();
    const content = document.getElementById('blog-content').value.trim();

    let blogs = getBlogs();

    if (editId) {
        // Update existing blog
        blogs = blogs.map(b => b.id === parseInt(editId) ? { ...b, title, image, link, content } : b);
        showToast('Blog updated successfully! ✅');
    } else {
        // Add new blog
        const newId = blogs.length > 0 ? Math.max(...blogs.map(b => b.id)) + 1 : 1;
        blogs.push({ id: newId, title, image, link, content });
        showToast('Blog published! 🎉 Export JSON to save permanently.');
    }

    saveBlogs(blogs);
    resetForm();
    switchTab('blogs-tab');
    loadAdminBlogs();
}

function editBlog(id) {
    const blogs = getBlogs();
    const blog = blogs.find(b => b.id === id);
    if (!blog) return;

    document.getElementById('edit-blog-id').value = blog.id;
    document.getElementById('blog-title').value = blog.title;
    document.getElementById('blog-image').value = blog.image;
    document.getElementById('blog-link').value = blog.link || '';
    document.getElementById('blog-content').value = blog.content;
    document.getElementById('form-title').innerHTML = '<i class="fas fa-edit"></i> Edit Blog';
    document.getElementById('submit-btn-text').textContent = 'Update Blog';
    document.getElementById('cancel-edit').style.display = 'inline-flex';

    switchTab('add-blog-tab');
    updatePreview();
}

function openDeleteModal(id) {
    deleteBlogId = id;
    deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
    deleteBlogId = null;
    deleteModal.classList.add('hidden');
}

function confirmDelete() {
    if (deleteBlogId === null) return;
    let blogs = getBlogs();
    blogs = blogs.filter(b => b.id !== deleteBlogId);
    saveBlogs(blogs);
    closeDeleteModal();
    loadAdminBlogs();
    showToast('Blog deleted! 🗑️ Export JSON to save permanently.');
}

function resetForm() {
    blogForm.reset();
    document.getElementById('edit-blog-id').value = '';
    document.getElementById('blog-link').value = '';
    document.getElementById('form-title').innerHTML = '<i class="fas fa-pen-fancy"></i> Write a New Blog';
    document.getElementById('submit-btn-text').textContent = 'Publish Blog';
    document.getElementById('cancel-edit').style.display = 'none';
    resetPreview();
}

// ---- Export JSON ----
function exportBlogsJSON() {
    const blogs = getBlogs();
    const jsonStr = JSON.stringify(blogs, null, 4);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blogs.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✅ blogs.json downloaded! Replace it in data/ folder and push to GitHub.');
}

// ---- Tab Navigation ----
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
    
    const navItem = document.querySelector(`[data-tab="${tabId}"]`);
    if (navItem) navItem.classList.add('active');

    // Update page title
    if (tabId === 'blogs-tab') {
        pageTitle.textContent = 'My Blogs';
    } else {
        const editId = document.getElementById('edit-blog-id').value;
        pageTitle.textContent = editId ? 'Edit Blog' : 'Add New Blog';
    }

    // Close mobile sidebar
    sidebar.classList.remove('open');
}

// ---- Live Preview ----
function updatePreview() {
    const title = document.getElementById('blog-title').value.trim();
    const image = document.getElementById('blog-image').value.trim();
    const link = document.getElementById('blog-link').value.trim();
    const content = document.getElementById('blog-content').value.trim();
    const preview = document.getElementById('blog-preview');

    if (!title && !image && !content) {
        resetPreview();
        return;
    }

    preview.innerHTML = `
        ${image ? `<div class="preview-img"><img src="${image}" alt="Preview" onerror="this.parentElement.innerHTML='<div style=\\'padding:2rem;text-align:center;color:var(--admin-text-muted)\\'>⚠️ Image not found</div>'"></div>` : ''}
        <div class="preview-body">
            <h4>${link ? `<a href="${link}" target="_blank" style="color:var(--admin-primary);text-decoration:none;">${title || 'Untitled'} ↗</a>` : (title || 'Untitled Blog')}</h4>
            <p>${content || 'No content yet...'}</p>
        </div>
    `;
}

function resetPreview() {
    document.getElementById('blog-preview').innerHTML = `
        <div class="preview-placeholder">
            <i class="fas fa-image"></i>
            <p>Start typing to see preview...</p>
        </div>
    `;
}

// ---- Toast Notification ----
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 4000);
}

// ---- Event Listeners ----
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    blogForm.addEventListener('submit', handleBlogSubmit);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    exportBtn.addEventListener('click', exportBlogsJSON);

    // Cancel edit button
    document.getElementById('cancel-edit').addEventListener('click', () => {
        resetForm();
        switchTab('blogs-tab');
    });

    // Tab navigation
    document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.dataset.tab;
            if (tabId === 'add-blog-tab') resetForm();
            switchTab(tabId);
        });
    });

    // Live preview
    ['blog-title', 'blog-image', 'blog-link', 'blog-content'].forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
    });

    // Mobile menu
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });

    // Close modal on overlay click
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });
}

// ---- Start ----
init();
