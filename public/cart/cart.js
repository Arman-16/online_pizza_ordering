
//   // Function to render cart items
// function renderCartItems() {
//   let cartContainer = document.querySelector(".cart-items-row"); // Container for items
//   cartContainer.innerHTML = ""; // Clear any existing content

//   let cartItems = JSON.parse(localStorage.getItem("cartItems")) || []; // Fetch cart items
//   if (cartItems.length === 0) {
//     cartContainer.innerHTML = "<p>Your cart is empty!</p>";
//     return;
//   }

//   cartItems.forEach((item) => {
//     let cartItemHTML = `
//       <div class="cart-item" data-price="${item.price}">
//         <div class="cart-img" style="background-image: url('${item.img}');"></div>
//         <div class="cart-details">
//           <p class="cart-item-name">${item.name}</p>
//           <p class="cart-item-price">Price: ₹${item.price}</p>
//           <div class="cart-quantity">
//             <button class="quantity-btn decrease" onclick="updateQuantity(this, -1)">-</button>
//             <span class="quantity-display">1</span>
//             <button class="quantity-btn increase" onclick="updateQuantity(this, 1)">+</button>
//           </div>
//         </div>
//       </div>
//     `;
//     cartContainer.innerHTML += cartItemHTML; // Append each item
//   });

//   updateTotalPrice(); // Update total price
// }

// // Function to update the total price
// function updateTotalPrice() {
//   let cartItems = document.querySelectorAll(".cart-item");
//   let totalPrice = 0;

//   cartItems.forEach((item) => {
//     let price = parseFloat(item.getAttribute("data-price"));
//     let quantity = parseInt(item.querySelector(".quantity-display").innerText);
//     totalPrice += price * quantity;
//   });

//   document.querySelector(".total-price").innerText = `₹${totalPrice}`;
// }

// // Function to update quantity
// function updateQuantity(button, change) {
//   let quantityDisplay = button.parentElement.querySelector(".quantity-display");
//   let currentQuantity = parseInt(quantityDisplay.innerText);
//   let newQuantity = currentQuantity + change;

//   if (newQuantity < 1){
//     let cartItems = button.closest(".cart-item"); // Get the parent cart-item element
//     cartItems.remove();
//   }else{
//     quantityDisplay.innerText = newQuantity; // Update quantity
//   }
  
//   updateTotalPrice(); // Update total price
// }

// // Call renderCartItems on page load
// window.onload = renderCartItems;

// document.addEventListener("DOMContentLoaded", function () {
//   const checkoutButton = document.querySelector(".checkout-btn");
//   const cartContainer = document.querySelector(".cart-container");

//   checkoutButton.addEventListener("click", function () {
//       // Remove existing cart items and total
//       cartContainer.innerHTML = `
//           <h2>Order Confirmation</h2>
//           <p class="success-message">✅ Your order is successful! Thank you for Ordering.</p>
//       `;
//   });
// });



// Fetch cart items from MongoDB
async function fetchCartItemsFromDB() {
  const username = localStorage.getItem("username");
  if (!username) {
    alert("Please login to view your cart.");
    window.location.href = "/login/signup.html";
    return;
  }

  try {
    const response = await fetch("/get-cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();
    return data.cart || [];
  } catch (error) {
    console.error("Error fetching cart from DB:", error);
    return [];
  }
}

// Render cart items on page
async function renderCartItems() {
  const cartContainer = document.querySelector(".cart-items-row");
  cartContainer.innerHTML = "";

  const cartItems = await fetchCartItemsFromDB();

  if (cartItems.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty!</p>";
    return;
  }

  cartItems.forEach((item) => {
    let cartItemHTML = `
      <div class="cart-item" data-name="${item.name}" data-price="${item.price}">
        <div class="cart-img" style="background-image: url('${item.img}');"></div>
        <div class="cart-details">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">Price: ₹${item.price}</p>
          <div class="cart-quantity">
            <button class="quantity-btn decrease" onclick="updateQuantity(this, -1)">-</button>
            <span class="quantity-display">${item.quantity || 1}</span>
            <button class="quantity-btn increase" onclick="updateQuantity(this, 1)">+</button>
          </div>
        </div>
      </div>
    `;
    cartContainer.innerHTML += cartItemHTML;
  });

  updateTotalPrice();
}

// Update total cart price
function updateTotalPrice() {
  const cartItems = document.querySelectorAll(".cart-item");
  let totalPrice = 0;

  cartItems.forEach((item) => {
    const price = parseFloat(item.getAttribute("data-price"));
    const quantity = parseInt(item.querySelector(".quantity-display").innerText);
    totalPrice += price * quantity;
  });

  document.querySelector(".total-price").innerText = `₹${totalPrice}`;
}

// Update quantity and sync with DB
async function updateQuantity(button, change) {
  const quantityDisplay = button.parentElement.querySelector(".quantity-display");
  let currentQuantity = parseInt(quantityDisplay.innerText);
  let newQuantity = currentQuantity + change;

  const cartItem = button.closest(".cart-item");
  const itemName = cartItem.getAttribute("data-name");
  const username = localStorage.getItem("username");

  if (newQuantity < 1) {
    // Remove item from UI
    cartItem.remove();

    // Also remove item from DB
    await fetch("/remove-from-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, name: itemName }),
    });
  } else {
    // Update UI
    quantityDisplay.innerText = newQuantity;

    // Update quantity in DB
    await fetch("/update-cart-quantity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, name: itemName, quantity: newQuantity }),
    });
  }

  updateTotalPrice();
}

// Checkout action
document.addEventListener("DOMContentLoaded", function () {
  const checkoutButton = document.querySelector(".checkout-btn");
  const cartContainer = document.querySelector(".cart-container");

 checkoutButton.addEventListener("click", async function () {
  const username = localStorage.getItem("username");

  if (!username) {
    alert("Please login first.");
    window.location.href = "/login/signup.html";
    return;
  }

  // 1. Check if user has address
  const addressResponse = await fetch('/get-user-address', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });

  const addressData = await addressResponse.json();
  console.log("Fetched Address:", addressData.address);


  if (!addressData.address) {
    alert("Please confirm your delivery address before checkout.");
    window.location.href = "/index.html";
    return;
  }

  // 2. Fetch cart from DB
  const cartResponse = await fetch("/get-cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  const cartData = await cartResponse.json();
  const cartItems = cartData.cart || [];

  if (cartItems.length === 0) {
    alert("Your cart is empty! Please add items before checkout.");
    return;
  }

  // 3. Clear cart in DB
  await fetch("/clear-cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  // 4. Show confirmation
  cartContainer.innerHTML = `
    <h2>Order Confirmation</h2>
    <p class="success-message">✅ Your order is successful! Thank you for Ordering.</p>
  `;
  

  });
});

// Initial load
window.onload = renderCartItems;
