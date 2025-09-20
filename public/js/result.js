// API Base URL
const API_BASE_URL = "/api";

// API Helper function
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Get status badge HTML
function getStatusBadgeHTML(status) {
  const statusMap = {
    "to do": { icon: "uil-clock", text: "To Do", class: "status-todo" },
    "in progress": {
      icon: "uil-play",
      text: "In Progress",
      class: "status-progress",
    },
    "waiting for payment": {
      icon: "uil-money-bill",
      text: "Waiting for Payment",
      class: "status-payment",
    },
    "in review": { icon: "uil-eye", text: "In Review", class: "status-review" },
    revision: { icon: "uil-edit", text: "Revision", class: "status-revision" },
    done: { icon: "uil-check-circle", text: "Done", class: "status-done" },
  };

  const statusInfo = statusMap[status] || statusMap["to do"];
  return `<span class="status-badge ${statusInfo.class}"><i class="uil ${statusInfo.icon}"></i>   ${statusInfo.text}</span>`;
}

// Load and display project data
async function loadProjectData() {
  try {
    // Get project ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("id");

    if (!projectId) {
      showError("No project ID provided");
      return;
    }

    // Show loading state
    showLoading();

    // Fetch project data from API
    const project = await apiRequest(`/projects/${projectId}`);

    // Hide loading and display project data
    hideLoading();
    displayProjectData(project);
  } catch (error) {
    hideLoading();
    showError("Failed to load project data: " + error.message);
  }
}

// Display project data in the page
function displayProjectData(project) {
  // Get all detail rows
  const detailRows = document.querySelectorAll(".detail-row");

  // Update project details (Order No, Project Name, Client, Deadline, Status)
  if (detailRows[0]) {
    detailRows[0].querySelector(".detail-value").textContent =
      project.numberOrder;
  }
  if (detailRows[1]) {
    detailRows[1].querySelector(".detail-value").textContent =
      project.projectName;
  }
  if (detailRows[2]) {
    detailRows[2].querySelector(".detail-value").textContent =
      project.clientName;
  }
  if (detailRows[3]) {
    detailRows[3].querySelector(".detail-value").textContent = formatDate(
      project.deadline
    );
  }

  // Update status badge
  const statusBadge = document.querySelector(".status-badge-container");
  if (statusBadge) {
    statusBadge.innerHTML = getStatusBadgeHTML(project.status);
  }

  // Update action buttons with actual URLs
  updateActionButtons(project);

  // Update page title
  document.title = `${project.projectName} - Project Completed - Gous Studio`;
}

// Update action buttons with project data
function updateActionButtons(project) {
  // Update "Lihat Hasil Desain" button
  const designButton = document.querySelector(".btn-primary");
  if (designButton) {
    if (project.deliverables) {
      designButton.onclick = () => window.open(project.deliverables, "_blank");
      designButton.style.opacity = "1";
      designButton.style.pointerEvents = "auto";
    } else {
      designButton.onclick = () =>
        alert("Deliverables link not available for this project");
      designButton.style.opacity = "0.6";
      designButton.style.pointerEvents = "auto";
    }
  }

  // Update "Download Invoice" button
  const invoiceButton = document.querySelector(".btn-secondary");
  if (invoiceButton) {
    if (project.invoice) {
      invoiceButton.onclick = () => window.open(project.invoice, "_blank");
      invoiceButton.style.opacity = "1";
      invoiceButton.style.pointerEvents = "auto";
    } else {
      invoiceButton.onclick = () =>
        alert("Invoice link not available for this project");
      invoiceButton.style.opacity = "0.6";
      invoiceButton.style.pointerEvents = "auto";
    }
  }
}

// Show loading state
function showLoading() {
  const container = document.querySelector(".container");
  // Add loading overlay instead of replacing content
  const loadingHTML = `
    <div class="loading-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; z-index: 9999;">
      <div style="text-align: center;">
        <div style="font-size: 24px; margin-bottom: 10px;">
          <i class="uil uil-spinner" style="animation: spin 1s linear infinite;"></i>
        </div>
        <p>Loading project data...</p>
      </div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  document.body.insertAdjacentHTML("beforeend", loadingHTML);
}

// Hide loading state
function hideLoading() {
  const loadingOverlay = document.querySelector(".loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}

// Show error message
function showError(message) {
  const container = document.querySelector(".container");
  const errorHTML = `
    <div class="error-state" style="text-align: center; padding: 50px;">
      <div style="font-size: 48px; color: #ef4444; margin-bottom: 20px;">
        <i class="uil uil-exclamation-triangle"></i>
      </div>
      <h2 style="color: #ef4444; margin-bottom: 10px;">Error</h2>
      <p style="color: #6b7280; margin-bottom: 20px;">${message}</p>
      <button onclick="window.close()" class="btn btn-secondary">Close</button>
    </div>
  `;
  container.innerHTML = errorHTML;
}

// Initialize the result page
function initResultPage() {
  loadProjectData();
}

// Load data when page loads
document.addEventListener("DOMContentLoaded", initResultPage);
