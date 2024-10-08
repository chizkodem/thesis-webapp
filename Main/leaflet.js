import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child,
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
  var map = L.map("map").setView([14.6513, 121.0493], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Object to store markers
  var markers = {};

  // Get a reference to the Firebase Realtime Database
  const locationsRef = ref(database, "locations");
  const notifRef = ref(database, "notifications");
  const youtubeRef = ref(database, "stream");
  const historyRef = ref(database, "history");
  const collisionsRef = ref(database, "collisionInstance");
  const unitsRef = ref(database, "units");
  const policeRef = ref(database, "policeStation");
  const fireRef = ref(database, "fireStation");
  const hospitalRef = ref(database, "hospitalStation");
  // Listen for location updates from devices

  let deviceSpeeds = {};
  let contactNos = {};
  let collision = {};

  onValue(
    locationsRef,
    (snapshot) => {
      console.log("Device data received from Firebase");
      // console.log(snapshot.val()); // Log the snapshot data to check if data is being received

      if (!snapshot.exists()) {
        console.log("No data found in Firebase.");
        return;
      }

      // Update markers for each device location
      snapshot.forEach((childSnapshot) => {
        const deviceId = childSnapshot.key;
        const data = childSnapshot.val();
        if (data.latitude && data.longitude) {
          deviceSpeeds[deviceId] = data.speed;

          const speed = deviceSpeeds[deviceId] * 3.6; // 0.1962414488196216
          const roundedSpeed = parseFloat(speed.toFixed(1)); // 0.2

          updateMarker(deviceId, data.latitude, data.longitude, roundedSpeed);
        } else {
          console.log(
            `Data for Device ID ${deviceId} is missing latitude, longitude,`
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
      // console.log(snapshot.val()); // Log the snapshot data to check if data is being received

      if (!snapshot.exists()) {
        console.log("No data found in Firebase notifications.");
        return;
      }

      // reportsCon.innerHTML = "";

      // Handle each notification
      snapshot.forEach((childSnapshot) => {
        const notifId = childSnapshot.key;
        const notifData = childSnapshot.val();

        contactNos[notifId] = notifData.contactNo;

        const contactNo = contactNos[notifId];
        const speed = deviceSpeeds[notifId];

        // console.log(speed, notifId, "test speed");

        notifying(
          notifId,
          notifData.message,
          notifData.latitude,
          notifData.longitude,
          speed,
          notifData.contactNo
        );
      });
    },
    (error) => {
      console.error("Error fetching notifications from Firebase:", error);
    }
  );

  let youtubeLink = {};
  onValue(
    youtubeRef,
    (snapshot) => {
      // console.log("Notification data received from Firebase");
      // console.log(snapshot.val()); // Log the snapshot data to check if data is being received

      if (!snapshot.exists()) {
        console.log("No data found in Firebase notifications.");
        return;
      }

      // Handle each notification
      snapshot.forEach((childSnapshot) => {
        const notifId = childSnapshot.key;
        const notifData = childSnapshot.val();

        // console.log(notifData.stream);
        // console.log(notifId);

        youtubeLink[notifId] = notifData.stream;

        console.log(youtubeLink, "laskdjlaksdj test");
      });
    },
    (error) => {
      console.error("Error fetching notifications from Firebase:", error);
    }
  );

  let plateNos = {};

  onValue(unitsRef, (snapshot) => {
    if (!snapshot.exists()) {
      console.log("No data found in Firebase notifications.");
      return;
    }

    snapshot.forEach((childSnapshot) => {
      const eJeepNo = childSnapshot.key;
      const eJeepData = childSnapshot.val();

      plateNos[eJeepNo] = eJeepData.plateNo;

      // console.log(plateNos[eJeepNo], "plate number test");

      getUnit(
        eJeepNo,
        eJeepData.contactNo,
        eJeepData.status,
        eJeepData.condition,
        eJeepData.plateNo,
        eJeepData.fullName
      );

      // updateJeepTextContent(eJeepNo, eJeepData.contactNo);
    });
  });

  onValue(
    historyRef,
    (snapshot) => {
      // console.log("Notification data received from Firebase");
      // console.log(snapshot.val()); // Log the snapshot data to check if data is being received

      if (!snapshot.exists()) {
        console.log("No data found in Firebase notifications.");
        return;
      }

      csvData.length = 1;

      // Handle each notification
      snapshot.forEach((childSnapshot) => {
        const historyId = childSnapshot.key;
        const historyData = childSnapshot.val();

        gettingHistory(
          historyData.deviceID,
          historyData.message,
          historyData.streetName,
          historyData.timestamp
        );
      });
    },
    (error) => {
      console.error("Error fetching notifications from Firebase:", error);
    }
  );

  onValue(collisionsRef, (snapshot) => {
    if (!snapshot.exists()) {
      console.log("No data found in Firebase Collisions.");
      return;
    }

    snapshot.forEach((childSnapshot) => {
      const colId = childSnapshot.key;
      const colData = childSnapshot.val();

      collision[colId] = colData.collision;

      checkCollision(colId, collision[colId]);
    });
  });

  function checkCollision(notifID, collision) {
    const notifRef = ref(database, `notifications/${notifID}`);

    // Update the message field to "False Alarm"
    if (collision) {
      update(notifRef, {message: "Possible Collision"}) // Use update() with correct import
        .then(() => {
          const promptTab = document.querySelector(".prompt");
          console.log("Notification message updated to 'Possible Collision'");
        })
        .catch((error) => {
          console.error("Error updating notification message:", error);
        });
    }
  }

  const streetNames = {}; // Global object to store street names
  // Listen for notifications from Firebase
  function notifying(notifID, message, lat, lon, speed, contactNo) {
    const reportsCon = document.querySelector(".reports-list");
    const notifTab = document.querySelector(".notif");
    let reportInfo = document.getElementById(`report-${notifID}`);
    let slicedNotifID = notifID.slice(-4).toUpperCase();

    // console.log(notifID, lat, lon, "ito ba yon?");
    const remainingReports = reportsCon.querySelectorAll(".report-info");

    if (remainingReports.length === 0) {
      notifTab.classList.remove("notified");
      // console.log(remainingReports, "rem report test again");
    }

    if (
      message === "Driver Pressed" ||
      message === "Passenger Pressed" ||
      message === "Possible Collision"
    ) {
      reverseGeocode(lat, lon, (error, result) => {
        if (
          message === "Driver Pressed" ||
          message === "Passenger Pressed" ||
          message === "Possible Collision"
        ) {
          notifTab.classList.add("notified");

          console.log(notifID, "rem report test again");
          streetNames[notifID] = result.road;

          // If reportInfo already exists, remove it before creating a new one
          if (reportInfo && reportsCon.contains(reportInfo)) {
            reportsCon.removeChild(reportInfo);
          }

          reportInfo = document.createElement("li");
          reportInfo.className = "report-info";
          reportInfo.id = `report-${notifID}`;
          reportInfo.innerHTML = `
            <a href="#" id="toggleLink" onclick="handleNotificationClick('${notifID}', ${lat}, ${lon})">${slicedNotifID} - ${plateNos[notifID]}</a>
            <p id="ejeep-no-${notifID}-street"></p>
            <p id="ejeep-no-${notifID}-contact"></p>
            <div class="notification-container">
              <p class="notif-button" id="ejeep-no-${notifID}-message">
                <div class="buttons-container">
                  <input type="text" class="reports-text">
                  <button class="verified-button"></button>
                  <button class="false-alarm" onclick="addHistory('${notifID}', '${result.road}')"></button>
                  <button class="back-button"></button>
                  <button class="send-button"></button>
                </div></p>
            </div>
          `;
          reportsCon.appendChild(reportInfo);

          const eJeepStreet = document.getElementById(
            `ejeep-no-${notifID}-street`
          );
          const eJeepContact = document.getElementById(
            `ejeep-no-${notifID}-contact`
          );
          const eJeepMessage = document.getElementById(
            `ejeep-no-${notifID}-message`
          );
          eJeepStreet.textContent =
            (result.houseNo ? result.houseNo + " " : "") + result.road;
          eJeepContact.textContent = contactNo;
          eJeepMessage.textContent = message;

          removeDuplicateElementsById(`report-${notifID}`);
        } else {
          if (reportInfo) {
            reportsCon.removeChild(reportInfo);
          }
        }
      });
    } else {
      if (reportInfo) {
        reportsCon.removeChild(reportInfo);
      }
      const remainingReports = reportsCon.querySelectorAll(".report-info");
      if (remainingReports.length === 0) {
        notifTab.classList.remove("notified");
      }
    }
  }

  window.handleNotificationClick = function (notifID, lat, lon) {
    console.log("test button");

    getCctv();
    createBtn(notifID, lat, lon);
    callAllStationFunction(notifID, lat, lon);
  };

  window.callAllStationFunction = function (notifID, lat, lon) {
    nearestHospital(notifID, lat, lon);
    nearestPoliceStation(notifID, lat, lon);
    nearestFireStation(notifID, lat, lon);
  };

  window.createBtn = function (id, lat, lon) {
    // Container for buttons
    const mapBtnContainer = document.getElementById("map-btn-container");
    const hospitalButton = document.getElementById("hospital-button");
    const policeButton = document.getElementById("police-button");
    const fireButton = document.getElementById("fire-button");
    const showAllButton = document.getElementById("show-all-button");

    if (hospitalButton) {
      mapBtnContainer.removeChild(hospitalButton);
      mapBtnContainer.removeChild(policeButton);
      mapBtnContainer.removeChild(fireButton);
      mapBtnContainer.removeChild(showAllButton);
    }

    if (mapBtnContainer) {
      // Create Hospital button
      const hospitalButton = document.createElement("button");
      hospitalButton.id = "hospital-button";
      hospitalButton.onclick = function () {
        nearestHospital(id, lat, lon);
      };

      // Create Police button
      const policeButton = document.createElement("button");
      policeButton.id = "police-button";
      policeButton.onclick = function () {
        clearMarkers();
        nearestPoliceStation(id, lat, lon);
      };

      // Create Fire button
      const fireButton = document.createElement("button");
      fireButton.id = "fire-button";
      fireButton.onclick = function () {
        clearMarkers();
        nearestFireStation(id, lat, lon);
      };

      // Create Show All button
      const showAllButton = document.createElement("button");
      showAllButton.id = "show-all-button";
      showAllButton.onclick = function () {
        clearMarkers();
        nearestHospital(id, lat, lon);
        nearestPoliceStation(id, lat, lon);
        nearestFireStation(id, lat, lon);
      };

      // Append buttons to container
      mapBtnContainer.appendChild(hospitalButton);
      mapBtnContainer.appendChild(policeButton);
      mapBtnContainer.appendChild(fireButton);
      mapBtnContainer.appendChild(showAllButton);
    } else {
      console.error('Element with id "map-btn-container" not found.');
    }
  };

  function removeDuplicateElementsById(elementId) {
    const elements = document.querySelectorAll(`#${elementId}`);

    if (elements.length > 1) {
      for (let i = 1; i < elements.length; i++) {
        elements[i].parentNode.removeChild(elements[i]);
      }
    }
  }

  document.addEventListener("click", function (event) {
    const iframe = document.getElementById("footage");
    const link = document.getElementById("toggleLink");

    // Check if the click was outside the iframe and the link
    if (link) {
      if (!link.contains(event.target) && !iframe.contains(event.target)) {
        iframe.style.display = "none"; // Hide the iframe
        iframe.src = "";
      }
    }
  });

  window.addHistory = function (deviceID, streetName) {
    // Create a reference to the specific timestamp key
    let timestamp = Date.now();

    const historyRef = ref(database, `history/${timestamp}`);
    const message = "False Alarm";

    // Data to be written to the 'history' node under the timestamp key
    const historyData = {
      deviceID: deviceID,
      message: message,
      streetName: streetName,
      timestamp: timestamp,
    };

    // Write data to the 'history' node under the specific timestamp key
    set(historyRef, historyData)
      .then(() => {
        console.log("History entry added successfully:", historyData);
      })
      .catch((error) => {
        console.error("Error adding history entry:", error);
      });
  };

  window.getCctv = async function () {
    const deviceID = "01";

    const cctv = document.getElementById("footage");

    cctv.src = youtubeLink[deviceID];
    cctv.style.display = "block";
  };

  function clearPreviousContacts() {
    const contactsCon = document.querySelector(".contacts-list");
    contactsCon.querySelectorAll(`.contacts-info`).forEach((el) => el.remove());
    const fireContactsCon = document.querySelector(".fire-contacts-list");
    fireContactsCon
      .querySelectorAll(`.contacts-info`)
      .forEach((el) => el.remove());
    const policeContactsCon = document.querySelector(".police-contacts-list");
    policeContactsCon
      .querySelectorAll(`.contacts-info`)
      .forEach((el) => el.remove());
  }

  // Initialize a global layer group to hold markers
  const markersLayer = L.layerGroup().addTo(map);

  console.log(markersLayer, "markers test");

  const registeredLocation = {
    "Mary Chiles General Hospital": {
      latitude: 14.60336242595793,
      longitude: 120.98976099659825,
    },
  };

  window.nearestHospital = function (deviceId, lat, lon) {
    clearPreviousContacts();
    const ContactsCon = document.querySelector(".contacts-list");
    let contactsInfo = document.getElementById(`.contacts-${deviceId}`);
    const radius = 3000; // 3km radius
    const mapboxToken =
      "pk.eyJ1Ijoiam96ZXBocGVyZXoiLCJhIjoiY20wMHBpbGNuMXhkMzJxczhmcHlpZXc2ZyJ9.JJwWHmr_HnB_aRMsLrg-6w";

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/hospital.json?proximity=${lon},${lat}&limit=5&access_token=${mapboxToken}`;

    fetch(url)
      .then((response) => response.json())
      .then(async (data) => {
        // Clear existing markers
        markersLayer.clearLayers();

        if (data.features && data.features.length > 0) {
          data.features.forEach((hospital) => {
            const [hospitalLon, hospitalLat] = hospital.geometry.coordinates;

            const distance = getDistanceFromLatLonInMeters(
              lat,
              lon,
              hospitalLat,
              hospitalLon
            );

            if (distance <= radius) {
              // Creating a marker with the hospital icon
              const marker = L.marker([hospitalLat, hospitalLon], {
                icon: L.icon({
                  iconUrl: "img/hospital.png", // Path to your hospital icon
                  iconSize: [32, 32], // Size of the icon
                  iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
                  popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
                }),
              }).bindPopup(
                `<b>${hospital.text}</b><br>${
                  hospital.place_name
                }<br>${hospitalContactNumber(hospital.text)}`
              ); // Add popup with hospital name and address

              marker.addTo(markersLayer); // Add marker to the layer group
              contactsInfo = document.createElement("li");
              contactsInfo.className = "contacts-info";
              contactsInfo.id = `contacts-${deviceId}`;
              contactsInfo.innerHTML = `
              <h3 href="#">${hospital.text}</h3>
              <p>${hospitalContactNumber(hospital.text)}</p>
              `;
              ContactsCon.appendChild(contactsInfo);
            }
          });
        } else {
          console.log("No hospitals found nearby.");
        }

        const snapshot = await get(hospitalRef);

        if (!snapshot.exists()) {
          console.log("No data found in Firebase notifications.");
          return;
        }

        snapshot.forEach((childSnapshot) => {
          const locName = childSnapshot.key;
          const data = childSnapshot.val();

          const distance = getDistanceFromLatLonInMeters(
            lat,
            lon,
            data.latitude,
            data.longitude
          );

          if (distance <= radius) {
            const marker = L.marker([data.latitude, data.longitude], {
              icon: L.icon({
                iconUrl: "img/hospital.png", // Path to your hospital icon
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
              }),
            }).bindPopup(
              `<b>${locName}</b><br>Custom Location (${(
                distance / 1000
              ).toFixed(2)} km away)<br>${
                data.contactNo ? data.contactNo : randomContactNumber()
              }`
            );

            marker.addTo(markersLayer);
            contactsInfo = document.createElement("li");
            contactsInfo.className = "contacts-info";
            contactsInfo.id = `contacts-${deviceId}`;
            contactsInfo.innerHTML = `
            <h3 href="#">${locName}</h3>
            <p>${data.contactNo ? data.contactNo : randomContactNumber()}</p>
            `;
            ContactsCon.appendChild(contactsInfo);
          }
        });
      })
      .catch((error) => console.error("Error:", error));
  };

  function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of the Earth in meters
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters
    return distance;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  window.nearestPoliceStation = function (deviceId, lat, lon) {
    const policeContactsCon = document.querySelector(".police-contacts-list");
    let contactsInfo = document.getElementById(`.contacts-${deviceId}`);
    const radius = 3000; // 3km radius
    const mapboxToken =
      "pk.eyJ1Ijoiam96ZXBocGVyZXoiLCJhIjoiY20wMHBpbGNuMXhkMzJxczhmcHlpZXc2ZyJ9.JJwWHmr_HnB_aRMsLrg-6w";

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/police.json?proximity=${lon},${lat}&limit=5&access_token=${mapboxToken}`;

    fetch(url)
      .then((response) => response.json())
      .then(async (data) => {
        // Clear existing markers
        markersLayer.clearLayers();

        if (data.features && data.features.length > 0) {
          data.features.forEach((policeStation) => {
            const [stationLon, stationLat] = policeStation.geometry.coordinates;

            const distance = getDistanceFromLatLonInMeters(
              lat,
              lon,
              stationLat,
              stationLon
            );

            if (distance <= radius) {
              // Creating a marker with the police station icon
              const marker = L.marker([stationLat, stationLon], {
                icon: L.icon({
                  iconUrl: "img/police.png", // Path to your police station icon
                  iconSize: [32, 32], // Size of the icon
                  iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
                  popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor
                }),
              }).bindPopup(
                `<b>${policeStation.text}</b><br>${
                  policeStation.place_name
                }<br>${policeContactNumber(policeStation.text)}`
              ); // Add popup with police station name and address

              marker.addTo(markersLayer); // Add marker to the layer group
              contactsInfo = document.createElement("li");
              contactsInfo.className = "contacts-info";
              contactsInfo.id = `contacts-${deviceId}`;
              contactsInfo.innerHTML = `
              <h3 href="#">${policeStation.text}</h3>
              <p>${policeContactNumber(policeStation.text)}</p>
              `;
              policeContactsCon.appendChild(contactsInfo);
            }
          });
        } else {
          console.log("No police stations found nearby.");
        }

        const snapshot = await get(policeRef);

        if (!snapshot.exists()) {
          console.log("No data found in Firebase notifications.");
          return;
        }

        snapshot.forEach((childSnapshot) => {
          const locName = childSnapshot.key;
          const data = childSnapshot.val();

          const distance = getDistanceFromLatLonInMeters(
            lat,
            lon,
            data.latitude,
            data.longitude
          );

          if (distance <= radius) {
            const marker = L.marker([data.latitude, data.longitude], {
              icon: L.icon({
                iconUrl: "img/police.png", // Path to your police station icon
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
              }),
            }).bindPopup(
              `<b>${locName}</b><br>Custom Location (${(
                distance / 1000
              ).toFixed(2)} km away)<br>${data.contactNo}`
            );

            marker.addTo(markersLayer);
            contactsInfo = document.createElement("li");
            contactsInfo.className = "contacts-info";
            contactsInfo.id = `contacts-${deviceId}`;
            contactsInfo.innerHTML = `
            <h3 href="#">${locName}</h3>
            <p>${data.contactNo}</p>
            `;
            policeContactsCon.appendChild(contactsInfo);
          }
        });
      })
      .catch((error) => console.error("Error:", error));
  };

  window.nearestFireStation = async function (deviceId, lat, lon) {
    const fireContactsCon = document.querySelector(".fire-contacts-list");
    let contactsInfo = document.getElementById(`.contacts-${deviceId}`);
    const radius = 3000;

    const snapshot = await get(fireRef);

    if (!snapshot.exists()) {
      console.log("No data found in Firebase notifications.");
      return;
    }

    snapshot.forEach((childSnapshot) => {
      const locName = childSnapshot.key;
      const data = childSnapshot.val();

      // console.log(locName);

      const distance = getDistanceFromLatLonInMeters(
        lat,
        lon,
        data.latitude,
        data.longitude
      );

      if (distance <= radius) {
        const marker = L.marker([data.latitude, data.longitude], {
          icon: L.icon({
            iconUrl: "img/fire.png", // Path to your hospital icon
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          }),
        }).bindPopup(
          `<b>${locName}</b><br>Custom Location (${(distance / 1000).toFixed(
            2
          )} km away)<br>${data.contactNo}`
        );

        marker.addTo(markersLayer);
        contactsInfo = document.createElement("li");
        contactsInfo.className = "contacts-info";
        contactsInfo.id = `contacts-${deviceId}`;
        contactsInfo.innerHTML = `
        <h3 href="#">${locName}</h3>
        <p>${data.contactNo}</p>
        `;
        fireContactsCon.appendChild(contactsInfo);
      }
    });
  };

  // Function to remove all markers
  window.clearMarkers = function () {
    markersLayer.clearLayers();
  };

  function hospitalContactNumber(hospitalName) {
    if (hospitalName == "University of Santo Tomas Hospital") {
      return "02 8731 3001";
    } else if (hospitalName == "Perpetual Succor Hospital & Maternity Inc.") {
      return "02 8731 1631";
    } else if (hospitalName == "De Ocampo Memorial Medical Center") {
      return "02 8715 1891";
    } else if (hospitalName == "AMOSUP Seamen's Hospital") {
      return "02 8527 8116";
    } else if (hospitalName == "St. Lukes Medical Center (Extension Clinic)") {
      return "02 8521 0020";
    } else if (hospitalName == "St. Victoria Hospital") {
      return "02 8942 2022";
    } else if (hospitalName == "VT Maternity Hospital") {
      return "02 8942 6669";
    } else if (hospitalName == "Amang Rodriguez Memorial Medical Center") {
      return "02 8941 5854";
    } else {
      return randomContactNumber();
    }
  }

  function policeContactNumber(policeName) {
    if (policeName == "Manila Police District") {
      return "02 8806 5686";
    } else if (policeName == "Jose Abad Santos PS") {
      return "02 8252 8450";
    } else if (policeName == "Manila District Traffic Enforcement Unit") {
      return "0977 714 5263";
    } else {
      return randomContactNumber();
    }
  }

  function randomContactNumber() {
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
      "02 5389 5678",
      "02 2189 6789",
      "02 2389 7891",
      "02 3490 8902",
      "02 2348 9013",
      "02 5678 5678",
      "02 5619 6781",
      "02 8291 7892",
      "02 8923 8903",
      "02 8712 9014",
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

  window.gettingHistory = function (historyId, message, streetName, timestamp) {
    // Convert timestamp to milliseconds (if necessary)
    let date = new Date(Number(timestamp)); // Ensure the timestamp is a number
    let dateAndTime = date.toLocaleString();
    let slicedHistoryId = historyId.slice(-4).toUpperCase();

    let sanitizedDate = dateAndTime.replace(/,/g, "");

    const historyCon = document.querySelector(".history-list");
    let existingHistoryInfo = document.getElementById(`history-${timestamp}`);

    csvData.push([
      slicedHistoryId + " - " + plateNos[historyId],
      streetName,
      sanitizedDate,
      message,
    ]);

    if (existingHistoryInfo) {
      // Remove the existing element with the same ID
      // console.log("Removing existing element with this ID...");
      historyCon.removeChild(existingHistoryInfo);
    }

    // Create a new element
    let historyInfo = document.createElement("li");
    historyInfo.className = "history-info";
    historyInfo.id = `history-${timestamp}`;
    historyInfo.innerHTML = `
        <p>${slicedHistoryId} - ${plateNos[historyId]}</p>
        <p>${streetName}</p>
        <p>${dateAndTime}</p>
        <p>${message}</p>
    `;

    // Insert the new element below the header

    const header = historyCon.querySelector(".header");
    if (header) {
      historyCon.insertBefore(historyInfo, header.nextSibling);
    } else {
      historyCon.appendChild(historyInfo);
    }

    // console.log(timestamp, "Element added or updated.");
  };

  window.falseAlarm = function (notifID) {
    const mapBtnContainer = document.getElementById("map-btn-container");
    const hospitalButton = document.getElementById("hospital-button");
    const policeButton = document.getElementById("police-button");
    const fireButton = document.getElementById("fire-button");
    const showAllButton = document.getElementById("show-all-button");

    if (hospitalButton) {
      mapBtnContainer.removeChild(hospitalButton);
      mapBtnContainer.removeChild(policeButton);
      mapBtnContainer.removeChild(fireButton);
      mapBtnContainer.removeChild(showAllButton);
    }
    clearPreviousContacts();
    markersLayer.clearLayers();

    const notifRef = ref(database, `notifications/${notifID}`);
    const collisionsRef = ref(database, `collisionInstance/${notifID}`);
    update(collisionsRef, {collision: false});

    // Update the message field to "False Alarm"
    update(notifRef, {message: "False Alarm"}) // Use update() with correct import
      .then(() => {
        const promptTab = document.querySelector(".prompt");
        promptTab.classList.add("prompted");
        setTimeout(() => {
          promptTab.classList.remove("prompted");
        }, 1500);
        console.log("Notification message updated to 'False Alarm'");
      })
      .catch((error) => {
        console.error("Error updating notification message:", error);
      });
  };

  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("notif-button")) {
      const notifButton = event.target;
      const notifContainer = notifButton
        .closest("li")
        .querySelector(".notification-container");
      notifContainer.classList.toggle("reveal");

      document.addEventListener("click", function (e) {
        // Check if the click was outside the notification container
        if (!notifContainer.contains(e.target) && e.target !== notifButton) {
          notifContainer.classList.remove("reveal");
        }
      }); // Ensure this listener is removed after execution
    }
  });

  document.addEventListener("click", function (event) {
    // Handle verified-button click
    if (event.target.classList.contains("verified-button")) {
      const notifContainer = event.target.closest(".notification-container");

      const reportText = notifContainer.querySelector(".reports-text");
      const falseAlarmButton = notifContainer.querySelector(".false-alarm");
      const verifiedButton = notifContainer.querySelector(".verified-button");
      const backButton = notifContainer.querySelector(".back-button");
      const sendButton = notifContainer.querySelector(".send-button");

      // Toggle visibility and styles
      reportText.classList.add("reveal");
      verifiedButton.style.display = "none";
      falseAlarmButton.style.display = "none";
      backButton.style.display = "block";

      backButton.classList.add("animate-glide");

      // Remove the animation class after the animation completes
      backButton.addEventListener("animationend", () => {
        backButton.classList.remove("animate-glide");
      });

      // Ensure only one event listener is added to the backButton
      backButton.removeEventListener("click", handleBackButtonClick);
      backButton.addEventListener("click", handleBackButtonClick);

      // Handle back-button click
      function handleBackButtonClick() {
        reportText.classList.remove("reveal");
        verifiedButton.style.display = "block";
        falseAlarmButton.style.display = "block";
        backButton.style.display = "none";
      }

      // Handle input in the reportText field
      reportText.addEventListener("input", function () {
        if (reportText.value.trim() !== "") {
          sendButton.style.display = "block";
          backButton.style.display = "none";
        } else {
          sendButton.style.display = "none";
          backButton.style.display = "block";
        }
      });
    }
  });

  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("false-alarm")) {
      const notifContainer = event.target.closest(".notification-container");
      const reportInfo = notifContainer.closest(".report-info");
      const notifID = reportInfo.id.replace("report-", ""); // Extract notifID
      notifContainer.classList.remove("reveal");
      const streetName = streetNames[notifID];
      const slicedHistoryId = notifID.slice(-4).toUpperCase();
      let timestamp = Date.now();
      let date = new Date(Number(timestamp)).toLocaleString().replace(/,/g, ""); // Ensure the timestamp is a number

      console.log(csvData); // Log to see collected data

      falseAlarm(notifID);
    }
  });

  let csvData = [
    ["UNIT NO. - PLATE NO.", "LAST KNOWN LOCATION", "DATE AND TIME", "STATUS"],
  ]; // Initialize with headers

  // Function to download CSV from collected data
  function downloadCSV(data, filename) {
    const csvContent =
      "data:text/csv;charset=utf-8," + data.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);

    // Append the link to the body and trigger a click
    document.body.appendChild(link);
    link.click();

    // Remove the link after downloading
    document.body.removeChild(link);
  }

  // Add a separate button for downloading the CSV file
  const downloadButton = document.getElementById("download-button");
  downloadButton.addEventListener("click", function () {
    downloadCSV(csvData, "history.csv");
  });

  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("send-button")) {
      const notifContainer = event.target.closest(".notification-container");
      const reportText = notifContainer.querySelector(".reports-text");

      // Find the parent <li> element to get the notifID
      const reportInfo = notifContainer.closest(".report-info");
      const notifID = reportInfo.id.replace("report-", ""); // Extract notifID

      // Get the value from the input field
      const textInput = reportText.value.trim();

      notifContainer.classList.remove("reveal");
      clearNotif(notifID, textInput);
    }
  });

  document.querySelector(".units-button").addEventListener("click", () => {
    map.invalidateSize();
  });

  // console.log(streetNames, "test streetnames LAKSJDLASJKD");

  // Function to clear notification
  window.clearNotif = function (deviceID, message) {
    const mapBtnContainer = document.getElementById("map-btn-container");
    const hospitalButton = document.getElementById("hospital-button");
    const policeButton = document.getElementById("police-button");
    const fireButton = document.getElementById("fire-button");
    const showAllButton = document.getElementById("show-all-button");

    if (hospitalButton) {
      mapBtnContainer.removeChild(hospitalButton);
      mapBtnContainer.removeChild(policeButton);
      mapBtnContainer.removeChild(fireButton);
      mapBtnContainer.removeChild(showAllButton);
    }
    clearPreviousContacts();
    markersLayer.clearLayers();

    let timestamp = Date.now();
    let date = new Date(Number(timestamp)); // Ensure the timestamp is a number
    let dateAndTime = date.toLocaleString();
    let sanitizedDate = dateAndTime.replace(/,/g, "");
    const notifID = deviceID; // Use deviceID as notifID if applicable
    const notifRef = ref(database, `notifications/${deviceID}`);
    const streetName = streetNames[notifID];
    const collisionsRef = ref(database, `collisionInstance/${notifID}`);

    update(collisionsRef, {collision: false})
      .then(() => {
        console.log("Collision flag updated successfully");
      })
      .catch((error) => {
        console.error("Error updating collision flag:", error);
      });

    const slicedHistoryId = notifID.slice(-4).toUpperCase();
    console.log(slicedHistoryId, streetName, sanitizedDate, message, "test");
    setHistory(
      slicedHistoryId,
      streetName,
      sanitizedDate,
      message,
      timestamp,
      notifID
    );

    update(notifRef, {message: message})
      .then(() => {
        const promptTab = document.querySelector(".prompt");
        promptTab.classList.add("prompted");
        setTimeout(() => {
          promptTab.classList.remove("prompted");
        }, 1500);
        console.log("Notification message updated to 'False Alarm'");
      })
      .catch((error) => {
        console.error("Error updating notification message:", error);
      });

    console.log("Before the final log");
  };

  function setHistory(
    slicedHistoryId,
    streetName,
    sanitizedDate,
    message,
    timestamp,
    deviceID
  ) {
    console.log(
      slicedHistoryId,
      streetName,
      sanitizedDate,
      message,
      "testing if this will log"
    );
    const historyRef = ref(database, `history/${timestamp}`);
    const historyData = {
      deviceID: deviceID,
      message: message,
      streetName: streetName || "undefined",
      timestamp: timestamp,
    };
    set(historyRef, historyData)
      .then(() => {
        console.log("History entry added successfully:", historyData);
      })
      .catch((error) => {
        console.error("Error adding history entry:", error);
      });
  }

  async function reverseGeocode(lat, lon, callback) {
    const apiRef = ref(database, "Apis");

    const snapshot = await get(apiRef);

    snapshot.forEach((childSnapshot) => {
      const apiID = childSnapshot.key;
      const apiData = childSnapshot.val();

      const hereApiKey = apiData; // Your HERE API key
      const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lon}&lang=en-US&apikey=${hereApiKey}`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.items) {
            const road = data.items[0].address.street;
            const houseNo = data.items[0].address.houseNumber;
            // console.log(data.items[0].address, "location test");

            callback(null, {road, houseNo});
          } else {
            callback("No street name found");
          }
        })
        .catch((error) => {
          callback(error);
        });
    });

    // console.log(data, "test DATA sdfasdf");
  }

  function updateMarker(deviceId, lat, lon, speed) {
    reverseGeocode(lat, lon, (error, streetName) => {
      if (error) {
        console.error("Error reverse geocoding:", error);
        streetName = `Lat: ${lat}, Lon: ${lon}`;
      }

      // console.log(deviceId, "is it this one?");

      const popupContent = `
        <b>Device ID:</b> ${deviceId}<br>
        <b>Street:</b> ${streetName.road}<br>
      `;

      if (markers[deviceId]) {
        markers[deviceId].setLatLng([lat, lon]).setPopupContent(popupContent);
      } else {
        markers[deviceId] = L.marker([lat, lon])
          .bindPopup(popupContent)
          .addTo(map);
      }

      // Update the sidebar with the latest device info
      updateSidebar(deviceId, streetName.road, speed);
    });
  }

  window.addUnit = function () {
    // Get the current data in the "units" database
    const plateNo = document.getElementById("plateNo");
    const capPlateNo = plateNo.value.toUpperCase();
    if (plateNo.value.trim() == "") {
      alert("Enter the plate number");
      return;
    }
    get(unitsRef)
      .then((snapshot) => {
        const unitData = snapshot.exists() ? snapshot.val() : {};
        const keys = Object.keys(unitData);

        let nextKey;

        if (keys.length === 0) {
          // If no units exist, create the first entry with key "01"
          nextKey = "01";
        } else {
          // Create a set of existing keys
          const existingKeys = new Set(keys.map((key) => parseInt(key, 10)));

          // Find the lowest available key
          for (let i = 1; i <= keys.length + 1; i++) {
            if (!existingKeys.has(i)) {
              nextKey = String(i).padStart(2, "0");
              break;
            }
          }
        }

        // Add new unit data under the next available key
        const newUnitRef = child(unitsRef, nextKey);
        set(newUnitRef, {
          fullName: "",
          plateNo: capPlateNo,
          status: "Unoccupied",
          condition: "Active",
          contactNo: "",
        })
          .then(() => {
            console.log(`Data saved successfully under key ${nextKey}!`);
            plateNo.value = "";
          })
          .catch((error) => {
            console.error("Error saving data: ", error);
          });
      })
      .catch((error) => {
        console.error("Error retrieving data: ", error);
      });
  };

  window.showQrCode = function (plateNumber) {
    let plateNo = plateNumber.trim(); // Trim whitespace from the input value

    if (plateNo === "") {
      alert("Please enter a plate number.");
      return;
    }

    // Create a new window
    const printWindow = window.open("", "_blank", "width=800,height=800");

    // Write a basic HTML structure to the new window
    printWindow.document.write(`
        <html>
        <head>
            <title>Print QR Code</title>
            <style>
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    font-family: Arial, sans-serif;
                }
            </style>
        </head>
        <body>
            <div id="qrcode"></div>
            <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.qrcode/1.0/jquery.qrcode.min.js"></script>
            <script>
                $(document).ready(function () {
                    // Generate the QR code
                    $('#qrcode').qrcode({
                        text: '${plateNo}',
                        width: 256 * 2, // Set the size of the QR code (300% of 256)
                        height: 256 * 2
                    });
                });
            </script>
        </body>
        </html>
    `);

    // Close the document stream to render the content
    printWindow.document.close();
  };

  window.decommisionWarning = function (eJeepNo) {
    const decomWarnCon = document.querySelector(".decommission-warning");
    const decomCancelBtn = document.querySelector(
      ".decommission-cancel-button"
    );
    const decomDelBtn = document.querySelector(".decommission-delete-button");
    const decomEjeepNo = document.querySelector(".decommission-ejeep-no");
    decomEjeepNo.textContent = eJeepNo;
    decomWarnCon.classList.add("reveal");
    decomCancelBtn.addEventListener("click", () => {
      decomWarnCon.classList.remove("reveal");
    });

    decomDelBtn.addEventListener("click", () => {
      deleteUnit(eJeepNo);
      decomWarnCon.classList.remove("reveal");
    });
  };

  document.addEventListener("click", function (event) {
    const decomWarnCon = document.querySelector(".decommission-warning");
    if (
      event.target.classList.contains("decommission-warning") &&
      !event.target.classList.contains("jeep-delete-button")
    ) {
      decomWarnCon.classList.remove("reveal");
    }
  });

  window.deleteUnit = function (eJeepNo) {
    const ejeep = document.getElementById(`ejeep-${eJeepNo}`);

    const unitsRef = ref(database, `units/${eJeepNo}`);
    // console.log(unitsRef);

    set(unitsRef, null);

    ejeep.remove();
  };

  function getUnit(eJeepNo, contactNo, status, condition, plateNo, fullName) {
    const unitList = document.querySelector(".units-list");
    let unitInfo = document.getElementById(`ejeep-${eJeepNo}`);

    if (!unitInfo) {
      unitInfo = document.createElement("div");
      unitInfo.className = "ejeep-container";
      unitInfo.id = `ejeep-${eJeepNo}`;
      unitList.appendChild(unitInfo);
    }
    unitInfo.innerHTML = `
      <p class="ejeep-number" id="ejeep-no-${eJeepNo}">E-jeep No: ${eJeepNo}</p>
      <p class="ejeep-${eJeepNo}-driver" id="ejeep-${eJeepNo}-driver">Driver: ${fullName}</p>
      <p class="ejeep-${eJeepNo}-contact" id="ejeep-${eJeepNo}-contact">
        Contact No: ${contactNo}
      </p>
      <p class="ejeep-${eJeepNo}-status" id="ejeep-${eJeepNo}-status">
        Status: ${status}
      </p>
      <p class="ejeep-${eJeepNo}-condition" id="ejeep-${eJeepNo}-condition">
        Condition: ${condition}
      </p>
      <p class="ejeep-plateNo" id="ejeep-${eJeepNo}-plateNo" onclick="showQrCode('${plateNo}')">Plate No: ${plateNo}</p>
      <div class="jeep-button-container" id="jeep-no-${eJeepNo}-button-container">
        <button class="jeep-deactivate-button" id="jeep-no-${eJeepNo}-deactivate-button" onclick="deactivate('${eJeepNo}', '${condition}')"></button>
        <button class="jeep-delete-button" id="jeep-no-${eJeepNo}-delete-button" onclick="decommisionWarning('${eJeepNo}')"></button>
      </div>
    `;
    let titleNo = document.getElementById(`ejeep-no-${eJeepNo}`);
    const jeepBtnCon = document.getElementById(
      `jeep-no-${eJeepNo}-button-container`
    );
    if (status == "Occupied") {
      unitInfo.style.backgroundColor = "#1d692a";
      unitInfo.style.border = "5px solid #10e633";
      titleNo.style.border = "5px solid #10e633";
      jeepBtnCon.style.display = "none";
    } else if (condition == "Under Maintenance") {
      unitInfo.style.backgroundColor = "#6b1212";
      unitInfo.style.border = "5px solid red";
      titleNo.style.border = "5px solid red";
    } else if (condition == "Active") {
      unitInfo.style.backgroundColor = "#52570e";
      unitInfo.style.border = "5px solid yellow";
      titleNo.style.border = "5px solid yellow";
    }
  }

  window.deactivate = function (eJeepNo, condition) {
    const conditionText = document.getElementById(`ejeep-${eJeepNo}-condition`);
    const unitsRef = ref(database, `units/${eJeepNo}`);
    if (condition == "Active") {
      conditionText.textContent = "Condition: Under Maintenance";
      update(unitsRef, {condition: "Under Maintenance"});
    } else if (condition == "Under Maintenance") {
      conditionText.textContent = "Condition: Active";
      update(unitsRef, {condition: "Active"});
    }
  };

  function updateSidebar(deviceId, streetName, speed) {
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
      <p><b>Speed:</b> ${speed}KM/H</p>
    `;
  }
}

window.backButton = function () {
  const unitNoCon = document.querySelector(".unit-number-container");
  const backBtn = document.getElementById("unit-back-btn");
  const routeImgCon = document.querySelector(".route-img-container");
  const routeImg = document.getElementById("route-img");
  routeImg.src = "";

  routeImgCon.classList.add("hide");
  unitNoCon.classList.remove("hide");
  backBtn.style.display = "none";
};

window.routeBtn = function (element) {
  const unitNoCon = document.querySelector(".unit-number-container");
  const routeBtn = document.getElementById("route-btn");
  const backBtn = document.getElementById("unit-back-btn");
  const routeImgCon = document.querySelector(".route-img-container");

  const deviceID = element.textContent.trim();
  console.log(deviceID);

  const routeImg = document.getElementById("route-img");

  const imgSrc = `routes/${deviceID}.png`;

  routeImg.src = imgSrc;

  routeImgCon.classList.remove("hide");
  unitNoCon.classList.add("hide");
  backBtn.style.display = "block";
};

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
