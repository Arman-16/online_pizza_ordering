document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

   
    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    alert(data.message);

    if (data.status === "success") {
      // store and redirect to home
      localStorage.setItem('username', data.username);
      window.location.href = data.redirect;
    } else if (data.status === "exists") {
      // redirect to login page
      window.location.href = data.redirect;
    }
  });