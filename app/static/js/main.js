document.addEventListener("DOMContentLoaded", function () {
  const recordBtn = document.getElementById("record-btn");
  const timer = document.getElementById("timer");
  let isRecording = false;
  let timerInterval;
  let startTime;
  const logContainer = document.getElementById("log-container");

  // Initialize data
  updateSensors();
  updateStorage();
  updateRecordingHistory();

  // Event listeners
  recordBtn.addEventListener("click", async () => {
    const recordText = recordBtn.querySelector(".record-text");
    const loadingText = recordBtn.querySelector(".loading-text");

    // Show loading state
    recordText.classList.add("hidden");
    loadingText.classList.remove("hidden");
    loadingText.textContent = isRecording ? "Stopping..." : "Starting...";

    try {
      if (isRecording) {
        await stopRecording();
      } else {
        await startRecording();
      }
      isRecording = !isRecording;
    } catch (error) {
      console.error("Recording action failed:", error);
      addLog(
        `Failed to ${isRecording ? "stop" : "start"} recording: ${
          error.message
        }`,
        "error",
      );
      // Reset button state
      updateRecordingState(isRecording);
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
      const response = await fetch("/api/recording/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.status === "success") {
        addLog("Recording started", "success");
        updateRecordingState(true);
        startTimer();
      } else {
        throw new Error(data.message || "Failed to start recording");
      }
    } catch (error) {
      console.error("Recording error:", error);
      addLog(`Failed to start recording: ${error.message}`, "error");
      updateRecordingState(false);
    }
  }

  async function stopRecording() {
    try {
      const response = await fetch("/api/recording/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.status === "success") {
        addLog("Recording stopped", "success");
        updateRecordingState(false);
        stopTimer();
      } else {
        throw new Error(data.message || "Failed to stop recording");
      }
    } catch (error) {
      console.error("Recording error:", error);
      addLog(`Failed to stop recording: ${error.message}`, "error");
    }
  }

  function updateRecordingState(isRecording) {
    const recordBtn = document.getElementById("record-btn");
    const recordText = recordBtn.querySelector(".record-text");
    const loadingText = recordBtn.querySelector(".loading-text");
    const timer = recordBtn.querySelector("#timer");

    recordText.textContent = isRecording ? "Stop" : "Record";
    recordBtn.classList.toggle("bg-red-500", isRecording);
    recordBtn.classList.toggle("hover:bg-red-600", isRecording);
    recordBtn.classList.toggle("bg-blue-500", !isRecording);
    recordBtn.classList.toggle("hover:bg-blue-600", !isRecording);

    loadingText.classList.add("hidden");
    recordText.classList.remove("hidden");
    timer.classList.toggle("hidden", !isRecording);
  }

  function startTimer() {
    startTime = Date.now();
    const timerElement = document.getElementById("timer");
    timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const seconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(seconds / 60);
      const displaySeconds = (seconds % 60).toString().padStart(2, "0");
      const displayMinutes = minutes.toString().padStart(2, "0");
      timerElement.textContent = `${displayMinutes}:${displaySeconds}`;
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    const timerElement = document.getElementById("timer");
    timerElement.textContent = "00:00";
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
                        Used: ${usedGB}GB / ${totalGB}GB
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
