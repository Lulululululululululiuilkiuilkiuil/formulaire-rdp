document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const code = document.getElementById("code").value.trim();
  const motdepasse = document.getElementById("motdepasse").value.trim();
  const errorMessage = document.getElementById("errorMessage");
  const submitBtn = document.getElementById("submitBtn");

  errorMessage.textContent = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Connexion en cours...";

  try {
    const response = await fetch("https://hook.eu2.make.com/4tyg6naz87yxkd1bb754qw5sbh0ct6x3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, motdepasse })
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (data.success === true) {
      window.location.href = "accueil.html";
    } else {
      errorMessage.textContent = "Identifiants incorrects.";
    }
  } catch (error) {
    errorMessage.textContent = "Erreur serveur. Réessayez plus tard.";
    console.error("Erreur :", error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Se connecter";
  }
});
