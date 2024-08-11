// login.js

import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Ensure that auth is accessible in the scope of login.js
const auth = getAuth();

// Listen for the login button click
document
  .getElementById("loginSubmit")
  .addEventListener("click", async function (e) {
    e.preventDefault();

    const loginEmail = document.getElementById("loginEmail").value;
    const loginPassword = document.getElementById("loginPassword").value;

    if (!loginEmail || !loginPassword) {
      alert("Please fill in both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      const user = userCredential.user;
      const db = getDatabase();

      const updatedEmail = loginEmail.replace(/\./g, ",");

      // Retrieve user's full name from Realtime Database
      const userRef = ref(db, "user/" + updatedEmail);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const fullName = userSnapshot.val().fullName;

        // Save the user's full name to session storage
        saveCurrentUserToSessionStorage({...user, fullName});
      } else {
        // If user data is not found, save the basic user info to session storage
        saveCurrentUserToSessionStorage(user);
      }

      console.log("Login successful:", user);

      // Clear input boxes after successful login
      document.getElementById("loginEmail").value = "";
      document.getElementById("loginPassword").value = "";

      // Redirect to main page after successful login
      window.location.href = "Main/main-page.html";

      // Perform any additional actions after successful login if needed
    } catch (error) {
      // Handle login errors with specific messages
      if (error.code === "auth/user-not-found") {
        alert("User not found. Please check your email.");
      } else if (error.code === "auth/wrong-password") {
        alert("Incorrect password. Please try again.");
      } else {
        alert("Login failed. Please check your email and password.");
      }

      console.error("Login Error:", error);
    }
  });

function saveCurrentUserToSessionStorage(user) {
  const userJSON = JSON.stringify(user);
  sessionStorage.setItem("currentUser", userJSON);
  console.log("User data saved to session storage:", user);
}
