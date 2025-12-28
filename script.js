// ----- User Object -----
const user = {
  name: "Cynthia",
  email: "Cynthia@example.com",
};
document.getElementById("userName").innerText = user.name;

// ----- Dish List -----
let dishes = [
  { id: 1, name: "Paneer Tikka", price: 400 },
  { id: 2, name: "Pizza", price: 500 },
  { id: 3, name: "Burger", price: 250 },
  { id: 4, name: "Pasta", price: 300 },
  { id: 5, name: "French Fries", price: 350 },
];

// ----- Cart (persisted in localStorage) -----
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ----- Promo (persisted) -----
let promo = JSON.parse(localStorage.getItem("promo")) || { code: null, discount: 0 };

// ----- Display Dishes -----
function displayDishes() {
  const dishContainer = document.getElementById("dishList");
  dishContainer.innerHTML = "";
  dishes.forEach((dish) => {
    const div = document.createElement("div");
    div.classList.add("dish");
    div.innerHTML = `
      <h4>${dish.name}</h4>
      <p>$${dish.price}</p>
      <button onclick="addToCart(${dish.id})">Add to Cart</button>
    `;
    dishContainer.appendChild(div);
  });
}
displayDishes();

// ----- Add to Cart -----
function addToCart(dishId) {
  const selectedDish = dishes.find(d => d.id === dishId);
  if (!selectedDish) return;
  const existing = cart.find(item => item.id === dishId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...selectedDish, qty: 1 });
  }
  saveCart();
  updateCartUI();
}

// ----- Remove from Cart -----
function removeFromCart(dishId) {
  cart = cart.filter(item => item.id !== dishId);
  saveCart();
  updateCartUI();
}

// ----- Update Quantity -----
function updateQuantity(dishId, delta) {
  const item = cart.find(i => i.id === dishId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(dishId);
  } else {
    saveCart();
    updateCartUI();
  }
}

// ----- Update Cart UI (shows subtotal, discount, total) -----
function updateCartUI() {
  const tbody = document.getElementById("cartBody");
  tbody.innerHTML = "";
  let subtotal = 0;

  cart.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>
        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
        ${item.qty}
        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
      </td>
      <td>$${(item.price * item.qty).toFixed(2)}</td>
      <td><button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button></td>
    `;
    tbody.appendChild(row);
    subtotal += item.price * item.qty;
  });

  // Apply promo if exists
  const discount = Math.min(promo.discount || 0, subtotal);
  const total = Math.max(0, subtotal - discount);

  document.getElementById("subtotalAmount").innerText = subtotal.toFixed(2);
  document.getElementById("discountAmount").innerText = discount.toFixed(2);
  document.getElementById("totalAmount").innerText = total.toFixed(2);

  // Update promo message if promo exists
  const promoMessage = document.getElementById("promoMessage");
  if (promo.code) {
    promoMessage.innerText = `Applied: ${promo.code} (-${discount.toFixed(2)})`;
    promoMessage.style.color = "green";
  } else {
    if (promoMessage && promoMessage.innerText === "") {
      // nothing
    } else if (promoMessage && !promo.code) {
      // keep existing message if any (no-op)
    }
  }
}

// ----- Apply Promo Code -----
function applyPromo() {
  const code = document.getElementById("promoCode").value.trim().toUpperCase();
  const subtotal = parseFloat(document.getElementById("subtotalAmount").innerText) || 0;
  const messageEl = document.getElementById("promoMessage");

  if (!code) {
    messageEl.innerText = "Please enter a promo code.";
    messageEl.style.color = "red";
    return;
  }

  // Example promo rules
  if (code === "FOOD50" && subtotal >= 300) {
    promo = { code: "FOOD50", discount: 50 };
    messageEl.innerText = "Promo applied! $50 off 🎉";
    messageEl.style.color = "green";
  } else if (code === "FOOD100" && subtotal >= 600) {
    promo = { code: "FOOD100", discount: 100 };
    messageEl.innerText = "Promo applied! $100 off 🎉";
    messageEl.style.color = "green";
  } else {
    promo = { code: null, discount: 0 };
    messageEl.innerText = "Invalid promo or minimum amount not met.";
    messageEl.style.color = "red";
  }

  localStorage.setItem("promo", JSON.stringify(promo));
  updateCartUI();
}

// ----- Clear Promo -----
function clearPromo() {
  promo = { code: null, discount: 0 };
  localStorage.removeItem("promo");
  document.getElementById("promoMessage").innerText = "";
  document.getElementById("promoCode").value = "";
  updateCartUI();
}

// ----- Sort Dishes by Price -----
function sortByPrice() {
  dishes.sort((a, b) => a.price - b.price);
  displayDishes();
}

// ----- Save Cart -----
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ----- Clear Cart -----
function clearCart() {
  if (!confirm("Clear entire cart?")) return;
  cart = [];
  saveCart();
  updateCartUI();
  clearPromo();
}

// ----- Go to Checkout -----
function goToCheckout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  saveCart();
  localStorage.setItem("promo", JSON.stringify(promo || { code: null, discount: 0 }));
  window.location.href = "checkout.html";
}

// ----- Initialize UI on page load -----
updateCartUI();
