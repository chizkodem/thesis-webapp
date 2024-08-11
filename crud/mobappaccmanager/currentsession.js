document.addEventListener("DOMContentLoaded", function () {
  const userFullNameElement = document.getElementById("user-full-name");

  const storedUserJSON = sessionStorage.getItem("currentUser");

  if (storedUserJSON) {
    const storedUser = JSON.parse(storedUserJSON);

    // Check if fullName is available
    if (storedUser && storedUser.fullName) {
      userFullNameElement.textContent = storedUser.fullName || "Undefined";
    } else {
      // Redirect to login page and display alert
      alert("You are logged out.");
      window.location.href = "../crudlogin.html";
    }
  } else {
    // Redirect to login page if user data is not available
    window.location.href = "../crudlogin.html";
  }
});

function signOut() {
  // Clear the user data from session storage
  sessionStorage.removeItem("currentUser");
  console.log("Sign-out successful");
  console.log("Session Storage after sign-out:", sessionStorage);
  window.location.href = "../crudlogin.html";

  // Display the session storage content after clearing
}

document
  .getElementById("logout-link")
  .addEventListener("click", function (event) {
    event.preventDefault();
    signOut();
  });
