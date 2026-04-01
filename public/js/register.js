const form = document.getElementById("registerForm");

console.log("REGISTER JS LOADED");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    return alert("Passwords do not match");
  }

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log(data);

    alert(data.message);

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
});