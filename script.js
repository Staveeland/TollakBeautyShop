document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    let cartItems = [];

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const product = button.closest('.product-card');
            const productName = product.querySelector('h3').textContent;
            const productPrice = product.querySelector('p').textContent;
            
            cartItems.push({
                name: productName,
                price: productPrice
            });
            
            updateCart();
            showNotification(`${productName} added to cart!`);
        });
    });

    function updateCart() {
        const cartIcon = document.querySelector('.cart-icon');
        cartIcon.textContent = `🛒 Cart (${cartItems.length})`;
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Add styles dynamically
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#ff69b4';
        notification.style.color = 'white';
        notification.style.padding = '1rem';
        notification.style.borderRadius = '5px';
        notification.style.animation = 'fadeIn 0.3s, fadeOut 0.3s 2s forwards';
        
        // Add keyframes for animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(20px); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2300);
    }
}); 