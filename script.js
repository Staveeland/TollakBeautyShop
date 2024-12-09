document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animations
    const animateOnScroll = () => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('appear');
                    // Optional: stop observing after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, options);

        // Observe hero content
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            observer.observe(heroContent);
        }

        // Observe feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => observer.observe(card));

        // Observe section headers
        const sectionHeaders = document.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => observer.observe(header));

        // Observe featured product sections
        const featuredImage = document.querySelector('.featured-image');
        const featuredContent = document.querySelector('.featured-content');
        if (featuredImage) observer.observe(featuredImage);
        if (featuredContent) observer.observe(featuredContent);

        // Observe testimonial cards
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        testimonialCards.forEach(card => observer.observe(card));
    };

    // Initialize scroll animations
    animateOnScroll();

    // Initialize UI Elements
    const cartModal = document.getElementById('cart-modal');
    const cartIcon = document.querySelector('.cart-icon');
    const closeCart = document.querySelector('.close-cart');
    const checkoutButton = document.querySelector('.checkout-button');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const filterButtons = document.querySelectorAll('.filter-button');
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalAmount = document.querySelector('.total-amount');

    // Cart State
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    // Filter Products
    if (filterButtons) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                const products = document.querySelectorAll('.product-card');

                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                products.forEach(product => {
                    if (filter === 'all' || product.getAttribute('data-category') === filter) {
                        product.style.display = 'block';
                    } else {
                        product.style.display = 'none';
                    }
                });
            });
        });
    }

    // Cart Functions
    function addToCart(product) {
        const existingItem = cartItems.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity;
        } else {
            cartItems.push(product);
        }

        updateLocalStorage();
        updateCartDisplay();
        updateCartCount();
    }

    function removeFromCart(productId) {
        cartItems = cartItems.filter(item => item.id !== productId);
        updateLocalStorage();
        updateCartDisplay();
        updateCartCount();
    }

    function updateQuantity(productId, newQuantity) {
        const item = cartItems.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, newQuantity);
            updateLocalStorage();
            updateCartDisplay();
        }
    }

    function updateLocalStorage() {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }

    function updateCartCount() {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const cartCount = document.createElement('span');
        cartCount.className = 'cart-count';
        cartCount.textContent = totalItems;

        const existingCount = cartIcon.querySelector('.cart-count');
        if (existingCount) {
            existingCount.remove();
        }
        
        if (totalItems > 0) {
            cartIcon.appendChild(cartCount);
        }
    }

    function updateCartDisplay() {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;

        cartItems.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-price">$${item.price}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.id}">
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-id="${item.id}">&times;</button>
            `;

            total += item.price * item.quantity;
            cartItemsContainer.appendChild(cartItem);

            // Add event listeners for quantity controls
            const quantityInput = cartItem.querySelector('.quantity-input');
            const minusBtn = cartItem.querySelector('.minus');
            const plusBtn = cartItem.querySelector('.plus');
            const removeBtn = cartItem.querySelector('.cart-item-remove');

            quantityInput.addEventListener('change', (e) => {
                updateQuantity(item.id, parseInt(e.target.value));
            });

            minusBtn.addEventListener('click', () => {
                updateQuantity(item.id, item.quantity - 1);
            });

            plusBtn.addEventListener('click', () => {
                updateQuantity(item.id, item.quantity + 1);
            });

            removeBtn.addEventListener('click', () => {
                removeFromCart(item.id);
            });
        });

        if (totalAmount) {
            totalAmount.textContent = `$${total.toFixed(2)}`;
        }

        // Show empty cart message if no items
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            if (checkoutButton) {
                checkoutButton.disabled = true;
            }
        } else if (checkoutButton) {
            checkoutButton.disabled = false;
        }
    }

    // Event Listeners
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            if (cartModal) {
                cartModal.classList.add('open');
            }
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            if (cartModal) {
                cartModal.classList.remove('open');
            }
        });
    }

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        if (cartModal && !cartModal.contains(e.target) && !cartIcon.contains(e.target)) {
            cartModal.classList.remove('open');
        }
    });

    // Add to Cart Button Click Handlers
    if (addToCartButtons) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productCard = button.closest('.product-card');
                const quantityInput = productCard.querySelector('.quantity-input');
                
                const product = {
                    id: Date.now().toString(), // Using timestamp as a simple unique ID
                    name: productCard.querySelector('h3').textContent,
                    price: parseFloat(productCard.querySelector('.product-price').textContent.replace('$', '')),
                    quantity: parseInt(quantityInput.value),
                    image: productCard.querySelector('img').src
                };

                addToCart(product);
                if (cartModal) {
                    cartModal.classList.add('open');
                }
            });
        });
    }

    // Quantity Controls in Product Cards
    document.querySelectorAll('.product-quantity').forEach(container => {
        const input = container.querySelector('.quantity-input');
        const minusBtn = container.querySelector('.minus');
        const plusBtn = container.querySelector('.plus');

        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(input.value);
            if (currentValue > 1) {
                input.value = currentValue - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            const currentValue = parseInt(input.value);
            if (currentValue < 10) {
                input.value = currentValue + 1;
            }
        });

        input.addEventListener('change', () => {
            const value = parseInt(input.value);
            if (value < 1) input.value = 1;
            if (value > 10) input.value = 10;
        });
    });

    // Checkout Process
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            // Simple checkout process - you can expand this
            alert('Thank you for your purchase! Total: ' + totalAmount.textContent);
            cartItems = [];
            updateLocalStorage();
            updateCartDisplay();
            if (cartModal) {
                cartModal.classList.remove('open');
            }
        });
    }

    // Initialize cart display
    updateCartDisplay();
    updateCartCount();

    // Search Functionality
    const searchInput = document.getElementById('product-search');
    const searchSuggestions = document.querySelector('.search-suggestions');
    const recentSearchesList = document.querySelector('.recent-searches-list');
    const suggestedProductsList = document.querySelector('.suggested-products-list');
    let searchTimeout;

    // Load recent searches from localStorage
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

    function addToRecentSearches(query) {
        if (query.trim() && !recentSearches.includes(query)) {
            recentSearches.unshift(query);
            recentSearches = recentSearches.slice(0, 5); // Keep only 5 recent searches
            localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
            updateRecentSearches();
        }
    }

    function updateRecentSearches() {
        if (!recentSearchesList) return;

        recentSearchesList.innerHTML = '';
        if (recentSearches.length === 0) {
            recentSearchesList.innerHTML = '<div class="empty-suggestions">No recent searches</div>';
            return;
        }

        recentSearches.forEach(search => {
            const item = document.createElement('div');
            item.className = 'search-suggestion-item';
            item.innerHTML = `
                <span class="suggestion-icon">🕒</span>
                <span>${search}</span>
            `;
            item.addEventListener('click', () => {
                searchInput.value = search;
                searchProducts(search);
                searchSuggestions.classList.remove('active');
            });
            recentSearchesList.appendChild(item);
        });

        // Add clear recent searches button
        const clearButton = document.createElement('div');
        clearButton.className = 'clear-recent';
        clearButton.textContent = 'Clear Recent Searches';
        clearButton.addEventListener('click', (e) => {
            e.stopPropagation();
            recentSearches = [];
            localStorage.removeItem('recentSearches');
            updateRecentSearches();
        });
        recentSearchesList.appendChild(clearButton);
    }

    function updateSuggestedProducts(query) {
        if (!suggestedProductsList) return;

        suggestedProductsList.innerHTML = '';
        if (!query.trim()) {
            suggestedProductsList.innerHTML = '<div class="empty-suggestions">Start typing to see suggestions</div>';
            return;
        }

        const products = document.querySelectorAll('.product-card');
        let matches = 0;

        products.forEach(product => {
            const name = product.querySelector('h3').textContent;
            const description = product.querySelector('.product-description').textContent;
            
            if ((name.toLowerCase().includes(query.toLowerCase()) || 
                 description.toLowerCase().includes(query.toLowerCase())) && 
                matches < 4) {
                
                const item = document.createElement('div');
                item.className = 'suggestion-product';
                item.innerHTML = `
                    <img src="${product.querySelector('img').src}" alt="${name}">
                    <div class="suggestion-product-info">
                        <div class="suggestion-product-name">${highlightMatch(name, query)}</div>
                        <div class="suggestion-product-category">${product.getAttribute('data-category')}</div>
                    </div>
                `;
                item.addEventListener('click', () => {
                    searchInput.value = name;
                    searchProducts(name);
                    searchSuggestions.classList.remove('active');
                });
                suggestedProductsList.appendChild(item);
                matches++;
            }
        });

        if (matches === 0) {
            suggestedProductsList.innerHTML = '<div class="empty-suggestions">No matching products found</div>';
        }
    }

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="suggestion-match">$1</span>');
    }

    function searchProducts(query) {
        const products = document.querySelectorAll('.product-card');
        let hasResults = false;

        products.forEach(product => {
            const name = product.querySelector('h3').textContent.toLowerCase();
            const description = product.querySelector('.product-description').textContent.toLowerCase();
            const searchTerm = query.toLowerCase();

            if (name.includes(searchTerm) || description.includes(searchTerm)) {
                product.classList.remove('hidden');
                product.classList.add('search-match');
                hasResults = true;

                // Remove animation class after it plays
                setTimeout(() => {
                    product.classList.remove('search-match');
                }, 500);
            } else {
                product.classList.add('hidden');
            }
        });

        // Show/hide no results message
        const noResults = document.querySelector('.no-results');
        if (noResults) {
            noResults.classList.toggle('show', !hasResults);
        }

        // Reset filter buttons
        const filterButtons = document.querySelectorAll('.filter-button');
        filterButtons.forEach(btn => btn.classList.remove('active'));
        const allButton = document.querySelector('.filter-button[data-filter="all"]');
        if (allButton) {
            allButton.classList.add('active');
        }

        // Add to recent searches
        if (query.trim()) {
            addToRecentSearches(query);
        }
    }

    function clearSearch() {
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            product.classList.remove('hidden');
            product.classList.remove('search-match');
        });

        const noResults = document.querySelector('.no-results');
        if (noResults) {
            noResults.classList.remove('show');
        }
    }

    // Search Event Listeners
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            updateRecentSearches();
            updateSuggestedProducts(searchInput.value.trim());
            searchSuggestions.classList.add('active');
        });

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            updateSuggestedProducts(query);
            
            searchTimeout = setTimeout(() => {
                if (query.length > 0) {
                    searchProducts(query);
                } else {
                    clearSearch();
                }
            }, 300);
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.classList.remove('active');
            }
        });
    }
}); 