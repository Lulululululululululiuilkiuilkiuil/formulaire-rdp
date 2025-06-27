document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

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
  } else if (path.includes("accueil.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    const userCode = urlParams.get("code") || "";
    const codeInput = document.getElementById("code");
    if (codeInput) {
      codeInput.value = userCode;
    }

    const form = document.getElementById("responseForm");
    const messageDiv = document.getElementById("message");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      messageDiv.textContent = "";
      messageDiv.className = "";

      const q1 = form.question1.value;
      const q2 = [...form.querySelectorAll('input[name="question2"]:checked')].map(el => el.value).join(", ");

      const data = {
        code: userCode,
        question1: q1,
        question2: q2
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
        codeInput.value = userCode;
      } catch (err) {
        messageDiv.textContent = "Erreur lors de l'envoi. Réessayez.";
        messageDiv.className = "error";
        console.error(err);
      }
    });
  }
});
