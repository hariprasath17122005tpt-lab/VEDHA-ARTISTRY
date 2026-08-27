/* ==========================================================================
   VEDHA LUXURY E-COMMERCE ENGINE
   Features: Kolam Loading Overlay, Shopping Cart, Wishlist Drawer, Custom Seeru Builder,
   Quick View Modal, WhatsApp Concierge, Back-To-Top, Scroll Animations
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 0. Dismiss Kolam Loader Screen smoothly
  const kolamLoader = document.getElementById('kolamLoader');
  if (kolamLoader) {
    setTimeout(() => {
      kolamLoader.classList.add('fade-out');
      setTimeout(() => {
        kolamLoader.style.display = 'none';
      }, 600);
    }, 800);
  }

  // Adjust video playback speed to make it slower and more elegant (0.75x)
  document.querySelectorAll('video').forEach(vid => {
    vid.playbackRate = 0.75;
    vid.addEventListener('loadedmetadata', () => {
      vid.playbackRate = 0.75;
    });
    vid.play().catch(() => {});
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      document.querySelectorAll('video[autoplay]').forEach(vid => {
        vid.play().catch(() => {});
      });
    }
  });

  // Global State
  let cart = JSON.parse(localStorage.getItem('vedha_cart')) || [];
  let wishlist = JSON.parse(localStorage.getItem('vedha_wishlist')) || [];

  // Navbar Scroll & Back-to-Top Effect
  const navbar = document.getElementById('navbar');
  const backToTopBtn = document.getElementById('backToTopBtn');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      if (navbar) navbar.classList.add('scrolled');
      if (backToTopBtn) backToTopBtn.classList.add('visible');
    } else {
      if (navbar) navbar.classList.remove('scrolled');
      if (backToTopBtn) backToTopBtn.classList.remove('visible');
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mobile Navigation Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Create Persistent Amazon/Flipkart Style Floating Cart Button
  let floatCartBtn = document.getElementById('floatingCartBtn');
  if (!floatCartBtn) {
    floatCartBtn = document.createElement('button');
    floatCartBtn.id = 'floatingCartBtn';
    floatCartBtn.className = 'floating-cart-btn';
    floatCartBtn.title = 'View Enquiry Cart';
    floatCartBtn.innerHTML = `
      <i class="fa-solid fa-bag-shopping"></i>
      <span class="floating-cart-badge" id="floatingCartCount">0</span>
    `;
    document.body.appendChild(floatCartBtn);
  }

  // Update Cart & Wishlist Count Badges
  function updateBadges() {
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    const cartCountEl = document.getElementById('cartCount');
    const wishlistCountEl = document.getElementById('wishlistCount');
    const floatingCartCountEl = document.getElementById('floatingCartCount');

    if (cartCountEl) cartCountEl.textContent = totalItems;
    if (floatingCartCountEl) floatingCartCountEl.textContent = totalItems;
    if (wishlistCountEl) wishlistCountEl.textContent = wishlist.length;
    const mobileCartCountEl = document.getElementById('mobileCartCount');
    const mobileWishlistCountEl = document.getElementById('mobileWishlistCount');
    if (mobileCartCountEl) mobileCartCountEl.textContent = totalItems;
    if (mobileWishlistCountEl) mobileWishlistCountEl.textContent = wishlist.length;
  }
  updateBadges();

  // Drawer Controls
  const cartDrawer = document.getElementById('cartDrawer');
  const wishlistDrawer = document.getElementById('wishlistDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');

  const cartBtn = document.getElementById('cartBtn');
  const wishlistBtn = document.getElementById('wishlistBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const closeWishlistBtn = document.getElementById('closeWishlistBtn');

  function openDrawer(drawer) {
    if (drawer && drawerOverlay) {
      drawer.classList.add('active');
      drawerOverlay.classList.add('active');
    }
  }

  function closeDrawers() {
    if (cartDrawer) cartDrawer.classList.remove('active');
    if (wishlistDrawer) wishlistDrawer.classList.remove('active');
    if (drawerOverlay) drawerOverlay.classList.remove('active');
  }

  if (cartBtn) cartBtn.addEventListener('click', () => { renderCart(); openDrawer(cartDrawer); });
  if (floatCartBtn) floatCartBtn.addEventListener('click', () => { renderCart(); openDrawer(cartDrawer); });
  if (wishlistBtn) wishlistBtn.addEventListener('click', () => { renderWishlist(); openDrawer(wishlistDrawer); });
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeDrawers);
  if (closeWishlistBtn) closeWishlistBtn.addEventListener('click', closeDrawers);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawers);

  document.querySelectorAll('.mobile-bottom-action').forEach(action => {
    action.addEventListener('click', () => {
      if (action.dataset.mobileAction === 'cart') {
        renderCart();
        openDrawer(cartDrawer);
      } else {
        renderWishlist();
        openDrawer(wishlistDrawer);
      }
    });
  });

  // Cart Functions
  window.addToCart = function(id, name, price, img) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, name, price, img, qty: 1 });
    }
    localStorage.setItem('vedha_cart', JSON.stringify(cart));
    updateBadges();
    showToast(`"${name}" added to your Seeru enquiry cart.`);
  };

  function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotalAmount');
    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#666; padding: 40px 0;">Your enquiry cart is empty.</p>';
      if (totalEl) totalEl.textContent = '₹0';
      return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
      total += item.price * item.qty;
      return `
        <div style="display:flex; gap:16px; align-items:center; margin-bottom:16px; border-bottom:1px solid #E8DFC9; padding-bottom:12px;">
          <img src="${item.img}" style="width:60px; height:60px; object-fit:cover; border-radius:10px;">
          <div style="flex:1;">
            <h5 style="font-size:0.95rem; margin-bottom:4px;">${item.name}</h5>
            <p style="font-size:0.85rem; color:#7B1E2B; font-weight:600;">₹${item.price.toLocaleString()} × ${item.qty}</p>
          </div>
          <button onclick="removeFromCart('${item.id}')" style="background:none; border:none; color:#999; cursor:pointer; font-size:1.1rem;">✕</button>
        </div>
      `;
    }).join('');

    if (totalEl) totalEl.textContent = `₹${total.toLocaleString()}`;
  }

  window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('vedha_cart', JSON.stringify(cart));
    updateBadges();
    renderCart();
  };

  // Wishlist Functions
  window.toggleWishlist = function(id, name, price, img) {
    const idx = wishlist.findIndex(item => item.id === id);
    if (idx > -1) {
      wishlist.splice(idx, 1);
      showToast(`Removed "${name}" from Wishlist.`);
    } else {
      wishlist.push({ id, name, price, img });
      showToast(`Saved "${name}" to Wishlist.`);
    }
    localStorage.setItem('vedha_wishlist', JSON.stringify(wishlist));
    updateBadges();
  };

  window.enhanceStoreWishlistButtons = function() {
    document.querySelectorAll('#thattuStoreGrid .thattu-card, #thattuStoreGrid .occasion-store-card').forEach(card => {
      if (card.querySelector('.store-wishlist-btn')) return;

      const cartButton = card.querySelector('[onclick*="addToCart"]');
      if (!cartButton) return;

      const match = cartButton.getAttribute('onclick').match(/addToCart\('([^']+)',\s*'((?:\\'|[^'])*)',\s*([\d.]+),\s*'([^']+)'\)/);
      if (!match) return;

      const [, id, rawName, price, img] = match;
      const name = rawName.replace(/\\'/g, "'");
      const actions = document.createElement('div');
      actions.className = 'product-actions store-product-actions';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'action-btn store-wishlist-btn';
      button.title = 'Add to Wishlist';
      button.setAttribute('aria-label', `Add ${name} to Wishlist`);
      button.innerHTML = '<i class="fa-regular fa-heart"></i>';
      button.addEventListener('click', () => window.toggleWishlist(id, name, Number(price), img));

      actions.appendChild(button);
      card.querySelector('.product-img-wrap').appendChild(actions);
    });
  };

  window.enhanceStoreWishlistButtons();

  function renderWishlist() {
    const container = document.getElementById('wishlistItemsContainer');
    if (!container) return;

    if (wishlist.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#666; padding: 40px 0;">No saved items in your wishlist.</p>';
      return;
    }

    container.innerHTML = wishlist.map(item => `
      <div style="display:flex; gap:16px; align-items:center; margin-bottom:16px; border-bottom:1px solid #E8DFC9; padding-bottom:12px;">
        <img src="${item.img}" style="width:60px; height:60px; object-fit:cover; border-radius:10px;">
        <div style="flex:1;">
          <h5 style="font-size:0.95rem; margin-bottom:4px;">${item.name}</h5>
          <p style="font-size:0.85rem; color:#7B1E2B; font-weight:600;">₹${item.price.toLocaleString()}</p>
        </div>
        <button onclick="addToCart('${item.id}', '${item.name.replace(/'/g, "\\'")}', ${item.price}, '${item.img}')" style="background:#C89B3C; border:none; color:#fff; padding:6px 12px; border-radius:20px; font-size:0.75rem; cursor:pointer;">Add</button>
      </div>
    `).join('');
  }

  // WhatsApp Cart Enquiry Checkout
  const waCheckoutBtn = document.getElementById('waCheckoutBtn');
  if (waCheckoutBtn) {
    waCheckoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Your cart is empty.');
        return;
      }
      let msg = "Vanakkam Vedha! I would like to place an enquiry for the following Seeru items:\n\n";
      let total = 0;
      cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        msg += `${index + 1}. *${item.name}* (Qty: ${item.qty}) - ₹${itemTotal.toLocaleString()}\n`;
      });
      msg += `\n*Estimated Total:* ₹${total.toLocaleString()}\n\nPlease confirm availability and custom options.`;
      window.open(`https://wa.me/919791014662?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }

  // Interactive Custom Seeru Builder
  const builderChips = document.querySelectorAll('.chip-btn');
  let builderSelection = {
    occasion: 'Wedding (Kalyanam)',
    style: 'Royal Brass Trays',
    saree: 'Kanchipuram Koorai Silk',
    jewelry: 'Antique Gold Temple Set',
    flowers: 'Jasmine & Rose Garlands',
    sweets: 'Traditional Laddu & Mysore Pak',
    gift: 'Custom Brass Kumkum Boxes'
  };

  const stylePrice = { 'Royal Brass Trays': 12000, 'Handcrafted Silver Plated': 25000, 'Floral Wooden Trays': 15000, 'Velvet Tray Set': 18000 };
  const flowerPrice = { 'Jasmine & Rose Garlands': 4000, 'Exotic Lotus & Orchid': 6500, 'Golden Marigold': 3500 };
  const sweetsPrice = { 'Traditional Laddu & Mysore Pak': 5000, 'Premium Kaju Sweets': 8000, 'Artisanal Nuts & Dates': 7000 };
  const giftPrice = { 'Custom Brass Kumkum Boxes': 3000, 'Silk Gift Bags': 4500, 'Silver Coins': 9000 };

  function updateBuilderPreview() {
    const listEl = document.getElementById('builderPreviewList');
    const priceEl = document.getElementById('builderTotalPrice');
    if (!listEl || !priceEl) return;

    const total = (stylePrice[builderSelection.style] || 12000) +
                  (flowerPrice[builderSelection.flowers] || 4000) +
                  (sweetsPrice[builderSelection.sweets] || 5000) +
                  (giftPrice[builderSelection.gift] || 3000);

    listEl.innerHTML = `
      <li><span>Occasion:</span> <strong>${builderSelection.occasion || 'Wedding'}</strong></li>
      <li><span>Base Tray Style:</span> <strong>${builderSelection.style}</strong></li>
      <li><span>Floral Styling:</span> <strong>${builderSelection.flowers}</strong></li>
      <li><span>Sweets & Delicacies:</span> <strong>${builderSelection.sweets}</strong></li>
      <li><span>Return Favors:</span> <strong>${builderSelection.gift}</strong></li>
    `;

    priceEl.textContent = `₹${total.toLocaleString()}`;
  }

  builderChips.forEach(chip => {
    chip.addEventListener('click', function() {
      const category = this.dataset.category;
      const value = this.dataset.value;
      
      const parent = this.parentElement;
      parent.querySelectorAll('.chip-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      builderSelection[category] = value;
      updateBuilderPreview();
    });
  });

  updateBuilderPreview();

  const orderCustomBuilderBtn = document.getElementById('orderCustomBuilderBtn');
  if (orderCustomBuilderBtn) {
    orderCustomBuilderBtn.addEventListener('click', () => {
      const msg = `Vanakkam Vedha! I have designed a custom Seeru package using your Custom Builder:\n\n` +
        `*Occasion:* ${builderSelection.occasion || 'Wedding'}\n` +
        `*Plate Style:* ${builderSelection.style}\n` +
        `*Flowers:* ${builderSelection.flowers}\n` +
        `*Sweets:* ${builderSelection.sweets}\n` +
        `*Return Gifts:* ${builderSelection.gift}\n\n` +
        `Please contact me to finalize details and deliver to our venue.`;
      window.open(`https://wa.me/919791014662?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }

  // Toast Notification helper
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: #7B1E2B;
      color: #FFFDF8;
      padding: 12px 24px;
      border-radius: 50px;
      font-size: 0.85rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      z-index: 10000;
      border: 1px solid #C89B3C;
      transition: all 0.3s ease;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
});
