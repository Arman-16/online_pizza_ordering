// Confirm button functionality
const confirmBtn = document.querySelector("#Confirm-btn");
const addressInput = document.querySelector("#delivery-add");
const deliveredText = document.querySelector("#delivered");

confirmBtn.addEventListener("click", () => {
  const enteredAddress = addressInput.value.trim();

  if (enteredAddress) {
    deliveredText.textContent = enteredAddress;

    confirmBtn.textContent = "Confirmed";
    confirmBtn.style.backgroundColor = "green";
    confirmBtn.style.color = "white";

    fetch("/api/auth/confirm-btn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: localStorage.getItem("username"),
        address: enteredAddress,
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Address saved:", data))
      .catch((err) => console.error("Failed to save address:", err));
  } else {
    alert("Please enter an address before confirming!");
  }
});

// Add to Cart functionality
let add_buttons = document.querySelectorAll(".add-to-cart");

add_buttons.forEach((button) => {
  button.addEventListener("click", function (event) {
    const username = localStorage.getItem("username");

    if (!username) {
      alert("Please login or signup to add items to cart.");
      window.location.href = "/login/signup.html";
      return;
    }

    let item = event.target.closest(".item");
    let itemName = item.querySelector(".item-name").innerText;
    let itemPrice = item
      .querySelector(".item-price")
      .innerText.replace("Price: ₹", "");
    let itemImg = item.querySelector(".item-img").style.backgroundImage;

    event.target.innerText = "Added";

    let cartItem = {
      name: itemName,
      price: parseFloat(itemPrice),
      img: itemImg.replace(/url\(['"]?|['"]?\)/g, ""),
    };

    fetch("/api/auth/add-to-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, item: { ...cartItem, quantity: 1 } }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Item saved to DB:", data);
      })
      .catch((err) => {
        console.error("Failed to save item in DB", err);
      });
  });
});

// Buy Now functionality
const buyNowButtons = document.querySelectorAll(".buy-now");

buyNowButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const username = localStorage.getItem("username");

    if (!username) {
      alert("Please login or signup to buy.");
      window.location.href = "/login/signup.html";
      return;
    }

    const item = button.closest(".item");
    const name = item.querySelector(".item-name").innerText;
    const price = item
      .querySelector(".item-price")
      .innerText.replace("Price: ₹", "");
    const rawImg = item.querySelector(".item-img").style.backgroundImage;
    const img = rawImg.replace(/url\(['"]?|['"]?\)/g, "");

    const product = {
      name,
      price: parseFloat(price),
      img,
      quantity: 1,
    };

    fetch("/api/auth/add-to-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, item: product }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Item added via Buy Now:", data);
        window.location.href = "/cart/cart.html";
      })
      .catch((err) => {
        console.error("Failed to save item in DB", err);
        alert("Something went wrong while adding item to cart.");
      });
  });
});

// DOM fully loaded event
window.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");

  if (username) {
    const rightSec = document.querySelector(".rightSec");
    if (!rightSec) return;

    const cartButton = rightSec.querySelector("#cart-btn").outerHTML;

    rightSec.innerHTML = `
      ${cartButton}
      <p style="color: black; font-weight: bold; font-size:12px; display: inline-block; margin-left: 5px;">Welcome, ${username}</p>
      <button class="btn" id="logout-btn" style="margin-left: 10px;">Logout</button>
    `;

    document.getElementById("logout-btn").addEventListener("click", logout);

    // Fetch and display user address
    fetch("/api/auth/get-user-address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.address) {
          deliveredText.textContent = data.address;
          confirmBtn.textContent = "Confirmed";
          confirmBtn.style.backgroundColor = "green";
          confirmBtn.style.color = "white";
        }
      })
      .catch((err) => console.error("Failed to fetch address:", err));
  }
});

// Logout function
function logout() {
  localStorage.removeItem("username");
  window.location.href = "/login/signup.html";
}

