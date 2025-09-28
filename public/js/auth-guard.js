// Authentication Guard System
class AuthGuard {
  constructor() {
    this.API_BASE_URL = window.location.origin + "/api";
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return token && user;
  }

  // Get current user data
  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
    return null;
  }

  // Get auth token
  getToken() {
    return localStorage.getItem("token");
  }

  // Verify token with backend
  async verifyToken() {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update user data if needed
          localStorage.setItem("user", JSON.stringify(result.data.user));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  }

  // Redirect to login page
  redirectToLogin() {
    // Clear any invalid auth data
    this.clearAuth();
    window.location.href = "login.html";
  }

  // Clear authentication data
  clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  // Protect route - call this on protected pages
  async protectRoute() {
    // First check if basic auth data exists
    if (!this.isAuthenticated()) {
      this.redirectToLogin();
      return false;
    }

    // Then verify token with backend
    const isValid = await this.verifyToken();
    if (!isValid) {
      this.redirectToLogin();
      return false;
    }

    return true;
  }

  // Initialize user display
  initializeUserDisplay() {
    const user = this.getCurrentUser();
    if (user) {
      this.updateUserDisplay(user);
    }
  }

  // Update user display in UI
  updateUserDisplay(user) {
    // Update profile greeting
    this.updateProfileGreeting(user);

    // Update profile dropdown
    this.updateProfileDropdown(user);

    // Update header avatar
    this.updateHeaderAvatar(user);
  }

  // Update profile greeting (Hi! {name})
  updateProfileGreeting(user) {
    const profileButton = document.getElementById("profileButton");
    if (profileButton) {
      // Check if greeting already exists
      let greeting = profileButton.querySelector(".profile-greeting");
      if (!greeting) {
        greeting = document.createElement("span");
        greeting.className = "profile-greeting";
        profileButton.insertBefore(greeting, profileButton.firstChild);
      }
      greeting.innerHTML = `Hi! <strong>${
        user.fullName || user.name
      } 👋🏻</strong>`;
    }
  }

  // Update profile dropdown with user data
  updateProfileDropdown(user) {
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profileImage = document.getElementById("profileImage");

    if (profileName) {
      profileName.textContent = user.fullName || user.name || "User";
    }

    if (profileEmail) {
      profileEmail.textContent = user.email || "user@example.com";
    }

    if (profileImage) {
      if (user.profileImage) {
        profileImage.innerHTML = `<img src="${user.profileImage}" alt="${
          user.fullName || user.name
        }" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
      } else {
        // Use same Dicebear avatar as header for consistency
        const seed = encodeURIComponent(
          user.fullName || user.name || "default"
        );
        const avatarUrl = `https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4&scale=100&seed=${seed}`;
        profileImage.innerHTML = `<img src="${avatarUrl}" alt="${
          user.fullName || user.name || "User"
        }" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
      }
    }
  }

  // Update header avatar
  updateHeaderAvatar(user) {
    const headerAvatar = document.getElementById("headerAvatar");
    if (headerAvatar) {
      if (user.profileImage) {
        headerAvatar.src = user.profileImage;
        headerAvatar.alt = user.fullName || user.name || "User";
      } else {
        // Keep the existing dicebear avatar but update the seed
        const seed = encodeURIComponent(
          user.fullName || user.name || "default"
        );
        headerAvatar.src = `https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4&scale=100&seed=${seed}`;
        headerAvatar.alt = user.fullName || user.name || "User";
      }
    }
  }

  // Enhanced logout function
  logout() {
    if (confirm("Are you sure you want to logout?")) {
      this.clearAuth();
      window.location.href = "login.html";
    }
  }

  // Get initials from full name (needed for profile modal)
  getInitials(fullName) {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  // Profile Modal Functions
  showProfileModal() {
    const modal = document.getElementById("profile-modal");
    if (modal) {
      // Populate form with current user data
      this.populateProfileForm();
      modal.style.display = "block";
    }
  }

  closeProfileModal() {
    const modal = document.getElementById("profile-modal");
    if (modal) {
      modal.style.display = "none";
      // Clear any alerts
      const alertContainer = document.getElementById("profile-alert-container");
      if (alertContainer) {
        alertContainer.innerHTML = "";
      }
    }
  }

  populateProfileForm() {
    const user = this.getCurrentUser();
    if (!user) return;

    // Populate form fields with current user data
    const fullNameField = document.getElementById("profileFullName");
    const emailField = document.getElementById("profileEmailField");
    const phoneField = document.getElementById("profilePhone");
    const bioField = document.getElementById("profileBio");

    if (fullNameField) fullNameField.value = user.fullName || user.name || "";
    if (emailField) emailField.value = user.email || "";
    if (phoneField) phoneField.value = user.phone || "";
    if (bioField) bioField.value = user.bio || "";

    // Update profile image preview
    this.updateProfileImagePreview();
  }

  updateProfileImagePreview() {
    const user = this.getCurrentUser();
    if (!user) return;

    const preview = document.getElementById("profileImagePreview");
    const initialsPreview = document.getElementById("profileInitialsPreview");

    if (preview && initialsPreview) {
      if (user.profileImage) {
        preview.innerHTML = `<img src="${user.profileImage}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
      } else {
        // Use Dicebear avatar for consistency
        const seed = encodeURIComponent(
          user.fullName || user.name || "default"
        );
        const avatarUrl = `https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4&scale=100&seed=${seed}`;
        preview.innerHTML = `<img src="${avatarUrl}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
      }
    }
  }

  handleProfileImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        this.showProfileAlert("Please select a valid image file.", "error");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showProfileAlert("Image size should be less than 5MB.", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById("profileImagePreview");
        if (preview) {
          preview.innerHTML = `<img src="${e.target.result}" alt="Profile Preview" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
          // Store the image data temporarily
          this.tempProfileImage = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfileImage() {
    const user = this.getCurrentUser();
    if (!user) return;

    const preview = document.getElementById("profileImagePreview");
    if (preview) {
      // Use Dicebear avatar as fallback
      const seed = encodeURIComponent(user.fullName || user.name || "default");
      const avatarUrl = `https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4&scale=100&seed=${seed}`;
      preview.innerHTML = `<img src="${avatarUrl}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;

      // Clear the image data
      this.tempProfileImage = null;

      // Clear the file input
      const fileInput = document.getElementById("profileImageInput");
      if (fileInput) {
        fileInput.value = "";
      }
    }
  }

  showProfileAlert(message, type = "success") {
    const alertContainer = document.getElementById("profile-alert-container");
    if (alertContainer) {
      const alertClass = type === "success" ? "alert-success" : "alert-error";
      alertContainer.innerHTML = `
        <div class="alert ${alertClass}">
          ${message}
        </div>
      `;

      // Auto-hide after 5 seconds
      setTimeout(() => {
        alertContainer.innerHTML = "";
      }, 5000);
    }
  }

  saveProfileChanges(formData) {
    try {
      const user = this.getCurrentUser();
      if (!user) return;

      // Update user data with new information
      const updatedUser = {
        ...user,
        fullName: formData.fullName,
        name: formData.fullName, // Keep both for compatibility
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
      };

      // Handle profile image
      if (this.tempProfileImage) {
        updatedUser.profileImage = this.tempProfileImage;
        this.tempProfileImage = null;
      }

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update all profile displays
      this.updateUserDisplay(updatedUser);

      this.showProfileAlert("Profile updated successfully!");

      // Close modal after 1.5 seconds
      setTimeout(() => {
        this.closeProfileModal();
      }, 1500);
    } catch (error) {
      console.error("Error saving profile:", error);
      this.showProfileAlert("Failed to save profile changes.", "error");
    }
  }
}

// Create global instance
window.authGuard = new AuthGuard();

// Auto-initialize on DOM load
document.addEventListener("DOMContentLoaded", function () {
  // Only initialize user display, don't protect route here
  // Route protection should be called explicitly on protected pages
  if (window.authGuard.isAuthenticated()) {
    window.authGuard.initializeUserDisplay();
  }
});
