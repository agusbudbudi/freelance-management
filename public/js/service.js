// Service management functionality

// Global variables
let services = [];
let currentServiceId = null;
let descriptionEditor = null;
let deliverablesEditor = null;
let editorsInitialized = false;
let editingServiceId = null;
let isLoading = false;
let serviceSearchManager = null;

// Initialize service functionality
document.addEventListener("DOMContentLoaded", function () {
  initializeServiceSection();
  loadServices();
});

// Initialize service section
function initializeServiceSection() {
  // Add event listeners for mobile menu buttons
  const mobileMenuBtnServices = document.getElementById(
    "mobile-menu-btn-services"
  );
  if (mobileMenuBtnServices) {
    mobileMenuBtnServices.addEventListener("click", function () {
      document.getElementById("mobile-overlay").classList.add("active");
      document.querySelector(".sidebar").classList.add("active");
    });
  }

  // Add form submit listener
  const serviceForm = document.getElementById("service-form");
  if (serviceForm) {
    serviceForm.addEventListener("submit", handleServiceSubmit);
  }

  // Initialize search functionality
  initializeServiceSearch();
}

// Initialize service search
function initializeServiceSearch() {
  if (typeof SearchManager !== "undefined") {
    serviceSearchManager = new SearchManager({
      containerId: "service-search-container",
      placeholder: "Search services by name...",
      searchFields: ["serviceName"],
      onSearch: handleServiceSearch,
      debounceDelay: 300,
      showResultCount: false,
      clearable: true,
    });
  }
}

// Handle service search results
function handleServiceSearch(filteredData, searchTerm) {
  renderServicesTable(filteredData);
}

// Generate service ID
function generateServiceId() {
  const randomNum = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `S${randomNum}`;
}

// Format currency (Rupiah)
function formatCurrency(amount) {
  if (!amount || isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Parse currency string to number
function parseCurrency(currencyString) {
  if (!currencyString) return 0;
  return parseInt(currencyString.replace(/[^\d]/g, "")) || 0;
}

// Show service modal
function showServiceModal(serviceId = null) {
  const modal = document.getElementById("service-modal");
  const modalTitle = document.getElementById("service-modal-title");

  // currentServiceId = serviceId;
  editingServiceId = serviceId; // Use editingServiceId instead of currentServiceId

  if (serviceId) {
    modalTitle.textContent = "Edit Service";
    loadServiceData(serviceId);
  } else {
    modalTitle.textContent = "Add New Service";
    resetServiceForm();
    document.getElementById("serviceId").value = generateServiceId();
  }

  modal.style.display = "block";
  document.body.style.overflow = "hidden";

  // Initialize Quill editors with timeout like in script.js
  setTimeout(() => {
    if (!editorsInitialized) initializeQuillEditors();
  }, 100);
}

// Close service modal
function closeServiceModal() {
  const modal = document.getElementById("service-modal");
  modal.style.display = "none";
  document.body.style.overflow = "auto";

  // Don't destroy editors, just clear content like in script.js
  if (descriptionEditor) {
    descriptionEditor.setContents([]);
  }
  if (deliverablesEditor) {
    deliverablesEditor.setContents([]);
  }

  // currentServiceId = null;
  editingServiceId = null;
  clearServiceAlerts();
}

// Destroy Quill editors properly
function destroyQuillEditors() {
  // Properly destroy description editor
  if (descriptionEditor) {
    try {
      // Remove all event listeners and destroy the editor
      descriptionEditor.off();
      descriptionEditor = null;
    } catch (e) {
      descriptionEditor = null;
    }
  }

  // Properly destroy deliverables editor
  if (deliverablesEditor) {
    try {
      // Remove all event listeners and destroy the editor
      deliverablesEditor.off();
      deliverablesEditor = null;
    } catch (e) {
      deliverablesEditor = null;
    }
  }

  // Clean up DOM elements completely
  const descriptionContainer = document.getElementById(
    "service-description-editor"
  );
  const deliverablesContainer = document.getElementById(
    "service-deliverables-editor"
  );

  if (descriptionContainer) {
    // Remove all child elements including toolbars
    while (descriptionContainer.firstChild) {
      descriptionContainer.removeChild(descriptionContainer.firstChild);
    }
  }

  if (deliverablesContainer) {
    // Remove all child elements including toolbars
    while (deliverablesContainer.firstChild) {
      deliverablesContainer.removeChild(deliverablesContainer.firstChild);
    }
  }

  // Reset the flag
  editorsInitialized = false;
}

// Initialize Quill editors
function initializeQuillEditors() {
  // Description editor
  const descriptionContainer = document.getElementById(
    "service-description-editor"
  );
  if (descriptionContainer) {
    descriptionEditor = new Quill(descriptionContainer, {
      theme: "snow",
      placeholder: "Enter service description...",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link"],
          ["clean"],
        ],
      },
    });
  }

  // Deliverables editor
  const deliverablesContainer = document.getElementById(
    "service-deliverables-editor"
  );
  if (deliverablesContainer) {
    deliverablesEditor = new Quill(deliverablesContainer, {
      theme: "snow",
      placeholder: "Enter service deliverables...",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link"],
          ["clean"],
        ],
      },
    });
  }

  // Set flag to prevent re-initialization
  editorsInitialized = true;
}

// Reset service form
function resetServiceForm() {
  document.getElementById("service-form").reset();
  document.getElementById("serviceId").value = generateServiceId();
  document.getElementById("unlimitedRevision").checked = false;
  document.getElementById("totalRevision").disabled = false;

  // Clear editors
  if (descriptionEditor) {
    descriptionEditor.setContents([]);
  }
  if (deliverablesEditor) {
    deliverablesEditor.setContents([]);
  }

  clearServiceAlerts();
}

// Load service data for editing
function loadServiceData(serviceId) {
  const service = services.find((s) => s.id === serviceId);
  if (!service) return;

  document.getElementById("serviceId").value = service.id;
  document.getElementById("serviceName").value = service.serviceName;
  document.getElementById("servicePrice").value = service.servicePrice;
  document.getElementById("durationOfWork").value = service.durationOfWork;

  if (service.unlimitedRevision) {
    document.getElementById("unlimitedRevision").checked = true;
    document.getElementById("totalRevision").disabled = true;
    document.getElementById("totalRevision").value = "";
    document.getElementById("totalRevision").placeholder = "Unlimited";
  } else {
    document.getElementById("unlimitedRevision").checked = false;
    document.getElementById("totalRevision").disabled = false;
    document.getElementById("totalRevision").value = service.totalRevision;
    document.getElementById("totalRevision").placeholder =
      "Enter number of revisions";
  }

  // Set editor contents
  setTimeout(() => {
    if (descriptionEditor && service.description) {
      descriptionEditor.root.innerHTML = service.description;
    }
    if (deliverablesEditor && service.deliverables) {
      deliverablesEditor.root.innerHTML = service.deliverables;
    }
  }, 100);
}

// Handle unlimited revision checkbox
function handleUnlimitedRevision() {
  const checkbox = document.getElementById("unlimitedRevision");
  const totalRevisionInput = document.getElementById("totalRevision");

  if (checkbox.checked) {
    totalRevisionInput.disabled = true;
    totalRevisionInput.value = "";
    totalRevisionInput.placeholder = "Unlimited";
  } else {
    totalRevisionInput.disabled = false;
    totalRevisionInput.placeholder = "Enter number of revisions";
  }
}

// Handle price input formatting
function handlePriceInput(input) {
  let value = input.value.replace(/[^\d]/g, "");
  if (value) {
    input.value = parseInt(value).toLocaleString("id-ID");
  }
}

// Validate service form
function validateServiceForm() {
  const serviceName =
    document.getElementById("serviceName")?.value?.trim() || "";
  const servicePrice =
    document.getElementById("servicePrice")?.value?.trim() || "";
  const durationOfWork =
    document.getElementById("durationOfWork")?.value?.trim() || "";

  if (!serviceName) {
    showAlert("Service name is required", "error");
    return false;
  }

  if (!servicePrice) {
    showAlert("Service price is required", "error");
    return false;
  }

  if (!durationOfWork) {
    showAlert("Duration of work is required", "error");
    return false;
  }

  // Check description editor with better error handling
  let hasDescription = false;
  try {
    hasDescription =
      descriptionEditor &&
      descriptionEditor.getText &&
      descriptionEditor.getText().trim().length > 0;
  } catch (e) {
    console.error("Error checking description editor:", e);
    hasDescription = false;
  }

  if (!hasDescription) {
    showAlert("Service description is required", "error");
    return false;
  }

  const unlimitedRevision =
    document.getElementById("unlimitedRevision")?.checked || false;
  const totalRevision =
    document.getElementById("totalRevision")?.value?.trim() || "";

  if (!unlimitedRevision && !totalRevision) {
    showAlert(
      "Total revision is required when unlimited revision is not selected",
      "error"
    );
    return false;
  }

  return true;
}

// Handle service form submission
async function handleServiceSubmit(event) {
  event.preventDefault();

  if (!validateServiceForm()) {
    return;
  }

  // Get form field values with null checks
  const serviceId = document.getElementById("serviceId")?.value || "";
  const serviceName =
    document.getElementById("serviceName")?.value?.trim() || "";
  const servicePrice = document.getElementById("servicePrice")?.value || "";
  const durationOfWork = document.getElementById("durationOfWork")?.value || "";
  const unlimitedRevision =
    document.getElementById("unlimitedRevision")?.checked || false;
  const totalRevision = document.getElementById("totalRevision")?.value || "";

  // Get editor content with fallbacks
  let description = "";
  let deliverables = "";

  try {
    description =
      descriptionEditor && descriptionEditor.root
        ? descriptionEditor.root.innerHTML
        : "";
  } catch (e) {
    console.error("Error getting description:", e);
    description = "";
  }

  try {
    deliverables =
      deliverablesEditor && deliverablesEditor.root
        ? deliverablesEditor.root.innerHTML
        : "";
  } catch (e) {
    console.error("Error getting deliverables:", e);
    deliverables = "";
  }

  const formData = {
    id: serviceId,
    serviceName: serviceName,
    servicePrice: parseCurrency(servicePrice),
    durationOfWork: parseInt(durationOfWork) || 0,
    description: description,
    deliverables: deliverables,
    unlimitedRevision: unlimitedRevision,
    totalRevision: unlimitedRevision ? null : parseInt(totalRevision) || 0,
    status: "active",
  };

  // Debug logging
  console.log("Form data being sent:", formData);
  console.log("Service Name:", serviceName);
  console.log(
    "Service Price:",
    servicePrice,
    "->",
    parseCurrency(servicePrice)
  );
  console.log(
    "Duration of Work:",
    durationOfWork,
    "->",
    parseInt(durationOfWork)
  );
  console.log("Description Editor:", descriptionEditor ? "exists" : "null");
  console.log("Description Content:", description);

  try {
    await saveService(formData);
  } catch (error) {
    console.error("Save service error:", error);
    showAlert(error.message, "error");
  }
}

// Render services table
function renderServicesTable(dataToRender = null) {
  const tbody = document.getElementById("services-tbody");
  if (!tbody) return;

  // Use filtered data if provided, otherwise use all services
  const servicesToRender = dataToRender || services;

  if (servicesToRender.length === 0) {
    const isSearchActive =
      serviceSearchManager && serviceSearchManager.getSearchTerm();
    tbody.innerHTML = `
             <tr>
                <td colspan="7">
                    <div class="empty-state">
                         <i class="uil uil-${
                           isSearchActive ? "search" : "package"
                         }"></i>
                         <h3>${
                           isSearchActive
                             ? "No services found"
                             : "No services yet"
                         }</h3>
                         <p>${
                           isSearchActive
                             ? "Try adjusting your search terms"
                             : 'Click "Add Service" to create your first service'
                         }</p>
                    </div>
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = servicesToRender
    .map(
      (service) => `
        <tr>
            <td><strong class="link" onclick="showServiceModal('${
              service.id
            }')">${service.id}</strong></td>
            <td>${service.serviceName}</td>
            <td><span class="currency">${formatCurrency(
              service.servicePrice
            )}</span></td>
            <td><span class="service-duration">${
              service.durationOfWork
            } days</span></td>
            <td><span class="service-revision ${
              service.unlimitedRevision ? "unlimited-revision" : ""
            }">${
        service.unlimitedRevision ? "Unlimited" : service.totalRevision
      }</span></td>
            <td><div class="deliverables-preview">${
              service.deliverables
                ? service.deliverables.substring(0, 100) + "..."
                : "No deliverables specified"
            }</div></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary btn-sm" onclick="showServiceModal('${
                      service.id
                    }')">
                        <i class="uil uil-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteService('${
                      service.id
                    }')">
                        <i class="uil uil-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `
    )
    .join("");
}

// Show alert - using reusable function from script.js
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

// Clear service alerts - kept for compatibility but now clears toast container
function clearServiceAlerts() {
  const toastContainer = document.getElementById("toast-container");
  if (toastContainer) {
    toastContainer.innerHTML = "";
  }
}

// Close modal when clicking outside
window.addEventListener("click", function (event) {
  const modal = document.getElementById("service-modal");
  if (event.target === modal) {
    closeServiceModal();
  }
});

// Handle escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const modal = document.getElementById("service-modal");
    if (modal && modal.style.display === "block") {
      closeServiceModal();
    }
  }
});

//NEW
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw new Error(error.message || "An unexpected error occurred");
  }
}

// Load services from API
async function loadServices() {
  try {
    services = await apiRequest("/services");
    renderServicesTable();

    // Update search manager with new data
    if (serviceSearchManager) {
      serviceSearchManager.setData(services);
    }
  } catch (error) {
    showAlert("Failed to load services: " + error.message, "error");
  }
}

// Update the saveService function
async function saveService(formData) {
  if (isLoading) return;

  try {
    isLoading = true;
    const submitButton = document.querySelector(
      "#service-form button[type='submit']"
    );
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="uil uil-spinner"></i> Saving...';

    if (editingServiceId) {
      // Update existing service
      const updatedService = await apiRequest(`/services/${editingServiceId}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      const index = services.findIndex((s) => s.id === editingServiceId);
      services[index] = updatedService;
      showAlert("Service updated successfully!");
    } else {
      // Add new service
      const newService = await apiRequest("/services", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      services.push(newService);
      showAlert("Service created successfully!");
    }

    renderServicesTable();

    // Update search manager with new data
    if (serviceSearchManager) {
      serviceSearchManager.setData(services);
    }

    setTimeout(() => {
      closeServiceModal();
    }, 1500);
  } catch (error) {
    showAlert("Failed to save service: " + error.message, "error");
  } finally {
    isLoading = false;
    const submitButton = document.querySelector(
      "#service-form button[type='submit']"
    );
    submitButton.disabled = false;
    submitButton.innerHTML = "Save Service";
  }
}

// Delete service
async function deleteService(serviceId) {
  if (confirm("Are you sure you want to delete this service?")) {
    try {
      await apiRequest(`/services/${serviceId}`, {
        method: "DELETE",
      });

      services = services.filter((s) => s.id !== serviceId);
      renderServicesTable();

      // Update search manager with new data
      if (serviceSearchManager) {
        serviceSearchManager.setData(services);
      }

      showAlert("Service deleted successfully!");
    } catch (error) {
      showAlert("Failed to delete service: " + error.message, "error");
    }
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadServices();
});
