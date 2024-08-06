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
import {update} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

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
  const notifRef = ref(database, "notifications");

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

  // Fetch notifications from Firebase
  onValue(
    notifRef,
    (snapshot) => {
      console.log("Notification data received from Firebase");
      console.log(snapshot.val()); // Log the snapshot data to check if data is being received

      if (!snapshot.exists()) {
        console.log("No data found in Firebase notifications.");
        return;
      }

      // Handle each notification
      snapshot.forEach((childSnapshot) => {
        const notifId = childSnapshot.key;
        const notifData = childSnapshot.val();
        notifying(
          notifId,
          notifData.message,
          notifData.latitude,
          notifData.longitude
        );
        gettingHistory(notifId, notifData.message);
      });
    },
    (error) => {
      console.error("Error fetching notifications from Firebase:", error);
    }
  );

  // Listen for notifications from Firebase
  function notifying(notifID, message, lat, lon) {
    const reportsCon = document.querySelector(".reports-list");
    const notifTab = document.querySelector(".notif");
    let reportInfo = document.getElementById(`report-${notifID}`);
    let slicedNotifID = notifID.slice(-4).toUpperCase();

    if (message === "Driver Pressed" && !reportInfo) {
      notifTab.classList.add("notified");
      reportInfo = document.createElement("li");
      reportInfo.className = "report-info";
      reportInfo.id = `report-${notifID}`;
      reportInfo.innerHTML = `
        <a href="#" onclick="nearestHospital('${notifID}', ${lat}, ${lon})">${slicedNotifID}</a>
        <p class="notif-button" onclick="clearNotif('${notifID}')">${message}</p>
      `;
      reportsCon.appendChild(reportInfo);
    } else if (message === "Passenger Pressed" && !reportInfo) {
      notifTab.classList.add("notified");
      reportInfo = document.createElement("li");
      reportInfo.className = "report-info";
      reportInfo.id = `report-${notifID}`;
      reportInfo.innerHTML = `
        <a href="#" onclick="nearestHospital('${notifID}', ${lat}, ${lon})">${slicedNotifID}</a>
        <p class="notif-button" onclick="clearNotif('${notifID}'), historyPrompt()">${message}</p>
      `;
      reportsCon.appendChild(reportInfo);
    } else if (message === "Cleared" && reportInfo) {
      // Remove the list item if the message is "cleared"
      reportsCon.removeChild(reportInfo);

      // Optionally, remove the "notified" class if there are no more notifications
      const remainingReports = reportsCon.querySelectorAll(".report-info");
      if (remainingReports.length === 0) {
        notifTab.classList.remove("notified");
      }
    }
  }

  function clearPreviousHospitals() {
    const contactsCon = document.querySelector(".contacts-list");
    // Remove all contacts with the given deviceId
    contactsCon.querySelectorAll(`.contacts-info`).forEach((el) => el.remove());
  }

  window.nearestHospital = function (deviceId, lat, lon) {
    clearPreviousHospitals();

    var radius = 5000; // Fixed radius
    var url = `https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=hospital](around:${radius},${lat},${lon});out;`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log("API Response:", data); // Debugging line to see raw API response

        const hospitals = data.elements.filter(
          (element) => element.lat && element.lon
        );

        if (hospitals.length < 5) {
          // If fewer than 5 hospitals, increase the search radius
          increaseSearchRadius(deviceId, lat, lon, hospitals);
        } else {
          // Show hospitals with custom icon
          hospitals.slice(0, 5).forEach((element) => {
            console.log(element.tags.name, "test ASLKD");

            L.marker([element.lat, element.lon], {
              icon: L.icon({
                iconUrl: "img/hospital.png", // Replace with your custom hospital icon URL
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
              }),
            })
              .addTo(map)
              .bindPopup(element.tags.name || "Hospital");
          });
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  function increaseSearchRadius(deviceId, lat, lng, currentHospitals) {
    var radius = 5000; // Initial radius
    var increment = 2000; // Radius increment
    const contactsCon = document.querySelector(".contacts-list");
    let contactsInfo = document.getElementById(`.contacts-${deviceId}`);

    function searchMoreHospitals() {
      radius += increment;
      var url = `https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=hospital](around:${radius},${lat},${lng});out;`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log("Expanded API Response:", data); // Debugging line to see expanded API response

          const newHospitals = data.elements.filter(
            (element) => element.lat && element.lon
          );
          const allHospitals = [...currentHospitals, ...newHospitals];

          if (allHospitals.length < 5) {
            searchMoreHospitals();
          } else {
            allHospitals.slice(0, 5).forEach((element) => {
              // console.log(contactNumber(), "test numberalsdkjaslkdj");

              if (!element.tags.name) {
                console.log("walang pangalan");
              } else if (element.tags.name) {
                contactsInfo = document.createElement("li");
                contactsInfo.className = "contacts-info";
                contactsInfo.id = `contacts-${deviceId}`;
                contactsInfo.innerHTML = `
                <h3 href="#">${element.tags.name}</h3>
                <p>${contactNumber()}</p>
                `;
                contactsCon.appendChild(contactsInfo);
              }

              L.marker([element.lat, element.lon], {
                icon: L.icon({
                  iconUrl: "img/hospital.png",
                  iconSize: [32, 32],
                  iconAnchor: [16, 32],
                  popupAnchor: [0, -32],
                }),
              })
                .addTo(map)
                .bindPopup(element.tags.name || "Hospital");
            });
          }
        })
        .catch((error) => console.error("Error:", error));
    }

    searchMoreHospitals();
  }

  function contactNumber() {
    let temporaryNumber = [
      "0912 345 6781",
      "0918 234 5679",
      "0922 345 6783",
      "0923 456 7894",
      "0924 567 8902",
      "0925 678 9015",
      "0926 789 0127",
      "0927 890 1238",
      "0928 901 2346",
      "0929 012 3457",
      "02 234 5678",
      "02 345 6789",
      "02 456 7891",
      "02 567 8902",
      "02 678 9013",
      "02 234 5678",
      "02 345 6781",
      "02 456 7892",
      "02 567 8903",
      "02 678 9014",
    ];

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    let shuffledNumbers = shuffle([...temporaryNumber]); // Shuffle a copy of the array
    let index = 0;

    contactNumber();

    function contactNumber() {
      if (index >= shuffledNumbers.length) {
        shuffledNumbers = shuffle([...temporaryNumber]); // Shuffle again when all numbers are used
        index = 0;
      }
    }
    return shuffledNumbers[index++];
  }

  function gettingHistory(notifID, message) {
    const historyCon = document.querySelector(".history-list");
    let historyInfo = document.getElementById(`history-${notifID}`);
    let slicedhistoryID = notifID.slice(-4).toUpperCase();

    if (message === "Cleared" && !historyInfo) {
      historyInfo = document.createElement("li");
      historyInfo.className = "history-info";
      historyInfo.id = `report-${notifID}`;
      historyInfo.innerHTML = `
        <a href="#">${slicedhistoryID}</a>
        <p>${message}</p>
      `;
      historyCon.appendChild(historyInfo);
    } else if (message === "Admin notified" && historyInfo) {
      // Remove the list item if the message is "cleared"
      reportsCon.removeChild(historyInfo);
    }
  }

  // Function to clear notification
  window.clearNotif = function (notifID) {
    // Reference to your Firebase database path for notifications
    const notifRef = ref(database, `notifications/${notifID}`);

    // Update the message field to "cleared"
    update(notifRef, {message: "Cleared"}) // Use update() with correct import
      .then(() => {
        const promptTab = document.querySelector(".prompt");
        promptTab.classList.add("prompted");
        setTimeout(() => {
          promptTab.classList.remove("prompted");
        }, 1500);
        console.log("Notification message updated to 'cleared'");
      })
      .catch((error) => {
        console.error("Error updating notification message:", error);
      });
  };

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

  function reverseGeocode(lat, lon, callback) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    console.log(url);
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.address && data.address.road) {
          callback(null, data.address.road);
        } else {
          callback("No street name found");
        }
      })
      .catch((error) => {
        callback(error);
      });
  }

  function updateMarker(deviceId, lat, lon, timestamp) {
    const date = new Date(timestamp);
    const formattedTimestamp = date.toLocaleString();
    const timeAgo = timeSince(timestamp);

    console.log(
      `Updating marker for Device ID: ${deviceId} at Latitude: ${lat}, Longitude: ${lon}, Timestamp: ${timeAgo}`
    );
    reverseGeocode(lat, lon, (error, streetName) => {
      if (error) {
        console.error("Error reverse geocoding:", error);
        streetName = `Lat: ${lat}, Lon: ${lon}`;
      }

      const popupContent = `
        <b>Device ID:</b> ${deviceId}<br>
        <b>Street:</b> ${streetName}<br>
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
      updateSidebar(
        deviceId,
        lat,
        lon,
        timeAgo,
        formattedTimestamp,
        streetName
      );
    });
  }

  function updateSidebar(
    deviceId,
    lat,
    lon,
    timeAgo,
    formattedTimestamp,
    streetName
  ) {
    const deviceList = document.getElementById("device-list");
    const numCon = document.querySelector(".unit-number-container");
    let deviceInfo = document.getElementById(`device-${deviceId}`);
    let listItem = document.getElementById(`unit-${deviceId}`);

    // getting the last 4 characters of the device ID
    let deviceLastFourChar = deviceId.slice(-4).toUpperCase();
    // console.log(deviceLastFourChar);

    if (!deviceInfo) {
      deviceInfo = document.createElement("div");
      deviceInfo.className = "device-info";
      deviceInfo.id = `device-${deviceId}`;
      deviceList.appendChild(deviceInfo);
    }
    deviceInfo.innerHTML = `
      <h3>Device ID: ${deviceLastFourChar}</h3>
      <p><b>Street:</b> ${streetName}</p>
      <p><b>Latitude:</b> ${lat}</p>
      <p><b>Longitude:</b> ${lon}</p>
      <p><b>Last Update:</b> ${timeAgo} (${formattedTimestamp})</p>
    `;

    if (!listItem) {
      listItem = document.createElement("li");
      listItem.className = "location-info";
      listItem.id = `unit-${deviceId}`;
      numCon.appendChild(listItem);
    }
    listItem.innerHTML = `
      <a href="#">${deviceLastFourChar}</a>
      <p class="location">${streetName}</p>
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
