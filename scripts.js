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

        // Create a div to display the timer name
        const timerNameDisplay = document.createElement("div");
        timerNameDisplay.textContent = timerName;
        timerNameDisplay.classList.add("timer-name");

        // Create a div to display the elapsed time in both formats
        const timeDisplay = document.createElement("div");
        timeDisplay.classList.add("time-display");
        timeDisplay.textContent = "00:00:00 (0.00 hours)"; // Initial display in hh:mm:ss and fractional hours

        // Create a reset button
        const resetButton = document.createElement("button");
        resetButton.textContent = "Reset";
        resetButton.classList.add("reset-btn");

        // Append elements to the timer container div
        timerDiv.appendChild(timerNameDisplay);
        timerDiv.appendChild(timeDisplay);
        timerDiv.appendChild(resetButton);

        // Associate timer object with timerDiv
        const timer = {
            timerDiv: timerDiv,
            timeDisplay: timeDisplay,
            startTime: null,
            elapsedTime: 0, // Store time in milliseconds
            timerInterval: null,
            running: false
        };

        timerDiv.timer = timer;

        // Add click event listener to timerDiv (start/stop)
        timerDiv.addEventListener("click", function() {
            if (!timer.running) {
                startTimer(timer);
            } else {
                stopTimer(timer);
            }
        });

        // Add click event listener to reset button
        resetButton.addEventListener("click", function(event) {
            event.stopPropagation();  // Prevent triggering the start/stop timer
            resetTimer(timer);
        });

        // Make the time display editable
        timeDisplay.addEventListener("click", function() {
            const currentTime = timeDisplay.textContent.split(" ")[0];  // Get current time in hh:mm:ss (e.g., "1:30:45")
            const [hours, minutes, seconds] = currentTime.split(":").map(Number);
            const currentTimeInHours = (hours + minutes / 60 + seconds / 3600).toFixed(2); // Convert to fractional hours
            const newTimeInput = prompt("Edit time in fractional hours (e.g., 1.25 for 1 hour and 15 minutes)", currentTimeInHours);
            if (newTimeInput) {
                let newTimeInHours = parseFloat(newTimeInput);
                if (isValidFractionalHours(newTimeInHours)) {
                    // Convert fractional hours to milliseconds
                    const newTimeInMillis = newTimeInHours * 3600000; // 1 hour = 3600000 milliseconds
                    updateTimerDisplay(timer, newTimeInMillis);
                } else {
                    alert("Invalid time format. Please enter a positive number in increments of 0.25.");
                }
            }
        });

        // Center the timers horizontally
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
    }

    function resetTimer(timer) {
        clearInterval(timer.timerInterval); // Stop the timer if it's running
        timer.elapsedTime = 0;
        timer.running = false;
        timer.startTime = null;
        updateDisplay(timer); // Update the display to 00:00:00 and 0.00 hours
        timer.timerDiv.classList.remove("running");
        timer.timerDiv.classList.add("stopped");
    }

    function updateTime(timer) {
        const currentTime = Date.now();
        timer.elapsedTime = currentTime - timer.startTime;
    }

    function updateDisplay(timer) {
        const formattedTime = formatTime(timer.elapsedTime); // Format in hh:mm:ss
        const fractionalHours = (timer.elapsedTime / 3600000).toFixed(2); // Convert to fractional hours
        const roundedQuarterHours = Math.ceil(timer.elapsedTime / 900000) * 0.25; // Round to the nearest quarter hour
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
});
