// API Base URL
// const API_BASE_URL = "/api";

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

// Update main title based on project status
function updateMainTitle(status) {
  const titleMessages = {
    "to do": "✨ Project kamu lagi dipersiapkan, stay tuned!",
    "in progress": "🚀 Project kamu lagi dikerjakan, progress on the way!",
    "waiting for payment":
      "💳 Yuk selesaikan pembayaran biar project bisa lanjut!",
    "in review": "🔍 Project kamu lagi direview, hampir selesai nih!",
    revision: "✏️ Project kamu lagi direvisi biar makin sempurna!",
    done: "🎉 Yeay! Project kamu sudah selesai dengan sukses!",
  };

  const mainTitleElement = document.getElementById("main-title");
  if (mainTitleElement) {
    const message = titleMessages[status] || "Status project tidak diketahui";
    mainTitleElement.textContent = message;
  }
}

// Global variable to store current project data
let currentProject = null;

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
    currentProject = project; // Store project data globally

    // Hide loading and display project data
    hideLoading();
    displayProjectData(project);

    // Load and display comments
    loadProjectComments(project.comments || []);
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

  // Update main title based on project status
  updateMainTitle(project.status);

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

// Format comment date for display
function formatCommentDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Generate avatar URL for user
function generateAvatar(name, email) {
  if (!name)
    return `https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4&scale=100&seed=default`;

  // Use email or name as seed for consistent avatar
  const seed = email || name;
  return `https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4&scale=100&seed=${encodeURIComponent(
    seed
  )}`;
}

// Render single comment HTML
function renderComment(comment) {
  const avatar =
    comment.authorAvatar ||
    generateAvatar(comment.authorName, comment.authorEmail);
  const formattedDate = formatCommentDate(comment.createdAt);
  const badgeHtml = comment.isClient
    ? '<span class="client-comment-badge">Client</span>'
    : '<span class="client-comment-badge" style="background: #6366f1;">Admin</span>';

  return `
    <div class="client-comment-item">
      <img src="${avatar}" alt="${comment.authorName}" class="client-comment-avatar" />
      <div class="client-comment-content">
        <div class="client-comment-header">
          <span class="client-comment-author">${comment.authorName}</span>
          <span class="client-comment-date">${formattedDate}</span>
          ${badgeHtml}
        </div>
        <div class="client-comment-text">${comment.content}</div>
      </div>
    </div>
  `;
}

// Load and display project comments (client comments only)
function loadProjectComments(comments) {
  const commentsList = document.getElementById("clientCommentsList");
  const noCommentsState = document.getElementById("noClientComments");

  if (!commentsList) return;

  // Filter to only show client comments (hide admin comments)
  const clientOnlyComments =
    comments?.filter((comment) => comment.isClient === true) || [];

  if (clientOnlyComments.length === 0) {
    commentsList.style.display = "none";
    if (noCommentsState) {
      noCommentsState.style.display = "block";
    }
    return;
  }

  // Sort client comments by date (newest first)
  const sortedComments = clientOnlyComments.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Render client comments only
  commentsList.innerHTML = sortedComments
    .map((comment) => renderComment(comment))
    .join("");
  commentsList.style.display = "flex";

  if (noCommentsState) {
    noCommentsState.style.display = "none";
  }
}

// Submit client comment
async function submitClientComment() {
  if (!currentProject) {
    alert("Project data not loaded. Please refresh the page.");
    return;
  }

  const commentContent = document.getElementById("clientCommentContent");
  const submitButton = document.querySelector(".comment-submit-btn");

  if (!commentContent || !submitButton) {
    console.error("Comment form elements not found");
    return;
  }

  const content = commentContent.value.trim();

  if (!content) {
    alert("Please enter your comment before submitting.");
    commentContent.focus();
    return;
  }

  // Show loading state
  const originalButtonText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML =
    '<i class="uil uil-spinner" style="animation: spin 1s linear infinite;"></i> Sending...';

  try {
    const commentData = {
      content: content,
      authorName: currentProject.clientName,
      authorEmail:
        currentProject.clientEmail ||
        `${currentProject.clientName
          .toLowerCase()
          .replace(/\s+/g, "")}@client.com`,
      isClient: true,
    };

    // Submit comment to API
    const response = await apiRequest(
      `/projects/${currentProject.id}/comments`,
      {
        method: "POST",
        body: JSON.stringify(commentData),
      }
    );

    // Clear the form
    commentContent.value = "";

    // Refresh comments display
    const updatedProject = response.project;
    currentProject = updatedProject;
    loadProjectComments(updatedProject.comments || []);

    // Show success feedback
    showAlert("Feedback berhasil dikirim! Terima kasih atas masukan Anda.");
  } catch (error) {
    console.error("Failed to submit comment:", error);
    alert(
      "Gagal mengirim feedback. Silakan coba lagi. Error: " + error.message
    );
  } finally {
    // Restore button state
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
  }
}

// Initialize the result page
function initResultPage() {
  loadProjectData();
}

// Load data when page loads
document.addEventListener("DOMContentLoaded", initResultPage);
