document.addEventListener('DOMContentLoaded', () => {
    
    // --- STATE MANAGEMENT KERANJANG ---
    let cart = [];

    // 1. STICKY NAVBAR EFFECT
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. MOBILE MENU TOGGLE
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });

    // Close menu saat klik link navigasi (kecuali link kontak luar seperti WA)
    const navLinks = document.querySelectorAll('.nav-link:not(.contact-wa-link)');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.querySelector('i').className = 'fas fa-bars';
        });
    });

    // 3. INTERACTIVE SEARCH BOX (Poin 1)
    const searchBtn = document.getElementById('search-btn');
    const searchBox = document.getElementById('search-box');

    searchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        searchBox.classList.toggle('active');
        if(searchBox.classList.contains('active')) {
            searchBox.querySelector('input').focus();
        }
    });

    // Tutup search box jika klik di luar area navbar
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            searchBox.classList.remove('active');
        }
    });

    // 4. DRAWER KERANJANG BELANJA TOGGLE (Poin 2)
    const cartBtn = document.getElementById('cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const drawerOverlay = document.getElementById('drawer-overlay');

    function openDrawer() {
        cartDrawer.classList.add('open');
        drawerOverlay.classList.add('active');
    }

    function closeDrawer() {
        cartDrawer.classList.remove('open');
        drawerOverlay.classList.remove('active');
    }

    cartBtn.addEventListener('click', openDrawer);
    closeCartBtn.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    // 5. KELOLA DATA & JUMLAH PRODUK DI KERANJANG
    const cartBadge = document.getElementById('cart-badge');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const id = productCard.getAttribute('data-id');
            const name = productCard.getAttribute('data-name');
            const price = parseInt(productCard.getAttribute('data-price'));

            // Cek apakah produk sudah ada di keranjang
            const existingItem = cart.find(item => item.id === id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }

            updateCartUI();
            showToast(`${name} berhasil masuk keranjang!`);
        });
    });

    // Fungsi Render & Hitung Total Ulang UI Keranjang (Termasuk Fitur Hapus)
    function updateCartUI() {
        // Hitung total item belanjaan untuk badge
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.innerText = totalItems;

        // Render isi item di dalam drawer
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Keranjang kamu masih kosong.</div>';
            cartTotalPrice.innerText = 'Rp 0';
            return;
        }

        cartItemsContainer.innerHTML = '';
        let totalPrice = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-details">
                    <h6>${item.name} (${item.quantity}x)</h6>
                    <span>Rp ${itemTotal.toLocaleString('id-ID')}</span>
                </div>
                <button class="remove-item-btn" data-id="${item.id}" aria-label="Hapus item">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        cartTotalPrice.innerText = `Rp ${totalPrice.toLocaleString('id-ID')}`;

        // Event Listener Tombol Hapus Produk (Poin 2)
        const removeButtons = document.querySelectorAll('.remove-item-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idToRemove = e.target.closest('.remove-item-btn').getAttribute('data-id');
                
                // Cari item target
                const itemIndex = cart.findIndex(item => item.id === idToRemove);
                if (itemIndex > -1) {
                    if (cart[itemIndex].quantity > 1) {
                        cart[itemIndex].quantity -= 1; // Kurangi jumlahnya saja jika lebih dari satu
                    } else {
                        cart.splice(itemIndex, 1); // Hapus permanen kalau sisa 1
                    }
                }
                updateCartUI();
            });
        });
    }

    // CHECKOUT VIA WHATSAPP (Integrasi Keranjang Belanjaan ke Chat)
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.addEventListener('click', () => {
        if(cart.length === 0) {
            showToast("Keranjang belanja kamu masih kosong!");
            return;
        }

        let orderMessage = "Halo Deni Project, saya mau pesan produk berikut:\n\n";
        let totalPrice = 0;

        cart.forEach((item, index) => {
            const total = item.price * item.quantity;
            totalPrice += total;
            orderMessage += `${index + 1}. ${item.name} (${item.quantity}x) - Rp ${total.toLocaleString('id-ID')}\n`;
        });

        orderMessage += `\n*Total Keseluruhan:* Rp ${totalPrice.toLocaleString('id-ID')}`;
        
        // Encode URL String text khusus WA
        const waUrl = `https://wa.me/62895331422781?text=${encodeURIComponent(orderMessage)}`;
        window.open(waUrl, '_blank');
    });

    // 6. TOAST NOTIFICATION FUNCTION
    function showToast(message) {
        const toastContainer = document.getElementById('toast-container');
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas fa-check-circle" style="color: #ff5e14;"></i> <span>${message}</span>`;
        
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3500);
    }
});
