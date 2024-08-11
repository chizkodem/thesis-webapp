import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDszZls3TGVDO2Et7ahkfTh348oMWE0O9g",
  authDomain: "thesis-4b44a.firebaseapp.com",
  databaseURL:
    "https://thesis-4b44a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "thesis-4b44a",
  storageBucket: "thesis-4b44a.appspot.com",
  messagingSenderId: "1003998652306",
  appId: "1:1003998652306:web:5f24787dd2790ef276434b",
  measurementId: "G-PS3BK080JQ",
};

// Initialize Firebase
try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth();

  const userFullNameElement = document.querySelector(".user-full-name");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, update the userFullName variable
      const userFullName = user.displayName || "Unnamed User";
      userFullNameElement.textContent = userFullName;
    } else {
      // No user is signed in, you may want to handle this case
      userFullNameElement.textContent = "Guest";
    }
  });

  // Additional Firebase-related logic can go here
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Handle initialization error (e.g., inform the user or retry)
}
