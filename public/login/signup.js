document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.querySelector('input[name="username"]').value;
  const email = document.querySelector('input[name="email"]').value;
  const password = document.querySelector('input[name="password"]').value;

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    console.log("Response from server:", data);

    alert(data.message);

    if (data.redirect) {
      localStorage.setItem('username', data.username);  // save username after signup
      window.location.href = data.redirect;
    }

  } catch (err) {
    console.error("Signup error:", err);
    alert("Something went wrong.");
  }
});