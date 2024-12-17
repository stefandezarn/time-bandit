// Initialize Firebase
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase app
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", function() {
    const addTimerBtn = document.getElementById("addTimerBtn");
    const timersContainer = document.getElementById("timers");
    let timerCount = 0;

    addTimerBtn.addEventListener("click", async function() {
        const timerName = prompt("Enter timer name:");
        if (timerName) {
            const newTimer = await createTimer(timerName);
            // Save the new timer to Firestore
            saveTimerToFirestore(newTimer);
        }
    });

    // Function to create a new timer
    async function createTimer(timerName) {
        timerCount++;
        const timerDiv = document.createElement("div");
        timerDiv.classList.add("timer");

        const timerNameDisplay = document.createElement("div");
        timerNameDisplay.textContent = timerName;
        timerNameDisplay.classList.add("timer-name");

        const timeDisplay = document.createElement("div");
        timeDisplay.classList.add("time-display");
        timeDisplay.textContent = "00:00:00 (0.00 hours)"; // Initial display in hh:mm:ss and fractional hours

        const resetButton = document.createElement("button");
        resetButton.textContent = "Reset";
        resetButton.classList.add("reset-btn");

        timerDiv.appendChild(timerNameDisplay);
        timerDiv.appendChild(timeDisplay);
        timerDiv.appendChild(resetButton);

        const timer = {
            timerDiv: timerDiv,
            timeDisplay: timeDisplay,
            name: timerName,
            elapsedTime: 0, // Time in milliseconds
            running: false,
            state: "stopped",
            startTime: null,
            timerInterval: null
        };

        timerDiv.timer = timer;

        // Add click event to start/stop timer
        timerDiv.addEventListener("click", function() {
            if (!timer.running) {
                startTimer(timer);
            } else {
                stopTimer(timer);
            }
        });

        // Add reset event
        resetButton.addEventListener("click", function(event) {
            event.stopPropagation();
            resetTimer(timer);
        });

        // Make the timer name editable
        timerNameDisplay.addEventListener("click", function() {
            const originalName = timerNameDisplay.textContent;
            const input = document.createElement("input");
            input.type = "text";
            input.value = originalName;
            input.classList.add("name-edit-input");

            timerNameDisplay.textContent = '';
            timerNameDisplay.appendChild(input);
            input.focus();

            input.addEventListener("blur", function() {
                const newName = input.value.trim();
                if (newName && newName !== originalName) {
                    timer.name = newName;  // Update the name in the timer object
                    timerNameDisplay.textContent = newName;
                    updateFirestoreTimer(timer);  // Update Firestore with the new name
                } else {
                    timerNameDisplay.textContent = originalName;
                }
            });

            input.addEventListener("keydown", function(event) {
                if (event.key === "Enter") {
                    input.blur(); // Save on Enter
                }
            });
        });

        timersContainer.appendChild(timerDiv);
        return timer;
    }

    // Start the timer
    function startTimer(timer) {
        timer.startTime = Date.now() - timer.elapsedTime;
        timer.timerInterval = setInterval(function() {
            updateTime(timer);
            updateDisplay(timer);
        }, 1000);
        timer.running = true;
        timer.state = "running";
        timer.timerDiv.classList.add("running");
        timer.timerDiv.classList.remove("stopped");
    }

    // Stop the timer
    function stopTimer(timer) {
        clearInterval(timer.timerInterval);
        timer.elapsedTime = Date.now() - timer.startTime;
        timer.running = false;
        timer.state = "stopped";
        timer.timerDiv.classList.remove("running");
        timer.timerDiv.classList.add("stopped");
        updateFirestoreTimer(timer);  // Update Firestore with the new state
    }

    // Reset the timer
    function resetTimer(timer) {
        clearInterval(timer.timerInterval);
        timer.elapsedTime = 0;
        timer.running = false;
        timer.state = "stopped";
        timer.startTime = null;
        updateDisplay(timer);  // Update the display
        timer.timerDiv.classList.remove("running");
        timer.timerDiv.classList.add("stopped");
        updateFirestoreTimer(timer);  // Update Firestore with the new state
    }

    // Update Firestore with the latest
