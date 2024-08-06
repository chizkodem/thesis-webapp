const container = document.getElementById('container');
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDszZls3TGVDO2Et7ahkfTh348oMWE0O9g",
    authDomain: "thesis-4b44a.firebaseapp.com",
    databaseURL: "https://thesis-4b44a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "thesis-4b44a",
    storageBucket: "thesis-4b44a.appspot.com",
    messagingSenderId: "1003998652306",
    appId: "1:1003998652306:web:5f24787dd2790ef276434b",
    measurementId: "G-PS3BK080JQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

const db = getDatabase()


document.getElementById("submit").addEventListener('click', async function(e) {
    e.preventDefault();

    const fullName = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!fullName || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    // Check if the password has at least 6 characters
    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }
        
    try {
        const emailExists = await checkIfEmailExists(email);

        if (emailExists) {
            alert("Email already registered. Please use a different email.");
            return;
        }

        const user = await signUpUser(email, password, fullName);
        alert("Sign up successful!");

        // Clear input boxes after successful sign-up
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";

        container.classList.remove("active");
    } catch (error) {
        console.error("Sign up error:", error);
        alert("Sign up failed. Please try again.");
    }
});

async function signUpUser(email, password, fullName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Add user data to Realtime Database
    await set(ref(db, 'user/' + uid), {
        fullName: fullName,
        email: email,
    });

    return userCredential.user;
}

async function checkIfEmailExists(email) {
    const usersRef = ref(db, 'user');
    const snapshot = await get(usersRef);

    if (snapshot.exists()) {
        const users = snapshot.val();
        return Object.values(users).some(user => user.email === email);
    }

    return false;
}

