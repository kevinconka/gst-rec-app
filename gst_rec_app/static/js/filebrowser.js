class FileBrowser {
  constructor() {
    this.currentPath = document
      .querySelector("#current-path")
      .textContent.trim();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const changeLocationBtn = document.querySelector("#change-location-btn");
    changeLocationBtn.addEventListener("click", () => this.showBrowser());
  }

  async showBrowser() {
    // Create modal dialog
    const modal = createModal();

    document.body.appendChild(modal);

    // Setup close handlers
    const closeBtn = modal.querySelector(".modal-close");
    const cancelBtn = modal.querySelector(".modal-cancel");
    const selectBtn = modal.querySelector(".modal-select");

    closeBtn.addEventListener("click", () => modal.remove());
    cancelBtn.addEventListener("click", () => modal.remove());
    selectBtn.addEventListener("click", () => this.selectCurrentPath(modal));

    // Load current directory
    await this.loadDirectory(this.currentPath);
  }

  async loadDirectory(path = "") {
    try {
      console.log("Attempting to load directory:", path);
      const response = await fetch(
        `/api/browse?path=${encodeURIComponent(path)}`,
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          credentials: "same-origin",
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const entries = await response.json();
      console.log("Received entries:", entries);

      this.currentPath = path;
      this.updateBrowserView(entries);
    } catch (error) {
      console.error("Error loading directory:", error);
      // Show error to user
      const container = document.querySelector(".file-list");
      container.innerHTML = `
        <div class="p-4 text-red-600">
          Error loading directory: ${error.message}
        </div>
      `;
    }
  }

  updateBrowserView(entries) {
    const container = document.querySelector(".file-list");
    const pathDisplay = document.querySelector(".current-path");

    pathDisplay.textContent = this.currentPath || "Home";

    container.innerHTML = entries
      .map(
        (entry) => `
      <div class="entry p-2 hover:bg-gray-100 cursor-pointer flex items-center"
           data-path="${entry.path}">
        <span class="mr-2">${entry.is_dir ? "📁" : "📄"}</span>
        <span>${entry.name}</span>
      </div>
    `,
      )
      .join("");

    // Add click handlers
    container.querySelectorAll(".entry").forEach((entry) => {
      entry.addEventListener("click", async (e) => {
        const path = e.currentTarget.dataset.path;
        const isDir = e.currentTarget
          .querySelector("span")
          .textContent.includes("📁");

        if (isDir) {
          await this.loadDirectory(path);
        }
      });
    });
  }

  async selectCurrentPath(modal) {
    try {
      const response = await fetch("/api/settings/path", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: this.currentPath }),
      });

      const result = await response.json();
      if (result.status === "success") {
        document.querySelector("#current-path").textContent = this.currentPath;
        modal.remove();
      }
    } catch (error) {
      console.error("Error updating path:", error);
    }
  }
}

function createModal() {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 z-50 flex items-center justify-center p-4";
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black bg-opacity-50"></div>
    <div class="modal-content relative w-full max-w-2xl rounded-lg shadow-lg">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Select Save Location</h3>
          <button class="modal-close hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="current-path mb-4 text-sm text-gray-600 bg-gray-100 p-2 rounded font-mono"></div>
        <div class="file-list overflow-y-auto max-h-96 rounded p-3 mb-4"></div>
        <div class="flex justify-end space-x-2">
          <button class="modal-cancel px-4 py-2 border rounded hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
          <button class="modal-select px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Select</button>
        </div>
      </div>
    </div>
  `;
  return modal;
}

// Initialize file browser
document.addEventListener("DOMContentLoaded", () => {
  new FileBrowser();
});
