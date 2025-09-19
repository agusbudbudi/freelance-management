// Global variables
let projects = JSON.parse(localStorage.getItem("design-projects") || "[]");
let editingProjectId = null;
let quill;

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
                                <i class="fas fa-folder-open"></i>
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
                        <strong style="color: #3b82f6; white-space: nowrap;">${
                          project.numberOrder
                        }</strong>
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
                            ? `<a href="${project.deliverables}" target="_blank" style="color: #3b82f6; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="fas fa-external-link-alt" style="font-size: 12px;"></i> 
                                View Files
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
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteProject('${
                              project.id
                            }')" title="Delete project">
                                <i class="fas fa-trash"></i>
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
  document.getElementById("clientName").value = project.clientName;
  document.getElementById("clientPhone").value = project.clientPhone || "";
  document.getElementById("deadline").value = project.deadline;
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
function deleteProject(projectId) {
  if (confirm("Are you sure you want to delete this project?")) {
    projects = projects.filter((p) => p.id !== projectId);
    localStorage.setItem("design-projects", JSON.stringify(projects));
    renderProjectsTable();
    updateDashboard();
  }
}

// Show alert
function showAlert(message, type = "success") {
  const container = document.getElementById("alert-container");
  const icon = type === "success" ? "check-circle" : "exclamation-triangle";
  container.innerHTML = `
                <div class="alert alert-${type}">
                    <i class="fas fa-${icon}" style="margin-right: 8px;"></i>
                    ${message}
                </div>
            `;
  setTimeout(() => {
    container.innerHTML = "";
  }, 5000);
}

// Save project
function saveProject(formData) {
  try {
    if (editingProjectId) {
      // Update existing project
      const index = projects.findIndex((p) => p.id === editingProjectId);
      projects[index] = { ...projects[index], ...formData };
      showAlert("Project updated successfully!");
    } else {
      // Add new project
      formData.id = Date.now().toString();
      projects.push(formData);
      showAlert("Project created successfully!");
    }

    localStorage.setItem("design-projects", JSON.stringify(projects));
    renderProjectsTable();
    updateDashboard();

    setTimeout(() => {
      closeProjectModal();
    }, 1500);
  } catch (error) {
    showAlert("An error occurred while saving the project.", "error");
  }
}

// Initialize app
function initApp() {
  // Set default date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("deadline").value = today;

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

      const formData = {
        numberOrder: document.getElementById("numberOrder").value,
        projectName: document.getElementById("projectName").value,
        clientName: document.getElementById("clientName").value,
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

  // Initial render
  updateDashboard();
  renderProjectsTable();
}

// Start the app
document.addEventListener("DOMContentLoaded", initApp);
