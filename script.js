document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const code = document.getElementById("code").value.trim();
  const motdepasse = document.getElementById("motdepasse").value.trim();
  const errorMessage = document.getElementById("errorMessage");

  try {
    const response = await fetch("https://hook.eu1.make.com/TON_WEBHOOK_ID", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, motdepasse })
    });

    const data = await response.json();

    if (data.success === true) {
      window.location.href = "accueil.html";
    } else {
      errorMessage.textContent = "Identifiants incorrects.";
    }
  } catch (error) {
    errorMessage.textContent = "Erreur serveur. Réessayez plus tard.";
    console.error("Erreur:", error);
  }
});
