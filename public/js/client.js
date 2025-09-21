// Global variables for clients
let clients = [];
let editingClientId = null;

// Load clients from API
async function loadClients() {
  try {
    clients = await apiRequest("/clients");
    renderClientsTable();
  } catch (error) {
    showAlert("Failed to load clients: " + error.message, "error");
  }
}

// Generate unique client ID
function generateClientId() {
  const randomNum = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `C${randomNum}`;
}

// Render clients table
function renderClientsTable() {
  const tbody = document.getElementById("clients-tbody");

  if (clients.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <i class="uil uil-users-alt"></i>
            <h3>No clients yet</h3>
            <p>Click "Add Client" to create your first client</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = clients
    .map(
      (client) => `
        <tr>
          <td>
            <strong class="link" onclick="editClient('${client.id}')">${
        client.clientId
      }</strong>
          </td>
          <td>
            <div style="font-weight: 500; color: #0f172a;">${
              client.clientName
            }</div>
          </td>
          <td>
            <div>
              ${
                client.phoneNumber
                  ? `<div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;"><i class="uil uil-phone" style="font-size: 12px; color: #64748b;"></i><span>${client.phoneNumber}</span></div>`
                  : ""
              }
              ${
                client.email
                  ? `<div style="display: flex; align-items: center; gap: 6px;"><i class="uil uil-envelope" style="font-size: 12px; color: #64748b;"></i><span>${client.email}</span></div>`
                  : ""
              }
              ${
                !client.phoneNumber && !client.email
                  ? '<span style="color: #94a3b8;">-</span>'
                  : ""
              }
            </div>
          </td>
          <td>
            ${
              client.address
                ? `<div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${client.address}">${client.address}</div>`
                : '<span style="color: #94a3b8;">-</span>'
            }
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-secondary btn-sm" onclick="editClient('${
                client.id
              }')" title="Edit client">
                <i class="uil uil-edit"></i>
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteClient('${
                client.id
              }')" title="Delete client">
                <i class="uil uil-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

// Show client modal
function showClientModal(clientId = null) {
  editingClientId = clientId;
  const modal = document.getElementById("client-modal");
  const title = document.getElementById("client-modal-title");

  if (clientId) {
    title.textContent = "Edit Client";
    const client = clients.find((c) => c.id === clientId);
    fillClientForm(client);
  } else {
    title.textContent = "Add New Client";
    resetClientForm();
    // Generate new client ID
    let newId;
    do {
      newId = generateClientId();
    } while (clients.some((c) => c.clientId === newId));
    document.getElementById("clientId").value = newId;
  }

  modal.style.display = "block";
}

// Close client modal
function closeClientModal() {
  document.getElementById("client-modal").style.display = "none";
}

// Reset client form
function resetClientForm() {
  document.getElementById("client-form").reset();
}

// Fill client form for editing
function fillClientForm(client) {
  document.getElementById("clientId").value = client.clientId;
  document.getElementById("clientNameField").value = client.clientName;
  document.getElementById("clientPhoneField").value = client.phoneNumber || "";
  document.getElementById("clientEmail").value = client.email || "";
  document.getElementById("clientAddress").value = client.address || "";
}

// Edit client
function editClient(clientId) {
  showClientModal(clientId);
}

// Delete client
async function deleteClient(clientId) {
  if (confirm("Are you sure you want to delete this client?")) {
    try {
      await apiRequest(`/clients/${clientId}`, {
        method: "DELETE",
      });

      // Remove from local array
      clients = clients.filter((c) => c.id !== clientId);
      renderClientsTable();
      showAlert("Client deleted successfully!");
    } catch (error) {
      showAlert("Failed to delete client: " + error.message, "error");
    }
  }
}

// Save client
async function saveClient(formData) {
  try {
    if (editingClientId) {
      // Update existing client
      const updatedClient = await apiRequest(`/clients/${editingClientId}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      // Update local array
      const index = clients.findIndex((c) => c.id === editingClientId);
      clients[index] = updatedClient;
      showAlert("Client updated successfully!");
    } else {
      // Add new client
      const newClient = await apiRequest("/clients", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      // Add to local array
      clients.push(newClient);
      showAlert("Client created successfully!");
    }

    renderClientsTable();

    setTimeout(() => {
      closeClientModal();
    }, 1500);
  } catch (error) {
    showAlert("Failed to save client: " + error.message, "error");
  }
}

// Initialize client functionality
function initClientModule() {
  // Form submission for clients
  const clientForm = document.getElementById("client-form");
  if (clientForm) {
    clientForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = {
        clientId: document.getElementById("clientId").value,
        clientName: document.getElementById("clientNameField").value,
        phoneNumber: document.getElementById("clientPhoneField").value,
        email: document.getElementById("clientEmail").value,
        address: document.getElementById("clientAddress").value,
        createdAt: editingClientId
          ? clients.find((c) => c.id === editingClientId).createdAt
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveClient(formData);
    });
  }

  // Modal click outside to close
  const clientModal = document.getElementById("client-modal");
  if (clientModal) {
    clientModal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeClientModal();
      }
    });
  }

  // Load clients from API on app start
  loadClients();
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Wait a bit to ensure other scripts are loaded
  setTimeout(initClientModule, 100);
});
