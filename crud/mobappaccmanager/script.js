import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, // This is for user registration
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-functions.js"; // Import httpsCallable
import {update} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js"; // This can be used for updating data

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbND1fNWm_WjFXco1ZW9-yAM8WwuPU1nk",
  authDomain: "login-enhancing-emergencies.firebaseapp.com",
  databaseURL:
    "https://login-enhancing-emergencies-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "login-enhancing-emergencies",
  storageBucket: "login-enhancing-emergencies.appspot.com",
  messagingSenderId: "160225886573",
  appId: "", // Optional, leave blank if not used
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const userRef = ref(database, "users");

onValue(
  userRef,
  (snapshot) => {
    console.log("users data received from Firebase");
    console.log(snapshot.val()); // Log the snapshot data to check if data is being received

    if (!snapshot.exists()) {
      console.log("No data found in Firebase users.");
      return;
    }
    snapshot.forEach((childSnapshot) => {
      const userId = childSnapshot.key;
      const userData = childSnapshot.val();

      gettingUser(userData.email, userData.fullName);
    });
  },
  (error) => {
    console.error("Error fetching users from Firebase:", error);
  }
);

function gettingUser(email, fullname) {
  const userCon = document.querySelector(".user-list");
  let userInfo = document.getElementById(`user-${email}`);

  if (!userInfo) {
    userInfo = document.createElement("li");
    userInfo.className = "user-info";
    userInfo.id = `user-${email}`;
    userInfo.innerHTML = `
      <div class="buttons-container">
        <button class="edit-button"></button>
        <button class="delete-button"></button>
      </div>
      <p class="popup-button">${email}</p>
      <p class="user-full-name">${fullname}</p>
    `;
    userCon.appendChild(userInfo);
  }
}

const registerButton = document.getElementById("register-button");
const emailInput = document.getElementById("user-email");
const nameInput = document.getElementById("user-name");
const passwordInput = document.getElementById("user-password");

// Prevent the form from submitting and handle registration
registerButton.addEventListener("click", async (event) => {
  event.preventDefault(); // Prevent the default form submission

  const email = emailInput.value;
  const password = passwordInput.value;
  const fullName = nameInput.value;

  try {
    // Create a new user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Get the user's unique ID
    const userId = userCredential.user.uid;

    // Save user data to the Realtime Database using email as the user ID
    await set(ref(database, "users/" + email.replace(/\./g, ",")), {
      // Replace '.' to avoid issues
      fullName: fullName,
      email: email,
    });

    alert("User registered successfully!");
    // Optionally redirect or clear the form
    emailInput.value = "";
    nameInput.value = "";
    passwordInput.value = "";
  } catch (error) {
    console.error("Error registering user:", error);
    alert(error.message); // Display the error message to the user
  }
});

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("add-user")) {
    const addUser = event.target;
    const formCon = document.querySelector(".form-container");
    const regButton = document.getElementById("register-button");
    const updateButton = document.getElementById("update-button");
    formCon.classList.toggle("reveal");

    regButton.style.display = "block";
    updateButton.style.display = "none";

    // Remove the existing listener before adding a new one
    document.removeEventListener("click", outsideClickListener);

    // Define the outsideClickListener function
    function outsideClickListener(e) {
      if (!formCon.contains(e.target) && e.target !== addUser) {
        formCon.classList.remove("reveal");
        // Remove the listener after it has executed
        document.removeEventListener("click", outsideClickListener);
      }
    }

    // Add the outside click listener
    document.addEventListener("click", outsideClickListener);
  }
});

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("edit-button")) {
    const editButton = event.target;
    const formCon = document.querySelector(".form-container");
    const userName = document.getElementById("user-name");
    const regButton = document.getElementById("register-button");
    const updateButton = document.getElementById("update-button");
    const userEmailText = editButton
      .closest("li")
      .querySelector(".popup-button");
    const userNameText = editButton
      .closest("li")
      .querySelector(".user-full-name");
    const userEmail = document.getElementById("user-email");
    formCon.classList.toggle("reveal");

    userName.value = userNameText.textContent;
    userEmail.value = userEmailText.textContent;
    userEmail.disabled = true; // Disable the input field
    console.log(userEmailText.textContent);

    regButton.style.display = "none";
    updateButton.style.display = "block";

    // Remove the existing listener before adding a new one
    document.removeEventListener("click", outsideClickListener);

    // Define the outsideClickListener function
    function outsideClickListener(e) {
      if (!formCon.contains(e.target) && e.target !== editButton) {
        formCon.classList.remove("reveal");
        userEmail.disabled = false;
        userName.value = "";
        userEmail.value = "";
        // Remove the listener after it has executed
        document.removeEventListener("click", outsideClickListener);
      }
    }

    // Add the outside click listener
    document.addEventListener("click", outsideClickListener);
  }
});

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("popup-button")) {
    const warnDelBtn = document.querySelector(".warning-delete-button");
    const popupButton = event.target;
    const buttonCon = popupButton
      .closest("li")
      .querySelector(".buttons-container");

    buttonCon.classList.toggle("reveal");

    document.addEventListener("click", function (e) {
      // Check if the click was outside the notification container
      if (
        !buttonCon.contains(e.target) &&
        e.target !== popupButton &&
        !warnDelBtn.classList.contains("reveal")
      ) {
        buttonCon.classList.remove("reveal");
      }
    }); // Ensure this listener is removed after execution
  }
});

function deleteWarning(userEmail) {
  const sanitizedEmail = userEmail.replace(/\./g, ",");
  const userRef = ref(database, `users/${sanitizedEmail}`); // Reference to the user in the database

  const userInfo = document.getElementById(`user-${userEmail}`);
  if (userInfo) {
    userInfo.remove();
  }
  try {
    set(userRef, null); // Delete the user by setting the reference to null
    console.log(`User with email ${userEmail} deleted successfully.`);

    // Optionally, remove the user's list item from the UI
    const userInfo = document.getElementById(`user-${userEmail}`);
    if (userInfo) {
      userInfo.remove();
    }
  } catch (error) {
    console.error("Error deleting user:", error);
  }
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-button")) {
    const warnCon = document.querySelector(".delete-warning");
    const warningDelButton = document.querySelector(".warning-delete-button");
    const buttonsCon = document.querySelector(".buttons-container.reveal");
    const userEmail = buttonsCon.closest("li").querySelector(".popup-button");
    const warningUserEmail = document.querySelector(".warning-user-email");

    warningUserEmail.textContent = userEmail.textContent;

    warningDelButton.classList.add("reveal");
    warnCon.classList.add("reveal");
  }
});

document
  .querySelector(".warning-cancel-button")
  .addEventListener("click", () => {
    const warnDelBtn = document.querySelector(".warning-delete-button");
    const warnCon = document.querySelector(".delete-warning");
    warnDelBtn.classList.remove("reveal");
    warnCon.classList.remove("reveal");
  });

document
  .querySelector(".warning-delete-button")
  .addEventListener("click", () => {
    const warnCon = document.querySelector(".delete-warning");
    const buttonsCon = document.querySelector(".buttons-container.reveal"); // Corrected the selector with a dot (.)

    if (buttonsCon) {
      const userEmail = buttonsCon.closest("li").querySelector(".popup-button");
      document
        .querySelector(".warning-delete-button")
        .classList.remove("reveal");

      if (userEmail) {
        console.log(userEmail.textContent, "test ALKSJDLKASJD"); // Changed from `value` to `textContent` to get the text

        document
          .querySelector(".warning-delete-button")
          .classList.remove("reveal");
        deleteUser(userEmail.textContent);
        deleteWarning(userEmail.textContent);
      } else {
        console.error("User email element not found.");
      }
    } else {
      console.error("Buttons container not found.");
    }

    warnCon.classList.remove("reveal");
  });

document.addEventListener("click", (event) => {
  const warnCon = document.querySelector(".delete-warning");
  const deleteButton = document.querySelector(".warning-delete-button");

  // Check if the click is outside the warning container and the delete button
  if (
    warnCon &&
    !warnCon.contains(event.target) &&
    event.target !== deleteButton &&
    !deleteButton.classList.contains("reveal")
  ) {
    warnCon.classList.remove("reveal");
  }
});

document.getElementById("update-button").addEventListener("click", () => {
  const userEmail = document.getElementById("user-email");
  const userFullName = document.getElementById("user-name");
  const userPassword = document.getElementById("user-password");
  let email = userEmail.value;
  let fullName = userFullName.value;

  if (userPassword.value.trim() !== "") {
    changePassword(userEmail.value, userPassword.value);
    userEmail.value = "";
    userFullName.value = "";
    userPassword.value = "";
    set(ref(database, "users/" + email.replace(/\./g, ",")), {
      // Replace '.' to avoid issues
      fullName: fullName,
      email: email,
    });
  } else if (userPassword.value.trim() === "") {
    set(ref(database, "users/" + email.replace(/\./g, ",")), {
      // Replace '.' to avoid issues
      fullName: fullName,
      email: email,
    });
    alert("User Renamed successfully!");
    userEmail.value = "";
    userFullName.value = "";
    userPassword.value = "";
  }
});

async function deleteUser(email) {
  try {
    const response = await fetch(
      "https://hollow-fanatical-quality.glitch.me/deleteUser",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email: email}),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.text();
    console.log(data); // Log success message
  } catch (error) {
    console.error("Error deleting user:", error);
  }
}

async function changePassword(email, newPassword) {
  try {
    const response = await fetch(
      "https://hollow-fanatical-quality.glitch.me/changePassword",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email: email, newPassword: newPassword}),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.text();
    console.log(data); // Log success message
    alert("Password Changed successfully!");
  } catch (error) {
    console.error("Error changing password:", error);
  }
}
