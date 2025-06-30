document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  // Fonction de redirection vers la page de connexion si pas authentifié
  function redirectIfNotLoggedIn() {
    const code = localStorage.getItem("userCode");
    if (!code) {
      window.location.href = "index.html";
    }
    return code;
  }

  // --- Page de connexion ---
  if (path.includes("index.html") || path === "/" || path.endsWith("/")) {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const code = document.getElementById("code").value.trim();
      const motdepasse = document.getElementById("motdepasse").value.trim();
      const errorMessage = document.getElementById("errorMessage");
      const submitBtn = document.getElementById("submitBtn");

      errorMessage.textContent = "";
      submitBtn.disabled = true;
      submitBtn.textContent = "Connexion...";

      try {
        const response = await fetch("https://hook.eu2.make.com/4tyg6naz87yxkd1bb754qw5sbh0ct6x3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, motdepasse })
        });

        const data = await response.json();
        if (data.success === true) {
          localStorage.setItem("userCode", code);
          window.location.href = "accueil.html";
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
  }

  // --- Page d'accueil / questionnaire ---
  else if (path.includes("accueil.html")) {
    const userCode = redirectIfNotLoggedIn();
    const form = document.getElementById("responseForm");
    const messageDiv = document.getElementById("message");

    const allowedQ1 = ["Pomme", "Banane", "Fraise"];
    const allowedQ2 = ["Rouge", "Bleu", "Vert", "Jaune"];

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const q1 = form.question1.value;
      const selectedQ2 = [...form.querySelectorAll('input[name="question2"]:checked')].map(el => el.value);

      // Validation stricte
      if (!allowedQ1.includes(q1)) {
        messageDiv.textContent = "Réponse invalide pour la question 1.";
        messageDiv.className = "error";
        return;
      }

      if (!selectedQ2.every(val => allowedQ2.includes(val))) {
        messageDiv.textContent = "Réponse invalide pour la question 2.";
        messageDiv.className = "error";
        return;
      }

      const data = {
        code: userCode,
        question1: q1,
        question2: selectedQ2.join(", ")
      };

      try {
        const response = await fetch("https://hook.eu2.make.com/oxl1za6zyxqct9t738fs5aijp2wuw43c", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error("Erreur HTTP");

        messageDiv.textContent = "Réponse envoyée avec succès !";
        messageDiv.className = "success";
        form.reset();
      } catch (err) {
        messageDiv.textContent = "Erreur lors de l'envoi. Réessayez.";
        messageDiv.className = "error";
        console.error(err);
      }
    });
  }
});
