/**
 * DukkanQR — Menu Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    trackVisitor();
    renderHeader();
    renderCategories();
    if (store.categories.length > 0) {
        showCategory(store.categories[0].id);
    } else {
        renderProducts([]);
    }
});

function renderHeader() {
    const nameEl = document.getElementById('shop-name');
    const logoEl = document.getElementById('shop-logo');
    const logoPlaceholder = document.getElementById('logo-placeholder');
    const aboutBtn = document.getElementById('header-about-btn');

    if (nameEl) nameEl.textContent = store.shopName;
    document.title = (store.shopName || 'Menü') + ' — Menü';

    if (store.shopLogo) {
        logoEl.src = store.shopLogo;
        logoEl.style.display = 'block';
        if (logoPlaceholder) logoPlaceholder.style.display = 'none';
    } else {
        logoEl.style.display = 'none';
        if (logoPlaceholder) logoPlaceholder.style.display = 'flex';
    }

    if (aboutBtn) {
        aboutBtn.onclick = () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            showAbout(true);
        };
    }
}

function renderCategories() {
    const container = document.getElementById('category-tabs');
    container.innerHTML = '';

    store.categories.forEach((cat) => {
        const btn = document.createElement('button');
        btn.className = 'cat-btn';
        btn.dataset.id = cat.id;
        btn.innerHTML = `<span class="cat-icon">${cat.icon || '🍽️'}</span>${cat.name}`;
        btn.onclick = () => {
            setActiveTab(btn);
            showAbout(false);
            showCategory(cat.id);
        };
        container.appendChild(btn);
    });

    // Activate first category
    const first = container.querySelector('.cat-btn');
    if (first) first.classList.add('active');
}

function setActiveTab(btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

/* ===== PRODUCT VIEW ===== */
function showCategory(categoryId) {
    document.getElementById('products-main').style.display = 'block';
    document.getElementById('about-section').classList.remove('active');

    if (!categoryId) { renderProducts([]); return; }

    const cat = store.categories.find(c => c.id === categoryId);
    const products = store.products.filter(p => p.categoryId === categoryId && p.available !== false);

    const titleEl = document.getElementById('section-title');
    const iconEl = document.getElementById('section-icon');
    const countEl = document.getElementById('section-count');

    if (cat) {
        titleEl.textContent = cat.name;
        iconEl.textContent = cat.icon || '🍽️';
    }
    if (countEl) {
        countEl.textContent = products.length + ' ürün';
        countEl.style.display = products.length ? 'inline-block' : 'none';
    }

    renderProducts(products);
}

function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍽️</div>
        <p>Bu kategoride henüz ürün yok.</p>
      </div>`;
        return;
    }

    products.forEach((product, i) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${i * 0.06}s`;

        const imgHTML = product.image
            ? `<img src="${product.image}" alt="${product.name}" loading="lazy">`
            : `<div class="product-img-placeholder">
           <span class="emoji">🍽️</span>
           <span>Fotoğraf Yok</span>
         </div>`;

        const p1 = product.price_1 || product.price || '0.00';
        const p1_5 = product.price_1_5;

        let pricesHTML = `<div class="product-price">${p1} ₺</div>`;
        if (p1_5 && p1_5.trim() !== '') {
            pricesHTML = `
                <div class="product-portions">
                    <div class="portion-item">
                        <span class="p-label">1 Por.</span>
                        <span class="p-price">${p1} ₺</span>
                    </div>
                    <div class="portion-item">
                        <span class="p-label">1.5 Por.</span>
                        <span class="p-price">${p1_5} ₺</span>
                    </div>
                </div>`;
        }

        card.innerHTML = `
      <div class="product-img-wrap">${imgHTML}</div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-desc">${product.description || ''}</div>
        <div class="product-footer">
          ${pricesHTML}
        </div>
      </div>`;

        grid.appendChild(card);
    });
}

/* ===== ABOUT VIEW ===== */
function showAbout(show) {
    const productsMain = document.getElementById('products-main');
    const aboutSection = document.getElementById('about-section');

    if (!show) {
        productsMain.style.display = 'block';
        aboutSection.classList.remove('active');
        return;
    }

    productsMain.style.display = 'none';
    aboutSection.classList.add('active');

    const about = store.aboutUs || {};

    // Description
    document.getElementById('about-description').textContent =
        about.description || 'Dükkan hakkında bilgi mevcut değil.';

    // Contact list
    const list = document.getElementById('about-contact-list');
    list.innerHTML = '';

    const items = [
        about.address && { icon: '📍', label: about.address, link: null },
        about.phone && { icon: '📞', label: about.phone, link: 'tel:' + about.phone },
        about.website && { icon: '🌐', label: about.website, link: about.website.startsWith('http') ? about.website : 'https://' + about.website },
    ].filter(Boolean);

    if (items.length === 0) {
        list.innerHTML = '<li style="color:var(--text-muted)">İletişim bilgisi girilmemiş.</li>';
    } else {
        items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
        <span class="contact-icon">${item.icon}</span>
        <span>${item.link
                    ? `<a class="contact-link" href="${item.link}" target="_blank" rel="noopener">${item.label}</a>`
                    : item.label
                }</span>`;
            list.appendChild(li);
        });
    }

    // Map
    const mapWrap = document.getElementById('about-map-wrap');
    if (about.mapEmbed && about.mapEmbed.trim()) {
        // Sanitise: only allow Google Maps embed src
        const srcMatch = about.mapEmbed.match(/src="([^"]+)"/);
        if (srcMatch) {
            mapWrap.innerHTML = `<iframe src="${srcMatch[1]}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
        } else {
            mapWrap.innerHTML = mapPlaceholder();
        }
    } else {
        mapWrap.innerHTML = mapPlaceholder();
    }
}

function mapPlaceholder() {
    return `<div class="about-map-placeholder">
    <span class="map-icon">🗺️</span>
    <p>Google Haritalar henüz eklenmedi.</p>
  </div>`;
}

function trackVisitor() {
    if (!sessionStorage.getItem('visited')) {
        store.visitorCount = (store.visitorCount || 0) + 1;
        saveData(store);
        sessionStorage.setItem('visited', 'true');
    }
}
