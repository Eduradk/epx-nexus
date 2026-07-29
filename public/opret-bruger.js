const loggedOutCard = document.getElementById("loggedOutCard");
const loggedInCard = document.getElementById("loggedInCard");

function renderLoginState() {
  const user = EpxAuth.getUser();
  if (user) {
    loggedOutCard.hidden = true;
    loggedInCard.hidden = false;
    document.getElementById("loggedInName").textContent = user.navn;
  } else {
    loggedOutCard.hidden = false;
    loggedInCard.hidden = true;
  }
}
renderLoginState();

document.getElementById("demoLoginBtn").addEventListener("click", () => {
  EpxAuth.login("Lars Andersen");
  window.location.href = "index.html";
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  EpxAuth.logout();
  renderTopbarAuth();
  renderLoginState();
});
