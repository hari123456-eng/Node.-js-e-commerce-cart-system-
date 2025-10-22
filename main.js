// Fetch and display all products
async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    const data = await res.json();

    const container = document.getElementById("product-container");
    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = `<p>No products found. Please add sample items via POST /api/products.</p>`;
      return;
    }

    data.forEach(product => {
      const card = document.createElement("div");
      card.classList.add("product-card");

      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>${product.description || ""}</p>
        <p><strong>₹${product.price}</strong></p>
        <button onclick="addToCart('${product._id}', '${product.name}', ${product.price})">
          Add to Cart
        </button>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// Add to cart (stored in localStorage)
function addToCart(id, name, price) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemIndex = cart.findIndex(item => item.id === id);

  if (itemIndex >= 0) {
    cart[itemIndex].qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${name} added to cart! 🛒`);
}

document.addEventListener("DOMContentLoaded", loadProducts);
