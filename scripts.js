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
        timerNameDisplay.classList.add("timer-name"); // Add class for styling

        // Create a div to display the elapsed time
        const timeDisplay = document.createElement("div");
        timeDisplay.classList.add("time-display");
        timeDisplay.textContent = "00:00:00 (0.00 hours)";

        // Append elements to the timer container div
        timerDiv.appendChild(timerNameDisplay);
        timerDiv.appendChild(timeDisplay);

        // Associate timer object with timerDiv
        const timer = {
            timerDiv: timerDiv,
            timeDisplay: timeDisplay,
            startTime: null,
            elapsedTime: 0,
            timerInterval: null,
            running: false // Flag to track timer state
        };

        timerDiv.timer = timer;

        // Add click event listener to timerDiv
        timerDiv.addEventListener("click", function() {
            if (!timer.running) {
                startTimer(timer);
            } else {
                stopTimer(timer);
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

    function updateTime(timer) {
        const currentTime = Date.now();
        timer.elapsedTime = currentTime - timer.startTime;
    }

    function updateDisplay(timer) {
        const formattedTime = formatTime(timer.elapsedTime);
        const roundedQuarterHours = Math.ceil(timer.elapsedTime / 900000) * 0.25; // Convert milliseconds to hours and round up to the nearest quarter hour
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
});
