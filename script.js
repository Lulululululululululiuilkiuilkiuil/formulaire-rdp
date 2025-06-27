document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.endsWith("index.html") || path === "/" || path === "/index.html") {
    // Login page
    const form = document.getElementById("loginForm");
    if (!form) return;

    const errorMessage = document.getElementById("errorMessage");
    const submitBtn = document.getElementById("submitBtn");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      errorMessage.textContent = "";
      submitBtn.disabled = true;
      submitBtn.textContent = "Connexion en cours...";

      const code = document.getElementById("code").value.trim();
      const motdepasse = document.getElementById("motdepasse").value.trim();

      try {
        const response = await fetch("https://hook.eu2.make.com/4tyg6naz87yxkd1bb754qw5sbh0ct6x3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, motdepasse }),
        });

        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        const data = await response.json();

        if (data.success === true) {
          // Redirige vers accueil.html avec le code dans l’URL
          window.location.href = "accueil.html?code=" + encodeURIComponent(code);
        } else {
          errorMessage.textContent = "Identifiants incorrects.";
        }
      } catch (error) {
        errorMessage.textContent = "Erreur serveur. Réessayez plus tard.";
        console.error("Erreur:", error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Se connecter";
      }
    });
  } else if (path.endsWith("accueil.html")) {
    // Page accueil formulaire
    const form = document.getElementById("responseForm");
    if (!form) return;

    const messageDiv = document.getElementById("message");
    const submitBtn = document.getElementById("submitBtn");

    // Récupérer le code depuis l'URL et remplir le champ caché
    const urlParams = new URLSearchParams(window.location.search);
    const userCode = urlParams.get("code") || "";
    const codeInput = document.getElementById("code");
    if (codeInput) codeInput.value = userCode;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      messageDiv.textContent = "";
      messageDiv.className = "";
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi en cours...";

      const q1 = form.question1.value;
      const q2checks = [...form.querySelectorAll("input[name='question2']:checked")];
      const q2 = q2checks.map((input) => input.value).join(", ");

      const data = {
        code: userCode,
        question1: q1,
        question2: q2,
      };

      try {
        const response = await fetch("https://hook.eu2.make.com/TON_WEBHOOK_ICI", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

        messageDiv.textContent = "Réponse envoyée avec succès !";
        messageDiv.className = "success";
        form.reset();
        if (codeInput) codeInput.value = userCode;
      } catch (error) {
        console.error(error);
        messageDiv.textContent = "Erreur lors de l'envoi, veuillez réessayer.";
        messageDiv.className = "error";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Envoyer";
      }
    });
  }
});
