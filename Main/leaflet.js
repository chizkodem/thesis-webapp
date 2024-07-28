import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

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

// Hardcoded email and password
const email = "shiyinon@gmail.com";
const password = "123456";

// Function to initialize the map and fetch device data
function initializeMap() {
  // Initialize map with specific zoom level
  var map = L.map("map").setView([14.6513, 121.0493], 12.5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Object to store markers
  var markers = {};

  // Get a reference to the Firebase Realtime Database
  const locationsRef = ref(database, "locations");

  // Listen for location updates from devices
  onValue(
    locationsRef,
    (snapshot) => {
      console.log("Device data received from Firebase");
      console.log(snapshot.val()); // Log the snapshot data to check if data is being received

      if (!snapshot.exists()) {
        console.log("No data found in Firebase.");
        return;
      }

      // Update markers for each device location
      snapshot.forEach((childSnapshot) => {
        const deviceId = childSnapshot.key;
        const data = childSnapshot.val();
        console.log(
          `Device ID: ${deviceId}, Latitude: ${data.latitude}, Longitude: ${data.longitude}, Timestamp: ${data.timestamp}`
        );
        if (data.latitude && data.longitude && data.timestamp) {
          updateMarker(deviceId, data.latitude, data.longitude, data.timestamp);
        } else {
          console.log(
            `Data for Device ID ${deviceId} is missing latitude, longitude, or timestamp.`
          );
        }
      });
    },
    (error) => {
      console.error("Error fetching data from Firebase:", error);
    }
  );

  function timeSince(timestamp) {
    const now = new Date();
    const secondsPast = (now - new Date(timestamp)) / 1000;

    if (secondsPast < 60) {
      return `${Math.floor(secondsPast)} seconds ago`;
    }
    if (secondsPast < 3600) {
      return `${Math.floor(secondsPast / 60)} minutes ago`;
    }
    if (secondsPast < 86400) {
      return `${Math.floor(secondsPast / 3600)} hours ago`;
    }
    return `${Math.floor(secondsPast / 86400)} days ago`;
  }

  function updateMarker(deviceId, lat, lon, timestamp) {
    const date = new Date(timestamp);
    const formattedTimestamp = date.toLocaleString();
    const timeAgo = timeSince(timestamp);

    console.log(
      `Updating marker for Device ID: ${deviceId} at Latitude: ${lat}, Longitude: ${lon}, Timestamp: ${timeAgo}`
    );
    const popupContent = `
                    <b>Device ID:</b> ${deviceId}<br>
                    <b>Updated:</b> ${timeAgo} (${formattedTimestamp})
                `;

    if (markers[deviceId]) {
      markers[deviceId].setLatLng([lat, lon]).setPopupContent(popupContent);
    } else {
      markers[deviceId] = L.marker([lat, lon])
        .bindPopup(popupContent)
        .addTo(map);
    }

    // Update the sidebar with the latest device info
    updateSidebar(deviceId, lat, lon, timeAgo, formattedTimestamp);
  }

  function updateSidebar(deviceId, lat, lon, timeAgo, formattedTimestamp) {
    const deviceList = document.getElementById("device-list");
    const numCon = document.querySelector(".unit-number-container");
    let deviceInfo = document.getElementById(`device-${deviceId}`);
    let listItem = document.getElementById(`unit-${deviceId}`);

    // getting the last 4 character of the device ID
    let deviceLastFourChar = deviceId.slice(-4);
    console.log(deviceLastFourChar);

    if (!deviceInfo) {
      deviceInfo = document.createElement("div");
      deviceInfo.className = "device-info";
      deviceInfo.id = `device-${deviceId}`;
      deviceList.appendChild(deviceInfo);
    }
    deviceInfo.innerHTML = `
        <h3>Device ID: ${deviceLastFourChar}</h3>
        <p><b>Latitude:</b> ${lat}</p>
        <p><b>Longitude:</b> ${lon}</p>
        <p><b>Last Update:</b> ${timeAgo} (${formattedTimestamp})</p>
    `;

    if (!listItem) {
      listItem = document.createElement("li");
      listItem.className = "device-info";
      listItem.id = `unit-${deviceId}`;
      numCon.appendChild(listItem);
    }
    listItem.innerHTML = `
    <a href="#">${deviceLastFourChar}</a>
    `;
  }
}

// Sign in and initialize the map
signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Successful login
    const user = userCredential.user;
    console.log("User logged in:", user);
    document.getElementById("map-container").style.display = "flex";
    initializeMap();
  })
  .catch((error) => {
    // Handle login errors
    console.error("Error logging in:", error);
  });
