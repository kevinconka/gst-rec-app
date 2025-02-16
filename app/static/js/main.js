document.addEventListener("DOMContentLoaded", function () {
  const recordBtn = document.getElementById("record-btn");
  const timer = document.getElementById("timer");
  let isRecording = false;
  let timerInterval;
  let seconds = 0;
  const logContainer = document.getElementById("log-container");

  // Initialize data
  updateSensors();
  updateStorage();
  updateRecordingHistory();

  // Event listeners
  recordBtn.addEventListener("click", function () {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  });

  function addLog(message, type = "info") {
    const logEntry = document.createElement("div");
    const timestamp = new Date().toLocaleTimeString();

    logEntry.className = `log-entry ${type} flex items-start`;

    // Choose color based on type
    let colorClass = "text-gray-600";
    switch (type) {
      case "error":
        colorClass = "text-red-600";
        break;
      case "success":
        colorClass = "text-green-600";
        break;
      case "warning":
        colorClass = "text-yellow-600";
        break;
    }

    logEntry.innerHTML = `
            <span class="text-gray-400 mr-2">[${timestamp}]</span>
            <span class="${colorClass}">${message}</span>
        `;

    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;

    // Keep only last 100 logs
    while (logContainer.children.length > 100) {
      logContainer.removeChild(logContainer.firstChild);
    }
  }

  async function startRecording() {
    try {
      // Update button state
      const recordText = recordBtn.querySelector(".record-text");
      const loadingText = recordBtn.querySelector(".loading-text");
      recordBtn.disabled = true;
      recordText.classList.add("hidden");
      loadingText.textContent = "Starting...";
      loadingText.classList.remove("hidden");

      addLog("Initializing recording...", "info");

      const response = await fetch("/api/start_recording", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          save_path: document.getElementById("current-path").textContent,
        }),
      });

      const data = await response.json();

      if (data.status === "recording") {
        isRecording = true;
        recordText.textContent = "Stop";
        recordBtn.classList.replace("bg-blue-500", "bg-red-500");
        recordBtn.classList.replace("hover:bg-blue-600", "hover:bg-red-600");
        timer.classList.remove("hidden");
        startTimer();
        addLog("Recording started successfully", "success");
      }
    } catch (error) {
      console.error("Error:", error);
      addLog("Failed to start recording: " + error.message, "error");
    } finally {
      // Reset button state
      recordBtn.disabled = false;
      recordBtn.querySelector(".loading-text").classList.add("hidden");
      recordBtn.querySelector(".record-text").classList.remove("hidden");
    }
  }

  async function stopRecording() {
    try {
      // Update button state
      const recordText = recordBtn.querySelector(".record-text");
      const loadingText = recordBtn.querySelector(".loading-text");
      recordBtn.disabled = true;
      recordText.classList.add("hidden");
      loadingText.textContent = "Stopping...";
      loadingText.classList.remove("hidden");

      addLog("Stopping recording...", "info");

      const response = await fetch("/api/stop_recording", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.status === "stopped") {
        isRecording = false;
        recordText.textContent = "Record";
        recordBtn.classList.replace("bg-red-500", "bg-blue-500");
        recordBtn.classList.replace("hover:bg-red-600", "hover:bg-blue-600");
        stopTimer();
        updateRecordingHistory();
        addLog("Recording stopped successfully", "success");
      }
    } catch (error) {
      console.error("Error:", error);
      addLog("Failed to stop recording: " + error.message, "error");
    } finally {
      // Reset button state
      recordBtn.disabled = false;
      recordBtn.querySelector(".loading-text").classList.add("hidden");
      recordBtn.querySelector(".record-text").classList.remove("hidden");
    }
  }

  function startTimer() {
    seconds = 0;
    updateTimerDisplay();
    timer.classList.remove("hidden");
    setTimeout(() => {
      timer.classList.add("fade-in");
    }, 10);
    timerInterval = setInterval(updateTimerDisplay, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    timer.classList.remove("fade-in");
    timer.classList.add("hidden");
  }

  function updateTimerDisplay() {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timer.textContent = `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  function updateSensors() {
    fetch("/api/sensors")
      .then((response) => response.json())
      .then((data) => {
        const sensorsList = document.getElementById("sensors-list");
        sensorsList.innerHTML = data.sensors
          .map(
            (sensor) => `
                    <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>${sensor.name}</span>
                        <span class="text-green-500">${sensor.status}</span>
                    </div>
                `,
          )
          .join("");
      });
  }

  function updateStorage() {
    fetch("/api/storage")
      .then((response) => response.json())
      .then((data) => {
        const storageInfo = document.getElementById("storage-info");
        const usedGB = (data.used / 1024 ** 3).toFixed(1);
        const totalGB = (data.total / 1024 ** 3).toFixed(1);

        storageInfo.innerHTML = `
                    <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div class="bg-blue-600 h-2 rounded-full" style="width: ${data.percent}%"></div>
                    </div>
                    <div class="text-sm text-gray-600">
                        Available: ${usedGB}GB / ${totalGB}GB
                    </div>
                `;
      });
  }

  function updateRecordingHistory() {
    fetch("/api/recordings")
      .then((response) => response.json())
      .then((data) => {
        const history = document.getElementById("recording-history");
        history.innerHTML = data.recordings
          .map(
            (recording) => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span class="font-medium">${recording.date}</span>
                        <span class="text-gray-600">Duration: ${recording.duration}</span>
                        <span class="text-gray-600">${recording.size}</span>
                    </div>
                `,
          )
          .join("");
      });
  }

  function updatePath(newPath) {
    fetch("/api/settings/path", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: newPath }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          document.getElementById("current-path").textContent = data.path;
          addLog("Save location updated successfully", "success");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        addLog("Failed to update save location", "error");
      });
  }

  document
    .querySelector(".change-location-btn")
    .addEventListener("click", function () {
      const newPath = prompt(
        "Enter new save location:",
        document.getElementById("current-path").textContent,
      );
      if (newPath) {
        updatePath(newPath);
      }
    });

  fetch("/api/settings/path")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("current-path").textContent = data.path;
    });

  // Update storage info every 30 seconds
  setInterval(updateStorage, 30000);
});
