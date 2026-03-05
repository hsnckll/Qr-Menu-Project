/**
 * DukkanQR — Admin Panel Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    updateStats();
    renderCategoryList();
    renderProductList();
    loadSettings();
    initLogoUpload();
    initProductForm();
    initCategoryForm();
    document.getElementById('current-year').textContent = new Date().getFullYear();
});

/* ==================== NAVIGATION ==================== */
function initNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => activateSection(item.dataset.section));
    });
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.querySelector('.admin-sidebar');
    if (hamburger) hamburger.onclick = () => sidebar.classList.toggle('open');
    document.addEventListener('click', e => {
        if (!sidebar.contains(e.target) && e.target !== hamburger) sidebar.classList.remove('open');
    });
}

function activateSection(name) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`section-${name}`)?.classList.add('active');
    document.querySelector(`[data-section="${name}"]`)?.classList.add('active');
    const labels = {
        dashboard: 'Genel Bakış', categories: 'Kategoriler',
        products: 'Ürünler', about: 'Hakkımızda', settings: 'Ayarlar'
    };
    document.getElementById('topbar-title').textContent = labels[name] || 'Yönetim';
}

/* ==================== STATS ==================== */
function updateStats() {
    document.getElementById('stat-categories').textContent = store.categories.length;
    document.getElementById('stat-products').textContent = store.products.length;
    document.getElementById('stat-available').textContent = store.products.filter(p => p.available !== false).length;
    document.getElementById('stat-unavailable').textContent = store.products.filter(p => p.available === false).length;

    const visitorEl = document.getElementById('stat-visitors');
    if (visitorEl) visitorEl.textContent = store.visitorCount || 0;
}

/* ==================== CATEGORIES ==================== */
let editingCategoryId = null;

function renderCategoryList() {
    const tbody = document.getElementById('category-table-body');
    tbody.innerHTML = '';
    store.categories.forEach(cat => {
        const count = store.products.filter(p => p.categoryId === cat.id).length;
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td><span style="font-size:1.4rem">${cat.icon || '🍽️'}</span></td>
      <td><strong>${cat.name}</strong></td>
      <td>${count} ürün</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-ghost btn-sm" onclick="openEditCategory(${cat.id})">✏️ Düzenle</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCategory(${cat.id})">🗑️ Sil</button>
        </div>
      </td>`;
        tbody.appendChild(tr);
    });
}

function openAddCategory() {
    editingCategoryId = null;
    document.getElementById('cat-modal-title').textContent = 'Yeni Kategori';
    document.getElementById('cat-name').value = '';
    document.getElementById('cat-icon').value = '';
    openModal('cat-modal');
}

function openEditCategory(id) {
    const cat = store.categories.find(c => c.id === id);
    if (!cat) return;
    editingCategoryId = id;
    document.getElementById('cat-modal-title').textContent = 'Kategori Düzenle';
    document.getElementById('cat-name').value = cat.name;
    document.getElementById('cat-icon').value = cat.icon || '';
    openModal('cat-modal');
}

function initCategoryForm() {
    document.getElementById('cat-form').onsubmit = e => {
        e.preventDefault();
        const name = document.getElementById('cat-name').value.trim();
        const icon = document.getElementById('cat-icon').value.trim() || '🍽️';
        if (!name) return;
        if (editingCategoryId) {
            const cat = store.categories.find(c => c.id === editingCategoryId);
            if (cat) { cat.name = name; cat.icon = icon; }
        } else {
            store.categories.push({ id: Date.now(), name, icon });
        }
        saveData(store);
        renderCategoryList();
        updateStats();
        closeModal('cat-modal');
        showToast(editingCategoryId ? 'Kategori güncellendi!' : 'Kategori eklendi!');
    };
}

function deleteCategory(id) {
    if (!confirm('Bu kategoriyi ve tüm ürünlerini silmek istediğinize emin misiniz?')) return;
    store.categories = store.categories.filter(c => c.id !== id);
    store.products = store.products.filter(p => p.categoryId !== id);
    saveData(store);
    renderCategoryList();
    renderProductList();
    updateStats();
    showToast('Kategori silindi!', 'danger');
}

/* ==================== PRODUCTS ==================== */
let editingProductId = null;
let currentProductImage = null;

function renderProductList() {
    const tbody = document.getElementById('product-table-body');
    tbody.innerHTML = '';
    store.products.forEach(product => {
        const cat = store.categories.find(c => c.id === product.categoryId);
        const imgHTML = product.image
            ? `<div class="tbl-img"><img src="${product.image}" alt="${product.name}"></div>`
            : `<div class="tbl-img">🍽️</div>`;
        const tr = document.createElement('tr');

        // Handle both old and new price formats
        const p1 = product.price_1 || product.price || '0.00';
        const p1_5 = product.price_1_5;
        const priceDisplay = p1_5
            ? `<div style="line-height:1.2">
                 <div style="font-size:0.85rem;color:var(--text-muted)">1 Pors: <strong style="color:var(--primary)">${p1} ₺</strong></div>
                 <div style="font-size:0.85rem;color:var(--text-muted)">1.5 Pors: <strong style="color:var(--primary)">${p1_5} ₺</strong></div>
               </div>`
            : `<strong style="color:var(--primary)">${p1} ₺</strong>`;

        tr.innerHTML = `
      <td>
        <div class="product-row-info">
          ${imgHTML}
          <div class="product-row-text">
            <div class="pname">${product.name}</div>
            <div class="pdesc">${product.description || ''}</div>
          </div>
        </div>
      </td>
      <td>${cat?.name || '—'}</td>
      <td>${priceDisplay}</td>
      <td><span class="badge ${product.available !== false ? 'badge-green' : 'badge-red'}">${product.available !== false ? 'Mevcut' : 'Mevcut Değil'}</span></td>
      <td>
        <div class="td-actions">
          <button class="btn btn-ghost btn-sm" onclick="openEditProduct(${product.id})">✏️ Düzenle</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">🗑️ Sil</button>
        </div>
      </td>`;
        tbody.appendChild(tr);
    });
}

function openAddProduct() {
    editingProductId = null;
    currentProductImage = null;
    document.getElementById('product-modal-title').textContent = 'Yeni Ürün';
    document.getElementById('product-form').reset();
    document.getElementById('price-1-input').value = '';
    document.getElementById('price-1-5-input').value = '';
    hideImagePreview();
    populateCategorySelect('product-category');
    openModal('product-modal');
}

function openEditProduct(id) {
    const product = store.products.find(p => p.id === id);
    if (!product) return;
    editingProductId = id;
    currentProductImage = product.image || null;
    document.getElementById('product-modal-title').textContent = 'Ürün Düzenle';
    populateCategorySelect('product-category', product.categoryId);
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-desc').value = product.description || '';
    document.getElementById('price-1-input').value = product.price_1 || product.price || '';
    document.getElementById('price-1-5-input').value = product.price_1_5 || '';
    document.getElementById('product-available').checked = product.available !== false;
    if (product.image) showImagePreview(product.image); else hideImagePreview();
    openModal('product-modal');
}

function populateCategorySelect(selectId, selectedId = null) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Kategori Seçin</option>';
    store.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = `${cat.icon} ${cat.name}`;
        if (selectedId && cat.id === selectedId) opt.selected = true;
        select.appendChild(opt);
    });
}

function initProductForm() {
    document.getElementById('product-image-file')?.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => { currentProductImage = ev.target.result; showImagePreview(ev.target.result); };
        reader.readAsDataURL(file);
    });

    document.getElementById('product-form').onsubmit = e => {
        e.preventDefault();
        const categoryId = parseInt(document.getElementById('product-category').value);
        const name = document.getElementById('product-name').value.trim();
        const description = document.getElementById('product-desc').value.trim();
        const price_1 = document.getElementById('price-1-input').value.trim();
        const price_1_5 = document.getElementById('price-1-5-input').value.trim();
        const available = document.getElementById('product-available').checked;
        if (!name || !categoryId || !price_1) { showToast('Zorunlu alanları doldurun!', 'danger'); return; }
        if (editingProductId) {
            const p = store.products.find(x => x.id === editingProductId);
            if (p) Object.assign(p, { categoryId, name, description, price_1, price_1_5, available, image: currentProductImage });
        } else {
            store.products.push({ id: Date.now(), categoryId, name, description, price_1, price_1_5, available, image: currentProductImage });
        }
        saveData(store);
        renderProductList();
        renderCategoryList();
        updateStats();
        closeModal('product-modal');
        showToast(editingProductId ? 'Ürün güncellendi!' : 'Ürün eklendi!');
    };
}

function deleteProduct(id) {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    store.products = store.products.filter(p => p.id !== id);
    saveData(store);
    renderProductList();
    updateStats();
    showToast('Ürün silindi!', 'danger');
}

function showImagePreview(src) {
    document.getElementById('img-preview-wrap').style.display = 'block';
    document.getElementById('img-preview').src = src;
}

function hideImagePreview() {
    document.getElementById('img-preview-wrap').style.display = 'none';
    currentProductImage = null;
}

/* ==================== SETTINGS — General ==================== */
let settingsLogoData = null;

function loadSettings() {
    document.getElementById('setting-shop-name').value = store.shopName;
    settingsLogoData = store.shopLogo;
    updateSettingsLogoPreview();

    // About Us
    const a = store.aboutUs || {};
    document.getElementById('about-description-input').value = a.description || '';
    document.getElementById('about-address-input').value = a.address || '';
    document.getElementById('about-phone-input').value = a.phone || '';
    document.getElementById('about-website-input').value = a.website || '';
    document.getElementById('about-map-input').value = a.mapEmbed || '';

    // EmailJS
    const ejs = store.emailjsConfig || {};
    document.getElementById('ejs-public-key').value = ejs.publicKey || '';
    document.getElementById('ejs-service-id').value = ejs.serviceId || '';
    document.getElementById('ejs-template-id').value = ejs.templateId || '';
    document.getElementById('ejs-admin-email').value = ejs.adminEmail || '';
}

function updateSettingsLogoPreview() {
    const imgEl = document.getElementById('settings-logo-img');
    const emojiEl = document.getElementById('settings-logo-emoji');
    if (settingsLogoData) {
        imgEl.src = settingsLogoData; imgEl.style.display = 'block'; emojiEl.style.display = 'none';
    } else {
        imgEl.style.display = 'none'; emojiEl.style.display = 'block';
    }
}

function initLogoUpload() {
    document.getElementById('settings-logo-preview')?.addEventListener('click', () => {
        document.getElementById('logo-file-input').click();
    });
    document.getElementById('logo-file-input')?.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => { settingsLogoData = ev.target.result; updateSettingsLogoPreview(); };
        reader.readAsDataURL(file);
    });
}

function saveSettings() {
    const name = document.getElementById('setting-shop-name').value.trim();
    if (!name) { showToast('Dükkan adı boş olamaz!', 'danger'); return; }
    store.shopName = name;
    store.shopLogo = settingsLogoData;
    saveData(store);
    showToast('Ayarlar kaydedildi! ✓');
    // Update sidebar
    document.getElementById('sidebar-shop-name').textContent = name;
    if (store.shopLogo) {
        document.getElementById('sidebar-logo-img').src = store.shopLogo;
        document.getElementById('sidebar-logo-img').style.display = 'block';
        document.getElementById('sidebar-logo-emoji').style.display = 'none';
    } else {
        document.getElementById('sidebar-logo-img').style.display = 'none';
        document.getElementById('sidebar-logo-emoji').style.display = 'block';
    }
}

function removeLogo() {
    settingsLogoData = null;
    document.getElementById('logo-file-input').value = '';
    updateSettingsLogoPreview();
}

/* ==================== SETTINGS — About Us ==================== */
function saveAboutSettings() {
    if (!store.aboutUs) store.aboutUs = {};
    store.aboutUs.description = document.getElementById('about-description-input').value.trim();
    store.aboutUs.address = document.getElementById('about-address-input').value.trim();
    store.aboutUs.phone = document.getElementById('about-phone-input').value.trim();
    store.aboutUs.website = document.getElementById('about-website-input').value.trim();
    store.aboutUs.mapEmbed = document.getElementById('about-map-input').value.trim();
    saveData(store);
    showToast('Hakkımızda bilgileri kaydedildi! ✓');
}

/* ==================== SETTINGS — EmailJS ==================== */
function saveEmailjsSettings() {
    if (!store.emailjsConfig) store.emailjsConfig = {};
    const publicKey = document.getElementById('ejs-public-key').value.trim();
    const serviceId = document.getElementById('ejs-service-id').value.trim();
    const templateId = document.getElementById('ejs-template-id').value.trim();
    const adminEmail = document.getElementById('ejs-admin-email').value.trim();
    if (!publicKey || !serviceId || !templateId || !adminEmail) {
        showToast('Tüm EmailJS alanlarını doldurun!', 'danger'); return;
    }
    store.emailjsConfig = { publicKey, serviceId, templateId, adminEmail };
    saveData(store);
    showToast('EmailJS ayarları kaydedildi! ✓');
}

/* ==================== DANGER ZONE ==================== */
function resetToDefaults() {
    if (!confirm('Tüm veriler sıfırlanacak! Devam etmek istiyor musunuz?')) return;
    resetData();
    location.reload();
}

/* ==================== MODAL ==================== */
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('open');
    });
});

/* ==================== TOAST ==================== */
let toastTimer;
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `show ${type === 'danger' ? 'danger' : ''}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.className = ''; }, 3000);
}
