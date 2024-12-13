document.addEventListener("DOMContentLoaded", function() {
    const addTimerBtn = document.getElementById("addTimerBtn");
    const timersContainer = document.getElementById("timers");
    let timerCount = 0;

    addTimerBtn.addEventListener("click", function() {
        const timerName = prompt("Enter timer name:");
        if (timerName) {
            createTimer(timerName);
        }
    });

    function createTimer(timerName) {
        timerCount++;
        const timerDiv = document.createElement("div");
        timerDiv.classList.add("timer");

        const timerNameDisplay = document.createElement("div");
        timerNameDisplay.textContent = timerName;
        timerNameDisplay.classList.add("timer-name");

        const timeDisplay = document.createElement("div");
        timeDisplay.classList.add("time-display");
        timeDisplay.textContent = "00:00:00 (0.00 hours)";

        const resetButton = document.createElement("button");
        resetButton.textContent = "Reset";
        resetButton.classList.add("reset-btn");

        timerDiv.appendChild(timerNameDisplay);
        timerDiv.appendChild(timeDisplay);
        timerDiv.appendChild(resetButton);

        const timer = {
            timerDiv: timerDiv,
            timeDisplay: timeDisplay,
            startTime: null,
            elapsedTime: 0,
            timerInterval: null,
            running: false,
            timerName: timerName // Store the name
        };

        timerDiv.timer = timer;

        timerDiv.addEventListener("click", function() {
            if (!timer.running) {
                startTimer(timer);
            } else {
                stopTimer(timer);
            }
        });

        resetButton.addEventListener("click", function(event) {
            event.stopPropagation();
            resetTimer(timer);
        });

        timeDisplay.addEventListener("click", function() {
            const currentTime = timeDisplay.textContent.split(" ")[0];
            const [hours, minutes, seconds] = currentTime.split(":").map(Number);
            const currentTimeInHours = (hours + minutes / 60 + seconds / 3600).toFixed(2);
            const newTimeInput = prompt("Edit time in fractional hours (e.g., 1.25 for 1 hour and 15 minutes)", currentTimeInHours);
            if (newTimeInput) {
                let newTimeInHours = parseFloat(newTimeInput);
                if (isValidFractionalHours(newTimeInHours)) {
                    const newTimeInMillis = newTimeInHours * 3600000;
                    updateTimerDisplay(timer, newTimeInMillis);
                    sendToFirestore(timer.timerName, newTimeInMillis); // Send updated data to Firestore
                } else {
                    alert("Invalid time format. Please enter a positive number in increments of 0.25.");
                }
            }
        });

        timersContainer.appendChild(timerDiv);
    }

    function startTimer(timer) {
        timer.startTime = Date.now() - timer.elapsedTime;
        timer.timerInterval = setInterval(function() {
            updateTime(timer);
            updateDisplay(timer);
        }, 1000);
        timer.running = true;
        timer.timerDiv.classList.add("running");
        timer.timerDiv.classList.remove("stopped");
    }

    function stopTimer(timer) {
        clearInterval(timer.timerInterval);
        timer.elapsedTime = Date.now() - timer.startTime;
        timer.running = false;
        timer.timerDiv.classList.remove("running");
        timer.timerDiv.classList.add("stopped");

        // Send timer data to Firestore when stopped
        sendToFirestore(timer.timerName, timer.elapsedTime);
    }

    function resetTimer(timer) {
        clearInterval(timer.timerInterval);
        timer.elapsedTime = 0;
        timer.running = false;
        timer.startTime = null;
        updateDisplay(timer);
        timer.timerDiv.classList.remove("running");
        timer.timerDiv.classList.add("stopped");

        // Send reset timer data to Firestore
        sendToFirestore(timer.timerName, timer.elapsedTime);
    }

    function updateTime(timer) {
        const currentTime = Date.now();
        timer.elapsedTime = currentTime - timer.startTime;
    }

    function updateDisplay(timer) {
        const formattedTime = formatTime(timer.elapsedTime);
        const fractionalHours = (timer.elapsedTime / 3600000).toFixed(2);
        const roundedQuarterHours = Math.ceil(timer.elapsedTime / 900000) * 0.25;
        timer.timeDisplay.textContent = `${formattedTime} (${roundedQuarterHours.toFixed(2)} hours)`;
    }

    function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
    }

    function pad(num) {
        return num.toString().padStart(2, "0");
    }

    function updateTimerDisplay(timer, newTimeInMillis) {
        timer.elapsedTime = newTimeInMillis;
        updateDisplay(timer);
    }

    function isValidFractionalHours(hours) {
        return !isNaN(hours) && hours >= 0 && hours % 0.25 === 0;
    }

    // Send data to Firestore (as shown above)
    function sendToFirestore(timerName, elapsedTimeMillis) {
        const fractionalHours = (elapsedTimeMillis / 3600000).toFixed(2);

        db.collection("timers").add({
            name: timerName,
            elapsedTimeMillis: elapsedTimeMillis,
            fractionalHours: fractionalHours,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log("Timer data sent to Firestore.");
        }).catch((error) => {
            console.error("Error sending data to Firestore: ", error);
        });
    }
});
