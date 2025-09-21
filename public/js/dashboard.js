// Global variables
let progressChart = null;

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Get project avatar initials
function getProjectInitials(projectName) {
  return projectName
    .split(" ")
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Get status class
function getStatusClass(status) {
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

// Update dashboard statistics
function updateDashboard() {
  // Get projects from global variable (set by script.js)
  const projectsData = window.projects || [];

  const total = projectsData.length;
  const ongoing = projectsData.filter(
    (p) => !["done"].includes(p.status)
  ).length;
  const completed = projectsData.filter((p) => p.status === "done").length;

  const ongoingRevenue = projectsData
    .filter((p) => !["done"].includes(p.status))
    .reduce((sum, p) => sum + (p.totalPrice || 0), 0);

  const completedRevenue = projectsData
    .filter((p) => p.status === "done")
    .reduce((sum, p) => sum + (p.totalPrice || 0), 0);

  // Update stat cards
  document.getElementById("total-projects").textContent = total;
  document.getElementById("ongoing-projects").textContent = ongoing;
  document.getElementById("completed-projects").textContent = completed;
  document.getElementById("ongoing-revenue").textContent =
    formatCurrency(ongoingRevenue);
  document.getElementById("completed-revenue").textContent =
    formatCurrency(completedRevenue);

  // Update chart and recent projects
  createProgressChart(completed, ongoing);
  updateRecentProjects(projectsData);

  return { total, completed, ongoing, completedRevenue, ongoingRevenue };
}

// Create progress pie chart
function createProgressChart(completed, ongoing) {
  const ctx = document.getElementById("progressChart").getContext("2d");
  const total = completed + ongoing;

  // Destroy existing chart if it exists
  if (progressChart) {
    progressChart.destroy();
  }

  if (total === 0) {
    document.getElementById("progressChart").style.display = "none";
    document.getElementById("empty-chart").style.display = "block";
    document.getElementById("chart-legend").style.display = "none";
    return;
  }

  document.getElementById("progressChart").style.display = "block";
  document.getElementById("empty-chart").style.display = "none";
  document.getElementById("chart-legend").style.display = "block";

  const completedPercentage = ((completed / total) * 100).toFixed(1);
  const ongoingPercentage = ((ongoing / total) * 100).toFixed(1);

  // Update legend percentages
  document.getElementById("completed-percentage").textContent =
    completedPercentage + "%";
  document.getElementById("ongoing-percentage").textContent =
    ongoingPercentage + "%";

  progressChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completed Projects", "Ongoing Projects"],
      datasets: [
        {
          data: [completed, ongoing],
          backgroundColor: [
            "rgba(16, 185, 129, 0.8)",
            "rgba(245, 158, 11, 0.8)",
          ],
          borderColor: ["rgba(5, 150, 105, 1)", "rgba(217, 119, 6, 1)"],
          borderWidth: 3,
          hoverBackgroundColor: [
            "rgba(16, 185, 129, 1)",
            "rgba(245, 158, 11, 1)",
          ],
          cutout: "65%",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "white",
          bodyColor: "white",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} projects (${percentage}%)`;
            },
          },
        },
      },
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 1000,
      },
    },
  });
}

// Update recent projects
function updateRecentProjects(projectsData = []) {
  const recentProjectsList = document.getElementById("recent-projects-list");

  if (projectsData.length === 0) {
    recentProjectsList.innerHTML = `
                    <div class="empty-state">
                        <i class="uil uil-folder-open"></i>
                        <h3>No projects yet</h3>
                        <p>Create your first project on Project menu</p>
                    </div>
                `;
    return;
  }

  // Get the 5 most recent projects
  const recentProjects = projectsData
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.updatedAt) -
        new Date(a.createdAt || a.updatedAt)
    )
    .slice(0, 5);

  recentProjectsList.innerHTML = recentProjects
    .map(
      (project) => `
                <div class="project-item" onclick="editProject('${
                  project.id
                }')" style="cursor: pointer;">
                    <div class="project-avatar">
                        ${getProjectInitials(project.projectName)}
                    </div>
                    <div class="project-info">
                        <div class="project-name">${project.projectName}</div>
                        <div class="project-client">${project.clientName}</div>
                    </div>
                    <div class="project-status ${getStatusClass(
                      project.status
                    )}">
                        ${project.status}
                    </div>
                </div>
            `
    )
    .join("");
}

// Initialize dashboard
function initDashboard() {
  updateDashboard();
}

// Make updateDashboard available globally so it can be called from script.js
window.updateDashboard = updateDashboard;
