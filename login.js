// When a user enters their login name, that name is put in the browser's local storage so it is available next time they play.
function login() {
  const nameE1 = document.querySelector("#name");
  localStorage.setItem("userName", nameE1.value);
  window.location.href = "play.html";
}
