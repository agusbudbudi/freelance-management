// Global variables
let projects = [];
let editingProjectId = null;
let quill;

// API Base URL
const API_BASE_URL = "/api";

// API Helper functions
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

// Load projects from API
async function loadProjects() {
  try {
    projects = await apiRequest("/projects");
    renderProjectsTable();
    updateDashboard();
  } catch (error) {
    showAlert("Failed to load projects: " + error.message, "error");
  }
}

// Initialize Quill editor
function initQuill() {
  quill = new Quill("#editor", {
    theme: "snow",
    placeholder: "Describe your project requirements...",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        ["link"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["clean"],
      ],
    },
  });
}

// Generate unique project number
function generateProjectNumber() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);
  const dateStr = `${day}${month}${year}`;

  // Find highest increment for today
  const todayProjects = projects.filter((p) => p.numberOrder.includes(dateStr));
  const maxIncrement =
    todayProjects.length > 0
      ? Math.max(
          ...todayProjects.map((p) => parseInt(p.numberOrder.split("-")[2]))
        )
      : 0;

  const increment = String(maxIncrement + 1).padStart(3, "0");
  return `AGD-${dateStr}-${increment}`;
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

// Calculate total price
function calculateTotalPrice() {
  const price = parseFloat(document.getElementById("price").value) || 0;
  const quantity = parseInt(document.getElementById("quantity").value) || 1;
  const discount = parseFloat(document.getElementById("discount").value) || 0;

  const subtotal = price * quantity;
  const total = subtotal - discount;

  document.getElementById("totalPrice").value = formatCurrency(
    Math.max(0, total)
  );
}

// Show section
function showSection(section) {
  document.querySelectorAll(".main-content > div").forEach((div) => {
    div.classList.add("hidden");
  });
  document.getElementById(`${section}-section`).classList.remove("hidden");

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });
  event.target.classList.add("active");

  if (section === "dashboard") {
    updateDashboard();
  } else if (section === "projects") {
    renderProjectsTable();
  } else if (section === "clients") {
    renderClientsTable();
  }
}

// Update dashboard statistics
function updateDashboard() {
  const total = projects.length;
  const ongoing = projects.filter((p) => !["done"].includes(p.status)).length;
  const completed = projects.filter((p) => p.status === "done").length;

  const ongoingRevenue = projects
    .filter((p) => !["done"].includes(p.status))
    .reduce((sum, p) => sum + (p.totalPrice || 0), 0);

  const completedRevenue = projects
    .filter((p) => p.status === "done")
    .reduce((sum, p) => sum + (p.totalPrice || 0), 0);

  document.getElementById("total-projects").textContent = total;
  document.getElementById("ongoing-projects").textContent = ongoing;
  document.getElementById("completed-projects").textContent = completed;
  document.getElementById("ongoing-revenue").textContent =
    formatCurrency(ongoingRevenue);
  document.getElementById("completed-revenue").textContent =
    formatCurrency(completedRevenue);
}

// Get status badge class
function getStatusBadgeClass(status) {
  const statusMap = {
    "to do": "status-todo",
    "in progress": "status-progress",
    "waiting for payment": "status-payment",
    "in review": "status-review",
    revision: "status-revision",
    done: "status-done",
  };
  return statusMap[status] || "status-todo";
}

// Render projects table
function renderProjectsTable() {
  const tbody = document.getElementById("projects-tbody");

  if (projects.length === 0) {
    tbody.innerHTML = `
                    <tr>
                        <td colspan="8">
                            <div class="empty-state">
                               <i class="uil uil-folder-open"></i>
                                <h3>No projects yet</h3>
                                <p>Click "Add Project" to create your first project</p>
                            </div>
                        </td>
                    </tr>
                `;
    return;
  }

  tbody.innerHTML = projects
    .map(
      (project) => `
                <tr>
                    <td>
                        <strong class="link" onclick="editProject('${
                          project.id
                        }')">${project.numberOrder}</strong>
                    </td>
                    <td>
                        <div style="font-weight: 500; color: #0f172a;">${
                          project.projectName
                        }</div>
                    </td>
                    <td>
                        <div style="font-weight: 500;">${
                          project.clientName
                        }</div>
                        ${
                          project.clientPhone
                            ? `<div class="text-sm">${project.clientPhone}</div>`
                            : ""
                        }
                    </td>
                    <td>${formatDate(project.deadline)}</td>
                    <td>
                        <span class="currency" style="font-weight: 600;">${formatCurrency(
                          project.totalPrice
                        )}</span>
                    </td>
                    <td>
                        ${
                          project.deliverables
                            ? `<a href="#" onclick="openProjectResultFromTable('${project.id}')" style="color: #3b82f6; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="uil uil-external-link-alt" style="font-size: 12px;"></i>
                                See Result
                               </a>`
                            : '<span style="color: #94a3b8;">-</span>'
                        }
                    </td>
                    <td>
                        <span class="status-badge ${getStatusBadgeClass(
                          project.status
                        )}">${project.status}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-secondary btn-sm" onclick="editProject('${
                              project.id
                            }')" title="Edit project">
                                <i class="uil uil-edit"></i>
                            </button>


                            <button class="btn btn-share btn-sm" onclick="shareProjectToWhatsApp('${
                              project.id
                            }')" title="Share to WhatsApp">
                                <i class="uil uil-whatsapp"></i>
                            </button>

                            <button class="btn btn-danger btn-sm" onclick="deleteProject('${
                              project.id
                            }')" title="Delete project">
                               <i class="uil uil-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `
    )
    .join("");
}

// Show project modal
function showProjectModal(projectId = null) {
  editingProjectId = projectId;
  const modal = document.getElementById("project-modal");
  const title = document.getElementById("modal-title");

  if (projectId) {
    title.textContent = "Edit Project";
    const project = projects.find((p) => p.id === projectId);
    fillProjectForm(project);
  } else {
    title.textContent = "Add New Project";
    resetProjectForm();
    document.getElementById("numberOrder").value = generateProjectNumber();
  }

  modal.style.display = "block";
  setTimeout(() => {
    if (!quill) initQuill();
  }, 100);
}

// Close project modal
function closeProjectModal() {
  document.getElementById("project-modal").style.display = "none";
  document.getElementById("alert-container").innerHTML = "";
}

// Reset project form
function resetProjectForm() {
  document.getElementById("project-form").reset();
  document.getElementById("totalPrice").value = "";
  if (quill) quill.setContents([]);
}

// Fill project form for editing
function fillProjectForm(project) {
  document.getElementById("numberOrder").value = project.numberOrder;
  document.getElementById("projectName").value = project.projectName;

  // Set client dropdown selection
  const clientSelect = document.getElementById("projectClientNameSelect");
  for (let i = 0; i < clientSelect.options.length; i++) {
    if (clientSelect.options[i].dataset.clientName === project.clientName) {
      clientSelect.selectedIndex = i;
      break;
    }
  }

  document.getElementById("clientPhone").value = project.clientPhone || "";
  // Convert ISO date to YYYY-MM-DD format for HTML date input
  document.getElementById("deadline").value = new Date(project.deadline)
    .toISOString()
    .split("T")[0];
  document.getElementById("price").value = project.price;
  document.getElementById("quantity").value = project.quantity;
  document.getElementById("discount").value = project.discount || "";
  document.getElementById("totalPrice").value = formatCurrency(
    project.totalPrice
  );
  document.getElementById("deliverables").value = project.deliverables || "";
  document.getElementById("status").value = project.status;

  setTimeout(() => {
    if (quill && project.brief) {
      quill.root.innerHTML = project.brief;
    }
  }, 200);
}

// Edit project
function editProject(projectId) {
  showProjectModal(projectId);
}

// Delete project
async function deleteProject(projectId) {
  if (confirm("Are you sure you want to delete this project?")) {
    try {
      await apiRequest(`/projects/${projectId}`, {
        method: "DELETE",
      });

      // Remove from local array
      projects = projects.filter((p) => p.id !== projectId);
      renderProjectsTable();
      updateDashboard();
      showAlert("Project deleted successfully!");
    } catch (error) {
      showAlert("Failed to delete project: " + error.message, "error");
    }
  }
}

// Show alert
function showAlert(message, type = "success") {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="uil uil-${
        type === "success" ? "check-circle" : "exclamation-triangle"
      }"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${type === "success" ? "Success" : "Error"}</div>
      <div class="toast-message">${message}</div>
    </div>
    <div class="toast-close" onclick="this.parentElement.remove()">
      <i class="uil uil-times"></i>
    </div>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
}

// Save project
async function saveProject(formData) {
  try {
    if (editingProjectId) {
      // Update existing project
      const updatedProject = await apiRequest(`/projects/${editingProjectId}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      // Update local array
      const index = projects.findIndex((p) => p.id === editingProjectId);
      projects[index] = updatedProject;
      showAlert("Project updated successfully!");
    } else {
      // Add new project
      const newProject = await apiRequest("/projects", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      // Add to local array
      projects.push(newProject);
      showAlert("Project created successfully!");
    }

    renderProjectsTable();
    updateDashboard();

    setTimeout(() => {
      closeProjectModal();
    }, 1500);
  } catch (error) {
    showAlert("Failed to save project: " + error.message, "error");
  }
}

// Mobile menu functions
function openMobileSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("mobile-overlay");

  sidebar.classList.add("open");
  overlay.classList.add("active");

  // Prevent body scroll when sidebar is open
  document.body.style.overflow = "hidden";
}

function closeMobileSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("mobile-overlay");

  sidebar.classList.remove("open");
  overlay.classList.remove("active");

  // Restore body scroll
  document.body.style.overflow = "";
}

// Initialize app
function initApp() {
  // Set default date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("deadline").value = today;

  // Mobile menu event listeners
  const mobileMenuBtns = document.querySelectorAll(".mobile-menu-btn");
  const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
  const mobileOverlay = document.getElementById("mobile-overlay");
  const navItems = document.querySelectorAll(".nav-item");

  // Open sidebar when hamburger button is clicked
  mobileMenuBtns.forEach((btn) => {
    btn.addEventListener("click", openMobileSidebar);
  });

  // Close sidebar when close button is clicked
  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener("click", closeMobileSidebar);
  }

  // Close sidebar when overlay is clicked
  if (mobileOverlay) {
    mobileOverlay.addEventListener("click", closeMobileSidebar);
  }

  // Close sidebar when nav item is clicked (mobile only)
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Only close on mobile (when sidebar has 'open' class)
      if (document.querySelector(".sidebar").classList.contains("open")) {
        closeMobileSidebar();
      }
    });
  });

  // Add event listeners
  document
    .getElementById("price")
    .addEventListener("input", calculateTotalPrice);
  document
    .getElementById("quantity")
    .addEventListener("input", calculateTotalPrice);
  document
    .getElementById("discount")
    .addEventListener("input", calculateTotalPrice);

  // Form submission
  document
    .getElementById("project-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      // Get client name from selected dropdown option
      const clientSelect = document.getElementById("projectClientNameSelect");
      const selectedOption = clientSelect.options[clientSelect.selectedIndex];
      const clientName =
        selectedOption.dataset.clientName || selectedOption.textContent;

      const formData = {
        numberOrder: document.getElementById("numberOrder").value,
        projectName: document.getElementById("projectName").value,
        clientName: clientName,
        clientPhone: document.getElementById("clientPhone").value,
        deadline: document.getElementById("deadline").value,
        brief: quill ? quill.root.innerHTML : "",
        price: parseFloat(document.getElementById("price").value),
        quantity: parseInt(document.getElementById("quantity").value),
        discount: parseFloat(document.getElementById("discount").value) || 0,
        totalPrice:
          (parseFloat(document.getElementById("price").value) || 0) *
            (parseInt(document.getElementById("quantity").value) || 1) -
          (parseFloat(document.getElementById("discount").value) || 0),
        deliverables: document.getElementById("deliverables").value,
        status: document.getElementById("status").value,
        createdAt: editingProjectId
          ? projects.find((p) => p.id === editingProjectId).createdAt
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveProject(formData);
    });

  // Modal click outside to close
  document
    .getElementById("project-modal")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        closeProjectModal();
      }
    });

  // Load projects from API on app start
  loadProjects();
}

// Open project result page with current project data
function openProjectResult(event) {
  // Prevent form submission if called from a button inside the form
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (editingProjectId) {
    window.open(`result.html?id=${editingProjectId}`, "_blank");
  } else {
    showAlert("No project selected", "error");
  }
}

// Open project result page from table row
function openProjectResultFromTable(projectId) {
  if (projectId) {
    window.open(`result.html?id=${projectId}`, "_blank");
  } else {
    showAlert("No project selected", "error");
  }
}

function shareProjectToWhatsApp(projectId) {
  const project = projects.find((p) => p.id === projectId);
  if (project && project.clientPhone && project.clientPhone.trim() !== "") {
    const resultUrl = `${window.location.origin}/result.html?id=${projectId}`;
    const message = `Hi ${project.clientName},\n\nThe project result is now available. Please review it at the link below:\n👉 Open Project Result: ${resultUrl}`;

    // Gunakan API WhatsApp supaya emoji tampil
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${
      project.clientPhone
    }&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  } else {
    showAlert("Client phone number is not available.", "error");
    console.log("Client phone number is not available.");
  }
}

async function loadClientsForProject() {
  try {
    const response = await fetch("/api/clients");
    const clients = await response.json();

    const select = document.getElementById("projectClientNameSelect");
    if (!select) return; // Exit if element doesn't exist

    // Clear existing options except the first one
    while (select.children.length > 1) {
      select.removeChild(select.lastChild);
    }

    clients.forEach((client) => {
      const option = document.createElement("option");
      option.value = client._id;
      option.textContent = client.clientName;
      // Store client data in the option for easy access
      option.dataset.clientName = client.clientName;
      option.dataset.clientPhone = client.phoneNumber || "";
      select.appendChild(option);
    });

    // Add event listener for client selection (only once)
    if (!select.hasAttribute("data-listener-added")) {
      select.addEventListener("change", function () {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
          // Populate client phone field when existing client is selected
          document.getElementById("clientPhone").value =
            selectedOption.dataset.clientPhone || "";
        }
      });
      select.setAttribute("data-listener-added", "true");
    }
  } catch (error) {
    console.error("Failed to load clients for project:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initApp();
  loadClientsForProject();
});
